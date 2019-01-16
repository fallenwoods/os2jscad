
const chevrotain = require("chevrotain");


"use strict";

class Stack extends Array{
  peek(){
    return this[this.length-1];
  }

}

// functionCtx indicates that blocks that can contain multiple actions (lines) need to wrap the lines
//    in an anonymous function that returns a single value.

// FIXME Is this still needed?
var functionCtx = new Stack();


/*=============================================================================================*\
  Parser

\*=============================================================================================*/
const Parser = chevrotain.Parser;

const defConfig = { outputCst: true, maxLookahead:5 };
var $t={};

class  os2jscadParser extends Parser {

  constructor (input,tokens,config) {
    //tokens = tokens || allTokens;
    config = config ||  defConfig;
    //super(input, tokens, config)
    super(tokens, config)

    $t = tokens.reduce((acc,elem)=>{acc[elem.name]=elem;return acc},{})

    // for conciseness
    const $ = this

    $.RULE("program", () => {
      $.MANY(()=>{
        $.SUBRULE($.statement)
      })
    })

    $.RULE("functionDefinition", () => {
      $.CONSUME($t.FunctionLiteral);
      $.CONSUME($t.Identifier);
      $.CONSUME($t.LParen);
      $.SUBRULE($.parameters);
      $.CONSUME($t.RParen);
      $.CONSUME2($t.EqualSign);
      $.SUBRULE2($.expression,{LABEL:"body"});
      $.CONSUME($t.Semicolon);
    });

    $.RULE("moduleDefinition", () => {
      $.CONSUME($t.ModuleLiteral);
      $.CONSUME($t.Identifier);
      $.CONSUME($t.LParen);
      $.SUBRULE($.parameters);
      $.CONSUME($t.RParen);
      $.SUBRULE($.statement);
    });

    $.RULE("moduleBlock", () => {
      $.CONSUME($t.LBrace);
      $.MANY(() => {
        $.SUBRULE($.statement)
      })
      $.CONSUME($t.RBrace);
    });

    $.RULE("statement", () => {
      $.OR([
        {ALT: () =>$.SUBRULE($.moduleBlock)},
        {ALT: () =>$.SUBRULE($.declaration)},
        {ALT: () =>{$.SUBRULE($.assignment);$.CONSUME($t.Semicolon)}}, // break this out from other actions so we can determine if a block needs a separate scope
        {ALT: () =>$.SUBRULE($.simpleAction)},
        //{ALT: () =>$.SUBRULE($.actionStatement)},
      ]);
    })

    $.RULE("declaration", () => {
      $.OR([
        {ALT: () => $.SUBRULE($.includeStmt)},  // this will be ignore everywhere but the top level scope
        {ALT: () => $.SUBRULE($.moduleDefinition)},
        {ALT: () => $.SUBRULE($.functionDefinition)},
      ])
    });

    $.RULE("actionBlock", () => {
      $.CONSUME($t.LBrace);
      $.MANY(() => {
        $.SUBRULE2($.actionStatement)
      });
      $.CONSUME($t.RBrace);
    });

    // This is a statement without declarations
    $.RULE("actionStatement", () => {
      $.OR([
        {ALT: () => $.SUBRULE2($.actionBlock)},
        {ALT: () => $.SUBRULE2($.simpleAction)},
        {ALT: () =>{$.SUBRULE($.assignment);$.CONSUME3($t.Semicolon)}},
      ]);
    });

    $.RULE("simpleAction", () => {
      $.OR([
        {ALT: () => $.SUBRULE($.moduleChain)},
        {ALT: () => $.SUBRULE($.ifStatement)},
        {ALT: () => $.SUBRULE($.forLoop)},
        {ALT: () => $.SUBRULE($.CSGAction)},
        {ALT: () => $.SUBRULE($.letStmt)},
        {ALT: () => $.CONSUME3($t.Semicolon)},
        //{ALT: () => $.SUBRULE($.assignment)},
      ])
    })

    $.RULE("moduleChain", () => {
      $.OPTION(() => {
        $.SUBRULE($.debugModifier);
      })
      $.OR([
        {ALT: () =>{
          $.CONSUME($t.Identifier);
          $.CONSUME($t.LParen);
          $.SUBRULE($.arguments);
          $.CONSUME($t.RParen);
          $.OR1([
            {ALT: () => $.SUBRULE($.actionStatement)},
            //{ALT: () => $.SUBRULE($.simpleAction)}
          ])
        }},


      ])

    });

    $.RULE("debugModifier",() => {
      $.AT_LEAST_ONE(() => {
        $.OR([
          {ALT: () => $.CONSUME($t.Percent)},
          {ALT: () => $.CONSUME($t.Bang)},
          {ALT: () => $.CONSUME($t.Hash)},
          {ALT: () => $.CONSUME($t.Star)}
        ])
      })
    });


    $.RULE("includeStmt", () => {
      $.CONSUME($t.IncludeLiteral);
      $.CONSUME($t.IncludeFile);
    });



    $.RULE("letStmt", () => {
      $.CONSUME($t.LetLiteral);
      $.CONSUME($t.LParen);
      $.SUBRULE($.arguments);
      $.CONSUME($t.RParen);
      $.SUBRULE($.actionStatement);
    });


    $.RULE("CSGAction", () => {
      $.CONSUME($t.CSGLiteral);
      $.CONSUME($t.LParen);
      $.CONSUME($t.RParen);
      $.SUBRULE1($.actionStatement);
    });



    $.RULE("assignment", () => {
      $.CONSUME($t.Identifier, { LABEL: "lhs" });
      $.CONSUME($t.EqualSign, {LABEL: "operator"});
      $.SUBRULE($.expression, { LABEL: "rhs" });
    });


    $.RULE("expression", () => {
      $.SUBRULE($.conditionalExpression);
    });


    $.RULE("conditionalExpression", () => {
      $.SUBRULE($.binaryCompareExpression, {LABEL: "condition"});
        $.OPTION(() => {
          $.CONSUME($t.Questionmark);
          $.SUBRULE2($.conditionalExpression, {LABEL: "trueclause"});
          $.CONSUME($t.Colon);
          $.SUBRULE3($.conditionalExpression, {LABEL: "falseclause"});
        });
    });

    $.RULE("binaryCompareExpression", () => {
      $.SUBRULE($.binaryBoolExpression, {LABEL: "lhs"});
      $.OPTION(() => {
          $.CONSUME($t.BinaryComparison, {LABEL: "operator"});
          $.SUBRULE2($.binaryCompareExpression, {LABEL: "rhs"});
        });
    }),

    $.RULE("binaryBoolExpression", () => {
      $.SUBRULE($.binarySumDiffExpression, {LABEL: "lhs"});
        $.OPTION(() => {
        $.CONSUME($t.BinaryBoolean, {LABEL: "operator"});
        $.SUBRULE2($.binaryBoolExpression, {LABEL: "rhs"});
      });
    }),

    $.RULE("binarySumDiffExpression", () => {
      $.SUBRULE($.binaryMultDivExpression, {LABEL: "lhs"});
        $.OPTION(() => {
          $.OR([
            {ALT: () => $.CONSUME($t.Minus, {LABEL: "operator"})},
            {ALT: () => $.CONSUME($t.Plus, {LABEL: "operator"})},
          ]);
          $.SUBRULE2($.binarySumDiffExpression, {LABEL: "rhs"});
        });
    }),

    $.RULE("binaryMultDivExpression", () => {
      $.SUBRULE($.unaryExpression, {LABEL: "lhs"});
        $.OPTION(() => {
          $.OR([
            {ALT: () => $.CONSUME($t.Star, {LABEL: "operator"})},
            {ALT: () => $.CONSUME($t.Slash, {LABEL: "operator"})},
            {ALT: () => $.CONSUME($t.Percent, {LABEL: "operator"})}
          ]);
          $.SUBRULE2($.binaryMultDivExpression, {LABEL: "rhs"});
        });
    }),

    $.RULE("unaryExpression", () => {
      $.OR([
        {ALT: () => {$.OPTION(() => {
            $.OR2([
              {ALT: () => $.CONSUME($t.Bang, {LABEL: "operator"})},
              {ALT: () => $.CONSUME2($t.Minus, {LABEL: "operator"})},
              {ALT: () => $.CONSUME2($t.Plus, {LABEL: "operator"})},
            ]);
          });
          $.SUBRULE($.atomicExpression, {LABEL: "rhs"});
        }},
        //{ALT: () => $.SUBRULE($.expression, {LABEL: "rhs"})}
      ]);
    });

    $.RULE("atomicExpression", () => {
      $.OR([
        {ALT: () => $.SUBRULE($.parenthesisExpression)},
        {ALT: () => $.SUBRULE($.array)},
        {ALT: () => $.SUBRULE($.functionCall)},
        {ALT: () => $.CONSUME($t.NumberLiteral)},
        {ALT: () => $.CONSUME($t.StringLiteral)},
        {ALT: () => $.SUBRULE($.listComprehension)},
        {ALT: () => $.CONSUME($t.Identifier)},
      ])
      $.MANY(() => {
        $.SUBRULE($.arrayLookup);
      })
    });

    $.RULE("arrayLookup", () => {
      $.CONSUME($t.LSquare)
      $.SUBRULE($.expression)
      $.CONSUME($t.RSquare)
    });


    $.RULE("listComprehension", () => {
      $.CONSUME($t.LSquare);
      $.CONSUME($t.ForLiteral);
      $.CONSUME($t.LParen);
      $.MANY_SEP({
          SEP: $t.Comma, DEF: () => {
            $.SUBRULE($.assignment,{LABEL:"ranges"});
          }
      },{LABEL:"ranges"});
      $.CONSUME($t.RParen);
      $.OPTION(() => {
        $.SUBRULE($.listCompPart);
      })
      $.CONSUME($t.RSquare);
    });

    $.RULE("listCompPart", () => {
      $.OR([
        {ALT: () =>  {
          $.CONSUME($t.ForLiteral);
          $.CONSUME($t.LParen);
          $.MANY_SEP({
              SEP: $t.Comma, DEF: () => {
                $.SUBRULE($.assignment,{LABEL:"ranges"});
              }
          },{LABEL:"ranges"});
          $.CONSUME($t.RParen);
        }},
        {ALT: () => {
          $.CONSUME($t.IfLiteral);
          $.CONSUME2($t.LParen);
          $.SUBRULE($.expression,{LABEL:"ifExpression"});
          $.CONSUME2($t.RParen);
        }},
        {ALT: () => {
          $.CONSUME($t.LetLiteral);
          $.CONSUME3($t.LParen);
          $.SUBRULE($.arguments);
          $.CONSUME3($t.RParen);
        }},
        {ALT: () =>$.SUBRULE2($.expression,{LABEL:"body"})}
      ]);
      $.OPTION(() => {
        $.SUBRULE($.listCompPart);
      })
    });


    $.RULE("array", () => {

      $.CONSUME($t.LSquare);
      $.OPTION(() => {
        $.SUBRULE($.expression,{LABEL:"item"});
        $.MANY(() => {
          $.OR([
            {ALT: () => $.CONSUME($t.Comma,{LABEL:"sep"})},
            {ALT: () => $.CONSUME($t.Colon,{LABEL:"sep"})}, // FIXME - this allows [a:b:c] like patterns for for-loops. Not quite right but allows a fit into the grammar
          ])
          $.SUBRULE2($.expression,{LABEL:"item"});
        })
      })
      $.CONSUME($t.RSquare);

    });

    $.RULE("parenthesisExpression", () => {
      $.CONSUME($t.LParen);
      $.SUBRULE($.expression);
      $.CONSUME($t.RParen);
    });



    $.RULE("parameters", () => {
      $.MANY_SEP({
        SEP: $t.Comma, DEF: () => {
          $.SUBRULE($.parameter);
        }
      });
    });

    $.RULE("parameter", () => {
      $.CONSUME2($t.Identifier,{LABEL:"paramName"});
      $.OPTION(() => {
        $.CONSUME($t.EqualSign);
        $.SUBRULE($.expression,{LABEL:"default"});
      });
    });



    $.RULE("functionCall", () => {
      $.OPTION(() => {
        $.SUBRULE($.debugModifier);
      })
      $.CONSUME($t.Identifier);
      $.CONSUME($t.LParen);
      $.SUBRULE($.arguments,{LABEL:"arguments"});
      $.CONSUME($t.RParen);
    });

    $.RULE("arguments", () => {
      $.MANY_SEP({
        SEP: $t.Comma, DEF: () => {
          $.SUBRULE($.argument);
        }
      });
    });

    $.RULE("argument", () => {
      $.OPTION(() => {
        $.CONSUME2($t.Identifier,{LABEL:"paramName"});
        $.CONSUME($t.EqualSign);
      });
      $.SUBRULE($.expression,{LABEL:"value"});
    });



    $.RULE("comment", () => $.OR([
      {ALT: () => $.CONSUME($t.Comment)},
      {ALT: () => $.CONSUME($t.CommentBlock)}
    ]));


    $.RULE("forLoop", () => {
      $.CONSUME($t.ForLiteral);
      $.CONSUME($t.LParen);

      $.MANY_SEP({
          SEP: $t.Comma, DEF: () => {
              $.SUBRULE($.assignment,{LABEL:"ranges"})
          }
      });
      $.CONSUME($t.RParen);
      $.SUBRULE($.actionStatement);
    });



    /*
    $.RULE("forRange", () => {
      $.OR([
        {ALT: () => {
          $.CONSUME($t.Identifier);
          $.CONSUME($t.EqualSign);
          $.CONSUME($t.LSquare);
          $.SUBRULE($.expression);
          $.CONSUME($t.Colon);
          $.SUBRULE1($.expression);
          $.OPTION(() => {
            $.CONSUME2($t.Colon);
            $.SUBRULE2($.expression);
          })
          $.CONSUME($t.RSquare);
        }},
        {ALT: () => $.SUBRULE1($.assignment)}
      ])
    });
    //*/

    /*
    $.RULE("forRange", () => {
      $.CONSUME($t.Identifier);
      $.CONSUME($t.EqualSign);
      $.CONSUME($t.LSquare);
      $.SUBRULE($.expression);
      $.MANY(() => {
        $.OR([
          {ALT: () => $.CONSUME($t.Comma)},
          {ALT: () => $.CONSUME($t.Colon)},
        ])
        $.SUBRULE2($.expression);
      })
      $.CONSUME($t.RSquare);
    });
    //*/


    $.RULE("ifStatement", () => {
      $.CONSUME($t.IfLiteral);
      $.CONSUME($t.LParen);
      $.SUBRULE($.expression);
      $.CONSUME($t.RParen);
      $.SUBRULE($.actionStatement,{LABEL:"ifClause"});
      $.OPTION(() => {
        $.CONSUME($t.ElseLiteral);
        $.SUBRULE2($.actionStatement,{LABEL:"elseClause"});
      });
    });



    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    this.performSelfAnalysis();

  //}

  /*
  $.separateCommentTokens = function (tokens) {
    let comments=[];
    let newTokens = [];
    let priorToken;

    tokens.forEach((currTok) => {
        if (chevrotain.tokenMatcher(currTok, this.tokensMap.Comment) || chevrotain.tokenMatcher(currTok, this.tokensMap.CommentBlock)) {
          priorToken = priorToken || currTok;   // if the first token is a comment, it will point back to itself
          comments.push(currTok);

        }
        else {
          priorToken = priorToken || currTok;   // ensure that priorToken has some value
          priorToken.comments = comments;
          comments=[];
          priorToken = currTok;                 // move the priorToken pointer along
          newTokens.push(currTok)
        }
    })
    return newTokens;
  }.bind(this);
  //*/
  //*
    $.separateCommentTokens = function (tokens) {

      let newTokens = []
      let precedingComments = []
      tokens.forEach((currTok) => {
          if (chevrotain.tokenMatcher(currTok, this.tokensMap.Comment) || chevrotain.tokenMatcher(currTok, this.tokensMap.CommentBlock)) {
            precedingComments.push(currTok)
          }
          else {
            currTok.precedingComments = precedingComments
            precedingComments = []
            newTokens.push(currTok)
          }
      })
      return newTokens;
    }.bind(this);
    //*/
  }
}

module.exports = {
  os2jscadParser: os2jscadParser,
}

