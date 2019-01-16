//include <inc3.scad>
include("helpers.js");
inc2 = function() {
  let a = 3

  function foo2(r) {
    [r] = $h.setArguments(['r'], arguments, [undefined]);

    return (translate([r * 10, 0, 0], sphere(a + r)));
  }

  inc2.main = function(args) {
    return (nullCSG());
  };
  [inc2.a, inc2.foo2] = [a, foo2]; // exports from lib inc2
}
inc2();
[a, foo2] = [inc2.a, inc2.foo2]; // exports to globals
function main(args) {
  return inc2.main(args);
}