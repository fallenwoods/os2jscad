const beautify = require('js-beautify').js;
var fs = require('fs');
var path = require('path');

//var $fn=12;   // Fixme convert to fn for jscad
//const undef = undefined;

const abs = Math.abs
const ceil = Math.ceil
const exp = Math.exp
const floor = Math.floor
const ln = Math.log
const log = Math.log10
const max = Math.max
const min = Math.min
const norm = Math.norm
const pow = Math.pow
const round = Math.round
const sign = Math.sign
const sqrt = Math.sqrt
/*
height = 20;
width=20;
range = 1.0;
data = [0, 0, 0, 0, 0.541, 0.525, 0.22, 0.106, 0.125, 0.275, 0.302, 0.306, 0.42, 0.298, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.329, 0.498, 0.525, 0.196, 0.227, 0.271, 0.306, 0.271, 0.243, 0.196, 0.078, 0.016, 0, 0, 0, 0, 0, 0, 0.004, 0.008, 0.525, 0.588, 0.478, 0.302, 0.369, 0.447, 0.471, 0.42, 0.337, 0.282, 0.196, 0.039, 0, 0, 0, 0, 0, 0.004, 0.004, 0.02, 0.49, 0.788, 0.631, 0.42, 0.514, 0.424, 0.349, 0.314, 0.325, 0.267, 0.184, 0.106, 0.008, 0, 0, 0, 0, 0, 0.004, 0.161, 0.737, 0.812, 0.6, 0.439, 0.271, 0.612, 0.557, 0.506, 0.396, 0.388, 0.239, 0.043, 0.02, 0, 0, 0, 0, 0.004, 0.004, 0.318, 0.769, 0.792, 0.514, 0.329, 0.765, 0.796, 0.8, 0.784, 0.588, 0.616, 0.753, 0.588, 0.106, 0, 0, 0, 0, 0, 0.004, 0.047, 0.765, 0.761, 0.333, 0.553, 0.792, 0.859, 0.89, 0.694, 0.357, 0.753, 0.867, 0.678, 0.059, 0, 0, 0, 0, 0.004, 0.004, 0.624, 0.58, 0.624, 0.271, 0.384, 0.443, 0.569, 0.533, 0.49, 0.333, 0.384, 0.604, 0.494, 0.008, 0, 0, 0, 0, 0.004, 0, 0.482, 0.776, 0.545, 0.522, 0.431, 0.42, 0.522, 0.592, 0.451, 0.306, 0.231, 0.251, 0.118, 0.035, 0.004, 0, 0, 0, 0, 0.012, 0.031, 0.463, 0.506, 0.553, 0.58, 0.596, 0.624, 0.639, 0.957, 0.733, 0.757, 0.31, 0.145, 0.482, 0.004, 0.004, 0, 0, 0.004, 0, 0.004, 0.459, 0.612, 0.576, 0.627, 0.612, 0.678, 0.635, 0.729, 0.71, 0.333, 0.455, 0.176, 0.047, 0, 0, 0, 0, 0.004, 0, 0.004, 0.004, 0.584, 0.592, 0.584, 0.627, 0.859, 0.808, 0.757, 0.733, 0.529, 0.455, 0.137, 0.008, 0, 0, 0, 0, 0, 0.004, 0.008, 0.004, 0.447, 0.643, 0.667, 0.733, 0.624, 0.51, 0.557, 0.537, 0.459, 0.306, 0.008, 0.008, 0, 0, 0, 0, 0, 0.004, 0.004, 0.004, 0.039, 0.639, 0.663, 0.733, 0.655, 0.682, 0.812, 0.71, 0.361, 0.247, 0.004, 0.004, 0, 0, 0, 0, 0, 0.004, 0.004, 0.004, 0.012, 0.541, 0.761, 0.694, 0.659, 0.541, 0.514, 0.408, 0.337, 0.031, 0.008, 0.004, 0, 0, 0, 0, 0, 0.004, 0.008, 0.004, 0.016, 0.51, 0.69, 0.71, 0.839, 0.78, 0.745, 0.651, 0.463, 0.008, 0.004, 0.004, 0, 0, 0, 0, 0, 0.008, 0.004, 0.004, 0.31, 0.518, 0.588, 0.686, 0.863, 0.863, 0.886, 0.816, 0.247, 0.008, 0.004, 0.008, 0, 0, 0, 0, 0.004, 0.004, 0.039, 0.031, 0.173, 0.525, 0.596, 0.671, 0.757, 0.788, 0.706, 0.392, 0.263, 0.651, 0.239, 0.008, 0.004, 0, 0, 0, 0.502, 0.62, 0.027, 0.031, 0.329, 0.361, 0.639, 0.631, 0.682, 0.659, 0.561, 0.533, 0.278, 0.749, 0.784, 0.745, 0.729, 0.42, 0.482, 0.553, 0.561, 0.639, 0.333, 0.204, 0.322, 0.404, 0.58, 0.569, 0.612, 0.608, 0.659, 0.498, 0.502, 0.812, 0.784, 0.608, 0.694, 0.698, 0.639, 0.569];
*/
var animate = 0;
var fn = 12;
libmain = function() {
  eval(include("helpers.js"));
  $h();
  eval(include("faceSmall.js"));
  libfaceSmall();
  libmain.narrow = 0.9;
  libmain.minWidth = 0.1;

  libmain.slice = function(start, end, data) {
    [start, end, data] = $h.setArguments(['start', 'end', 'data'], arguments, [undefined, undefined, undefined]);

    return ($h.forLoop($h.range(undefined.start, undefined.end), (elem) => {
      let [i] = elem;
      return (libfaceSmall.data[libmain.i]);
    }));
  };

  libmain.polyPts = function(row, range) {
    [row, range] = $h.setArguments(['row', 'range'], arguments, [undefined, undefined]);

    return (concat($h.forLoop($h.range(0, len(undefined.row) - 1), (elem) => {
      let [i] = elem;
      return ([undefined.row[libmain.i] * libmain.narrow / libfaceSmall.range + libmain.minWidth, libmain.i * 2]);
    }), $h.forLoop($h.range(len(undefined.row) - 1, -1, 0), (elem) => {
      let [i] = elem;
      return ([-undefined.row[libmain.i] * libmain.narrow / libfaceSmall.range - libmain.minWidth, libmain.i * 2]);
    }), [
      [undefined.row[0] * libmain.narrow / libfaceSmall.range + libmain.minWidth, 0]
    ]));
  };

  libmain.polyStrip = function(row, range) {
    [row, range] = $h.setArguments(['row', 'range'], arguments, [undefined, undefined]);

    return /*echo(row);//echo(polyPts(row,range));*/ polygon({
      points: libmain.polyPts(undefined.row, libfaceSmall.range),
      convexity: 10
    });
  };

  //polyStrip(slice(width,(width)+width-1,data),range);
  //echo (polyPts(slice(width,(width)+width-1,data),range));

  libmain.main = function() {
    return translate([-libfaceSmall.height, -libfaceSmall.width, 0] union( /***/ color("white"
        translate([0, 0, 1] linear_extrude({
            height: undefined
          }
          union($h.forLoop($h.range(0, libfaceSmall.height - 1), (elem) => {
            let [i] = elem;
            return translate([2 * libmain.i, 0, 0] libmain.polyStrip(libmain.slice(libmain.i * libfaceSmall.width, (libmain.i * libfaceSmall.width) + libfaceSmall.width - 1, libfaceSmall.data), libfaceSmall.range));
          }))))),
      //*/
      color("white"
        translate([-0.5, 2 * (libfaceSmall.width - 1), 1] cube([(libfaceSmall.height) * 2, 1, 1]))),
      color("white"
        translate([-0.5, 0, 1] cube([(libfaceSmall.height) * 2, 1, 1]))),
      color("black"
        cube([(libfaceSmall.height - 1) * 2, (libfaceSmall.width - 1) * 2, 1]))));
  };

  libmain.libmain = function(args) {
    return libmain.main();
  }
}

function main(args) {
  libmain();
  return libmain.libmain(args);
}//=== Stubs Utilities ==============================================

function showArgs(name,args){
    var result ="";
    var argAry = [...args];

    result += name +"(";
    for(var i = 0; i<argAry.length;i++){
      result +=
        Array.isArray(argAry[i])  ? "["+argAry[i].toString()+"]" :
        typeof(argAry[i]) === "object" ? JSON.stringify(argAry[i]) :
        argAry[i];
      result +=",";
      result += i==argAry.length-2 ? "\n" : "";
    }
    result = result.slice(0,-1) + ")";

    return result;

  }

  function include(fileName){
    var basename = path.basename(fileName).split(".")[0];
    var content = fs.readFileSync(__dirname + "\\"+ fileName, 'utf8');
    var code = "((()=>{" + content + "})()); ";
    return code;
  }


function color(a){ return showArgs('color',arguments); };
function translate(a){return showArgs('translate',arguments);};
function scale(a){ return showArgs('scale',arguments); };
function rotate(a){ return showArgs('rotate',arguments); };
function mirror (a){return showArgs('mirror',arguments); };

function union(a){ return showArgs('union',arguments); };
function intersection(a){ return showArgs('intersection',arguments); };
function difference(a){ return showArgs('difference',arguments); };

function circle(a){ return showArgs('circle',arguments) ; };
function square(a){ return showArgs('square',arguments); };
function polygon(a){ return showArgs('polygon',arguments); };

function sphere(a){ return showArgs('sphere',arguments); };
//function text(a){ return showArgs('Text',arguments); };
function cube(a){ return showArgs('cube',arguments); };
function cylinder(a){return showArgs('cylinder',arguments); };
function polyhedron (a){return showArgs('polyhedron',arguments); };

function linear_extrude (a){return showArgs('linear_extrude',arguments); };
function rotate_extrude (a){return showArgs('rotate_extrude',arguments); };
function rectangular_extrude (a){return showArgs('rectangular_extrude',arguments); };

function $import (a){return showArgs('$import',arguments); };


function sin(a) { return Math.sin(a*Math.PI/180)}
function cos(a) { return Math.cos(a*Math.PI/180)}
function tan(a) { return Math.tan(a*Math.PI/180)}

function asin(a) { return Math.asin(a)*180/Math.PI}
function acos(a) { return Math.acos(a)*180/Math.PI}
function atan(a) { return Math.atan(a)*180/Math.PI}
function atan2(y,x) { return Math.atan2(y,x)*180/Math.PI}


function rands(min,max,cnt,seed) {
    min = min?min:0;
    max = max?max:1.0;
    cnt = cnt?cnt:1;
    var result = [];
    for(var i =0;i<cnt;i++){
      result.push(Math.random()*(max-min)+min)
    }
    return result;
  }

  function echo(args) {
    console.log([[...arguments]]);
  }

  // returns the word "Text"
  function vectorText(){
    var segmentsForText=
    [[[8,21],[8,0]],[[1,21],[15,21]],[[19,8],[31,8],[31,10],[30,12],[29,13],
    [27,14],[24,14],[22,13],[20,11],[19,8],[19,6],[20,3],[22,1],[24,0],[27,0],
    [29,1],[31,3]],[[37,14],[48,0]],[[48,14],[37,0]],[[56,21],[56,4],[57,1],[59,0],[61,0]],
    [[53,14],[60,14]]];

    let output = [];
    segmentsForText.forEach(segment => output.push(
      rectangular_extrude(segment, { w:2, h:1 })
    ));
    return union(output);
  }


//============================
var result = main();
result =  beautify(result, { indent_size: 2, space_in_empty_paren: true });

result = "function main (){\n return " + result +  "\n}";

fs.writeFileSync(__dirname + '/stubsOutput.js', result, {encoding:'utf8'});

//console.log (result);
console.log("--");
console.log("done");