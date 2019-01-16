// Pin Connectors V2
// Tony Buser <tbuser@gmail.com>
// pinhole(h=5);
//test();
// pintack(h=10);
// pinpeg(h=20);
include("helpers.js");
pins = function() {

  function test() {
    let tolerance = 0.3;
    return (union(translate([-12, 12, 0], pinpeg(20)),
      translate([12, 12, 0], pintack(10)),
      difference(union(translate([0, -12, 2.5], cube({
            size: [59, 20, 5],
            center: true
          })),
          translate([24, -12, 7.5], cube({
            size: [12, 20, 15],
            center: true
          }))),
        translate([-24, -12, 0], pinhole({
          h: 5,
          t: tolerance
        })),
        translate([-12, -12, 0], pinhole({
          h: 5,
          t: tolerance,
          tight: false
        })),
        translate([0, -12, 0], pinhole({
          h: 10,
          t: tolerance
        })),
        translate([12, -12, 0], pinhole({
          h: 10,
          t: tolerance,
          tight: false
        })),
        translate([24, -12, 15], rotate([0, 180, 0], pinhole({
          h: 10,
          t: tolerance
        }))))));
  }


  function pinhole(h, r, lh, lt, t, tight) {
    [h, r, lh, lt, t, tight] = $h.setArguments(['h', 'r', 'lh', 'lt', 't', 'tight'], arguments, [10, 4, 3, 1, 0.3, true]);

    return ( /* h = shaft height// r = shaft radius// lh = lip height// lt = lip thickness// t = tolerance// tight = set to false if you want a joint that spins easily*/ union(pin_solid(h, r + (t / 2), lh, lt),
      cylinder({
        h: h + 0.2,
        r: r
      }),
      // widen the cylinder slightly// cylinder(h=h+0.2, r=r+(t-0.2/2));
      $h.ifFunc((tight == false), () => {
        return (cylinder({
          h: h + 0.2,
          r: r + (t / 2) + 0.25
        }));
      }),
      // widen the entrance hole to make insertion easier
      translate([0, 0, -0.1], cylinder({
        h: lh / 3,
        r2: r,
        r1: r + (t / 2) + (lt / 2),
        r: 1
      }))));
  }


  function pin(h, r, lh, lt, side) {
    [h, r, lh, lt, side] = $h.setArguments(['h', 'r', 'lh', 'lt', 'side'], arguments, [10, 4, 3, 1, false]);

    return ( /* h = shaft height// r = shaft radius// lh = lip height// lt = lip thickness// side = set to true if you want it printed horizontally*/ $h.ifFunc((side), () => {
      return (pin_horizontal(h, r, lh, lt));
    }, () => {
      return (pin_vertical(h, r, lh, lt));
    }));
  }


  function pintack(h, r, lh, lt, bh, br) {
    [h, r, lh, lt, bh, br] = $h.setArguments(['h', 'r', 'lh', 'lt', 'bh', 'br'], arguments, [10, 4, 3, 1, 3, 8.75]);

    return ( /* bh = base_height// br = base_radius*/ union(cylinder({
        h: bh,
        r: br
      }),
      translate([0, 0, bh], pin(h, r, lh, lt))));
  }


  function pinpeg(h, r, lh, lt) {
    [h, r, lh, lt] = $h.setArguments(['h', 'r', 'lh', 'lt'], arguments, [20, 4, 3, 1]);

    return (union(translate([0, -h / 4 + 0.05, 0], pin({
        side: true,
        h: h / 2 + 0.1,
        r: r,
        lh: lh,
        lt: lt
      })),
      translate([0, h / 4 - 0.05, 0], rotate([0, 0, 180], pin({
        side: true,
        h: h / 2 + 0.1,
        r: r,
        lh: lh,
        lt: lt
      })))));
  }


  // just call pin instead, I made this module because it was easier to do the rotation option this way
  // since openscad complains of recursion if I did it all in one module

  function pin_vertical(h, r, lh, lt) {
    [h, r, lh, lt] = $h.setArguments(['h', 'r', 'lh', 'lt'], arguments, [10, 4, 3, 1]);

    return ( /* h = shaft height// r = shaft radius// lh = lip height// lt = lip thickness*/ difference(pin_solid(h, r, lh, lt),
      // center cut
      translate([-r * 0.5 / 2, -(r * 2 + lt * 2) / 2, h / 4], cube([r * 0.5, r * 2 + lt * 2, h])),
      translate([0, 0, h / 4], cylinder({
        h: h + lh,
        r: r / 2.5,
        fn: 20
      })),
      // center curve// translate([0, 0, h/4]) rotate([90, 0, 0]) cylinder(h=r*2, r=r*0.5/2, center=true, $fn=20);// side cuts
      translate([-r * 2, -lt - r * 1.125, -1], cube([r * 4, lt * 2, h + 2])),
      translate([-r * 2, -lt + r * 1.125, -1], cube([r * 4, lt * 2, h + 2]))));
  }


  // call pin with side=true instead of this

  function pin_horizontal(h, r, lh, lt) {
    [h, r, lh, lt] = $h.setArguments(['h', 'r', 'lh', 'lt'], arguments, [10, 4, 3, 1]);

    return ( /* h = shaft height// r = shaft radius// lh = lip height// lt = lip thickness*/ translate([0, h / 2, r * 1.125 - lt], rotate([90, 0, 0], pin_vertical(h, r, lh, lt))));
  }


  // this is mainly to make the pinhole module easier

  function pin_solid(h, r, lh, lt) {
    [h, r, lh, lt] = $h.setArguments(['h', 'r', 'lh', 'lt'], arguments, [10, 4, 3, 1]);

    return (union( /* shaft*/ cylinder({
        h: h - lh,
        r: r,
        fn: 30
      }),
      // lip// translate([0, 0, h-lh]) cylinder(h=lh*0.25, r1=r, r2=r+(lt/2), $fn=30);// translate([0, 0, h-lh+lh*0.25]) cylinder(h=lh*0.25, r2=r, r1=r+(lt/2), $fn=30);// translate([0, 0, h-lh+lh*0.50]) cylinder(h=lh*0.50, r1=r, r2=r-(lt/2), $fn=30);// translate([0, 0, h-lh]) cylinder(h=lh*0.50, r1=r, r2=r+(lt/2), $fn=30);// translate([0, 0, h-lh+lh*0.50]) cylinder(h=lh*0.50, r1=r+(lt/2), r2=r-(lt/3), $fn=30);    
      translate([0, 0, h - lh], cylinder({
        h: lh * 0.25,
        r1: r,
        r2: r + (lt / 2),
        fn: 30,
        r: 1
      })),
      translate([0, 0, h - lh + lh * 0.25], cylinder({
        h: lh * 0.25,
        r: r + (lt / 2),
        fn: 30
      })),
      translate([0, 0, h - lh + lh * 0.50], cylinder({
        h: lh * 0.50,
        r1: r + (lt / 2),
        r2: r - (lt / 2),
        fn: 30,
        r: 1
      }))));
  }

  pins.main = function(args) {
    return (nullCSG());
  };
  [pins.test, pins.pinhole, pins.pin, pins.pintack, pins.pinpeg, pins.pin_vertical, pins.pin_horizontal, pins.pin_solid] = [test, pinhole, pin, pintack, pinpeg, pin_vertical, pin_horizontal, pin_solid]; // exports from lib pins
}
pins();
[test, pinhole, pin, pintack, pinpeg, pin_vertical, pin_horizontal, pin_solid] = [pins.test, pins.pinhole, pins.pin, pins.pintack, pins.pinpeg, pins.pin_vertical, pins.pin_horizontal, pins.pin_solid]; // exports to globals
function main(args) {
  return pins.main(args);
}