// Import file system module from Node:
var fs = require('fs');

// Define path of directory where phtotos reside.
var src_path = __dirname.substr(0, __dirname.lastIndexOf('/')) + '/public/uploads/images/'

// Export collection of available images.
var list = function(callback) {
  fs.readdir(src_path, function(err, files) {
    var ret = [];
    files.forEach(function(file) {
      // Ignore files beginning with '.'!
      if (!/^\./img.test(file)) {
        ret.push('/uploads/images/' + file);
      }
    });
    //console.log(ret);
    callback(err, ret);
  });
};

// Export the file system, image path and list to use in products.js and images.js.
exports.fs = fs;
exports.list = list;
exports.src_path = src_path;