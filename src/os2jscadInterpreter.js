
//const chevrotain = require("chevrotain");

const path = require("path");
const Utilities = require("./Utilities.js");

const SignatureStack = Utilities.SignatureStack;
const CtxTools = Utilities.CtxTools;
const CommentTools = Utilities.CommentTools;
const Logging = Utilities.Logging;
const Utils = Utilities.Utils;


/*=============================================================================================*\
  Intepreter

\*=============================================================================================*/

//var $t=0,$fn=0,$fa=12,$fs=2,$preview=false,$vpr=[0,0,0],$vpt=[10,10,10],$vpd=50;


  class os2jscadInterpreter { // extends BaseCstVisitor {

    constructor() {
        //super();                  //FIXME add this and the validator back in. (I'm not using visitor() so this may not be needed.)

        //this.options;
        this.ctxTools= new CtxTools(this);
        this.signatureStack;
        // This helper will detect any missing or redundant methods on this visitor
        //FIXME Can this be reintroduced by passing in the parser and using call()?
        // Is this the only thing the parent is used for?
        //this.validateVisitor()
    }

    array(ctx,args) {
      var result="";

      args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.
      args.sep=", ";
      if(ctx.children.sep && ctx.children.sep[0].image ==":") {
         result =  "$h.range(" +  this.ctxTools.iterate(ctx.children.item,args) + ")"
      } else {
        result =  "["+
          this.ctxTools.iterate(ctx.children.item,args) +
        "]";
      }


      return result;
    }

    arrayLookup(ctx,args) {
      var result =  "" +
        this.ctxTools.iterateChildren(ctx,["LSquare","expression","RSquare"],args);
        return result;
    }

    assignment(ctx,args) {
      var result = "";
      result += CommentTools.addComments(ctx.children.lhs,args)
      var varName = ctx.children.lhs[0].image;

      var assignStr = this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"],args);

      var exportVar = this.signatureStack.getVarSignature(varName);

      //if(exportVar.libName){
      //  result = exportVar.libName+".";
      //} else if (!exportVar.defined) {
        result = "let ";
      //}

      result +=  assignStr;

      if(exportVar) exportVar.defined=true;

      return result;
    }



    atomicExpression(ctx,args) {
      var result="";
      for(var prop in ctx.children){
        switch(prop){
          case "functionCall":
            result += this.ctxTools.childToString(ctx.children.functionCall,args);
          break;
          case "arrayLookup":
            result += this.ctxTools.iterate(ctx.children.arrayLookup,args);
          break;
          case "LSquare":
          case "RSquare":
          break;
          case "Identifier":
            var name = this.ctxTools.childToString(ctx.children[prop],args);
            //(ctx.image==="PI") ? "Math.PI" :
            //var exportVar = this.signatureStack.getVarSignature(name)
            //result =  ((exportVar && exportVar.libName) ? exportVar.libName + "." : "") +  name;
            result =  name;
          break;
          default:
            result += this.ctxTools.childToString(ctx.children[prop],args)
          break;
        }
      }

      return result
    }


    binaryCompareExpression(ctx,args) { return this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"],args);}
    binaryBoolExpression(ctx,args) { return this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"],args);}

    binaryMultDivExpression(ctx,args) {
      var result = "";

      //*
      //if(args.vectorMath && ctx.children.operator && ctx.$type ==="v"){
      if(ctx.children.operator){
        var operator = ctx.children.operator[0].image;
        result = ( operator === "*" ? "$h.vmult(" : operator ==="/" ? "$h.vdiv(" : "$h.vmod(")
        result += this.ctxTools.childToString(ctx.children.lhs,args)
        result += ","
        result += this.ctxTools.childToString(ctx.children.rhs,args)
        result += ")";
      } else //*/
       {
        result = this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"],args);
      }
      return result;
    }

    binarySumDiffExpression(ctx,args) {
      var result = "";
      //*
      //if(args.vectorMath && ctx.children.operator && ctx.$type ==="v"){
      if(ctx.children.operator){
        result = (ctx.children.operator[0].image === "+" ? "$h.vadd(" : "$h.vsub(") +
        this.ctxTools.childToString(ctx.children.lhs,args) +
        ","+
        this.ctxTools.childToString(ctx.children.rhs,args)+
        ")";
      } else  //*/
      {
        result = this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"],args)
      }
      return result;
    }

    unaryExpression(ctx,args) {
      //FIXME handle unary +/- for vectors
      if(ctx.children.operator &&  ctx.children.operator[0].image === "-" ) {
        return "$h.vneg(" + this.ctxTools.childToString(ctx.children.rhs,args) + ")";
      } else {
        return this.ctxTools.iterateChildren(ctx,["operator","rhs"],args);
      }

    }


    conditionalExpression(ctx,args) {
      return this.ctxTools.iterateChildren(ctx,["condition","Questionmark","trueclause","Colon","falseclause"],args);}

    expression(ctx,args) { return this.ctxTools.childToString(ctx.children.conditionalExpression,args);}

    functionDefinition(ctx,args) {
      var functionName = ctx.children.Identifier[0].image;

      this.signatureStack.setScope(functionName);

      var params = this.paramsParser(ctx.children.parameters,args)
      var libName = (args && args.libName) ? args.libName : "";
      args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.
      args.functionName = functionName;
      delete args.libName;

      var result="";
      result += "\n"+CommentTools.addComments(ctx.children.FunctionLiteral,args);
      //if(libName) {
      //  result += libName +"." + functionName +" = function ";
      //} else {
        result += "function " + functionName;
      //}
      result += " ( " + params.vars + ") ";
      result += "{ "
      result += params.defaults;
      result += "\n"+CommentTools.addComments(ctx.children.body,args);
      result += "return (" + this.ctxTools.childToString(ctx.children.body,args) + ");"
      result += "}\n"

      this.signatureStack.popScope();
      return result;
    }

    moduleDefinition(ctx,args) {
      var moduleName = ctx.children.Identifier[0].image;

      this.signatureStack.setScope(moduleName);

      var params = this.paramsParser(ctx.children.parameters,args)
      var libName = (args && args.libName) ? args.libName : "";
      args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.
      args.moduleName = moduleName;
      delete args.libName;

      var result = "";
      result += "\n"+CommentTools.addComments(ctx.children.ModuleLiteral,args);

      //if(libName) {
      //  result += libName +"." + moduleName +" = function ";
      //} else {
        result += "function " + moduleName;
      //}


      args.unwrap = true;
      result += " ( " + params.vars + ") ";
      result += "{ "

      result += params.defaults +"\n";

      var subresult = this.moduleBlock(ctx,args) ;  // treat a program like a module block

      result += Utils.formatActionStmtNoWrap(subresult);

      result += "}\n";

      this.signatureStack.popScope();
      return result;
    }

    program(ctx,args) {
      //this.options = options;
      var libName = args.libName;  //args.libName;

      libName = libName === "main" ? "libmain" : libName;
      args.libName = libName;

      this.signatureStack = args.signatureStack;
      this.signatureStack.setScope(libName === undefined ? "libmain" : libName);

      CommentTools.doComments(args.comments===true);
      var result = "";
      args.moduleName = libName;

      args.csgType="union";
      result += "\n"+CommentTools.addComments(ctx,args);

      result += "helpers();\n"
      //result += "var animate=0;\n"
      //result += "var fn=12;\n"


      result += (args.stubs && args.includes) ? "eval(":"";
      result += args.includes ? 'include ("helpers.js")' : ""
      result += (args.stubs && args.includes) ? ")\n":"\n";
      result += (args.includes) ? ";":"";

      result +=  libName + " = function () {\n";

      var subresult = this.moduleBlock(ctx,args) ;  // treat a program like a module block
      subresult.declarations.forEach((elem)=>{result += elem + (elem.slice(-1)==="}" ? ";\n" :"\n");})

      subresult.declarations = [];

      result +=  libName +  ".main = function  (args){\n";

      result += Utils.formatActionStmtNoWrap(subresult);

      result += "};\n";

      //var exportsNames = Object.getOwnPropertyNames(args.signatureStack.allScopes[libName]).filter(elem=>elem.indexOf("_")>=0).map(elem=>elem.replace(/func_|var_/,""));
      var exportsNames = Object.getOwnPropertyNames(args.signatureStack.allScopes[libName]).filter(elem=>elem.search(/func_|var_/)>=0).map(elem=>args.signatureStack.allScopes[libName][elem].name)

      result += "[" + (exportsNames.map(elem=>libName+"."+elem)).toString() + "]=["+exportsNames.toString() +"]; // exports from lib " + libName + "\n";
      result += "}\n";


      //result += "[" +exportsNames.toString() + "]=["  + (exportsNames.map(elem=>libName+"."+elem)).toString() +"]; // exports to globals\n";

      result +=  "function main(args) { "
      result += libName + "();";
      result +=  "return " + libName +".main(args);}"

      return result;
    }


    moduleBlock(ctx,args) {
      var result = {declarations:[],actions:[]};

      if (ctx.children.statement === undefined) {
        result.actions.push("nullCSG()")
        return result;
      }

      ctx.children.statement.forEach((stmt)=>{
        var subresult = this.statement(stmt,args);
        result.declarations = result.declarations.concat(subresult.declarations);
        result.actions = result.actions.concat(subresult.actions);
      })

      return result;
    }


    statement(ctx,args) {
      var result = {declarations:[],actions:[]};

      result.declarations.push(this.ctxTools.childToString(ctx.children.assignment,args))
      result.declarations.push(this.ctxTools.childToString(ctx.children.declaration,args))
      result.actions.push(this.ctxTools.childToString(ctx.children.simpleAction,args))

      if(ctx.children.moduleBlock) {
        var subresult = this.moduleBlock(ctx.children.moduleBlock[0],args); // braced regions within braces don't actually create a new scope
        result.declarations = result.declarations.concat(subresult.declarations);
        result.actions = result.actions.concat(subresult.actions);
      }
      result.declarations = result.declarations.filter((elem)=>elem!="")
      result.actions = result.actions.filter((elem)=>elem!="")

      return result;

    }



    paramsParser(ctx,args){
      var names = "";
      var defaults = "";
      var vars="";
      var hasDefaults = false;
      ctx = CtxTools.trySkipArray(ctx,args);

      if(!ctx.children.parameter) return {vars:"",defaults:""}

      for(var i = 0;i<ctx.children.parameter.length;i++){
        var param = this.paramParser(ctx.children.parameter[i],args);
        names += "'"+param.key+"', ";
        vars += param.key+", ";
        defaults += param.value+", ";
        hasDefaults = hasDefaults || param.value !== undefined;

      }
      vars = vars.slice(0,-2);
      names = names.slice(0,-2);
      defaults = defaults.slice(0,-2);

      defaults = "["+vars+"] = $h.setArguments(["+names+"],arguments,["+defaults+"]);\n";      // FIXME - remove defaults if none have values.

      return {vars:vars,defaults:defaults};
    }

    paramParser(ctx,args){
      var key = ctx.children.paramName ? ctx.children.paramName[0].image : "$value";
      var value = ctx.children.default ? this.ctxTools.childToString(ctx.children.default,args) : undefined;
      var exportVar = this.signatureStack.getVarSignature(key);
      exportVar.defined=true;

      return({key:key,value:value});
    }


    includeStmt (ctx,args) {
      var result="";

      var filePath = ctx.children.IncludeFile[0].image.slice(1,-1).replace(".scad","."+args.fileExtension); //FIXME - path here?
      var fileBase = path.basename(filePath);

      result +=  CommentTools.addComments(ctx.children.IncludeLiteral,args);
      result += args.stubs ? "eval(":"";
      result +=  'include ("' + filePath + '") '
      result += args.stubs ? ")":"";
      result += ";\n" + libName + "();";

      //result +=  '; lib' + fileBase.split(".")[0] +'()\n';
      return result;
    }

    letStmt(ctx,args) {
      var result = "";
      var lets=[];

      var args = this.argumentsParser(ctx.children.arguments,args)[0];
      for(var prop in args){
        lets.push("var " + prop + " = " + args[prop]);
      }

      var subresult = this.actionStatement(ctx.children.actionStatement[0],args);

      subresult.declarations = lets.concat(subresult.declarations);

      result += Utils.formatActionStmtFullWrap(subresult);

      return result;
    }

    declaration(ctx,args) {
      var result="";

      result += this.ctxTools.childToString(ctx.children.includeStmt,args);
      if(ctx.children.moduleDefinition) result += this.moduleDefinition(ctx.children.moduleDefinition[0],args);
      if(ctx.children.functionDefinition) result += this.functionDefinition(ctx.children.functionDefinition[0],args);

      return result;
    }

    actionBlock(ctx,args) {
      var result = {declarations:[],actions:[]};

      if (ctx.children.actionStatement === undefined) {
        result.actions.push("nullCSG()")
        return result;
      }

      ctx.children.actionStatement.forEach((stmt)=>{
        var subresult = this.actionStatement(stmt,args);
        result.declarations = result.declarations.concat(subresult.declarations);
        result.actions = result.actions.concat(subresult.actions);
      })

      return result;
    }


    actionStatement(ctx,args) {
      var result = {declarations:[],actions:[]};

      result.declarations.push(this.ctxTools.childToString(ctx.children.assignment,args))
      result.actions.push(this.ctxTools.childToString(ctx.children.simpleAction,args))

      if(ctx.children.actionBlock) {
        var subresult = this.actionBlock(ctx.children.actionBlock[0],args); // braced regions within braces don't actually create a new scope
        result.declarations = result.declarations.concat(subresult.declarations);
        result.actions = result.actions.concat(subresult.actions);
      }
      result.declarations = result.declarations.filter((elem)=>elem!="")
      result.actions = result.actions.filter((elem)=>elem!="")

      return result;

    }


    simpleAction(ctx,args) {
      var result = "";
      args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.
      args.sep = args.sep || ", ";



      result += this.ctxTools.childToString(ctx.children.ifStatement,args);
      result += this.ctxTools.childToString(ctx.children.forLoop,args);
      result += this.ctxTools.childToString(ctx.children.moduleChain,args);
      result += this.ctxTools.childToString(ctx.children.CSGAction,args);
      result += this.ctxTools.childToString(ctx.children.letStmt,args);


      if(result ==="") {
        //result += "nullCSG()";
      }


      return result;
    }


    // For things line union(){} intersection etc.
    // difference(){a=1;sphere();cube();}
    // ((()=>{a=1; return difference(sphere(),cube())})())
    CSGAction(ctx,args) {
      var result="";

      var subresult = this.actionStatement(ctx.children.actionStatement[0],args);

      result += Utils.formatActionStmtFullWrap(subresult,ctx.children.CSGLiteral[0].image);

      return result;
    }

    moduleChain(ctx,args) {
      var result = "";
      args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.


      var moduleName = ctx.children.Identifier[0].image;
      var signature = args.signature = this.signatureStack.getSignature(moduleName);


      var moduleArgs = this.argumentsParser(ctx.children.arguments,args);
      var named = moduleArgs.slice(-1)[0] || {};
      moduleArgs = moduleArgs.slice(0,-1);

      moduleName = this.translateSignatures(ctx,moduleName,named,moduleArgs);

      // There is no available import in jscad, the code below assumes that the import file has been pre-processed into
      //  a jscad .js file and is available in the target import directory
      if(moduleName === "import" || moduleName === "import_dxf" || moduleName === "import_stl"){
        var fileName = named.file || moduleArgs[0];
        var convexity = named.convexity || moduleArgs[1];
        var layer = named.layer || moduleArgs[2];
        moduleName = fileName.replace(/\./g,"_").slice(1,-1);
        fileName = fileName.replace(/\.(dxf|stl)/,"_$1.js");

        result += "(" + moduleName + "("+ (convexity || "") +")["+ (layer || '1') +"], ";

      } else {
        //result +=  " " + ((signature && signature.libName) ? signature.libName+"." : "") + moduleName
        result +=   moduleName
        result +=   "(  ";
        result +=  moduleArgs.length ? moduleArgs.toString() +", "  :"";
        result +=  Object.keys(named).length>0 ?  "{"+Object.keys(named).reduce((acc,key)=>{return acc +( key + ":" + named[key]+",")},"").slice(0,-1) +"}, " :"";


        // FIXME - This adds a nullCSG() to translate() correctly, but also adds it to sphere() i.e. sphere(r=3,nullCSG())
        var subresult = this.actionStatement(ctx.children.actionStatement[0],args);

        if(subresult.actions && subresult.actions.length === 0){
          result = result.slice(0,-2);
        }

        //if(subresult.actions && subresult.actions[0]==="nullCSG()" && Utils.isPrimtive(moduleName)){
          //result = result.slice(0,-2);
        //  subresult.actions[0]="";
        //}

        //primitives: cube, sphere, cylinder, polyhedron, square, circle, ellipse, regular_polygon, polygon, text, import

        result += Utils.formatActionStmtFullWrap(subresult);

        result +=   ")  ";
      }

      return result;

    }

    translateSignatures(ctx,moduleName,named,moduleArgs){


      Logging.warnCheck(ctx,(moduleName=="linear_extrude" && named.scale)," OpenJSCAD linear_extrude does not recognize the scale argument")
      Logging.warnCheck(ctx,(moduleName=="minkowski" && named.scale)," minkowski() is not supported")
      Logging.warnCheck(ctx,(moduleName=="linear_extrude" && named.center)," OpenJSCAD linear_extrude will center in x,y,z rather than just z")
      Logging.warnCheck(ctx,(moduleName=="text" && (named.font || named.valign || named.direction || named.language || named.script || named.fn)),"Conversion for text is limited. The following arguments are not supported: font, valign, direction, language, script and fn")
      Logging.infoCheck(ctx,moduleName=="text" ,"Text is 2d and must be extruded."); // FIXME, look for extrude in module chain?
      Logging.warnCheck(ctx,moduleName=="polyhedron" ,"Polyhedron faces and triangles must be in CW order. See OpenScad docs on polyhedron,F12 and pink faces.");

      // HACK Alert: fixing some of the function names/arguments to allow them to function properly.
      switch(moduleName){
        case "echo":
          moduleName = "echof"
        break;
        case "circle":
          named.center = named.center ? named.center : true;
          //named.r = named.r || 1; //required if named is present
          if(moduleArgs.length>0) {named.r = moduleArgs[0];moduleArgs.splice(0,1);}
          if (named.d ) {named.r = named.d + "* 2"; delete named.d;}

        break;
        case "polyhedron":
          if (named.faces ) {named.polygons = named.faces; delete named.faces;}

        break;
        case "cylinder":
          if (named.d  ) {named.r  = named.d  + "* 2"; delete named.d;}
          if (named.d1 ) {named.r1 = named.d1 + "* 2"; delete named.d1;}
          if (named.d2 ) {named.r2 = named.d2 + "* 2"; delete named.d2;}
          if (named.r2 && !named.r1) {named.r1 = named.r; delete named.r;}
        break;
        case "linear_extrude":
          if(moduleArgs.length>0) {named.height = moduleArgs[0]; moduleArgs.splice(0,1);}  //OpenSCad accepts a single argument as the height
        break;
        case "square":
           if (named.size && named.size[0]!="[")   named.size = "["+named.size+","+named.size+"]";
        break;

      }

      return moduleName;
    }

    functionCall(ctx,args) {
      var result = "";
      args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.


      var funcName = ctx.children.Identifier[0].image;
      var signature = args.signature = this.signatureStack.getSignature(funcName);

      var funcArgs = this.argumentsParser(ctx.children.arguments,args);
      var named = funcArgs.slice(-1)[0] || {};
      funcArgs = funcArgs.slice(0,-1);

      //funcName = this.translateSignatures(ctx,funcName,named,funcArgs); // is this ever used here?

      //result +=  " " + ((signature && signature.libName) ? signature.libName+"." : "") + funcName
      result +=   funcName
      result +=   "(  ";
      result +=  funcArgs.length ? funcArgs.toString() +", "  :"";
      result +=  Object.keys(named).length>0 ?  "{"+Object.keys(named).reduce((acc,key)=>{return acc +( key + ":" + named[key]+",")},"").slice(0,-1) +"}, " :"";

      result = result.slice(0,-2);

      result +=   ")  ";


      return result;

    }

    parenthesisExpression(ctx,args) { return this.ctxTools.iterateChildren(ctx,["LParen","expression","RParen"],args);}
    parameters(ctx,args) { return this.ctxTools.childToString(ctx,args);}
    parameter(ctx,args) { return this.ctxTools.childToString(ctx,args);}
    debugModifier(ctx,args) {return this.ctxTools.childToString(ctx.children.Hash,args);}


    // e.g. (a,2,var1,param=3)
    argumentsParser(ctx,args){
      var result = [];
      var named = {};
      var signature = args.signature;
      ctx = CtxTools.trySkipArray(ctx,args);

      if(ctx.children.argument ) {
        for(var i = 0;i<ctx.children.argument.length;i++){
          var param = this.argumentParser(ctx.children.argument[i],args);
          if(param.name) {
            //named.$named=true;
            named[param.name]=param.value;
          } else {
            result.push(param.value)
          }
        }
      }

      if(signature){
        if(signature.defaults){
          //named.$named=true;
          for(var i =0; i < signature.defaults.length;i++){
            named[signature.names[i]] = named[signature.names[i]] === undefined ?  signature.defaults[i] : named[signature.names[i]] ;
          }
        }

        // HACK Alert: The code below is to fix 'simple' cases of single arguments being turned into an object
        if(Object.keys(named).length===1 && result.length===0){
          result.push(named[Object.keys(named)[0]]);
          named ={};
        }

        // if both positional and named arguments were given, try to create just a named object from the module/function signature
        if(result.length!==0 && Object.keys(named).length!==0){
            for(var i =0; i < result.length && i < signature.names.length;i++){
              named[signature.names[i]] = result[i];
            }
            result=[];
        }

        Logging.warnCheck(ctx,signature.funcName === "rotate" && result[0] && result[0][0]!=="[","Rotate requires an array of three angles or an angle and a rotation vector.")
      }

      Logging.errCheck (ctx,(result.length!==0 && Object.keys(named).length!==0),"Mixed named and positional arguments found");

      result.push(named);
      return result;
    }

    argumentParser(ctx,args){
      var name = ctx.children.paramName ? this.ctxTools.childToString(ctx.children.paramName,args) : undefined;
      var value = ctx.children.value ? this.ctxTools.childToString(ctx.children.value,args) : "";

      return({name:name,value:value});
    }

    arguments(ctx,args) {
      var result="";
      var positional="";
      var named="";

      if( ctx.children.argument){

        ctx.children.argument.forEach((elem)=>{
          var arg = this.argument(elem,args);
          positional +=    arg.indexOf(":")>=0   ? "" : arg+",";
          named      += (!(arg.indexOf(":")>=0)) ? "" : arg+",";
        })

        result += positional.slice(0,-1);
        result += ((named != "") && positional != "") ? "," : "";
        result += ((named != "") ? "{"+named.slice(0,-1)+"}" : "") ;



        return result;
      } else{
        return "";
      }
    }
    argument(ctx,args) {
      var result = "";

      if(ctx.children.EqualSign){
        result += CommentTools.addComments(ctx.children.paramName[0],args)// +":";
      }

      result += this.ctxTools.childToString(ctx.children.value,args);
      return result;
    }

    ifStatement(ctx,args) {
      var result = ""
      args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.

      result += "$h.ifFunc(";

      result += "("+this.ctxTools.childToString(ctx.children.expression,args) +")";

      args.unwrap = true;
      result += ",()=>{";

      var subresult = this.actionStatement(ctx.children.ifClause[0],args);
      result += Utils.formatActionStmtNoWrap(subresult);

      result += "}";

      if(ctx.children.elseClause){
        result += ",()=>{";
        var subresult = this.actionStatement(ctx.children.elseClause[0],args);
        result += Utils.formatActionStmtNoWrap(subresult);
        result += "}";
      }

      result += ")";

      return result;
    }

    listComprehension(ctx,args) {
      var result="";
      var ranges = ctx.children.ranges.map((range)=>this.forRange(range,args))

      // FIXME - combine all for loops in a list comp into one multi-range for loop
      // this will have to be done with iteration rather than recursion
      // Need to think a bit more about this - are there scenarios where reording this will break things?
      result += "$h.forLoop(";

      result += ranges.reduce((acc,range)=>acc+=range.arg+",","").slice(0,-1)

      result += ",(elem)=>{\nlet ["
      //ranges.forEach((range)=>this.trySaveVariable(range.name));
      result +=  ranges.reduce((acc,range)=>acc+=range.name+",","").slice(0,-1)
      result += "]=elem;\n"

      if(ctx.children.listCompPart){
        result += CommentTools.addComments(ctx.children.listCompPart,args);
        result += this.listCompPart(ctx.children.listCompPart[0],args)
      }

      //result += "return (" + this.ctxTools.childToString(ctx.children.body,args) + ");"; // expression
      result += this.isLastFor(ctx.children.listCompPart[0]) ? "})" : "}).reduce((acc,elem)=>acc.concat(elem),[])"

      //result += "})";

      return result;
    };

    // FIXME add listCompPart to os2jscadVectMathPreProc.js
    listCompPart(ctx,args) {
      var result="";


      if(ctx.children.ForLiteral){
        var ranges = ctx.children.ranges.map((range)=>this.forRange(range,args));
        result += "return $h.forLoop(";
        result += ranges.reduce((acc,range)=>acc+=range.arg+",","").slice(0,-1)
        result += ",(elem)=>{\nlet ["
        result +=  ranges.reduce((acc,range)=>acc+=range.name+",","").slice(0,-1)
        result += "]=elem;\n"
        result += ctx.children.listCompPart ? this.listCompPart(ctx.children.listCompPart[0],args) :"";
        //FIXME this is off by one. The deepest one should not be concatenated.
        // this is also required in the toplevel, if this is the approach taken
        result += this.isLastFor(ctx.children.listCompPart[0]) ? "})" : "}).reduce((acc,elem)=>acc.concat(elem),[])"

       }

     if(ctx.children.IfLiteral){
      result += "if(";
      result += this.ctxTools.childToString(ctx.children.ifExpression,args)
      result += "){";
      result += ctx.children.listCompPart ? this.ctxTools.childToString(ctx.children.listCompPart,args) :"";
      result += "}";
     }

    if(ctx.children.LetLiteral){
      var args = this.argumentsParser(ctx.children.arguments,args)[0];

      for(var prop in args){
        var found = false; //= this.trySaveVariable(prop);
        result += (found ? "" : "let ") + prop + " = " + args[prop] + ";\n";
      }
      result += ctx.children.listCompPart ? this.listCompPart(ctx.children.listCompPart[0],args) :"";
    };

    if(ctx.children.body){
      result += "return (" + this.ctxTools.childToString(ctx.children.body,args) + ")"
      result += ctx.children.listCompPart ? this.listCompPart(ctx.children.listCompPart[0],args) :"";
    };
      return result;
    };

    isLastFor(ctx){
      if(ctx.children.ForLiteral) return false;
      if(ctx.children.listCompPart) return this.isLastFor(ctx.children.listCompPart[0]);

      return true;
    }


    //union($h.forLoop($h.range(0, 10, 30),(elem) => {func})
    forLoop(ctx,args) {

        var result="";
        args = Utils.clone(args);

        var ranges = ctx.children.ranges.map((range)=>this.forRange(range,args))

        result += "union($h.forLoop(";
        result += ranges.reduce((acc,range)=>acc+=range.arg+",","").slice(0,-1)
        result += ",(elem)=>{ let ["

        result += ranges.reduce((acc,range)=>acc+=range.name+",","").slice(0,-1)
        result += "]=elem; "

        var subresult = this.actionStatement(ctx.children.actionStatement[0],args);

        result += Utils.formatActionStmtNoWrap(subresult);

        result += "}))"

        return result;

      }


      forRange(ctx,args) {
        var result={}
        result.name=this.ctxTools.childToString(ctx.children.lhs,args);
        if(ctx.children.Comma){
          result.arg =  "[" + this.ctxTools.iterate(ctx.children.expression,args) + "]";
        } else if(ctx.children.Colon) {
          result.arg =  "$h.range(" +  this.ctxTools.iterate(ctx.children.expression,args) + ")"
        } else {
          result.arg =  this.ctxTools.iterate(ctx.children.rhs,args)
        }
        return result;
      }


    }


module.exports = {
  os2jscadInterpreter:  os2jscadInterpreter

}
