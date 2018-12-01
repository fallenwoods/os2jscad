
include<faceSmall.scad>;

narrow = 0.9;
minWidth=0.1;

function slice(start,end,data) = [for(i=[start:end]) data[i]];
function polyPts(row,range)= concat(
    [for(i=[0:len(row)-1]) [row[i]*narrow/range+minWidth,i*2]],
    [for(i=[len(row)-1:-1:0]) [-row[i]*narrow/range-minWidth,i*2]],
    [[row[0]*narrow/range+minWidth,0]]);

module polyStrip(row,range){
    //echo(row);
     //echo(polyPts(row,range));
     
     polygon(points=polyPts(row,range),convexity=10);
}
//polyStrip(slice(width,(width)+width-1,data),range);
//echo (polyPts(slice(width,(width)+width-1,data),range));

module $main(){

    translate([-height,-width,0])
    union(){
        //*
        color("white")translate([0,0,1])linear_extrude(0.1) union(){
            for(i = [0:height-1]){
                translate([2*i,0,0])polyStrip(slice(i*width,(i*width)+width-1,data),range);
            }
        }
        //*/
        //color("white")translate([-0.5,2*(width-1),1])cube([(height)*2,1,1]);
        //color("white")translate([-0.5,0,1])          cube([(height)*2,1,1]);
        color("black")cube([(height-1)*2,(width-1)*2,1]);
    }
}

$main();
