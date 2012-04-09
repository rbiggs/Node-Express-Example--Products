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

// Export the list to use in products.js
exports.list = list;

// Handle access to the images page.
// If the user is not logged in, redirect to the login page.
exports.load = function(req, res) {
  list(function(err, image_list) {
    res.render('images/index', {locals: {
      images: image_list
    }})
  });
}

// Render the new image page when the user selects that button.
exports.new = function(req, res) {
  res.render('images/new');
}

// Upload a new image:
exports.upload = function(req, res) {
	console.log(req.files.image);
	var newFile = src_path + req.files.image.name;
  	fs.rename(req.files.image.path , newFile, function (data,error) {
		//console.log(data); 
		if(error) {
			throw error;
		}
	});
  // If the upload was successful, redirect to '/images'.
  res.redirect('/images');
}