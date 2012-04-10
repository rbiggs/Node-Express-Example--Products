var auth = require('./authenticate');
module.exports = function(app) {
	// Manage user login:
	app.get('/login', function(req, res) {
	  // If the user is already logged in,
	  // send him to the products page.
	  if (req.session.user) {
		res.redirect('/products');
	  // Otherwise send him to the login page.
	  } else {
		res.render('login');
	  }
	});
	
	// Handle the posting of the username and password.
	app.post('/login', function (req, res) {
	  // Retrive the username and password from the request body.
	  auth.authenticate(req.body.username, req.body.password, function(err, user) {
		// If the username entered is legit, validate session.
		if (user) {
		  // Regenerate session when signing in
		  // to prevent fixation 
		  req.session.regenerate(function() {
			/*
			  Store the user's primary key 
			  in the session store to be retrieved,
			  or in this case the entire user object,
			*/
			req.session.user = user;
			res.redirect('back');
		  });
		// Otherwise, user entered wrong username, so redirect back to login with a message.
		} else {
		  req.session.error = 'Authentication failed. Please check your username and password.';
		  res.redirect('back');
		}
	  });
	});
	
	// Logout the user:
	app.get('/logout', function(req, res) {
	  // Destroy the user's session to log them out.
	  // Will be re-created next request.
	  req.session.destroy(function() {
		res.redirect('/');
	  });
	});
};