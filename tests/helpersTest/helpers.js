helpers =
//=== Helper Utilities ==============================================
// FIXME does this form need to be different to embedd the code directly.
// Also can I tighten up this code and inject it after the beautify

//===========================

function helpers(){

  // These pollute the global space
  str = function str(args){ return [...arguments].toString();}
  len = function len(a) { return a.length;}
  import_dxf = function import_dxf(args) { return $import(arguments);}

  concat = function concat(arys) {
  return flatten1([...arguments])
  }

  nullCSG = function nullCSG() { return polyhedron({points: [],triangles: []});}

  forLoop = function forLoop(start,end,inc) {
  if(Array.isArray(start)) return start;  // Handle the case where this iterates over an array rather than a range
  inc=inc===undefined?1:inc;
  var result=[];
  for(var i=start;i<=end;i+=inc) result.push(i);
  return result;
  }


  // These are only visible via the helpers var
  helpers.setDefaults = function setDefaults(names, values, defs) {
    var result = [];
    var isObjArg = (typeof(values[0]) === "object" && !Array.isArray(values[0])) || false;
    var argObj = isObjArg ? values[0] : {};

    if(!isObjArg){
      for(var i = 0; i < values.length; i++){
        argObj[names[i]] = values[i];
      }
    }

    for(var i = 0; i < names.length; i++){
      result.push(argObj[names[i]] ? argObj[names[i]] : defs[i]);
    }
    return result;
  }

helpers.echo = function echo(args) {  console.log(...arguments); return nullCSG();}

helpers.axisHelper = function axisHelper(){
  var r=0.1;
  var oneAxis = union(cylinder({h: 9,r2: r,r1: r}),
  translate([0, 0, 9], cylinder({h: 1,r2: 0,r1: r*2})));
  return union(
      color("blue", oneAxis),   //FIXME do I need to close oneAxis?
      color("red", rotate([0, 90, 0], oneAxis)),
      color("green", rotate([-90, 0, 0], oneAxis))
    );
}
helpers.text = function text(text,size,font,halign,valign,spacing,direction,language,script,fn){

  [text,size,font,halign,valign,spacing,direction,language,script,fn] =
    helpers.setDefaults(["text","size","font","halign","valign","spacing","direction","language","script","fn"],
      arguments,
      ["",10,"","left","baseline",1,"ltr","en","latin",12]);



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


function poly3Dto2D(poly){
  var pts=[]
  poly.vertices.forEach((vertex)=>pts.push([vertex.pos._x,vertex.pos._y]))
  return polygon(pts);
}

/*
helpers.flatten1 = function flatten1(arr1) {
  return (arr1.reduce((acc, val) =>  acc.concat(val), []));
}

flatten = function flatten(arr1) {
  return (arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), [])).filter(elem => (!Array.isArray(elem) || elem.length>0));
}


//*/

}




