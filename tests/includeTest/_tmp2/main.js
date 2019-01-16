include("helpers.js");
libmain = function() {
  include("inc2.js")
  let mv = 3

  function mf() {
    return (sphere());
  }

  libmain.main = function(args) {
    return (union(echof(a),
      foo2(2)));
  };
  [libmain.mv, libmain.mf] = [mv, mf]; // exports from lib libmain
}
libmain();
[mv, mf] = [libmain.mv, libmain.mf]; // exports to globals
function main(args) {
  return libmain.main(args);
}