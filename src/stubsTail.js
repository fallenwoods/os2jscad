//=== Stubs Utilities ==============================================

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