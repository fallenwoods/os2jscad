

class SignatureStack {
    constructor(){
        //this.scopes=[];
        //this.scopes.push(require("./signatures.js"));
        this.root=require("./signatures.js");
        this.root.name="root";
        this.currentScope=this.root;
        this.allScopes={};
    }
    addScope(newScope){
        this.currentScope =  {parent:this.currentScope,name:newScope};    // create a new empty scope pointing to the current
        this.allScopes[newScope] = this.currentScope;
        return this.currentScope
    }
    popScope(){
        return this.currentScope = this.currentScope.parent;
    }
    setScope(name){
        return this.currentScope = this.allScopes[name];
    }

    saveSignature(funcName,libName,type){
        var signatures =this.currentScope;
        funcName = "func_"+funcName;
        signatures[funcName] = {kind:"function",type:type,scope:signatures.name,name:funcName};  // Function and Module are not distiguished
        if (libName)signatures[funcName].libName = libName;

        return signatures[funcName];
    }

    saveVarSignature(varName,libName,type){
        var signatures =this.currentScope;
        varName = "var_"+varName;
        signatures[varName] = {kind:"var",type:type,scope:signatures.name,name:varName};
        if (libName)signatures[varName].libName = libName;

        return signatures[varName];
    }

    getSignature(funcName){
        var signatures =this.currentScope;
        funcName = "func_"+funcName;
        while(signatures){
            if(signatures[funcName])
            return signatures[funcName];
            signatures = signatures.parent;
        }

        return undefined;
    }

    getVarSignature(varName){
        var signatures =this.currentScope;
        varName = "var_"+varName;
        while(signatures){
            if(signatures[varName]) return signatures[varName];
            signatures = signatures.parent;
        }
        //if(signature) signature.varName = varName;
        return undefined;
    }


    isInTopScope(varName){
        var signatures =this.currentScope;
        varName = "var_"+varName;
        return signatures[varName];
    }
}

/*
    OptionsStack is different from signature and variable stacks.
*/
class OptionsStack {
    constructor(){
        this.optionsStack=[{}];
        //this.optionsStack[0].$optionsStack = this;
    }

    get(name,def) {
        var options = this.peek();
        return (options && options[name]) ? options[name] : def;
      }
    set(addOptions) {
        return Object.assign(this.peek(),addOptions);
    }
    clear(clearOptions) {
        var options = this.optionsStack[this.optionsStack.length-1];
        if(Array.isArray(clearOptions)){
            clearOptions.forEach((option)=>delete options[option])
        } else {
            delete options[clearOptions];
        }
    }
    peek(){
        return this.optionsStack[this.optionsStack.length-1];
    }

    pop() {
        delete this.optionsStack.pop();
        return this.peek(); // return what now tops the stack
    }

    push(addOptions) {
        var newOptions = Object.assign({},this.peek());  // clone top of stack
        this.optionsStack.push(newOptions);
        if(addOptions) this.set(addOptions);
        return this.peek();
    }
}
var doComments = false;
class CommentTools {

    static  doComments(aDoComments){
        doComments=aDoComments;
    }

    /*
    static  addComments(ctx,args){
        var doComments = args ? !args.comments : false;
        if (!doComments) return "";
        ctx = CtxTools.trySkipArray(ctx);
        var result ="";
        if(ctx.comments && ctx.comments.length>0){
          ctx.comments.forEach((comment)=>{
            result += comment.startColumn==1 ? "\n" : "";
            //comment.image = comment.image.replace(/(^\/\/)(!.*)/,"$1  $2");
            result +=  comment.image;

          })
          result +=  "\n";
          delete ctx.comments;
        }

        return result;
    }
    //*/
    //*
       static  addComments(ctx,args){
        var doComments = args ? !args.comments : false;
        if (!doComments) return "";
        ctx = CtxTools.trySkipArray(ctx);
        var result ="";
        if(ctx.$firstToken.precedingComments && ctx.$firstToken.precedingComments.length>0){
          ctx.$firstToken.precedingComments.forEach((comment)=>{
            result += comment.startColumn==1 ? "\n" : "";
            //comment.image = comment.image.replace(/(^\/\/)(!.*)/,"$1  $2");
            result +=  comment.image;

          })
          result +=  "\n";
          delete ctx.$firstToken.precedingComments;
        }

        //if(ctx.$firstToken.tokenType.name === "LBrace" && ctx.children.action){    // Special case where this may be the start of a block
        if(ctx.children && ctx.children.action){    // Special case where this may be the start of a block
            //result += "\n" + CommentTools.addComments(ctx.children.action);
            result +=  CommentTools.addComments(ctx.children.action,args);
        }
        return result;
      }
    //*/
}

class CtxTools {
    constructor(interpreter){
        this.interpreter = interpreter;
    }
    static trySkipArray(ctx){ return ctx = Array.isArray(ctx) ? ctx[0] : ctx;}

    iterateChildren(ctx,childNames,args) {
      var result="";
      var done=false;
      ctx = CtxTools.trySkipArray(ctx);
      delete args.sep;  // don't add additional separators
      if(ctx.image) result += CommentTools.addComments(ctx,args);
      var i=0;
      while(!done){ // while any of the children arrays have data, add it to the output
       done=true;
        childNames.forEach((childName)=>{
          if(ctx.children[childName] && ctx.children[childName][i]) {
            result += this.childToString(ctx.children[childName][i],args);
            done = false;
          }
        })
        i++;
      }
      return result;
    }

    iterate(ctx,args){
        var sep = args.sep;
      var result ="";
      if(!ctx) return "";
      for(var i = 0; i < ctx.length; i++){
        var elem = ctx[i];

        var subResult =  this.childToString(elem,args) //this[elem.name](elem);
        if(subResult !== ""){
          result +=  subResult + (sep ? sep : "");
        }
      }
      result = (sep) ? result.slice(0,-sep.length) : result;
      return result;
    }



    childToString(ctx,args){
      if(!ctx) return "";
      var result="";
      var comments = "";
      ctx = CtxTools.trySkipArray(ctx);

      comments = CommentTools.addComments(ctx,args);
      result+= comments;
      if(ctx.image){
         result +=
          (ctx.image[0]==="$") ? ctx.image.slice(1) :
          (ctx.image==="PI") ? "Math.PI" :
          ctx.image;
      } else if (ctx.name && this.interpreter[ctx.name]){
        result += this.interpreter[ctx.name](ctx,args);
      }
      return result;
    }

    static maxType(args){
        var argsAry = [...arguments];
        //if (argsAry.indexOf("m")>-1) return "m"   // current expressions are either "s" scalar or "v" vector
        if (argsAry.indexOf("v")>-1) return "v"
        return "s";
    }

}

class Logging {

    static logCheck(ctx,condition,msg,prefix="INF:"){
    if(condition)
        console.log(prefix+': ',msg,'at line:',ctx.$firstToken.startLine,'column:',ctx.$firstToken.startColumn)
    }

    static errCheck(ctx,condition,msg){ Logging.logCheck(ctx,condition,msg,'ERROR')}
    static warnCheck(ctx,condition,msg){ Logging.logCheck(ctx,condition,msg,'WARNING')}
    static infoCheck(ctx,condition,msg){ Logging.logCheck(ctx,condition,msg,'INFO')}

}
class Utils {
    static clone(obj){
        return Object.assign({},obj);
    }

    static formatActionStmtNoWrap(actionStmtObj,csgType){
        var result="";
        csgType = csgType || "union";

        actionStmtObj.declarations.forEach((dec)=>{result += dec + ";\n"})

        // Leading double slash comments can cause grief if they follow the return
        if(actionStmtObj.actions[0]) actionStmtObj.actions[0] = actionStmtObj.actions[0].replace(/(^\/\/)(.*)\r?\n/,"/*$2*/ ")

        result += "return (" + (actionStmtObj.actions.length>1 ? csgType + " (" : "  ");
        actionStmtObj.actions.forEach((dec)=>{result += dec + ",\n"})
        result = result.slice(0,-2);  // remove trailing comma
        result += (actionStmtObj.actions.length>1 ? "));" : actionStmtObj.actions.length>0 ? ");" : "nullCSG());");

        return result;
    }
    static formatActionStmtFullWrap(actionStmtObj,csgType){
        var result="";
        csgType = csgType || "union";
        var wrap = actionStmtObj.declarations.length>0

        result += wrap ? "((()=>{" : "";
        actionStmtObj.declarations.forEach((dec)=>{result += dec + ";\n"})

        // Leading double slash comments can cause grief if they follow the return
        if(actionStmtObj.actions[0]) actionStmtObj.actions[0] = actionStmtObj.actions[0].replace(/(^\/\/)(.*)\r?\n/,"/*$2*/ ")

        result += (wrap ? "return (" : "") + (actionStmtObj.actions.length>1 ? csgType + " (" : "");
        actionStmtObj.actions.forEach((dec)=>{result += dec + ",\n"})
        result = result.slice(0,-2);  // remove trailing comma
        result += (actionStmtObj.actions.length>1 ? ")" : "");
        result += wrap ? ")})())" : "";

        return result;
    }

    static isPrimtive(funcName){
        return (funcName.match(/cube|sphere|cylinder|polyhedron|square|circle|ellipse|regular_polygon|polygon|text|import"/) !== null);
    }


}

module.exports = {

    SignatureStack: SignatureStack,     //Instantiable
    OptionsStack: OptionsStack,         //Instantiable

    CtxTools:   CtxTools,
    CommentTools: CommentTools,
    Logging:    Logging,
    Utils:      Utils  }

