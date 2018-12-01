// A thing to put on sharp corners to avoid injury
difference() {
  minkowski() {
  // Make a cube
  cube(size = 100, center = true);
  // Round the corners. 
  // $fn=10 is blocky but fast, $fn=100 is smooth but slow.
  sphere(20, $fn=50);
  }
   // Push 6mm down, back, out
   translate(v=[-6,-6,-6]) {
    // New cube to cut away the bulk of the first cube
       cube(size = 130, center = true);
   }
   // Cut away the top face 
   translate(v=[-57,-60,65]) {
       sphere(r = 110, center = true, $fn=100);
   }
   // Cut away one side...
   translate(v=[-60,65,-57]) {
       sphere(r = 110, center = true, $fn=100);
   }
   // Cut away the other side 
   translate(v=[65,-60,-57]) {
       sphere(r = 110, center = true, $fn=100);
   }
}