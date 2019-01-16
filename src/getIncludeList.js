var fs = require('fs');
var path = require('path');


/*
var includeList=getIncludeList("includeTest4/inc4.scad")

console.log(includeList);
console.log(includeList);
//*/


// FIXME Are there any global type references where we won't find the file?
// FIXME need to look for circular references. This can be solved if we do this in three passes
//      one to get the list in order, one to build the signature table and one to do the conversion
//      (Will this still have issues if there are also overlaps in symbols, so the order of the sigatures in the map matters?)
function getIncludeLines(fileName,parent){

    var lines;
    try {
        let buf = fs.readFileSync(fileName, { encoding: 'utf8' })

        lines = buf.split('\n')  // each line in an array
        lines = lines.filter(line => /^\s*include\s*<[\w\.\/\\:]*>/.test(line))  // find include lines
        lines = lines.map((line)=>path.join(path.dirname(fileName), line.replace(/.+<([^>]*)>.*\r?/, '$1')).replace(/\\/g,"/"))
    } catch(exp){
        console.log("Unable to open file",fileName,(parent?"from file "+parent:""));

    }

    return lines;


  }

  function getIncludeList(fileNames){
    var includeList=[];

    function recurseIncludes(fileName,parent){
        var foundIncludes = getIncludeLines(fileName,parent);
        if(foundIncludes && foundIncludes.length > 0) {
            //remove dups from the found list
            foundIncludes = foundIncludes.filter((includedFile)=>includeList.indexOf(includedFile)<0)
            // first add those we haven't seen before to the list
            includeList = includeList.concat(foundIncludes);

            // and then recurse to find the includes they may reference
            foundIncludes.forEach((includedFile)=>recurseIncludes(includedFile,fileName));

        }
    }

    //includeList = includeList.concat(fileNames);
    fileNames.forEach((fileName)=>recurseIncludes(fileName));
    includeList = includeList.reverse();
    return includeList;
}

module.exports = {
    getIncludeList:  getIncludeList,
    getIncludeLines:    getIncludeLines

  }