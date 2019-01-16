/*
height = 20;
width=20;
range = 1.0;
data = [0, 0, 0, 0, 0.541, 0.525, 0.22, 0.106, 0.125, 0.275, 0.302, 0.306, 0.42, 0.298, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.329, 0.498, 0.525, 0.196, 0.227, 0.271, 0.306, 0.271, 0.243, 0.196, 0.078, 0.016, 0, 0, 0, 0, 0, 0, 0.004, 0.008, 0.525, 0.588, 0.478, 0.302, 0.369, 0.447, 0.471, 0.42, 0.337, 0.282, 0.196, 0.039, 0, 0, 0, 0, 0, 0.004, 0.004, 0.02, 0.49, 0.788, 0.631, 0.42, 0.514, 0.424, 0.349, 0.314, 0.325, 0.267, 0.184, 0.106, 0.008, 0, 0, 0, 0, 0, 0.004, 0.161, 0.737, 0.812, 0.6, 0.439, 0.271, 0.612, 0.557, 0.506, 0.396, 0.388, 0.239, 0.043, 0.02, 0, 0, 0, 0, 0.004, 0.004, 0.318, 0.769, 0.792, 0.514, 0.329, 0.765, 0.796, 0.8, 0.784, 0.588, 0.616, 0.753, 0.588, 0.106, 0, 0, 0, 0, 0, 0.004, 0.047, 0.765, 0.761, 0.333, 0.553, 0.792, 0.859, 0.89, 0.694, 0.357, 0.753, 0.867, 0.678, 0.059, 0, 0, 0, 0, 0.004, 0.004, 0.624, 0.58, 0.624, 0.271, 0.384, 0.443, 0.569, 0.533, 0.49, 0.333, 0.384, 0.604, 0.494, 0.008, 0, 0, 0, 0, 0.004, 0, 0.482, 0.776, 0.545, 0.522, 0.431, 0.42, 0.522, 0.592, 0.451, 0.306, 0.231, 0.251, 0.118, 0.035, 0.004, 0, 0, 0, 0, 0.012, 0.031, 0.463, 0.506, 0.553, 0.58, 0.596, 0.624, 0.639, 0.957, 0.733, 0.757, 0.31, 0.145, 0.482, 0.004, 0.004, 0, 0, 0.004, 0, 0.004, 0.459, 0.612, 0.576, 0.627, 0.612, 0.678, 0.635, 0.729, 0.71, 0.333, 0.455, 0.176, 0.047, 0, 0, 0, 0, 0.004, 0, 0.004, 0.004, 0.584, 0.592, 0.584, 0.627, 0.859, 0.808, 0.757, 0.733, 0.529, 0.455, 0.137, 0.008, 0, 0, 0, 0, 0, 0.004, 0.008, 0.004, 0.447, 0.643, 0.667, 0.733, 0.624, 0.51, 0.557, 0.537, 0.459, 0.306, 0.008, 0.008, 0, 0, 0, 0, 0, 0.004, 0.004, 0.004, 0.039, 0.639, 0.663, 0.733, 0.655, 0.682, 0.812, 0.71, 0.361, 0.247, 0.004, 0.004, 0, 0, 0, 0, 0, 0.004, 0.004, 0.004, 0.012, 0.541, 0.761, 0.694, 0.659, 0.541, 0.514, 0.408, 0.337, 0.031, 0.008, 0.004, 0, 0, 0, 0, 0, 0.004, 0.008, 0.004, 0.016, 0.51, 0.69, 0.71, 0.839, 0.78, 0.745, 0.651, 0.463, 0.008, 0.004, 0.004, 0, 0, 0, 0, 0, 0.008, 0.004, 0.004, 0.31, 0.518, 0.588, 0.686, 0.863, 0.863, 0.886, 0.816, 0.247, 0.008, 0.004, 0.008, 0, 0, 0, 0, 0.004, 0.004, 0.039, 0.031, 0.173, 0.525, 0.596, 0.671, 0.757, 0.788, 0.706, 0.392, 0.263, 0.651, 0.239, 0.008, 0.004, 0, 0, 0, 0.502, 0.62, 0.027, 0.031, 0.329, 0.361, 0.639, 0.631, 0.682, 0.659, 0.561, 0.533, 0.278, 0.749, 0.784, 0.745, 0.729, 0.42, 0.482, 0.553, 0.561, 0.639, 0.333, 0.204, 0.322, 0.404, 0.58, 0.569, 0.612, 0.608, 0.659, 0.498, 0.502, 0.812, 0.784, 0.608, 0.694, 0.698, 0.639, 0.569];
*/
var animate = 0;
var fn = 12;
libmain = function() {
  include("helpers.js")
  $h();
  include("faceSmall.js");
  libfaceSmall()

  let narrow = 0.9
  let minWidth = 0.1

  function slice(start, end, data) {
    [start, end, data] = $h.setArguments(['start', 'end', 'data'], arguments, [undefined, undefined, undefined]);

    return ($h.forLoop($h.range(start, end), (elem) => {
      let [i] = elem;
      return (data[i]);
    }));
  }


  function polyPts(row, range) {
    [row, range] = $h.setArguments(['row', 'range'], arguments, [undefined, undefined]);

    return (concat($h.forLoop($h.range(0, len(row) - 1), (elem) => {
      let [i] = elem;
      return ([row[i] * narrow / range + minWidth, i * 2]);
    }), $h.forLoop($h.range(len(row) - 1, -1, 0), (elem) => {
      let [i] = elem;
      return ([-row[i] * narrow / range - minWidth, i * 2]);
    }), [
      [row[0] * narrow / range + minWidth, 0]
    ]));
  }


  function polyStrip(row, range) {
    [row, range] = $h.setArguments(['row', 'range'], arguments, [undefined, undefined]);

    return ( /*echo(row);//echo(polyPts(row,range));*/ polygon({
      points: polyPts(row, range),
      convexity: 10
    }));
  }


  //polyStrip(slice(width,(width)+width-1,data),range);
  //echo (polyPts(slice(width,(width)+width-1,data),range));

  function main() {
    return (translate([-libfaceSmall.height, -libfaceSmall.width, 0], union( /***/ color("white", translate([0, 0, 1], linear_extrude({
        height: 0.1
      }, union($h.forLoop($h.range(0, libfaceSmall.height - 1), (elem) => {
        let [i] = elem;
        return (translate([2 * i, 0, 0], polyStrip(slice(i * libfaceSmall.width, (i * libfaceSmall.width) + libfaceSmall.width - 1, libfaceSmall.data), libfaceSmall.range)));
      }))))),
      //*/
      color("white", translate([-0.5, 2 * (libfaceSmall.width - 1), 1], cube([(libfaceSmall.height) * 2, 1, 1]))),
      color("white", translate([-0.5, 0, 1], cube([(libfaceSmall.height) * 2, 1, 1]))),
      color("black", cube([(libfaceSmall.height - 1) * 2, (libfaceSmall.width - 1) * 2, 1])))));
  }

  return (main());
}

function main(args) {
  return libmain(args);
}