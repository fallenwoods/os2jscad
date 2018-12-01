/*
//OpenScad
 https://sap.github.io/chevrotain/playground/
 https://sap.github.io/chevrotain/docs/tutorial/step0_introduction.html

 NOTE:
Should this be done with three passes through the interpreter
  - do a pass to find includes
  - do a pass to build signatures (with lib refs)
  - do a pass to convert the files based on their use in includes or not (simple when not)

NOT HANDLED:
  surface: may add this as  a pre-defined function
  Search abilities.

  FIXME
    Fix the text stuff in the helpers and stubs
      I'm not sure I need to define text, I believe the original is rectangularly scaleable as in the example

include('https://www.openjscad.org/fonts/camBamStick1.js');

function main (params) {
  let myfont = camBamStick1Font; // font object (! NOTE the "Font" suffix)
  let text = vectorText({font: myfont, height: 5},'OpenJSCAD');
  return csgFromSegments(text);
}

function csgFromSegments (segments) {
  let output = [];
  segments.forEach(segment => output.push(
    rectangular_extrude(segment, { w:2, h:1 })
  ));
  return union(output);
}

    The signature stack stuff only works if functions are defined in order.
      currently there is no 'function lifting' to get the signatures.
      Also, the signature stack needs to be cleared between files when not doing recursive includes
    Embedded if statements do not create the correct result if they follow a primitive rather than an operator
    The problem with the parametric_involute_gear_v5.0.scad was the inability to do an assign (and var declaration) on a var that was already declared.
    The 2nd problem with the parametric_involute_gear_v5.0.scad was a comment within the first CGSAction

    move $h to before setDefaults (or don't use setDefauts for lib wrapper function)
    Comments in return statements

    Action types
      null action (standalone ;)
      simple action (function chain)
      null actions (pair of empty braces)
      simple action actions (one action in braces)
      multiple action actions (several action in braces)
      declarative actions (declaratives in braces - no actions)
      declarative action actions (declarative and an action)
      declarative multi action actions (declarative and multiple action)

      each of the above can be in a functional ()




    BIG ISSUE:
      OpenScad allows /+-* of vectors (arrays). There is no way to create an override for this in javascript
      Considering replacing x * y with mult(x,y) etc. Kind of a mess.
      Requires observation of precedence e.g. mult before add. So a + b * c + d -> add(add(a,mult(b,c)),d) (or add(a,mult(b,c),d))
      Would need to consider unary minus


    The maze example shows a case where the converted code runs out of stack
      one method - find() gets called 41442 times for a 5x5x5 cube maze.
      I suspect it's just a really bad algorithm, buts it hard to confirm the same behavior happens in the scad version
      The scad version does run w/o running out of stack, (but locks up with a 50x50x50 maze (and perhaps less))


  NEXT:
    Try to introduce the class wrappers
      this impacts var declarations and 2nd tier module definitions
        should use static as the class scope since these are all singletons
    Would also like to fix the actions interpreter
      it seems the function wrapping could be done in action rather than actions
        this would allow actions to be cleanly split in two, declarations and then real actions
        (perhaps I can break out declarations during the parsing?)

  Known Differences:
    Differences below
    A certain collection of predefined functions are required e.g. text, forLoop, echof
    comments are attached to the first 'real' token after them. If the tokens get reordered,
          trailing comments could be in the wrong place

  Observed differences that can't be translated
    mirror with [0,0,0] as the vector (0 distance from origin) (add warning and fix)
    2D (CAG) objects don't allow Color()
    hull() only support 2D (CAG)
    you can'y create a union of 3d and 2D objects. 2D have to be converted to 3D
    rotate(90)
    include is a reserved word

  Observed differences that work but may change results
    linear extrude doesn't allow scale.
    use and include are simply mapped to include()
    debug modifiers are allowed but ignored. The relevant subtree is simply rendered with everything else.

  Import
    import files need to be preprocessed (drop them into OpenJSCAD window and grab the resulting js)
    The preprocessor currently does not work fully for dxf files (at least those I was trying)
      to fix the dxf, I returned {} rather than [] from empty layers and ended the main return list with {} rather than []
      I also replaced the layer1 return value with polygon(jscad1) rather than [jscad1,]
      finally I assigned the function main to filename_dxf e.g. cross_profile_dxf = function main() {
        this last change allows cross_profile_dxf() to be called (be visible) from the code which originally called import()
    This interpreter replaces the import call with <filename>_dxf() and adds an include for the <filename>_dxf.js file




*/


/* command line
 list of files and/or directories to convert.

 Options
 - specify the main file name (defaults to main.scad)
 - add stubs
 - insert includes for a single file output
 - add export for require() (node mode)
*/
function os2jscadMain(argv) {
  //const tojsCadVisitor = require("./OpenScad.js").tojsCad
  const beautify = require('js-beautify').js;
  var fs = require('fs');
  var path = require('path');
  var glob = require('glob');
  var commander = require('commander');



  const Utilities = require("./src/Utilities.js");

  var options = {};

  const allTokens =  require('./src/os2jscadLexer.js').allTokens;
  const os2jscadLexer =  require('./src/os2jscadLexer.js').os2jscadLexer;
 // const os2jscadParser =  require('./src/os2jscadParser.js').os2jscadParser;
  const os2jscadParser =  require('./src/os2jscadParser2.js').os2jscadParser;
  const os2jscadInterpreter =  require('./src/os2jscadInterpreter.js').os2jscadInterpreter;
  const getIncludeList = require("./src/getIncludeList.js").getIncludeList;

  const lexerInstance = new os2jscadLexer();
  const parserInstance = new os2jscadParser ([],allTokens);
  const interpreterInstance = new os2jscadInterpreter();

  commander
    .version('0.1.0')
    .option('-s, --stubs', 'Add stubs')
    .option('-c, --comments', 'Include comments')
    .option('-i, --includes', 'Recursively build include dependency files')
    .option('-e, --fileExtension [extension]', 'Use this as the output file extension [jscad]', 'jscad')
    .parse(argv);

    var stubs;
    var stubsTail;

  //FIXME to clean up the logic around includes I should have 3 separate notions
  // - library: build as library the code is wrapped in a function that 'exports' its methods else file is build as standalone (helpers are included inline)
  // - recurse: build the command line files as indicated and then recurse to all dependent libraries and build them as libraries
  // - inline code: create new files only for those listed on the command line, build code for depends as libs, but inline the result into the main.
  // default would be -recurse (no lib or inline) - give a warning if no includes are found to use inline to inline helpers. (or just do it with a warning)

    // If we'll be adding stubs to files, get the stubs file content
    if(commander.stubs){
      stubs  = fs.readFileSync(__dirname + '/src/stubs.js', 'utf8');
      stubsTail  = fs.readFileSync(__dirname + '/src/stubsTail.js', 'utf8');
    }

    var helpers =  fs.readFileSync(__dirname + '/src/helpers.js', 'utf8');

    // Convert the file patterns from the command line to fully qualified file paths
  var filenames = commander.args.map((fileName)=>glob.sync(path.join(__dirname, fileName))).reduce((acc,fileList)=>acc.concat(fileList),[]);

  var includeFiles=[];


  includeFiles = getIncludeList(filenames)

  if(includeFiles && !commander.includes) console.log("INFO: Consider using the -i option to recursively convert included library.")


  if(commander.includes){
    for(let file of includeFiles){
      processFile(file,true)
    }
  }
  for(let file of filenames){
    processFile(file,false)
  }



    function processFile(fileName,isInclude){

      var outFileName = fileName.replace(".scad","."+commander.fileExtension);
      console.log(fileName);
      console.log(" ",outFileName);

      var libName = "lib"+ path.basename(outFileName).split(".")[0];
      libName = libName.replace(/[.-\s]/g,"_");

      options.libName=libName;
      options.fileExtension = commander.fileExtension;
      options.includes = commander.includes;
      options.comments = commander.comments;

      var inputText="";

      inputText += fs.readFileSync(fileName, 'utf8');;


      // lex, parse and interpret the file
      let result = tojsCad( inputText,libName);

      // format the result for output
      result = beautify(result, { indent_size: 2, space_in_empty_paren: true });


      var fd = fs.openSync(outFileName,'w');

      // optionally add the stubs file for debug
      if(commander.stubs){
          fs.writeSync(fd, stubs,'end','utf8');   // position == 'end' will be ignored.
          fs.writeSync(fd, result,'end','utf8');

      } else {
          fs.writeSync(fd, result,'end','utf8');
      }
      // if the helpers should be embedded rather than access via include add the helpers file content
      if(commander.includes) {
        fs.writeFileSync(path.dirname(outFileName)+"/helpers.js", helpers,'utf8');
      } else {
        fs.writeSync(fd, helpers,'end','utf8');
      }
      if(commander.stubs){
        fs.writeSync(fd, stubsTail,'end','utf8');
      }

      fs.closeSync(fd);



  }




  function tojsCad(inputText,libName) {
      const lexResult = lexerInstance.tokenize(inputText)


      var newTokens = parserInstance.separateCommentTokens(lexResult.tokens)
      // ".input" is a setter which will reset the parser's internal's state.
      //parserInstance.input = lexResult.tokens;
      parserInstance.input = newTokens;

      // Automatic CST created when parsing
      //const cst = parserInstance.moduleDefinition()
      const cst = parserInstance.program()
      //console.log(JSON.stringify(cst,null,2));

      if (parserInstance.errors.length > 0) {
        var stack = parserInstance.errors[0].context.ruleStack;
          throw Error(
              "Parsing errors detected!\n" +
                  parserInstance.errors[0].message +
                  " at ("+parserInstance.errors[0].token.startLine+":"+parserInstance.errors[0].token.startColumn+")" +
                  " stack: > " + stack.toString()
          )
      }
      annotateCST(cst);  // record the location of the starts of the nodes for error messages
      options.libName=libName
      //const ast = interpreterInstance.moduleDefinition(cst)
      const ast = interpreterInstance.program(cst,options)


      return ast
  }

  function annotateCST(ctx){
      if(ctx.image){
        ctx.$firstToken = ctx;
      } else if(Array.isArray(ctx)){
        ctx.forEach((elem)=>{annotateCST(elem)});
        return ctx[0].$firstToken;
      } else {
        var firstToken={startOffset:Infinity};
        //for(var key in Object.getOwnPropertyNames(ctx.children)){
        Object.getOwnPropertyNames(ctx.children).forEach((prop)=>{
          var first = annotateCST(ctx.children[prop]);
          firstToken = first.startOffset < firstToken.startOffset ?  first : firstToken;
        })
        ctx.$firstToken = firstToken;
      }
      return ctx.$firstToken;
    }
}

os2jscadMain(process.argv);