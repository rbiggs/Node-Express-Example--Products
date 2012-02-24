////////////////////////
//  Module dependencies.
////////////////////////
var express = require('express')
  , fs = require('fs')
  , crypto = require('crypto');

// Create an instance of the server.
var app = exports = express.createServer();

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

//////////////////////////////
// Import route helpers:
//////////////////////////////
var index = require('./index');
var authenticate = require('./authenticate');
var products = require('./products');
var images = require('./images');


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


//////////////////////////////////
// HANDLE ROUTES:
//////////////////////////////////
// Handle access to the main page
app.get('/', index.load);

// Handle access to the login page.
app.get('/login', authenticate.index);
// Login user:
app.post('/login', authenticate.login);
// This is executed when the user clicks a logout link:
app.get('/logout', authenticate.logout);

// Get all available products:
app.get('/products',  products.index);
app.post('/products', products.post);
// Restrict creating new products to logged in user:
app.get('/products/new', restrict, products.new);
app.get('/products/:id', products.id);
// Restrict editing products:
app.get('/products/:id/edit', restrict, products.edit);
// Handle updating a product after editing it.
app.put('/products/:id', products.update);

app.get('/images', restrict, images.load);
// For adding new images, restrict access to logged in user.
app.get('/images/new', restrict, images.new);
// Handle uploading a new image.
app.post('/images', images.upload);


////////////////////////
// Basic Error Handling
///////////////////////
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
