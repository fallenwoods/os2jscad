a=[for(i=[1:2:6])  i]; echo (a);
b=[for(i=[1:2:6]) if(i!=2)  i]; echo (b);
c=[for(i=[1:2:6]) if(i!=2) let(x=2*i) [i,x]]; echo (c);

//module foo() ; // Known to not work
module foo0() {};
module foo1()  translate([-20,0,0]) sphere();
module foo2() { translate([-20,10,0])sphere();}
module foo3() { translate([-20,20,0])cube(); translate([-20,20,0])sphere();}
module foo4() { a=1; translate([-20,30,0])sphere();}

//for(i=[0:10:30]) ; // Known to not work
for(i=[0:10:30]) { }
for(i=[0:10:30]) { translate ([i,6,10]) sphere();}
for(i=[0:10:30],j=[0:10:30]) { translate ([i,j,20])sphere();}
for(i=[0:10:30],j=[0:10:30]) { a=j; translate ([i,a,30])sphere(); translate ([i,a,30]) cube();}

if(true) {} else {}
if(true) {translate([-10,10,0]) sphere();}
if(true) {translate([-10,15,0])cube(); translate([-10,15,0])sphere();}
if(true) { a=1; translate([-10,20,0])sphere();}
if(false) translate([-10,30,0])sphere(); else translate([-10,30,0]) cube();
if(false) translate([-10,35,0])sphere(); else {translate([-10,35,0])cube();translate([-10,35,0])sphere();}

foo();
foo0();
foo1();
foo2();
foo3();
foo4();

translate([-30,0,0]) ;
translate([-30,0,0]) {};
translate([-30,0,0]) difference() sphere();
translate([-30,10,0]) difference(){sphere();cube();}
translate([-30,20,0]) difference(){a=1; sphere();cube();}

assign(a=2) {}
assign(a=2) translate([-40,0,0]) sphere(a);
assign(a=2) {translate([-40,10,0]) sphere(a);};
assign(a=2) {translate([-40,20,0]) sphere(a);translate([-40,20,0]) cube(a);};
assign(a=2) {b=2;translate([-40,30,0]) sphere(a);translate([-40,30,0]) cube(a);};

//union() ; // Known to not work
union() {}
union()sphere();cube();
union(){sphere();cube();}
union(){a=1;sphere();cube();}