include("helpers.js");
mounting_library = function() {
  include("arduino.js")

  //Arduino boards
  //You can create a boxed out version of a variety of boards by calling the arduino() module
  //The default board for all functions is the Uno
  let dueDimensions = boardDimensions(DUE)
  let unoDimensions = boardDimensions(UNO)
  mounting_library.main = function(args) {
    return (union(
      //Board mockups
      arduino(),
      translate([unoDimensions[0] + 50, 0, 0], arduino(DUE)),
      translate([-(unoDimensions[0] + 50), 0, 0], arduino(LEONARDO)),
      translate([0, 0, -75], union(enclosure(),
        translate([unoDimensions[0] + 50, 0, 0], bumper(DUE)),
        translate([-(unoDimensions[0] + 50), 0, 0], union(standoffs(LEONARDO, {
            mountType: PIN
          }),
          boardShape(LEONARDO, {
            offset: 3
          }))))),
      translate([0, 0, 75], enclosureLid())));
  };
  [mounting_library.dueDimensions, mounting_library.unoDimensions] = [dueDimensions, unoDimensions]; // exports from lib mounting_library
}
mounting_library();
[dueDimensions, unoDimensions] = [mounting_library.dueDimensions, mounting_library.unoDimensions]; // exports to globals
function main(args) {
  return mounting_library.main(args);
}