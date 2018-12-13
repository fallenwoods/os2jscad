
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
      return "" +
        this.ctxTools.iterateChildren(ctx,["LSquare","expression","RSquare"],args);
    }

    assignment(ctx,args) {
      var result = "";
      result += CommentTools.addComments(ctx.children.lhs,true)
      var found = this.signatureStack.isVarInSignature(args.moduleName,ctx.children.lhs[0].image)
      result += (found ? "": "var ") + this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"],args);
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
      /*
      if(ctx.children.operator){
        result = (ctx.children.operator[0].image === "*" ? "mult(" : "div(") +
        this.ctxTools.childToString(ctx.children.lhs,args) +
        ","+
        this.ctxTools.childToString(ctx.children.rhs,args) +
        ")";
      } else */
       {
        result = this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"],args);
      }
      return result;
    }

    binarySumDiffExpression(ctx,args) {
      var result = "";
      /*
      if(ctx.children.operator){
        result = (ctx.children.operator[0].image === "+" ? "add(" : "diff(") +
        this.ctxTools.childToString(ctx.children.lhs,args) +
        ","+
        this.ctxTools.childToString(ctx.children.rhs,args)+
        ")";
      } else  */
      {
        result = this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"],args)
      }
      return result;
    }

    unaryExpression(ctx,args) {
      return this.ctxTools.iterateChildren(ctx,["operator","rhs"],args);
    }


    conditionalExpression(ctx,args) {
      return this.ctxTools.iterateChildren(ctx,["condition","Questionmark","trueclause","Colon","falseclause"],args);}

    expression(ctx,args) { return this.ctxTools.childToString(ctx.children.conditionalExpression,args);}

    functionDefinition(ctx,args) {
      var functionName = ctx.children.Identifier[0].image;
      var params = this.paramsParser(ctx.children.parameters,args)
      var libName = (args && args.libName) ? args.libName : "";
      args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.
      args.functionName = functionName;

      //this.signatureStack.saveSignature(functionName,params,libName); // this is now done in the preprocessor

      var result="";
      result += "\n"+CommentTools.addComments(ctx.children.FunctionLiteral,true);
      if(libName) {
        result += libName +"." + functionName +" = function ";
      } else {
        result += "function " + functionName;
      }
      result += " ( " + params.vars + ") ";
      result += "{ "
      result += params.defaults;
      result += "\n"+CommentTools.addComments(ctx.children.body,true);
      result += "return (" + this.ctxTools.childToString(ctx.children.body,args) + ");"
      result += "}\n"

        return result;
    }

    moduleDefinition(ctx,args) {
      var moduleName = ctx.children.Identifier[0].image;
      var params = this.paramsParser(ctx.children.parameters,args)
      var libName = (args && args.libName) ? args.libName : "";
      args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.
      args.moduleName = moduleName;

      // this.signatureStack.saveSignature(moduleName,params,libName);  // this is now done in the preprocessor

      var result = "";
      result += "\n"+CommentTools.addComments(ctx.children.ModuleLiteral);

      if(libName) {
        result += libName +"." + moduleName +" = function ";
      } else {
        result += "function " + moduleName;
      }


      args.unwrap = true;
      result += " ( " + params.vars + ") ";
      result += "{ "

      var subresult = this.moduleBlock(ctx,args) ;  // treat a program like a module block

      result += Utils.formatActionStmtNoWrap(subresult);

      result += "}\n";

      return result;
    }

    program(ctx,args) {
      //this.options = options;
      this.signatureStack = args.signatureStack || new SignatureStack();

      CommentTools.doComments(args.comments===true);
      var result = "";
      var libName = args.libName;  //args.libName;
      args.moduleName = libName;
      args.csgType="union";
      result += "\n"+CommentTools.addComments(ctx,args);

      result += "var animate=0;\n"
      result += "var fn=12;\n"

      result += libName + " = function () {\n";
      result += (args.includes ? 'include ("helpers.js");' : "") + "\n$h();\n"

      args.sep="; ";
      //args.isActions=false;
      //result += this.ctxTools.iterate(ctx.children.statement,args);

      result += "\n" + libName +".libmain = function (args){\n";

      var subresult = this.moduleBlock(ctx,args) ;  // treat a program like a module block

     result += Utils.formatActionStmtNoWrap(subresult);


      result += "}\n}\n";

      result += "function main(args) { " + libName +"();\n return "+ libName +".libmain(args);}"

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

      return({key:key,value:value});
    }


    includeStmt (ctx,args) {
      var result="";

      var filePath = ctx.children.IncludeFile[0].image.slice(1,-1).replace(".scad","."+args.fileExtension); //FIXME - path here?
      var fileBase = path.basename(filePath);

      result +=  CommentTools.addComments(ctx.children.IncludeLiteral,true);
      result +=  'include ("' + filePath + '"); '
      result +=  'lib' + fileBase.split(".")[0] +'();\n';
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
        result += " nullCSG()";
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

      var funcName = ctx.children.Identifier[0].image;

      var signature = this.signatureStack.getSignature(funcName);
      args.signature = signature;
      var funcArgs = this.argumentsParser(ctx.children.arguments,args);
      var named = funcArgs.slice(-1)[0] || {};
      funcArgs = funcArgs.slice(0,-1);


      Logging.warnCheck(ctx,(funcName=="linear_extrude" && named.scale)," OpenJSCAD linear_extrude does not recognize the scale argument")
      Logging.warnCheck(ctx,(funcName=="minkowski" && named.scale)," minkowski() is not supported")
      Logging.warnCheck(ctx,(funcName=="linear_extrude" && named.center)," OpenJSCAD linear_extrude will center in x,y,z rather than just z")
      Logging.warnCheck(ctx,(funcName=="text" && (named.font || named.valign || named.direction || named.language || named.script || named.fn)),"Conversion for text is limited. The following arguments are not supported: font, valign, direction, language, script and fn")

      // HACK Alert: fixing some of the function names/arguments to allow them to function properly.
      funcName = funcName ==="echo" ? "echof" : funcName;
      if(funcName ==="circle") named.center = named.center ? named.center : true;
      if(funcName ==="cylinder" && (named.r2 && !named.r1)) {
        named.r1 = named.r; delete named.r;
      }

      // There is no available import in jscad, the code below assumes that the import file has been pre-processed into
      //  a jscad .js file and is available in the target import directory
      if(funcName === "import" || funcName === "import_dxf" || funcName === "import_stl"){
        var fileName = named.file || funcArgs[0];
        var convexity = named.convexity || funcArgs[1];
        var layer = named.layer || funcArgs[2];
        funcName = fileName.replace(/\./g,"_").slice(1,-1);
        fileName = fileName.replace(/\.(dxf|stl)/,"_$1.js");

        result += "(" + funcName + "("+ (convexity || "") +")["+ (layer || '1') +"], ";

      } else {
        result +=  " " + ((signature && signature.libName) ? signature.libName+"." : "") + funcName
        result +=   "(  ";
        result +=  funcArgs.length ? funcArgs.toString() +", "  :"";
        result +=  Object.keys(named).length>0 ?  "{"+Object.keys(named).reduce((acc,key)=>{return acc +( key + ":" + named[key]+",")},"").slice(0,-1) +"}, " :"";


        // FIXME - This adds a nullCSG() to translate() correctly, but also adds it to sphere() i.e. sphere(r=3,nullCSG())
        var subresult = this.actionStatement(ctx.children.actionStatement[0],args);

        result += Utils.formatActionStmtFullWrap(subresult);

        result +=   ")  ";
      }

      return result;

    }

    functionCall(ctx,args) {
      var result = "";
      args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.

      var funcName = ctx.children.Identifier[0].image;

      var signature = this.signatureStack.getSignature(funcName);
      args.signature = signature;
      var funcArgs = this.argumentsParser(ctx.children.arguments,args);
      var named = funcArgs.slice(-1)[0] || {};
      funcArgs = funcArgs.slice(0,-1);

      result +=  " " + ((signature && signature.libName) ? signature.libName+"." : "") + funcName
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
            named[signature.names[i]] = named[signature.names[i]] == undefined ?  signature.defaults[i] : named[signature.names[i]] ;
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

        // HACK ALERT: patch incompatible argument translations
        // When size is passed by name to square() it needs to be a 2 element array in jscad
        if(signature.funcName === "square" && named && named.size && named.size[0]!="[")   named.size = "["+named.size+","+named.size+"]";
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
        result += CommentTools.addComments(ctx.children.paramName[0]) +":";
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

      result += "$h.forLoop(";

     result += ranges.reduce((acc,range)=>acc+=range.arg+",","").slice(0,-1)

     if(ctx.children.IfLiteral){
      result += ",(";
      result += ranges.reduce((acc,range)=>acc+=range.name+",","").slice(0,-1)
      result += ")=>("
      result += this.ctxTools.childToString(ctx.children.ifExpression,args)
      result +=")"
     }
     result += ",(elem)=>{\nlet ["
     //ranges.forEach((range)=>this.trySaveVariable(range.name));
     result +=  ranges.reduce((acc,range)=>acc+=range.name+",","").slice(0,-1)
     result += "]=elem;\n"

      if(ctx.children.LetLiteral){
        var args = this.argumentsParser(ctx.children.arguments,args)[0];

        //result += "{";
        for(var prop in args){
          var found = false; //= this.trySaveVariable(prop);
          result += (found ? "" : "let ") + prop + " = " + args[prop] + ";\n";
        }
      };
      result += CommentTools.addComments(ctx.children.body,true);
      result += "return (" + this.ctxTools.childToString(ctx.children.body,args) + ");"; // expression

      result += "})";

      return result;
    };


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
