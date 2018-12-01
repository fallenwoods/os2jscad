
step=500;
rad=400;
min=10;
scale([0.1,0.1,0.15]){
for(i=[0:step:30000]){
    translate([0,0,i/100]){
        cylinder(r1=sin(sqrt(i))*rad+min, r2=sin(sqrt(i+step))*rad+min, h=step/100);}
    }
    translate([0,0, 180])scale(0.8){
        for(i=[0:step:30000]){
    translate([0,0,i/100]){
        cylinder(r1=sin(sqrt(i))*rad+min, r2=sin(sqrt(i+step))*rad+min, h=step/100);}
    }
}
    translate([0,0, 350])scale(0.6){
        for(i=[0:step:30000]){
    translate([0,0,i/100]){
        cylinder(r1=sin(sqrt(i))*rad+min, r2=sin(sqrt(i+step))*rad+min, h=step/100);}
    }
}
translate([0,0, 480])scale(0.4){
        for(i=[0:step:30000]){
    translate([0,0,i/100]){
        cylinder(r1=sin(sqrt(i))*rad+min, r2=sin(sqrt(i+step))*rad+min, h=step/100);}
    }
}
translate([0,0, 575])scale(0.25){
        for(i=[0:step:30000]){
    translate([0,0,i/100]){
        cylinder(r1=sin(sqrt(i))*rad+min, r2=sin(sqrt(i+step))*rad+min, h=step/100);}
    }
}
}

translate([0,0,95])cylinder(r=1,h=25);