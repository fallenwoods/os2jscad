include <inc4.scad>
include <inc5.scad>

a = 4;

module foo3(r) {
  translate([r*10,0,0]) sphere (a+r);
  foo4(a);
  foo5(5);
}
foo3(a*2);
