/*
//OpenScad
 https://sap.github.io/chevrotain/playground/
 https://sap.github.io/chevrotain/docs/tutorial/step0_introduction.html

NOT HANDLED:
  surface: may add this as  a pre-defined function
  Search abilities.

  NEXT:
    Provide an option to use vector math or regular math
    Remove examples and replace with a wget of the originals.
      Is there a wget for node, so that it need not be installed ( not default for windows)
  Git documentation page
    getting started
    examples
    options
    includes
    known issues
    troubleshooting
      stubs

  FIXME
    robot arm - imports and stl, needs work
    Parametric gears... redeclaration of function parameters as variables (e.g. finish)
    Confirm include() still works
    multmatrix
    create declarations for variables that are used without being assigned
    RoboArm mismatch parens
    WhiteNight ERROR: hull() accepts only 2D forms / CAG
    CookieCutter Invalid Array Length
    CookieCutter2 top is too wide
    The signature stack needs to be cleared between independent files (or directories)
    The MarlinMesh example
      constructs a mesh with faces oriented incorrectly (inward facing normals)

    The maze example shows a case where the converted code runs out of stack
      one method - find() gets called 41442 times for a 5x5x5 cube maze.
      I suspect it's just a really bad algorithm, buts it hard to confirm the same behavior happens in the scad version
      The scad version does run w/o running out of stack, (but locks up with a 50x50x50 maze (and perhaps less))

  Known Differences:
    Differences below
    A certain collection of predefined functions are required e.g. text, forLoop, echof
    comments are attached to the first 'real' token after them. If the tokens get reordered,
          trailing comments could be in the wrong place

  Observed differences that can't be translated
    mirror with [0,0,0] as the vector (0 distance from origin) (add warning and fix)
    2D (CAG) objects don't allow Color()
    hull() only support 2D (CAG)
    you can't create a union of 3d and 2D objects. 2D have to be converted to 3D
    rotate(90) is an invalid syntax
    include is a reserved word
    No color names are available

  Observed differences that work but may change results
    linear extrude doesn't allow scale.
    use and include are simply mapped to include()
    debug modifiers are allowed but ignored. The relevant subtree is simply rendered with everything else.

  Import
    dfx import files need to be preprocessed (drop them into OpenJSCAD window and grab the resulting js)
    The preprocessor currently does not work fully for dxf files (at least those I was trying)
      to fix the dxf, I returned {} rather than [] from empty layers and ended the main return list with {} rather than []
      I also replaced the layer1 return value with polygon(jscad1) rather than [jscad1,]
      finally I assigned the function main to filename_dxf e.g. cross_profile_dxf = function main() {
        this last change allows cross_profile_dxf() to be called (be visible) from the code which originally called import()
    This interpreter replaces the import call with <filename>_dxf() and adds an include for the <filename>_dxf.js file

    Notes: Action types
      null action (standalone ;)
      simple action (function chain)
      null actions (pair of empty braces)
      simple action actions (one action in braces)
      multiple action actions (several action in braces)
      declarative actions (declaratives in braces - no actions)
      declarative action actions (declarative and an action)
      declarative multi action actions (declarative and multiple action)

      each of the above can be in a functional () or non-functional context
        e.g. translate([]) foo(); or module bar() {foo();} only the latter requires a return


*/

function os2jscadMain(argv) {
  //const tojsCadVisitor = require("./OpenScad.js").tojsCad
  const beautify = require('js-beautify').js;
  var fs = require('fs');
  var path = require('path');
  var glob = require('glob');
  var commander = require('commander');



  const Utilities = require("./src/Utilities.js");
  const SignatureStack = Utilities.SignatureStack;

  const allTokens =  require('./src/os2jscadLexer.js').allTokens;
  const os2jscadLexer =  require('./src/os2jscadLexer.js').os2jscadLexer;
  const os2jscadParser =  require('./src/os2jscadParser.js').os2jscadParser;
  //const os2jscadPreprocessor =  require('./src/os2jscadPreprocessor.js').os2jscadPreprocessor;
  const os2jscadVectMathPreProc =  require('./src/os2jscadVectMathPreProc.js').os2jscadVectMathPreProc;
  const os2jscadInterpreter =  require('./src/os2jscadInterpreter.js').os2jscadInterpreter;
  const getIncludeList = require("./src/getIncludeList.js").getIncludeList;
  const getIncludeLines = require("./src/getIncludeList.js").getIncludeLines;

  const lexerInstance = new os2jscadLexer();
  const parserInstance = new os2jscadParser ([],allTokens);
  //const preprocessorInstance = new os2jscadPreprocessor();
  const vecMathPreProcInstance = new os2jscadVectMathPreProc();
  const interpreterInstance = new os2jscadInterpreter();

  commander
    .version('0.1.0')
    .option('-s, --stubs', 'Add stubs')
    .option('-c, --comments', 'Include comments')
    .option('-v, --vectorMath', 'Use mult() etc for expressions to allow vector math')
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


  //includeFiles = getIncludeList(filenames)

  if(includeFiles && !commander.includes) console.log("INFO: Consider using the -i option to recursively convert included library.")


  // TJM FIXME  Make this recursive. The included files may get rebuilt - later check dates to prevent rebuild
  /*
  if(commander.includes){
    for(let file of includeFiles){
      processFile(file,true)
    }
  }
  //*/
  for(let file of filenames){
    processFile(file)
  }

var processed={};

    function processFile(fileName,isInclude,signatureStack){
      signatureStack = signatureStack || new SignatureStack();

      //var dependencies = getIncludeLines(fileName)
      //if(dependencies) dependencies.forEach((dependent)=>{
      //  processFile(dependent,true,signatureStack);
      //})

      var outFileName = fileName.replace(".scad","."+commander.fileExtension);
      console.log(fileName);
      console.log(" ",outFileName);
      let options={}

      var libName;
      //if(isInclude){
        libName = "lib"+ path.basename(outFileName).split(".")[0];
        //libName =  path.basename(outFileName).split(".")[0];
        libName = libName.replace(/[.-\s]/g,"_");
        options.libName = libName;
      //}

      //options.libName=libName;
      options.fileExtension = commander.fileExtension;
      options.includes = commander.includes;
      options.comments = commander.comments;
      options.stubs = commander.stubs;
      options.vectorMath = commander.vectorMath;
      options.signatureStack = signatureStack;

      var inputText="";

      inputText += fs.readFileSync(fileName, 'utf8');;


      // lex, parse and interpret the file
      let result = tojsCad( inputText,options);

      // format the result for output
      result = beautify(result, { indent_size: 2, space_in_empty_paren: true });


      var fd = fs.openSync(outFileName,'w');

      // optionally add the stubs file for debug
      if(commander.stubs && !isInclude){
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
      if(commander.stubs&& !isInclude){
        fs.writeSync(fd, stubsTail,'end','utf8');
      }

      fs.closeSync(fd);



  }




  function tojsCad(inputText,options) {
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
      //options.libName=libName
      //const ast = interpreterInstance.moduleDefinition(cst)
      //var signatureStack = preprocessorInstance.program(cst,options)
      //var signatureStack =
      vecMathPreProcInstance.program(cst,options)
      //options.signatureStack = signatureStack;
      var result = interpreterInstance.program(cst,options)

      /* A Hack. In javascript a return statement must have and expression on the same line, it won't line wrap.
        I gave up trying to prevent a '//' style comment from following a return statement e.g.
        return // comment
        foo();

        This regular expression just moves the return onto the next line after the comment
      */
      while (result.match(/return[^\/]\/\//)){
        result = result.replace(/return[^\/](\/\/[^\n]*)\n(\s*)/g,"$1\n$2return ");
      }


      return result
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