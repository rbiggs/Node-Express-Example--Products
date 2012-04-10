// Import image helpers for 'new' and 'edit' methods:
var images = require('./image');
var authenticate = require('./authenticate');

module.exports = function(app) {
	// Handle access to the images page.
	// If the user is not logged in, redirect to the login page.
	app.get('/images', authenticate.restrict, function(req, res) {
	  images.list(function(err, image_list) {
		res.render('images/index', {locals: {
		  images: image_list
		}})
	  });
	});
	
	// Render the new image page when the user selects that button.
	app.get('/images/new', authenticate.restrict, function(req, res) {
	  res.render('images/new');
	});
	
	// Upload a new image:
	app.post('/images', function(req, res) {
		//console.log(req.files.image);
		var newFile = images.src_path + req.files.image.name;
		images.fs.rename(req.files.image.path , newFile, function (data,error) {
			console.log(data); 
			if(error) {
				throw error;
			}
		});
	  // If the upload was successful, redirect to '/images'.
	  res.redirect('/images');
	});
};