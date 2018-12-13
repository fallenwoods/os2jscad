translate([-30,0,0]) ;
translate([-30,0,0]) {};
translate([-30,0,0]) difference() sphere();
translate([-30,10,0]) difference(){sphere();cube();}
translate([-30,20,0]) difference(){a=1; sphere();cube();}

union() ;
union() {}
union()sphere();cube();
union(){sphere();cube();}
union(){a=1;sphere();cube();}