include <inc4.scad>

a = 4;

module foo(r) {
  sphere (a*r);
}
foo(5);
