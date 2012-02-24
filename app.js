////////////////////////
//  Module dependencies.
////////////////////////
var express = require('express'), 
  fs = require('fs'), 
  crypto = require('crypto');

//////////////////////////////
// Server setup
//////////////////////////////
// Create an instance of the server:
var app = express.createServer();
// Import configuration settings for server:
var configuration = require('./configuration');
// Initialize server configuration:
configuration.setup(app);


//////////////////////////////
// Import route helpers:
//////////////////////////////
var index = require('./index');
var authenticate = require('./authenticate');
var products = require('./products');
var images = require('./images');

//////////////////////////////////
// HANDLE ROUTES VERBS:
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
app.get('/products/new', authenticate.restrict, products.new);
app.get('/products/:id', products.id);
// Restrict editing products:
app.get('/products/:id/edit', authenticate.restrict, products.edit);
// Handle updating a product after editing it.
app.put('/products/:id', products.update);

app.get('/images', authenticate.restrict, images.load);
// For adding new images, restrict access to logged in user.
app.get('/images/new', authenticate.restrict, images.new);
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

// Tell the server what port to listen to.
app.listen(4444);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
