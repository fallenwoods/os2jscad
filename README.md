
# os2jscad

## Introduction

os2jscad converts OpenScad programs to OpenJScad programs. Unlike the translator built into OpenJScad, this does a
conversion to javascript, retaining the origional program structure.





of th
Chevrotain is a [**blazing fast**][benchmark] and [**feature rich**](http://sap.github.io/chevrotain/docs/features/blazing_fast.html) **Parser Building Toolkit** for **JavaScript**.
It can be used to build parsers/compilers/interpreters for various use cases ranging from simple configuration files,
to full fledged programing languages.

A more in depth description of Chevrotain can be found in this great article on: [Parsing in JavaScript: Tools and Libraries](https://tomassetti.me/parsing-in-javascript/#chevrotain).

It is important to note that Chevrotain is **NOT** a parser generator. It solves the same kind of problems as a parser generator, just **without any code generation**. Chevrotain Grammars are pure code which can be created/debugged/edited
as any other pure code without requiring any new tools or processes.

# Tutorial - Introduction

## Installation

```shell
npm install os2jscad
```

## Scenario

In this tutorial we will implement a parser for a simplified SQL syntax which will contain only SELECT statements.
The output of the parser will be an Abstract Syntax Tree (AST).

## Running & Debugging

The code snippets in this tutorial steps are part of an
executable and debuggable [example](https://github.com/SAP/chevrotain/tree/master/examples/tutorial).
It is recommended to use these sources either as an initial template
or as an executable example in order to gain a deeper understanding.

## Samples Syntax

This tutorial uses ES2015+ syntax.
See examples of how to use Chevrotain with other [implementation


## TLDR

-   [**Online Playground**](https://sap.github.io/chevrotain/playground/)
-   **[Getting Started Tutorial](https://sap.github.io/chevrotain/docs/tutorial/step0_introduction.html)**
-   [**Performance benchmark**][benchmark]

## Installation

-   **npm**: `npm install chevrotain`
-   **Browser**:
    The npm package contains Chevrotain as concatenated and minified files ready for use in a browser.
    These can also be accessed directly via [UNPKG](https://unpkg.com/) in a script tag.
    -   Latest:
        -   `https://unpkg.com/chevrotain/lib/chevrotain.js`
        -   `https://unpkg.com/chevrotain/lib/chevrotain.min.js`
    -   Explicit version number:
        -   `https://unpkg.com/chevrotain@4.1.0/lib/chevrotain.js`
        -   `https://unpkg.com/chevrotain@4.1.0/lib/chevrotain.min.js`

## Documentation & Resources

-   **[Getting Started Tutorial](https://sap.github.io/chevrotain/docs/tutorial/step1_lexing.html)**.

-   **[Sample Grammars](https://github.com/SAP/chevrotain/blob/master/examples/grammars)**.

-   **[FAQ](https://sap.github.io/chevrotain/docs/FAQ.html).**

-   **[Other Examples](https://github.com/SAP/chevrotain/blob/master/examples)**.

-   **[HTML API docs](https://sap.github.io/chevrotain/documentation).**

    -   [The Parsing DSL Docs](https://sap.github.io/chevrotain/documentation/4_1_0/classes/parser.html#at_least_one).

## Dependencies

There is a single dependency to [regexp-to-ast](https://github.com/bd82/regexp-to-ast) library.
This dependency is included in the bundled artifacts, for ease of consumption in browsers.

## Compatibility

Chevrotain runs on any modern JavaScript ES5.1 runtime.
That includes any modern nodejs version, modern browsers and even IE11.

-   Uses [UMD](https://github.com/umdjs/umd) to work with common module loaders (browser global / amd / commonjs).

## Contributions

Contributions are **greatly** appreciated.
See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## Where used

Some interesting samples:

-   [JHipster Domain Language][sample_jhipster]
-   [Metabase BI expression parser][sample_metabase].
-   [Eve Programing Language][sample_eve].
-   [BioModelAnalyzer's ChatBot parser][sample_biomodel].
-   [Bombadil Toml Parser][sample_bombadil]
-   [BrightScript Parser][sample_bright]

[benchmark]: https://sap.github.io/chevrotain/performance/
[sample_metabase]: https://github.com/metabase/metabase/blob/136dfb17954f4e4302b3bf2fee99ff7b7b12fd7c/frontend/src/metabase/lib/expressions/parser.js
[sample_jhipster]: https://github.com/jhipster/jhipster-core/blob/master/lib/dsl/jdl_parser.js
[sample_eve]: https://github.com/witheve/Eve/blob/master/src/parser/parser.ts
[sample_biomodel]: https://github.com/Microsoft/BioModelAnalyzer/blob/master/ChatBot/src/NLParser/NLParser.ts
[sample_bombadil]: https://github.com/sgarciac/bombadil/blob/master/src/parser.ts
[sample_bright]: https://github.com/RokuRoad/bright/blob/master/src/Parser.ts
[languages]: https://github.com/SAP/chevrotain/tree/master/examples/implementation_languages
[backtracking]: https://github.com/SAP/chevrotain/blob/master/examples/parser/backtracking/backtracking.js
[custom_apis]: https://sap.github.io/chevrotain/docs/guide/custom_apis.html