

const chevrotain = require("chevrotain");

"use strict";

/*=============================================================================================*\
  Lexer

\*=============================================================================================*/

const createToken = chevrotain.createToken;
const tokenMatcher = chevrotain.tokenMatcher;
const Lexer = chevrotain.Lexer;


const Identifier = createToken({ name: "Identifier", pattern: /\$?[a-zA-z]\w*/ });
const Comment = createToken({ name: "Comment", pattern: /\/\/.*/ });//,group: Lexer.SKIPPED });

const BinaryComparison = createToken({name: "BinaryComparison", pattern: /<=|!=|==|>=|<|>/});
const BinaryBoolean = createToken({name: "BinaryBoolean", pattern: /&&|\|\|/});
// NOTE
// BinarySumDiff will be created from Plus and Minus
// BinaryMultDiv will be created from Star and Slash

const Minus = createToken({name: "Minus", pattern: /-/});     // both binary and unary minus
const Plus = createToken({name: "Plus", pattern: /\+/});
const Star = createToken({name: "Star", pattern: /\*/});      // mult and debug modifier
const Slash = createToken({name: "Slash", pattern: /\//});
const Percent = createToken({name: "Percent", pattern: /%/}); // mult and debug modifier




const CommentBlock = createToken({name: "CommentBlock", pattern: /\/\*(\*(?!\/)|[^*])*\*\// });//,group: Lexer.SKIPPED});
const LParen = createToken({name: "LParen", pattern: /\(/});
const RParen = createToken({name: "RParen", pattern: /\)/});
const LBrace = createToken({name: "LBrace", pattern: /\{/});
const RBrace = createToken({name: "RBrace", pattern: /\}\;|\}/});
const LSquare = createToken({name: "LSquare", pattern: /\[/});
const RSquare = createToken({name: "RSquare", pattern: /]/});
const EqualSign = createToken({name: "EqualSign", pattern: /=/, longer_alt: BinaryComparison});
const Comma = createToken({name: "Comma", pattern: /,/});



const Bang = createToken({name: "Bang", pattern: /!/, longer_alt: BinaryComparison});
const Hash = createToken({name: "Hash", pattern: /#/});
const Questionmark = createToken({name: "Questionmark", pattern: /\?/});
const Colon = createToken({name: "Colon", pattern: /:/});
const Semicolon = createToken({name: "Semicolon", pattern: /;/});


const IncludeFile = createToken({name: "IncludeFile", pattern: /<(([a-zA-Z]:|\.\.|\.)\/)?(\w+\/)*(\w+\.\w+)+>/});
const StringLiteral = createToken({
  name: "StringLiteral", pattern: /"(:?[^\\"\n\r]+|\\(:?[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/
});
const NumberLiteral = createToken({
  //name: "NumberLiteral", pattern: /(((\d+)(\.\d*))|((\d*)(\.\d+))|\d+)([eE][+-]?\d+)?/
  name: "NumberLiteral", pattern: /(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?/
});

const FunctionLiteral = createToken({name: "FunctionLiteral", pattern: /function/,  longer_alt: Identifier});
const ModuleLiteral = createToken({name: "ModuleLiteral", pattern: /module/,  longer_alt: Identifier});
const ForLiteral = createToken({name: "ForLiteral", pattern: /for/,  longer_alt: Identifier});
const IfLiteral = createToken({name: "IfLiteral", pattern: /if/,  longer_alt: Identifier});
const ElseLiteral = createToken({name: "ElseLiteral", pattern: /else/,  longer_alt: Identifier});
const CSGLiteral = createToken({name: "CSGLiteral", pattern: /union|intersection|difference|hull|render|minkowski/,  longer_alt: Identifier});  // These are currently treated as reserve words. I removed 'offset'
const LetLiteral = createToken({name: "LetLiteral", pattern: /let|assign/,  longer_alt: Identifier});
const IncludeLiteral = createToken({name: "IncludeLiteral", pattern: /include|use/,  longer_alt: Identifier});

// marking WhiteSpace as 'SKIPPED' makes the lexer skip it.
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED
});



// Labels only affect error messages and Diagrams.
LBrace.LABEL = "{";
RBrace.LABEL = "}";
LSquare.LABEL = "[";
RSquare.LABEL = "]";
Comma.LABEL = ",";
Colon.LABEL = ":";
Semicolon.LABEL = ";";
LParen.LABEL = "(";
RParen.LABEL = ")";
EqualSign.LABEL= "=";
Questionmark.LABEL="?";
FunctionLiteral.LABEL="function";
ModuleLiteral.LABEL="module";
ForLiteral.LABEL="for";
IfLiteral.LABEL="if";
Star.LABEL = "*";
Slash.LABEL = "/";
Plus.LABEL = "+";
Minus.LABEL = "-";

const allTokens = [WhiteSpace, Comment, CommentBlock,
    LParen, RParen, LBrace, LSquare, RSquare,
    NumberLiteral,   StringLiteral,  FunctionLiteral, ModuleLiteral, ForLiteral, IfLiteral, ElseLiteral, CSGLiteral, LetLiteral, IncludeLiteral, IncludeFile, Identifier,
    EqualSign, Minus, Star, Percent, Slash, Plus, BinaryBoolean, BinaryComparison,  Bang, Hash, Questionmark, Comma, Colon, Semicolon, RBrace];

//const openScadLexer = new Lexer(allTokens);

class os2jscadLexer extends Lexer{
    constructor(){
        super(allTokens)
    }
}


module.exports = {
  os2jscadLexer:  os2jscadLexer,
  allTokens:      allTokens
}