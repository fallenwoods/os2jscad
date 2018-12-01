
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
    super(input, tokens, config)

    $t = tokens.reduce((acc,elem)=>{acc[elem.name]=elem;return acc},{})

    // for conciseness
    const $ = this


    $.RULE("functionDefinition", () => {
      $.CONSUME($t.FunctionLiteral);
      $.CONSUME($t.Identifier);
      $.CONSUME($t.LParen);
      $.SUBRULE($.parameters,{LABEL:"parameters"});
      $.CONSUME($t.RParen);
      $.CONSUME2($t.EqualSign);
      $.SUBRULE2($.expression,{LABEL:"body"});
      $.CONSUME($t.Semicolon);
    });

    $.RULE("moduleDefinition", () => {
      $.CONSUME($t.ModuleLiteral);
      $.CONSUME($t.Identifier);
      $.CONSUME($t.LParen);
      $.SUBRULE($.parameters,{LABEL:"parameters"});
      $.CONSUME($t.RParen);
      $.SUBRULE($.action,{LABEL:"body"});


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

    $.RULE("actions", () => {
      $.AT_LEAST_ONE(() => {
        $.OR([
          {ALT: () =>$.SUBRULE($.action)},
          {ALT: () => $.SUBRULE($.includeStmt)},  // this will be ignore everywhere but the top level scope
          {ALT: () => {$.SUBRULE($.assignment); $.CONSUME2($t.Semicolon);}},
          {ALT: () =>  $.SUBRULE($.moduleDefinition)},
          {ALT: () =>  $.SUBRULE($.functionDefinition)}
        ])
      })
    });

    $.RULE("action", () => {

      $.MANY(() => {
        $.SUBRULE($.functionCall);
      });
      $.OR2([
        {ALT: () => $.CONSUME($t.Semicolon)},

        {ALT: () => $.SUBRULE($.forLoop)},
        {ALT: () => $.SUBRULE($.ifStatement)},
        {ALT: () => $.SUBRULE($.CSGAction)},
        {ALT: () => $.SUBRULE($.letStmt)},      // It's not clear where let can appear in the grammar. Does it need to be within a for loop?
        {ALT: () => {
          $.CONSUME($t.LBrace);
          $.OPTION2(() => {
            $.SUBRULE($.actions)
          })
          $.CONSUME($t.RBrace);
        }}
      ])
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
      $.SUBRULE($.action);
    });

    $.RULE("CSGAction", () => {
      $.CONSUME($t.CSGLiteral);
      $.CONSUME($t.LParen);
      $.CONSUME($t.RParen);
      $.SUBRULE1($.action);
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
      $.AT_LEAST_ONE(() => {
        $.CONSUME($t.ForLiteral);// for loop w/o action
        $.CONSUME($t.LParen);
        $.MANY_SEP({
            SEP: $t.Comma, DEF: () => {
              //$ .SUBRULE($.forRange,{LABEL:"ranges"});  //FIXME - not sure the ranges label here twice is a good idea
              $.SUBRULE($.assignment,{LABEL:"ranges"});
            }
        },{LABEL:"ranges"});
        $.CONSUME($t.RParen);
      });
      $.OPTION(() => {
        $.CONSUME($t.IfLiteral);
        $.CONSUME2($t.LParen);
        $.SUBRULE($.expression,{LABEL:"ifExpression"});
        $.CONSUME2($t.RParen);
      })

      $.OPTION2(() => {
        $.CONSUME($t.LetLiteral);
        $.CONSUME3($t.LParen);
        $.SUBRULE($.arguments);
        $.CONSUME3($t.RParen);
      });

      $.SUBRULE2($.expression,{LABEL:"body"});
      $.CONSUME($t.RSquare);
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
      $.SUBRULE($.action,{LABEL:"body"});
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
      $.SUBRULE($.action,{LABEL:"ifClause"});
      $.OPTION(() => {
        $.CONSUME($t.ElseLiteral);
        $.SUBRULE2($.action,{LABEL:"elseClause"});
      });
    });


    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    this.performSelfAnalysis();

  //}

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
  }
}

module.exports = {
  os2jscadParser: os2jscadParser,
}

