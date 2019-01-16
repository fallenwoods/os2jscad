   include("helpers.js");
  include("inc2.js"); 
libmain = function() {
  
  $main = function(){
    return (foo2(2*a));
  }
  //exports
  libmain.$main = $main;
}
libmain();


function main(args) {
  return libmain.$main(args);
}

