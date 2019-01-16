include("helpers.js");
pin_joints = function() {
  include("pins.js")

  // default is 0.3
  let tolerance = 0.3

  //plate_simple();

  function pins() {
    return (union(translate([-21, 0, 0], pinpeg({
        h: 20
      })),
      translate([0, 0, 0], pintack({
        h: 11
      })),
      translate([21, 0, 0], pintack({
        h: 11
      }))));
  }


  function wheel() {
    return (difference(union(translate([0, 0, 10], cylinder({
          h: 5,
          r1: 20 / 2,
          r2: 17 / 2,
          r: 1
        })),
        translate([0, 0, 5], cylinder({
          h: 5,
          r: 20 / 2
        })),
        translate([0, 0, 0], cylinder({
          h: 5,
          r1: 17 / 2,
          r2: 20 / 2,
          r: 1
        }))),
      translate([0, 0, 11], cylinder({
        h: 15,
        r: 13 / 2
      })),
      pinhole({
        h: 5,
        t: tolerance
      })));
  }


  function axel_tight() {
    return (difference(union(translate([0, -2.5, 0], cube([25, 5, 5])),
        cylinder({
          h: 5,
          r: 5 * 1.75
        }),
        translate([25, 0, 0], cylinder({
          h: 12,
          r: 5 * 1.75
        }))),
      pinhole({
        h: 5,
        t: tolerance
      }),
      translate([25, 0, 10 + 2], rotate([180, 0, 0], pinhole({
        h: 8,
        t: tolerance
      })))));
  }


  function axel_loose() {
    return (difference(union(translate([0, -2.5, 0], cube([25, 5, 5])),
        cylinder({
          h: 5,
          r: 5 * 1.75
        }),
        translate([25, 0, 0], cylinder({
          h: 5,
          r: 5 * 1.75
        }))),
      translate([0, 0, 5], rotate([180, 0, 0], pinhole({
        h: 5,
        t: tolerance,
        tight: false
      }))),
      translate([25, 0, 0], pinhole({
        h: 5,
        t: tolerance,
        tight: false
      }))));
  }


  function axel_loose_and_tight() {
    return (difference(union(translate([0, -2.5, 0], cube([25, 5, 5])),
        cylinder({
          h: 5,
          r: 5 * 1.75
        }),
        translate([25, 0, 0], cylinder({
          h: 5,
          r: 5 * 1.75
        }))),
      pinhole({
        h: 10,
        t: tolerance
      }),
      translate([25, 0, 0], pinhole({
        h: 10,
        t: tolerance,
        tight: false
      }))));
  }


  function plate() {
    return (union(translate([0, 0, -0.5], cube({
        center: true,
        size: [100, 100, 1]
      })),
      translate([0, 21, 0], pins()),
      translate([-21, 0, 0], wheel()),
      translate([-21, -21, 0], wheel()),
      translate([0, 0, 0], axel_tight()),
      translate([0, -20, 0], axel_loose())));
  }


  function plate_simple() {
    return (union(translate([0, 0, -0.5], cube({
        center: true,
        size: [100, 100, 1]
      })),
      translate([-10.5, 10.5, 0], pintack({
        h: 11
      })),
      translate([10.5, 10.5, 0], pintack({
        h: 11
      })),
      translate([-25 / 2, -10.5, 0], axel_loose_and_tight())));
  }

  pin_joints.main = function(args) {
    return (
      // pinpeg(h=40);
      // pin();
      // pin(side=true);
      // pinhole(t=tolerance);
      // pintack(h=10, r=4);
      //pins();
      // wheel();
      // translate([-25/2, 0, 0]) axel_tight();
      // translate([-25/2, 0, 0]) axel_loose();
      // translate([-25/2, 0, 0]) axel_loose_and_tight();
      plate());
  };
  [pin_joints.tolerance, pin_joints.pins, pin_joints.wheel, pin_joints.axel_tight, pin_joints.axel_loose, pin_joints.axel_loose_and_tight, pin_joints.plate, pin_joints.plate_simple] = [tolerance, pins, wheel, axel_tight, axel_loose, axel_loose_and_tight, plate, plate_simple]; // exports from lib pin_joints
}
pin_joints();
[tolerance, pins, wheel, axel_tight, axel_loose, axel_loose_and_tight, plate, plate_simple] = [pin_joints.tolerance, pin_joints.pins, pin_joints.wheel, pin_joints.axel_tight, pin_joints.axel_loose, pin_joints.axel_loose_and_tight, pin_joints.plate, pin_joints.plate_simple]; // exports to globals
function main(args) {
  return pin_joints.main(args);
}