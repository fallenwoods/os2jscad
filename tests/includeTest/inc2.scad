include <inc3.scad>

a = 3;

module foo2(r) {
  translate([r*10,0,0]) sphere (a+r);
  foo3(a);
}
foo2(2*a);
