//!OpenSCAD
edgeThickness = 0.4;
cutter_sizes = 4;
wallHeight = 17;
wallFlareWidth = 14;
wallFlareThickness = 2;
minWallWidth = .8;
maxWallWidth = .8;
insideWallFlareWidth = 1;
insideWallFlareThickness = 1.5;
minInsideWallWidth = 1;
maxInsideWallWidth = 3;
featureHeight = 14;
minFeatureThickness = 0.8;
maxFeatureThickness = 0.8;
connectorThickness = 2;
size = 25.4*cutter_sizes;

module dummy() {}

//scale = size/25.108;
scale=1;

module ribbon(points, thickness=1, closed=false) {
    p = closed ? concat(points, [points[0]]) : points;
    
    union() {
        for (i=[1:len(p)-1]) {
            hull() {
                translate(p[i-1]) circle(d=thickness, $fn=8);
                translate(p[i]) circle(d=thickness, $fn=8);
            }
        }
    }
}

module cookieCutter() {

path0=[[-2.604,305.284],[-2.961,290.904],[-3.050,283.568],[-3.006,280.906],[-2.961,280.545],[2.805,288.678],[1.814,291.470],[-0.099,297.214],[-0.906,299.960],[-1.349,301.962],[-1.373,302.531],[-1.231,302.729],[-0.898,302.494],[0.269,300.934],[0.810,300.408],[1.276,300.152],[1.672,300.132],[2.005,300.313],[2.280,300.661],[2.678,301.717],[2.911,303.022],[3.057,305.653],[-2.604,305.284]];
render(convexity=10) linear_extrude(height=(wallHeight)) ribbon(path0,thickness=min(maxWallWidth,max(0.001,minWallWidth)));
render(convexity=10) linear_extrude(height=(wallHeight+1)) ribbon(path0,thickness=edgeThickness);
difference() {
 render(convexity=10) linear_extrude(height=wallFlareThickness) ribbon(path0,thickness=wallFlareWidth);
 translate([0,0,-0.01]) linear_extrude(height=wallFlareThickness+0.02) polygon(points=path0);
}
}

translate([0,-280.545*scale,0]) cookieCutter();