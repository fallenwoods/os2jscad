var getPixels = require("get-pixels")
var fs = require("fs");

var imageName = './GridPicture/faceSmall';

getPixels(imageName+".png", function(err, pixels) {
  if(err) {
    console.log("Bad image path")
    return
  }
  var newPixels=[];
  for(var i=0;i<pixels.shape[0]*pixels.shape[1]*pixels.shape[2];i+=pixels.shape[2]){
    newPixels.push(pixels.data[i])
  }

  var fd = fs.openSync(imageName+".js",'w');
  fs.writeSync(fd, JSON.stringify({shape:pixels.shape,range:255,data:newPixels}),'end','utf8');   // position == 'end' will be ignored.
  //console.log("got pixels", pixels.shape.slice())

  fs.closeSync(fd);
})