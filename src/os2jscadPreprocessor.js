
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


  class os2jscadPreprocessor { // extends BaseCstVisitor {

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

    program(ctx,options) {
        this.options = options;

        this.moduleBodyDeclarations(ctx,options.libName);  // Program is actually a moduleBodyDeclaration

        return  this.signatureStack;
      }

    moduleBodyDeclarations(ctx,libName) {
        if(ctx.children.declaration){
            ctx.children.declaration.forEach((elem)=>{
            this.declaration(elem,libName);
            })
        }

    }

    declaration(ctx,libName) {

        if(ctx.children.moduleDefinition) this.moduleDefinition(ctx.children.moduleDefinition[0],libName);
        if(ctx.children.functionDefinition) this.functionDefinition(ctx.children.functionDefinition[0],libName);

      }

    functionDefinition(ctx,libName) {
        var functionName = ctx.children.Identifier[0].image;
        var params = this.paramsParser(ctx.children.parameters)
        this.options.moduleName = functionName;

        this.signatureStack.saveSignature(functionName,params,libName);

        // We are only interested in top level functions, modules and (possibly) assignments. So no need to continue.


    }

    moduleDefinition(ctx,libName) {
      var moduleName = ctx.children.Identifier[0].image;
      var params = this.paramsParser(ctx.children.parameters)
      this.options.moduleName = moduleName;

      this.signatureStack.saveSignature(moduleName,params,libName);

       // We are only interested in top level functions, modules and (possibly) assignments. So no need to continue.
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

    }


module.exports = {
  os2jscadPreprocessor:  os2jscadPreprocessor

}
