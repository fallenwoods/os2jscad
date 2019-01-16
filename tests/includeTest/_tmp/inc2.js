//include <inc3.scad>
  include("helpers.js");
libinc2 = function () {

  
  var a = 3;

  function foo (r) {
    [r] = $h.setArguments(['r'], arguments, [undefined]);

    return (translate([r * 10, 0, 0], sphere(a + r)));
  }
  
  function foo2(r) {
    return foo(r);
  }
  [libinc2.a,libinc2.foo,libinc2.foo2] = [a,foo,foo2]; //export public refs on lib object

}
libinc2();  // Instanciate the library functions
[a,foo,foo2] = [libinc2.a,libinc2.foo,libinc2.foo2]; //export public refs on global object (Alternatively, use qualified names elsewhere e.g. lib.func())


function main(args) {
  return (nullCSG());
}

