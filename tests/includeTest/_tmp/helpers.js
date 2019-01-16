
//=== Helper Utilities ==============================================



//helpers = helpers;
$h = libhelpers = function libhelpers(){
  
  if(libhelpers.loaded) return;

  // These are replacements for functions that exist in OpenScad but don't have direct matches in OpenJSCAD
  undef = undefined;
  //if(!t) t=0;
  str = function str(args){
    var ary = [...arguments];
    return ary.reduce((result,elem)=>{
      if(Array.isArray(elem))
      result += "[" + elem.reduce((acc,el)=>acc += ","+str(el),"").slice(1) +"]"
      else if(elem === undefined) result += "undef";
      else if(typeof elem === 'number') {elem = Math.trunc(elem*100)/100; result +=  elem.toString();}
      else result +=  elem.toString();
      return result;
    },"");
  }
  len = function len(a) { return a.length;}
  import_dxf = function import_dxf(args) { return $import(arguments);}
  concat = function concat(arys) {return [...arguments].reduce((acc, val) => acc.concat(val) , []) }
  nullCSG = function nullCSG() { return polyhedron({points: [],triangles: []});} // This doens't explicitly exist in OpenScad, but is implied
  echof = function echof(args) {  console.log(...arguments); return nullCSG();} // adding nullCSG(); to this allows it to be added within a function chain. e.g. translate() echo() sphere()
  render = function render(convexity,obj) { return obj;}
  t=0;


  /*
    function main (args) {
  $h();
  debugger;
  //[mySphere] = requireAll("libmain",["mySphere"]);
  require("helpers");
  return (mySphere(3));
  }
  //*/
  // FIXME where to put this so I can use it to import helpers too
  /*
  require = function (fileName,addGlobals){
    include(fileName+".js");    // import the file contents
    eval("lib"+fileName+"()");  // evaluate the main function
    var exps = eval(name+".exports")  // get the desired exports from the main function
    if(addGlobals) Object.assign(this,exps) // add all exported values to the surrounding scope if requested
    return exps; // return the exports for use with a more conventional require e.g. const foo = require("fooFile").foo;
  }
  //*/

  /*
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
      var csg = rectangular_extrude(path,{w:thickness, h:1, fn:16, closed:false});   // w, h, resolution, roundEnds
      var polys = csg.polygons.filter((poly=>poly.plane.normal.z===1))
      polys = polys.map((poly)=>poly3Dto2D(poly));
      result = result.concat(polys)
    })
    return union(result);
  }
  //*/
  text = function text(text,size,font,halign,valign,spacing,direction,language,script,fn){
    [text,size,font,halign,valign,spacing,direction,language,script,fn] =
      $h.setArguments(["text","size","font","halign","valign","spacing","direction","language","script","fn"],
        arguments,
        ["",10,"","left","baseline",1,"ltr","en","latin",12]);


    size = size/2;  // adjust for apparent size difference scad to jscad
    var thickness = 0.15 * size;
    let l = vectorText({letterspacing:spacing, align:halign, height: size},text);

    var o = [];

    l.forEach(function(pl) {
      var hullCircles=[];
      pl.forEach(function(pt){
        hullCircles.push(translate(pt,circle({r:thickness,fn:8})));
      })
       o.push(chain_hull({closed: false},hullCircles));
       hullCircles=[];
    });
    return union(o);
  }
  
  $h.load = function (name){
  eval(name+"()");  // evaluate the main function
  var exps = eval(name+".exports")  // get the desired exports from the main function
  Object.assign(this,exps) // add all exported values to the surrounding scope if requested
  return exps; // return the exports for use with a more conventional require e.g. const foo = require("fooFile").foo;
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
    // including an if function allows this to be used for list comprehension as well as for
    if(ifFunc){
      result = result.filter((elem)=>{
        return ifFunc(...elem);
      })
    }
    return result.map(bodyFunc);
  }

  // For input arrays i,j,k... creates an array [[i,j,k...][...]...] for every iterative value of i,j,k...
  // e.g forRecurse([1,2,3],[5,6]) returns [[1,5],[1,6],[2,5],[2,6],[3:5],[3,6]]
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

  // creates an array of indexes from start to end (inclusive) in steps of inc
  // The inputs can be real (does not require integers)
  $h.range = function range(start,inc,end){
      if(end===undefined) {end=inc;inc=1;}
      return Array(Math.floor((end-start)/inc)+1).fill(start).map((e,i)=>e+i*inc)
    }

  $h.ifFunc = function ifFunc(cond,trueFunc,falseFunc){
    return (cond) ? trueFunc() : (falseFunc ? falseFunc() : nullCSG());
  }

  // This resolves problems when arguments are passed with some named and others not.
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

  $h.vadd = function vadd(lhs,rhs){
    var result=[];
    if(! Array.isArray(lhs) && ! Array.isArray(rhs)) result = lhs + rhs;
    else if(Array.isArray(lhs) && ! Array.isArray(rhs)) result = undef;
    else if(! Array.isArray(lhs) && Array.isArray(rhs)) result = undef;
    else if(Array.isArray(lhs) && Array.isArray(rhs)) {for(var i=0;i<Math.min(lhs.length,rhs.length);i++) result.push($h.vadd(lhs[i],rhs[i]));}
    else result = undef
    return result;
  }
  $h.vsub = function vsub(lhs,rhs){
    var result=[];
    if(! Array.isArray(lhs) && ! Array.isArray(rhs)) result = lhs - rhs;
    else if(Array.isArray(lhs) && ! Array.isArray(rhs)) result = undef;
    else if(! Array.isArray(lhs) && Array.isArray(rhs)) result = undef;
    else if(Array.isArray(lhs) && Array.isArray(rhs)) {for(var i=0;i<Math.min(lhs.length,rhs.length);i++) result.push( $h.vsub(lhs[i],rhs[i]));}
    else result = undef
    return result;
  }

  $h.vmult = function vmult(lhs,rhs){
    var result=[];
    if(! Array.isArray(lhs) && ! Array.isArray(rhs)) result = lhs * rhs;
    else if(Array.isArray(lhs) && ! Array.isArray(rhs)) result = lhs.map((elem)=>$h.vmult(elem,rhs))
    else if(! Array.isArray(lhs) && Array.isArray(rhs)) result = rhs.map((elem)=>$h.vmult(lhs,elem))
    else if(Array.isArray(rhs) && Array.isArray(rhs[0])) result =$h.vmatrix(lhs,rhs);
    else if(lhs.length !== rhs.length) result = undef;
    else  { result =0; for(var i=0;i<rhs.length;i++) { result += $h.vmult(lhs[i],rhs[i])} if(result!==result) result = undef;}
    //else result = undef
    return result;
  }

  $h.vmatrix = function vmatrix(lhs,rhs){
    var result=[];
    if(!Array.isArray(rhs) || ! Array.isArray(rhs[0])) result = undef;
    else if(Array.isArray(lhs[0]) && lhs[0].length != rhs.length) result = undef;  // row and column dimensions don't agree, can't do matrix math
    else {
      var xpose = $h.transpose(rhs);
      if(Array.isArray(lhs[0])){
        result = lhs.map((lhsElem)=>xpose.map((tElem)=>$h.vmult(lhsElem,tElem)));
      } else {
        result = xpose.map((tElem)=>$h.vmult(lhs,tElem));
      }
    }
    return result;
  }
  $h.transpose = function transpose(mat){
    return mat[0].map((outer,i)=>mat.map((inner,j)=>mat[j][i]));
  }

  $h.vdiv = function vdiv(lhs,rhs){
    var result=[];
    if(! Array.isArray(lhs) && ! Array.isArray(rhs)) result = lhs / rhs;
    else if(Array.isArray(lhs) && ! Array.isArray(rhs)) result = lhs.map((elem)=>$h.vdiv(elem,rhs))
    else if(!Array.isArray(lhs) &&  Array.isArray(rhs))  result = rhs.map((elem)=>$h.vdiv(lhs,elem))
    else if(Array.isArray(lhs) && Array.isArray(rhs)) result =undef;
    else result = undef
    return result;
  }

  // X is red, Y is green and Z is Blue
  $h.axisHelper = function axisHelper(){
    var r=0.1;
    var oneAxis = union(cylinder({h: 9,r2: r,r1: r}),
    translate([0, 0, 9], cylinder({h: 1,r2: 0,r1: r*2})));
    return union(
        color("blue", oneAxis),
        color("red", rotate([0, 90, 0], oneAxis)),
        color("green", rotate([-90, 0, 0], oneAxis))
      );
  }

  libhelpers.$h = $h;

}
libhelpers();





