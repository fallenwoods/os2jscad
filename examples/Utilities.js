

class SignatureStack {
    constructor(){
        this.scopes=[];
        this.scopes.push(require("./signatures.js"));
    }
    push(){
        return this.scopes.push({});
    }
    pop(){
        return this.scopes.pop();
    }

    saveSignature(funcName,params,libName){
        var signatures = this.scopes.slice(-1)[0];
        signatures[funcName] = {names:params.vars.split(",")};
        if (libName)signatures[funcName].libName = libName;
    }

    getSignature(funcName){
        var signature;
        for(var i = this.scopes.length-1;i>=0;i--){
            if(this.scopes[i][funcName]){
                signature = this.scopes[i][funcName];
                break;
            }
        }
        if(signature) signature.funcName = funcName;
        return signature;
    }


    isVarInSignature(funcName,varName){
        var signature = this.getSignature(funcName)
        return (signature && signature.names[varName] !== undefined) ? true : false;
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

    static  addComments(ctx){
        if (!doComments) return "";
        ctx = CtxTools.trySkipArray(ctx);
        var result ="";
        if(ctx.$firstToken.precedingComments && ctx.$firstToken.precedingComments.length>0){
          ctx.$firstToken.precedingComments.forEach((comment)=>{
            result += comment.startColumn==1 ? "\n" : "";
            result +=  comment.image;
          })
          result +=  "\n";
          delete ctx.$firstToken.precedingComments;
        }
        if(ctx.$firstToken.tokenType.name === "LBrace" && ctx.children.actions){    // Special case where this may be the start of a block
            result += CommentTools.addComments(ctx.children.actions);
        }
        return result;
      }


}

class CtxTools {
    constructor(interpreter){
        this.interpreter = interpreter;
    }
    static trySkipArray(ctx){ return ctx = Array.isArray(ctx) ? ctx[0] : ctx;}

    iterateChildren(ctx,childNames) {
      var result="";
      var done=false;
      ctx = CtxTools.trySkipArray(ctx);
      if(ctx.image) result += CommentTools.addComments(ctx);
      var i=0;
      while(!done){ // while any of the children arrays have data, add it to the output
       done=true;
        childNames.forEach((childName)=>{
          if(ctx.children[childName] && ctx.children[childName][i]) {
            result += this.childToString(ctx.children[childName][i]);
            done = false;
          }
        })
        i++;
      }
      return result;
    }

    iterate(ctx,sep){
      var result ="";
      if(!ctx) return "";
      for(var i = 0; i < ctx.length; i++){
        var elem = ctx[i];

        var subResult =  this.childToString(elem) //this[elem.name](elem);
        if(subResult !== ""){
          result +=  subResult + (sep ? sep : "");
        }
      }
      result = (sep) ? result.slice(0,-sep.length) : result;
      return result;
    }



    childToString(ctx){
      if(!ctx) return "";
      var result="";
      var comments = "";
      ctx = CtxTools.trySkipArray(ctx);

      comments = CommentTools.addComments(ctx);
      result+= comments;
      if(ctx.image){
         result +=
          (ctx.image[0]==="$") ? ctx.image.slice(1) :
          (ctx.image==="PI") ? "Math.PI" :
          ctx.image;
      } else if (ctx.name && this.interpreter[ctx.name]){
        result += this.interpreter[ctx.name](ctx);
      }
      return result;
    }
}

class Logging {

    static logCheck(ctx,condition,msg,prefix="INF:"){
    if(condition)
        console.log(prefix+': ',msg,'at line:',ctx.$firstToken.startLine,'column:',ctx.$firstToken.startColumn)
    }

    static errCheck(ctx,condition,msg){ Logging.logCheck(ctx,condition,msg,'ERROR')}
    static warnCheck(ctx,condition,msg){ Logging.logCheck(ctx,condition,msg,'WARNING')}

}

module.exports = {

    SignatureStack: SignatureStack,     //Instantiable
    OptionsStack: OptionsStack,         //Instantiable

    CtxTools: CtxTools,
    CommentTools: CommentTools,
    Logging:  Logging,
  }

