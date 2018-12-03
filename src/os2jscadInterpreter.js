
//const chevrotain = require("chevrotain");

const path = require("path");
const Utilities = require("./Utilities.js");

const SignatureStack = Utilities.SignatureStack;
const CtxTools = Utilities.CtxTools;
const CommentTools = Utilities.CommentTools;
const Logging = Utilities.Logging;


/*=============================================================================================*\
  Intepreter

\*=============================================================================================*/

//var $t=0,$fn=0,$fa=12,$fs=2,$preview=false,$vpr=[0,0,0],$vpt=[10,10,10],$vpd=50;


  class os2jscadInterpreter {//extends BaseCstVisitor {

    constructor() {
        //super();                  //FIXME add this and the validator back in. (I'm not using visitor() so this may not be needed.)

        this.options;
        this.ctxTools= new CtxTools(this);
        this.signatureStack = new SignatureStack();
        // This helper will detect any missing or redundant methods on this visitor
        //FIXME Can this be reintroduced by passing in the parser and using call()?
        // Is this the only thing the parent is used for?
        //this.validateVisitor()
    }

    array(ctx) {
      var result="";

      if(ctx.children.sep && ctx.children.sep[0].image ==":") {
         result =  "$h.range(" +  this.ctxTools.iterate(ctx.children.item,",") + ")"
      } else {
        result =  "["+
          this.ctxTools.iterate(ctx.children.item,",") +
        "]";
      }


      return result;
    }

    arrayLookup(ctx) {
      return "" +
        this.ctxTools.iterateChildren(ctx,["LSquare","expression","RSquare"]);
    }

    assignment(ctx) {
      var result = "";
      result += CommentTools.addComments(ctx.children.lhs,true)
      var found = this.signatureStack.isVarInSignature(this.options.moduleName,ctx.children.lhs[0].image)
      result += (found ? "": "var ") + this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"]) + ";";
      return result;
    }



    atomicExpression(ctx) {
      var result="";
      for(var prop in ctx.children){
        switch(prop){
          case "functionCall":
            result += this.ctxTools.childToString(ctx.children.functionCall);
          break;
          case "arrayLookup":
            result += this.ctxTools.iterate(ctx.children.arrayLookup);
          break;
          case "LSquare":
          case "RSquare":
          break;
          default:
            result += this.ctxTools.childToString(ctx.children[prop])
          break;
        }
      }

      return result
    }


    binaryCompareExpression(ctx) { return this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"]);}
    binaryBoolExpression(ctx) { return this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"]);}

    binaryMultDivExpression(ctx) {
      var result = "";
      /*
      if(ctx.children.operator){
        result = (ctx.children.operator[0].image === "*" ? "mult(" : "div(") +
        this.ctxTools.childToString(ctx.children.lhs) +
        ","+
        this.ctxTools.childToString(ctx.children.rhs) +
        ")";
      } else */
       {
        result = this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"]);
      }
      return result;
    }

    binarySumDiffExpression(ctx) {
      var result = "";
      /*
      if(ctx.children.operator){
        result = (ctx.children.operator[0].image === "+" ? "add(" : "diff(") +
        this.ctxTools.childToString(ctx.children.lhs) +
        ","+
        this.ctxTools.childToString(ctx.children.rhs)+
        ")";
      } else  */
      {
        result = this.ctxTools.iterateChildren(ctx,["lhs","operator","rhs"])
      }
      return result;
    }

    unaryExpression(ctx) {
      return this.ctxTools.iterateChildren(ctx,["operator","rhs"]);
    }


    conditionalExpression(ctx) {
      return this.ctxTools.iterateChildren(ctx,["condition","Questionmark","trueclause","Colon","falseclause"]);}

    expression(ctx) { return this.ctxTools.childToString(
      ctx.children.conditionalExpression);}

    functionDefinition(ctx,libName) {
      var functionName = ctx.children.Identifier[0].image;
      var params = this.paramsParser(ctx.children.parameters)
      this.options.moduleName = functionName;

      this.signatureStack.saveSignature(functionName,params,libName);

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
      result += "return (" + this.ctxTools.childToString(ctx.children.body) + ");"
      result += "}\n"

        return result;
    }

    moduleDefinition(ctx,libName) {
      var moduleName = ctx.children.Identifier[0].image;
      var params = this.paramsParser(ctx.children.parameters)
      this.options.moduleName = moduleName;

      this.signatureStack.saveSignature(moduleName,params,libName);

      var result = "";
      result += "\n"+CommentTools.addComments(ctx.children.ModuleLiteral);

      if(libName) {
        result += libName +"." + moduleName +" = function ";
      } else {
        result += "function " + moduleName;
      }


      result += " ( " + params.vars + ") ";
      result += "{ "
      result += params.defaults;
      result += this.ctxTools.childToString(ctx.children.moduleBody,"");
      result += "}\n";

      return result;
    }

    program(ctx,options) {
      this.options = options;

      CommentTools.doComments(options.comments===true);
      var result = "";
      var libName = this.options.libName;
      this.options.moduleName = libName;
      result += "\n"+CommentTools.addComments(ctx);

      result += libName + " = function () {\n";
      result += (options.includes ? 'include ("helpers.js");' : "") + "\n$h();\n"

      result += this.moduleBodyDeclarations(ctx,libName);  // This context actually is a moduleBody

      result += "\n" + libName +".main = function (args){\n";
      result += this.moduleBodyActions(ctx,"");
      result += "\n}\n";

      result += "}\n";

      result += "function main(args) { " + libName +"();\n return "+ libName +".main(args);}"

      return result;
    }

    moduleBody(ctx) {
      var result = "";

      result += this.moduleBodyDeclarations(ctx);
      result += this.moduleBodyActions(ctx);

      return result;

    }

    moduleBodyDeclarations(ctx,libName) {
      var result ="";

      if(ctx.children.declaration){
        ctx.children.declaration.forEach((elem)=>{
          result +=  this.declaration(elem,libName);
        })
      }

      result +=  this.ctxTools.iterate(ctx.children.assignment);

      return result;
    }
    moduleBodyActions(ctx) {
      var result ="";

      if(ctx.children.action) {
        if(ctx.children.action.length > 1){
          result += "return union ("
          result +=  this.ctxTools.iterate(ctx.children.action,", ");
          result += ")"
        } else
        result += CommentTools.addComments(ctx.children.action);
          result +=  "return " + this.ctxTools.iterate(ctx.children.action,", ");
      } else {
        result += "return nullCSG();"
      }

        return result;
    }


    paramsParser(ctx){
      var names = "";
      var defaults = "";
      var vars="";
      var hasDefaults = false;
      ctx = CtxTools.trySkipArray(ctx);

      if(!ctx.children.parameter) return {vars:"",defaults:""}

      for(var i = 0;i<ctx.children.parameter.length;i++){
        var param = this.paramParser(ctx.children.parameter[i]);
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

    paramParser(ctx){
      var key = ctx.children.paramName ? ctx.children.paramName[0].image : "$value";
      var value = ctx.children.default ? this.ctxTools.childToString(ctx.children.default) : undefined;

      return({key:key,value:value});
    }


    includeStmt (ctx) {
      var result="";

      var filePath = ctx.children.IncludeFile[0].image.slice(1,-1).replace(".scad","."+this.options.fileExtension); //FIXME - path here?
      var fileBase = path.basename(filePath);

      result +=  CommentTools.addComments(ctx.children.IncludeLiteral,true);
      result +=  'include ("' + filePath + '"); '
      result +=  'lib' + fileBase.split(".")[0] +'();\n';
      return result;
    }

    letStmt(ctx) {
      var result = "";

      result += "((()=>{ \n"

      var args = this.argumentsParser(ctx.children.arguments)[0];

      for(var prop in args){
        var found = false;//  = this.trySaveVariable(prop);
        result += (found ? "" : "let ") + prop + " = " + args[prop] + ";\n";
      }

      result += this.actionAssigns(ctx.children.action[0]);
      result += CommentTools.addComments(ctx.children.action);
      result += "return " + this.actionActions(ctx.children.action[0]) +";";


      result += "})()) \n"


      return result;
    }

    declaration(ctx,libName) {
      var result="";

      result += this.ctxTools.childToString(ctx.children.includeStmt);
      if(ctx.children.moduleDefinition) result += this.moduleDefinition(ctx.children.moduleDefinition[0],libName);
      if(ctx.children.functionDefinition) result += this.functionDefinition(ctx.children.functionDefinition[0],libName);

      return result;
    }

    action(ctx,sep){
      var result = "";
      result += this.actionAssigns(ctx,sep);
      result += this.actionActions(ctx,sep);

      return result;
    }

    actionAssigns(ctx,sep) {
      var result = "";
      sep = sep || ", ";

      result += this.ctxTools.iterate(ctx.children.assignment,"");

      return result;
    }
    actionActions(ctx,sep,csgType) {
      var result = "";
      sep = sep || ", ";
      csgType = csgType || "union";

      result += this.ctxTools.childToString(ctx.children.ifStatement);
      result += this.ctxTools.childToString(ctx.children.forLoop);
      result += this.ctxTools.childToString(ctx.children.functionChain);
      result += this.ctxTools.childToString(ctx.children.CSGAction);
      result += this.ctxTools.childToString(ctx.children.letStmt);


      if(ctx.children.action && ctx.children.action.length > 1) result += csgType + " ( "
      result += this.ctxTools.iterate(ctx.children.action,sep);
      if(ctx.children.action && ctx.children.action.length > 1) result += ")"

      return result;
    }


    // For things line union(){} intersection etc.
    // difference(){a=1;sphere();cube();}
    // ((()=>{a=1; return difference(sphere(),cube())})())
    CSGAction(ctx) {
      var result="";

      var assigns = this.actionAssigns(ctx.children.action[0])
      var csgType = ctx.children.CSGLiteral[0].image;

      if(assigns != "") {
        result += "((()=>{"

        result += assigns;
        result += CommentTools.addComments(ctx.children.action);
        result += "return " + this.actionActions(ctx.children.action[0],", ",csgType);

        result += "})()) ";

      } else {
        result += this.actionActions(ctx.children.action[0],", ",csgType) ;
      }

      return result;
    }

    functionChain(ctx) {
      var result = "";
      var funcName = ctx.children.Identifier[0].image;

      var signature = this.signatureStack.getSignature(funcName);
      var args = this.argumentsParser(ctx.children.arguments,signature);
      var named = args.slice(-1)[0] || {};
      args = args.slice(0,-1);


      Logging.warnCheck(ctx,(funcName=="linear_extrude" && named.scale)," OpenJSCAD linear_extrude does not recognize the scale argument")
      Logging.warnCheck(ctx,(funcName=="linear_extrude" && named.center)," OpenJSCAD linear_extrude will center in x,y,z rather than just z")
      Logging.warnCheck(ctx,(funcName=="text" && (named.font || named.valign || named.direction || named.language || named.script || named.fn)),"Conversion for text is limited. The following arguments are not supported: font, valign, direction, language, script and fn")

      funcName = funcName ==="echo" ? "echof" : funcName;
      if(funcName ==="circle") named.center = named.center ? named.center : true;
      if(funcName ==="cylinder" && (named.r2 && !named.r1)) {
        named.r1 = named.r; delete named.r;
      }

      // There is no available import in jscad, the code below assumes that the import file has been pre-processed into
      //  a jscad .js file and is available in the target import directory
      if(funcName === "import" || funcName === "import_dxf" || funcName === "import_stl"){
        var fileName = named.file || args[0];
        var convexity = named.convexity || args[1];
        var layer = named.layer || args[2];
        funcName = fileName.replace(/\./g,"_").slice(1,-1);
        fileName = fileName.replace(/\.(dxf|stl)/,"_$1.js");
        importIncludes += 'include ('+fileName+');\n'

        result += "(" + funcName + "("+ (convexity || "") +")["+ (layer || '1') +"], ";

      } else {
        result +=  " " + ((signature && signature.libName) ? signature.libName+"." : "") + funcName
        result +=   "(  ";
        result +=  args.length ? args.toString() +", "  :"";
        result +=  Object.keys(named).length>0 ?  "{"+Object.keys(named).reduce((acc,key)=>{return acc +( key + ":" + named[key]+",")},"").slice(0,-1) +"}, " :"";

        var action =  this.ctxTools.iterate(ctx.children.action,", ") ;

        if(action !== ""){
          result += action;
        } else {
          result = result.slice(0,-2);
        }

        result +=   ")  ";
      }

      return result;

    }

    functionCall(ctx) {
      var result = "";
      var funcName = ctx.children.Identifier[0].image;

      var signature = this.signatureStack.getSignature(funcName);
      var args = this.argumentsParser(ctx.children.arguments,signature);
      var named = args.slice(-1)[0] || {};
      args = args.slice(0,-1);

      result +=  " " + ((signature && signature.libName) ? signature.libName+"." : "") + funcName
      result +=   "(  ";
      result +=  args.length ? args.toString() +", "  :"";
      result +=  Object.keys(named).length>0 ?  "{"+Object.keys(named).reduce((acc,key)=>{return acc +( key + ":" + named[key]+",")},"").slice(0,-1) +"}, " :"";

      result = result.slice(0,-2);

      result +=   ")  ";


      return result;

    }

    parenthesisExpression(ctx) { return this.ctxTools.iterateChildren(ctx,["LParen","expression","RParen"]);}
    parameters(ctx) { return this.ctxTools.childToString(ctx);}
    parameter(ctx) { return this.ctxTools.childToString(ctx);}
    debugModifier(ctx) {
      return this.ctxTools.childToString(ctx.children.Hash);}


    // e.g. (a,2,var1,param=3)
    argumentsParser(ctx,signature){
      var result = [];
      var named = {};
      ctx = CtxTools.trySkipArray(ctx);

      if(ctx.children.argument ) {
        for(var i = 0;i<ctx.children.argument.length;i++){
          var param = this.argumentParser(ctx.children.argument[i]);
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

    argumentParser(ctx){
      var name = ctx.children.paramName ? this.ctxTools.childToString(ctx.children.paramName) : undefined;
      var value = ctx.children.value ? this.ctxTools.childToString(ctx.children.value) : "";

      return({name:name,value:value});
    }

    arguments(ctx) {
      var result="";
      var positional="";
      var named="";

      if( ctx.children.argument){

        ctx.children.argument.forEach((elem)=>{
          var arg = this.argument(elem);
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
    argument(ctx) {
      var result = "";

      if(ctx.children.EqualSign){
        result += CommentTools.addComments(ctx.children.paramName[0]) +":";
      }

      result += this.ctxTools.childToString(ctx.children.value);
      return result;
    }

    ifStatement(ctx) {
      var result = ""

      result += "$h.ifFunc(";

      result += "("+this.ctxTools.childToString(ctx.children.expression) +")";

      result += ",()=>{";
      result +=  this.actionAssigns(ctx.children.ifClause[0]);
      result += CommentTools.addComments(ctx.children.ifClause,true);
      result +=  "return " + this.actionActions(ctx.children.ifClause[0]);
      result += "}";

      if(ctx.children.elseClause){
        result += ",()=>{";
        result +=  this.actionAssigns(ctx.children.elseClause[0]);
        result += CommentTools.addComments(ctx.children.elseClause,true);
        result +=  "return " + this.actionActions(ctx.children.elseClause[0]);
        result += "}";
      }

      result += ")";

      return result;
    }

    listComprehension(ctx) {
      var result="";
      var ranges = ctx.children.ranges.map((range)=>this.forRange(range))

      result += "$h.forLoop(";

     result += ranges.reduce((acc,range)=>acc+=range.arg+",","").slice(0,-1)

     if(ctx.children.IfLiteral){
      result += ",(";
      result += ranges.reduce((acc,range)=>acc+=range.name+",","").slice(0,-1)
      result += ")=>("
      result += this.ctxTools.childToString(ctx.children.ifExpression)
      result +=")"
     }
     result += ",(elem)=>{\nlet ["
     //ranges.forEach((range)=>this.trySaveVariable(range.name));
     result +=  ranges.reduce((acc,range)=>acc+=range.name+",","").slice(0,-1)
     result += "]=elem;\n"

      if(ctx.children.LetLiteral){
        var args = this.argumentsParser(ctx.children.arguments)[0];

        //result += "{";
        for(var prop in args){
          var found = false; //= this.trySaveVariable(prop);
          result += (found ? "" : "let ") + prop + " = " + args[prop] + ";\n";
        }
      };
      result += CommentTools.addComments(ctx.children.body,true);
      result += "return (" + this.ctxTools.childToString(ctx.children.body) + ");"; // expression

      result += "})";

      return result;
    };


    //union($h.forLoop($h.range(0, 10, 30),(elem) => {func})
    forLoop(ctx) {

        var result="";
        var ranges = ctx.children.ranges.map((range)=>this.forRange(range))

        result += "union($h.forLoop(";
        result += ranges.reduce((acc,range)=>acc+=range.arg+",","").slice(0,-1)
        result += ",(elem)=>{ let ["

        result += ranges.reduce((acc,range)=>acc+=range.name+",","").slice(0,-1)
        result += "]=elem; "
        result += this.actionAssigns(ctx.children.action[0],"");
        result += CommentTools.addComments(ctx.children.action);
        result += "return " + this.actionActions(ctx.children.action[0],"");
        result += "}))"

        return result;

      }


      forRange(ctx) {
        var result={}
        result.name=this.ctxTools.childToString(ctx.children.lhs);
        if(ctx.children.Comma){
          result.arg =  "[" + this.ctxTools.iterate(ctx.children.expression,",") + "]";
        } else if(ctx.children.Colon) {
          result.arg =  "$h.range(" +  this.ctxTools.iterate(ctx.children.expression,",") + ")"
        } else {
          result.arg =  this.ctxTools.iterate(ctx.children.rhs,",")
        }
        return result;
      }


    }


module.exports = {
  os2jscadInterpreter:  os2jscadInterpreter

}
