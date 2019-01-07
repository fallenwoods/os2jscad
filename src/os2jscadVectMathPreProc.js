
//const chevrotain = require("chevrotain");

const path = require("path");
const Utilities = require("./Utilities.js");

const SignatureStack = Utilities.SignatureStack;
const CtxTools = Utilities.CtxTools;
const Utils = Utilities.Utils;



/*=============================================================================================*\
  Intepreter

\*=============================================================================================*/

//var $t=0,$fn=0,$fa=12,$fs=2,$preview=false,$vpr=[0,0,0],$vpt=[10,10,10],$vpd=50;


  class os2jscadVectMathPreProc {//} extends BaseCstVisitor {

    constructor() {
        this.signatureStack = new SignatureStack();
    }

    program (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];

        this.moduleBlock(ctx,args);  // Program is actually a moduleBlock

        return  this.signatureStack;

    }
    functionDefinition (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.
        var libName = args.libName;
        delete args.libName;    // nothing in this scope should be treated as global

        var functionName = ctx.children.Identifier[0].image;
        var signature = this.signatureStack.saveSignature(functionName,libName);

        var newScope = this.signatureStack.addScope(functionName);  // parameters, vars, functions and modules will be within this scope


        //this.parameters(ctx.children.parameters,args);      // THis *should* be handled in parametersParser

        var params = this.paramsParser(ctx.children.parameters)
        signature.names = params.reduce((acc,param)=>{acc.push(param.key); return acc;},[]);
        params.forEach((param)=>this.signatureStack.saveVarSignature(param.key,undefined,param.type));

        signature.type = this.expression(ctx.children.body,args);

        this.signatureStack.popScope();  // set the scope back to this scopes parent

        return signature.type;
    }
    moduleDefinition (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        args = Utils.clone(args); // replace local args reference with clone, so parent doesn't get changed.
        var libName = args.libName;
        delete args.libName;    // nothing in this scope should be treated as global

        var moduleName = ctx.children.Identifier[0].image;
        var signature = this.signatureStack.saveSignature(moduleName,libName,"s");

        var newScope = this.signatureStack.addScope(moduleName);  // parameters, vars, functions and modules will be within this scope

        var params = this.paramsParser(ctx.children.parameters)
        signature.names = params.reduce((acc,param)=>{acc.push(param.key); return acc;},[]);
        params.forEach((param)=>this.signatureStack.saveVarSignature(param.key,undefined,param.type));

        this.statement(ctx.children.statement,args);

        this.signatureStack.popScope();  // set the scope back to this scopes parent

        return "s";
     }
     paramsParser(ctx){
        ctx = CtxTools.trySkipArray(ctx);

        if(!ctx.children.parameter) return [];

        var result = ctx.children.parameter.map((param)=>this.paramParser(param))

        return result;
      }

      paramParser(ctx){
        var key = ctx.children.paramName ? ctx.children.paramName[0].image : "$value";
        var type = ctx.children.default ? this.expression(ctx.children.default) : "s";

        return({key:key,type:type});
      }

    moduleBlock (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        if(ctx.children.statement){
            ctx.children.statement.forEach((stmt)=>{
            this.statement(stmt,args);
            })
        }
        return "s";
    }
    statement (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        if(ctx.children.declaration) this.declaration(ctx.children.declaration,args);
        if(ctx.children.assignment) this.assignment(ctx.children.assignment,args);
        if(ctx.children.moduleBlock) this.moduleBlock(ctx.children.moduleBlock,args);
        if(ctx.children.simpleAction) this.simpleAction(ctx.children.simpleAction,args);
        return "s";
     }
    declaration (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        if(ctx.children.moduleDefinition) this.moduleDefinition(ctx.children.moduleDefinition,args);
        if(ctx.children.functionDefinition) this.functionDefinition(ctx.children.functionDefinition,args);
        //this.includeStmt(ctx.children.includeStmt,args);
        return "s";
    }
    actionBlock (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        if(ctx.children.actionStatement) ctx.children.actionStatement.forEach((as)=>{this.actionStatement(as,args);});
        return "s";
    }
    actionStatement (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        this.actionBlock(ctx.children.actionBlock,args);
        this.simpleAction(ctx.children.simpleAction,args);
        this.assignment(ctx.children.assignment,args);
        return "s";
     }
    simpleAction (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        this.moduleChain(ctx.children.moduleChain,args);
        this.ifStatement(ctx.children.ifStatement,args);
        this.forLoop(ctx.children.forLoop,args);
        this.CSGAction(ctx.children.CSGAction,args);
        this.letStmt(ctx.children.letStmt,args);
        //this.semicolon(ctx.children.semicolon,args);
        return "s"
    }
    moduleChain (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        this.arguments(ctx.children.arguments,args);
        this.actionStatement(ctx.children.actionStatement,args);
        return "s";
     }
    debugModifier (ctx,args) { }
    includeStmt (ctx,args) { }
    letStmt (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        this.arguments(ctx.children.arguments,args);
        this.actionStatement(ctx.children.actionStatement,args);
        return "s";
    }
    CSGAction (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        this.actionStatement(ctx.children.actionStatement,args);
        return "s";
    }
    assignment (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        var varName = ctx.children.lhs[0].image;
        var result = this.expression(ctx.children.rhs,args)

        this.signatureStack.saveVarSignature(varName,args.libName,result);

        return result
    }
    expression (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        var result = this.conditionalExpression(ctx.children.conditionalExpression,args)
        ctx.$type = result;
        return result
    }
    conditionalExpression (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        var result;
        if(!ctx.children.trueClause){
            result = this.binaryCompareExpression(ctx.children.condition,args);
        } else {
            result = CtxTools.maxType(this.conditionalExpression(ctx.children.trueClause,args), this.conditionalExpression(ctx.children.falseClause,args) )
        }

        ctx.$type = result;
        return result
    }
    binaryCompareExpression (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        var result = this.binaryBoolExpression(ctx.children.lhs,args);
        if(ctx.children.rhs) result = "s";
        ctx.$type = result;
        return result;
     }
    binaryBoolExpression (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        var result = this.binarySumDiffExpression(ctx.children.lhs,args);
        if(ctx.children.rhs) result = "s";
        ctx.$type = result;
        return result;
     }
    binarySumDiffExpression (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        var result = CtxTools.maxType(this.binaryMultDivExpression(ctx.children.lhs,args), this.binarySumDiffExpression(ctx.children.rhs,args) )
        ctx.$type = result;
        return result
    }
    binaryMultDivExpression (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        var result = CtxTools.maxType(this.unaryExpression(ctx.children.lhs,args), this.binaryMultDivExpression(ctx.children.rhs,args) )
        ctx.$type = result;
        return result
    }
    unaryExpression (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        var result = "s";
        if(ctx.children.operator && ctx.children.operator[0].image === "!") return "s";
        result = this.atomicExpression(ctx.children.rhs,args)
        ctx.$type = result;
        return result
    }
    atomicExpression (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        var signature = ctx.children.Identifier ? this.signatureStack.getVarSignature(ctx.children.Identifier[0].image): undefined
        var result = CtxTools.maxType(      //can visit accept undefined input?
            this.parenthesisExpression(ctx.children.parenthesisExpression,args),
            this.array(ctx.children.array,args),
            this.functionCall(ctx.children.functionCall,args),
            this.listComprehension(ctx.children.listComprehension,args),
            signature ? signature.type : "s"
        )
        //this.NumberLiteral(ctx.children.NumberLiteral,args),
        //this.StringLiteral(ctx.children.StringLiteral,args),
        //this.Identifier(ctx.children.Identifier,args)
        ctx.$type = result;
        return result;
     }
    arrayLookup (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        this.expression(ctx.children.expression,args);
        return "s";
     }

    listComprehension (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        var result = "v";
        ctx.$type = result;
        return result
    }
    array (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        if(ctx.children.item) ctx.children.item.forEach((item)=>{this.expression(item,args);});
        var result = "v";
        ctx.$type = result;
        return result
     }
    parenthesisExpression (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        var result = this.expression(ctx.children.expression,args)
        ctx.$type = result;
        return result
     }
    parameters (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        if(ctx.children.parameter) ctx.children.parameter.forEach((param)=>{this.parameter(param,args);});
        return "s";
    }
    parameter (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        this.expression(ctx.children.default,args);
         return "s";
        }

    functionCall (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];

        var funcName = ctx.children.Identifier[0].image;
        this.arguments(ctx.children.arguments,args);
        var signature = this.signatureStack.getSignature(funcName);
        var result = signature ? signature.type : "s";
        ctx.$type = result;
        return result
    }
    arguments (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        if(ctx.children.argument) ctx.children.argument.forEach((arg)=>{this.argument(arg,args);});
        return "s";
    }
    argument (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        this.expression(ctx.children.value,args);
         return "s";
        }
    comment (ctx,args) {}
    forLoop (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        if(ctx.children.ranges) ctx.children.ranges.forEach((range)=>{this.assignment(range,args);});
        this.actionStatement(ctx.children.actionStatement,args);
        return "s";
    }
    ifStatement (ctx,args) {
        if(!ctx) return "s"; else if (Array.isArray(ctx) ) ctx=ctx[0];
        this.expression(ctx.children.expression,args);
        this.actionStatement(ctx.children.ifClause,args);
        this.actionStatement(ctx.children.elseClause,args);
        return "s";
    }

}


module.exports = {
    os2jscadVectMathPreProc:  os2jscadVectMathPreProc

}
