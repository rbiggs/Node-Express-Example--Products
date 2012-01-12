/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , fs = require('fs')
  , crypto = require('crypto');

// Create an instance of the server.
var app = module.exports = express.createServer();

// Server configuration
app.configure(function(){
  // Path for the app's views:
  app.set('views', __dirname + '/views');
  // Which template engine the app will use:
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  // This will parse the body of node request
  app.use(express.cookieParser());
  // Set up session support (setting a 'secret' is required)
  app.use(express.session({ secret: 'robot cowboy' }));
  // This allows you to overload any methods and still access the original
  app.use(express.methodOverride());
  // Use the CSS preprocess Stylus:
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  // Use the router.js file
  app.use(app.router);
  // Designate a directory for static files that won't change:
  app.use(express.static(__dirname + '/public'));
});

// Define a configuration state for development mode.
// This dumps the full stack to the terminal console.
// Set this in the terminal: NODE_ENV=production
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

// Define a configuration state for production mode.
// This prevents output of error info to the terminal.
// Set this in the terminal: NODE_ENV=production
app.configure('production', function(){
  app.use(express.errorHandler()); 
});

//These are some helpers for session management.
app.dynamicHelpers({
  message: function(req){
    var err = req.session.error
      , msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    if (err) {
      var error = "<span class='error'>";
      return error + err + '</span>';
    }
    if (msg) return msg;
  }
});

//Generate a salt for the user to prevent rainbow table attacks.
var users = {
  joe: {
    name: 'joe'
    , salt: 'randomly-generated-salt'
    , pass: hash('bozo', 'randomly-generated-salt')
  }
};

// Used to generate a hash of the plain-text password + salt.
function hash(msg, key) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

// Authenticate using our plain-object.
// For a real app you'd use some kind of data persistance (database)
function authenticate(name, pass, fn) {
  var user = users[name];
  // If the user doesn't exist, handle it:
  if (!user) return fn(new Error('cannot find user'));
  /* 
     Apply the same algorithm to the POSTed password, applying
     the hash against the pass / salt, if there is a match we
     found the user. 
  */
  if (user.pass == hash(pass, user.salt)) return fn(null, user);
  // Otherwise password is invalid:
  fn(new Error('invalid password'));
}

// Function to restrict access to certain routes.
// This will be passed in as an argument for the routes to be restricted.
function restrict(req, res, next) {
  // If the user is logged in, continue:
  if (req.session.user) {
    next();
  // Else redirect the user to login and inform them with a message:
  } else {
    req.session.error = 'Access denied! Please login.';
    res.redirect('/login');
  }
}

// Handle access to the main page
app.get('/', function(req, res) {
  // If the user is logged in, pass that info to the page.
  // It use that to show a 'logout' link, otherwise
  // it will show a login link.
  var user = req.session.user || '';
  res.render('index', {locals: {
      user: user
  }});
});

// Handle access to the login page.
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
app.post('/login', function(req, res) {
  // Retrive the username and password from the request body.
  authenticate(req.body.username, req.body.password, function(err, user) {
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

// This is executed when the user clicks a logout link:
app.get('/logout', function(req, res) {
  // Destroy the user's session to log them out.
  // Will be re-created next request.
  req.session.destroy(function() {
    res.redirect('/');
  });
});

// Routes
var products = require('./products');
var photos = require('./photos');

// This is used to render out all the products defined in the data model (products.js).
function getAllProducts(req, res) {
  // We want to pass in the logged state of the user.
  // This will be used to show either the login or logout link.
  var user = req.session.user || '';
  res.render('products/index', {locals: {
      products: products.list,
      user: user
  }});
}

// When the user access the '/products' route, get all products.
app.get('/products', function(req, res) {
  getAllProducts(req, res);
});

// For new products, restrict access to logged in user.
app.get('/products/new', restrict, function(req, res) {
  // products.new is defined in products.js.
  var product = products.new();
  // Get available photos in 'upload' directory.
  // This list will be used by the page to build a image select box.
  photos.list(function(err, photo_list) {
    if (err) {
      throw err;
    }
    res.render('products/new', {locals: {
      product: product,
      photos: photo_list
    }});

  }); 
});

// Handle adding a new product to the live data model.
app.post('/products', function(req, res) {
    var id = products.insert(req.body.product);
    // Redirect the user to the new product's page.
    res.redirect('/products/' + id);
});

// Handle the request for a particular product.
// Check if the user is logged in or not to
// show the login/logout links.
app.get('/products/:id', function(req, res) {
    var user = req.session.user || '';
    var product = products.find(req.params.id);
    // If the product ID exists, render its page.
    if (product) {
      res.render('products/show', {
        locals: {
          product: product,
          user: user
        }
      });
    // Otherwise send the user back to the products page.
    } else {
      getAllProducts(req, res);
    }
});

// When the user selects the Edit button,
// render the edit page.
// Restrict access to logged in user.
// Pass the list of available photos for rendering a select box in the template.
app.get('/products/:id/edit', restrict, function(req, res) {
  var product = products.find(req.params.id);
  photos.list(function(err, photo_list) {
    if (err) {
      throw err;
    }
    res.render('products/edit', {locals: {
      product: product,
      photos: photo_list
    }});

  });
});

// Handle updating a product after editing it.
app.put('/products/:id', function(req, res){
    var id = req.params.id;
    products.set(id, req.body.product);
    res.redirect('/products/' + id);
});

// Handle access to the photos page.
// If the user is not logged in, redirect to the login page.
app.get('/photos', restrict, function(req, res) {
  photos.list(function(err, photo_list) {
    res.render('photos/index', {locals: {
      photos: photo_list
    }})
  });
});

// Render the new photo page when the user selects that button.
// For new photos, restrict access to logged in user.
app.get('/photos/new', restrict, function(req, res) {
  res.render('photos/new');
});

// Handle uploading a new image.
app.post('/photos', function(req, res) {
	console.log(req.files.photo);
	var newFile =__dirname+'/public/uploads/photos/'+ req.files.photo.name;
  	fs.rename(req.files.photo.path , newFile, function (data,error) {
		console.log(data); 
		if(error) {
			throw error;
		}
	});
  // If the upload was successful, redirect to '/photos'.
  res.redirect('/photos');
  
});

// Basic Error Handling
// If the route provided was not trapped by the previous handlers,
// render it as a 404 error page.

app.use(function(req, res, next) {
  // respond with html page
  res.render('404');
  return;
});

// Tell the server what port to listen to  .
app.listen(4444);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
