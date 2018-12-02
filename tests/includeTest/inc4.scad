

a = 4;

module foo4(r) {
  translate([r*10,0,0]) sphere (a+r);
}
foo4(2*a);
