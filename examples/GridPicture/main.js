var animate = 0;
var fn = 12;
libmain = function() {

  $h();
  include("faceSmall.js");
  libfaceSmall();

  libmain.slice = function(start, end, data) {
    [start, end, data] = $h.setArguments(['start', 'end', 'data'], arguments, [undefined, undefined, undefined]);

    return ($h.forLoop($h.range(start, end), (elem) => {
      let [i] = elem;
      return (data[i]);
    }));
  }

  libmain.polyPts = function(row, range) {
    [row, range] = $h.setArguments(['row', 'range'], arguments, [undefined, undefined]);

    return (concat($h.forLoop($h.range(0, len(row) - 1), (elem) => {
      let [i] = elem;
      return ([row[i] * narrow / range + minWidth, i * 2]);
    }), $h.forLoop($h.range(len(row) - 1, -1, 0), (elem) => {
      let [i] = elem;
      return ([-row[i] * narrow / range - minWidth, i * 2]);
    }), [
      [row[0] * narrow / range + minWidth, 0]
    ]));
  }

  libmain.polyStrip = function(row, range) {
    [row, range] = $h.setArguments(['row', 'range'], arguments, [undefined, undefined]);
    return polygon({
      points: libmain.polyPts(row, range),
      convexity: 10
    })
  }

  libmain.mainf = function() {
    var height = libfaceSmall.height;
    var width = libfaceSmall.width;
    var range = libfaceSmall.range;
    var data = libfaceSmall.data;
    
    return translate([-height, -width, 0], union(color("white", translate([0, 0, 1], linear_extrude({
      height: 0.1
    }, union($h.forLoop($h.range(0, height - 1), (elem) => {
      let [i] = elem;
      return translate([2 * i, 0, 0], libmain.polyStrip(libmain.slice(i * width, (i * width) + width - 1, data), range))
    }))))), color("white", translate([-0.5, 2 * (width - 1), 1], cube([(height) * 2, 1, 1]))), color("white", translate([-0.5, 0, 1], cube([(height) * 2, 1, 1]))), color("black", cube([(height - 1) * 2, (width - 1) * 2, 1]))))
  }
  var narrow = 0.9;
  var minWidth = 0.1;
  libmain.main = function(args) {
    return libmain.mainf()
  }
}

function main(args) {
  libmain();
  return libmain.main(args);
}
//=== Helper Utilities ==============================================

$h=helpers;
helpers = helpers;
function helpers(){

  // These are replacements for functions that exist in OpenScad but don't have direct matches in OpenJSCAD
  undef = undefined;
  //if(!t) t=0;
  str = function str(args){ return [...arguments].toString();}
  len = function len(a) { return a.length;}
  import_dxf = function import_dxf(args) { return $import(arguments);}

  concat = function concat(arys) {
    return [...arguments].reduce((acc, val) => acc.concat(val) , [])
  }


  nullCSG = function nullCSG() { return polyhedron({points: [],triangles: []});} // This doens't explicitly exist in OpenScad, but is implied
  echof = function echof(args) {  console.log(...arguments); return nullCSG();} // adding nullCSG(); to this allows it to be added within a function chain. e.g. translate() echo() sphere()

  text = function text(text,size,font,halign,valign,spacing,direction,language,script,fn){

    [text,size,font,halign,valign,spacing,direction,language,script,fn] =
      $h.setArguments(["text","size","font","halign","valign","spacing","direction","language","script","fn"],
        arguments,
        ["",10,"","left","baseline",1,"ltr","en","latin",12]);

    function poly3Dto2D(poly){
      var pts=[]
      poly.vertices.forEach((vertex)=>pts.push([vertex.pos._x,vertex.pos._y]))
      return polygon(pts);
    }

    size = size/2;  // adjust for apparent size difference scad to jscad
    var thickness = 0.2 * size;
    let segments = vectorText({letterspacing:spacing, align:halign, height: size},text);

    var result=[];
    segments.forEach(segment => {
      var path = new CSG.Path2D(segment, false);
      var csg = path.rectangularExtrude(thickness, 1, 16, false);   // w, h, resolution, roundEnds
      var polys = csg.polygons.filter((poly=>poly.plane.normal.z===1))
      polys = polys.map((poly)=>poly3Dto2D(poly));
      result = result.concat(polys)
    })
    return union(result);
  }

   // $h.<name> are functions added to make the translation more readable.
   $h.forLoop = function forLoop(arys){
    var arys = [...arguments];
    var bodyFunc = arys.slice(-1)[0];
    arys = arys.slice(0,-1);
    if(typeof arys.slice(-1)[0] === "function"){
      var ifFunc = arys.slice(-1)[0];
      arys = arys.slice(0,-1);
    }
    var result = forRecurse(arys);
    if(ifFunc){
      result = result.filter((elem)=>{
        return ifFunc(...elem);
      })
    }
    return result.map(bodyFunc);
  }

  /*
 // $h.<name> are functions added to make the translation more readable.
  $h.forLoop = function forLoop(arys){
    var arys = [...arguments];
    if(typeof arys.slice(-1)[0] === "function"){
      var ifFunc = arys.slice(-1)[0];
      arys = arys.slice(0,-1);
    }
    var result = forRecurse(arys);
    if(ifFunc){
      result = result.filter((elem)=>{
        return ifFunc(...elem);
      })
    }
    return result;
  }
  //*/

  function forRecurse(arys){
    //var arys = [...arguments];
    var last = arys.slice(-1)[0];
    var rest = arys.slice(0,-1);
    if(rest.length==0){
      return last.map((elem)=>[elem]);
    } else if(rest.length==1){
      var result = rest[0].map(i=>last.map(j=>[i,j])).reduce((acc,elem)=>acc.concat(elem),[]);
      return result;
    } else {
      var result = forRecurse(rest).map(i=>last.map(j=>i.concat(j))).reduce((acc,elem)=>acc.concat(elem),[]);
      return result;
    }
  }

  $h.range = function range(start,inc,end){
      if(end===undefined) {end=inc;inc=1;}
      // I'm not sure why I used floor for the inputs, they don't have to be integers
      //start = Math.floor(start);inc=Math.floor(inc);end=Math.floor(end);
      return Array(Math.floor((end-start)/inc)+1).fill(start).map((e,i)=>e+i*inc)
    }

  $h.ifFunc = function ifFunc(cond,trueFunc,falseFunc){
    return (cond) ? trueFunc() : (falseFunc ? falseFunc() : nullCSG());
  }

  // Javascript does no have
  $h.setArguments = function setArguments(names, values, defs) {
    var result = [];
    var isObjArg = (typeof(values[0]) === "object" && !Array.isArray(values[0])) || false;
    var argObj = isObjArg ? values[0] : {};

    if(!isObjArg){
      for(var i = 0; i < values.length; i++){
        argObj[names[i]] = values[i];
      }
    }

    for(var i = 0; i < names.length; i++){
      result.push(argObj[names[i]] !== undefined ? argObj[names[i]] : (defs ? defs[i] : undefined));
    }
    return result;
  }


  // X is red, Y is green and Z is Blue (or should be)
  $h.axisHelper = function axisHelper(){
    var r=0.1;
    var oneAxis = union(cylinder({h: 9,r2: r,r1: r}),
    translate([0, 0, 9], cylinder({h: 1,r2: 0,r1: r*2})));
    return union(
        color("blue", oneAxis),   //FIXME do I need to close oneAxis?
        color("red", rotate([0, 90, 0], oneAxis)),
        color("green", rotate([-90, 0, 0], oneAxis))
      );
  }



}




