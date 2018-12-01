/*

	parametric temp tower - http://fns.csokolade.hu

	Use tempInjector.py from https://github.com/fablabnbg/tronxy-xy100 to inject temperatures into generated GCODE file.
	tempInjector.py parameters used in this temp_tower.scad file:

	STARTTEMP = temp (240)
	TEMP_INCREMENTS = inc (-5)
	TEMP_STEPS_HEIGHT_MM = z_bridgesole (2)
	BASE_HEIGHT_MM = z_sole (10)

*/

// temp tower steps
temp = 240;
inc = -5;
steps = 8;

// bottom sole:
x_sole = 80;
y_sole = 20;
z_sole = 2;

// pillars with bridge soles
xygap_pillars = 4;
xy_pillars = y_sole - 2 * xygap_pillars;
xygap_bridgesole = 2;
xy_bridgesole = y_sole - 2 * xygap_bridgesole;
z_bridgesole = 10;

// bridge definition
gap_bridge = 1; // 
zgap_bridge = 2; // gap between bridge soles
z_bridge = z_bridgesole + zgap_bridge;

xz_support = 6;
y_plank = 8;
z_plank = 2;


union() {
	// tower sole
	linear_extrude(height=z_sole) square(size=[x_sole, y_sole]);

	// left pillar
	translate([4, 4, 0]) linear_extrude(height=steps * (z_bridge + gap_bridge)) square(size=[xy_pillars, xy_pillars]);

	// right pillar
	translate([x_sole - xy_pillars - 4, 4, 0]) linear_extrude(height=steps * (z_bridge + gap_bridge)) square(size=[xy_pillars, xy_pillars]);

	// ladder
	for (i = [0 : steps]) {
		// left bridge sole with numbers
		difference() {
			translate([(y_sole - xy_bridgesole) / 2, (y_sole - xy_bridgesole) / 2, z_sole + i * z_bridge]) leg(); // left
			translate([(y_sole - xy_bridgesole) / 2 + 1, (y_sole - xy_bridgesole) / 2+2, z_sole + i * z_bridge +2]) {
				// title
				rotate([90, 0, 0]) linear_extrude(3) text(str(temp + i * inc), size = 6);
			}
		}

		// right bridge sole
		translate([x_sole - xy_bridgesole - (y_sole - xy_bridgesole) / 2, (y_sole - xy_bridgesole) / 2, z_sole + i * z_bridge]) leg(); // right
		
		// bridge
		//translate([xy_bridgesole + xygap_bridgesole, 0, (i+1)*z_bridge - 4]) bridge(i); 
		translate([xygap_bridgesole + xy_bridgesole, y_sole / 2- xy_bridgesole/2 , (i+1)*z_bridge - 4]) bridge(i); 
	}	
}


module leg() {
	linear_extrude(height = z_bridgesole) square(size = [xy_bridgesole, xy_bridgesole]);
}

module bridge(i) {
	x_bridge = x_sole - 2 * xy_bridgesole - 2 * xygap_bridgesole;
	x_plank = x_bridge - xz_support;

	// left mount
	rotate([-90,0,0]) linear_extrude(height = xy_bridgesole) polygon(points=[[0, 0], [xz_support,0], [0,xz_support]]);

	// right mount
	translate([x_plank,0,0]) rotate([-90,0,0]) linear_extrude(height=xy_bridgesole) polygon(points=[[0, 0], [xz_support, xz_support], [xz_support,0]]);

	// bridge
	translate([(x_bridge - x_plank)/2, (xy_bridgesole-y_plank)/2, 0]) linear_extrude(height=z_plank) square(size=[x_plank, y_plank]);
}