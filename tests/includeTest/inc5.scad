

a = 5;

module foo5(r) {
 translate([r*10,0,0]) sphere (a+r);
}
foo(a*2);
