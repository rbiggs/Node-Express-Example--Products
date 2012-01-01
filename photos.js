var fs = require('fs');

var src_path = __dirname + '/public/uploads/photos/'
module.exports.list = function(callback) {
  fs.readdir(src_path, function(err, files) {
    var ret = [];
    files.forEach(function(file) {
      if (!/DS_Store/img.test(file)) {
        ret.push('/uploads/photos/' + file);
      }
    });
    console.log(ret);
    callback(err, ret);
  });
};