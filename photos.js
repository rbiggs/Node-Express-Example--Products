// Import file system module from Node:
var fs = require('fs');

// Define path of directory where phtotos reside.
var src_path = __dirname + '/public/uploads/photos/'

// Export collection of available photos.
module.exports.list = function(callback) {
  fs.readdir(src_path, function(err, files) {
    var ret = [];
    files.forEach(function(file) {
      // Ignore the .DS_Store Mac system file!!!
      if (!/DS_Store/img.test(file)) {
        ret.push('/uploads/photos/' + file);
      }
    });
    console.log(ret);
    callback(err, ret);
  });
};