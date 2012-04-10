// Import json object:
var available = require('../models/products');
var authenticate = require('./authenticate');


// Define a 'find' method for products.
// This will enable you to search products by id.
var find = function(id) {
  id = parseInt(id, 10);
  var found = null;
  productloop: for(product_index in available.products) {
    var product = available.products[product_index];
    if (product.id == id) {
      found = product;
      break productloop;
    }    
  };
  return found;
}

// Define method to create a new product id based on current ids.
var set = function(id, product) {
  id = parseInt(id, 10);
  product.id = id;
  available.products[id - 1] = product;
};

// Define method to create an empty object for a new product.
// This will be used to fill out the appropriate values in /views/partials/products/product_form.jade,
// which is loaded when the user requested /views/products/new.jade.
var create = function() {
  return {
    name: '',
    description: '',
    price: 0
  };
}

// Define a function to insert the new product into the product collection.
// This is executed when the user submits the new product.
var insert = function(product) {
  var id = available.products.length + 1;
  product.id = id;
  available.products[id - 1] = product;
  return id;
}

// Import image helpers for 'new' and 'edit' methods:
var images = require('../controllers/image');

module.exports = function(app) {
	// When the user access the '/products' route, get all products.
	// This is used to render out all the products defined in the data model (products.js).
	//app.get('/products',  products.index) {
	app.get('/products', function(req, res){
	//exports.index = function(req, res) {
	  // We want to pass in the logged state of the user.
	  // This will be used to show either the login or logout link.
	  var user = req.session.user || '';
	  res.render('products/index', {locals: {
		  products: available.products,
		  user: user
	  }});
	});
	
	// Handle adding a new product to the live data model.
	app.post('/products', function(req, res) {
		var id = insert(req.body.product);
		// Redirect the user to the new product's page.
		res.redirect('/products/' + id);
	});
	
	// Create a new product.
	app.get('/products/new', authenticate.restrict, function(req, res) {
	  // The create function is defined above.
	  // This creates an empty product object.
	  // This object gets sent to the new product page,
	  // where it gets updated when the user submits the form.
	  var product = create();
	  // Get available images in 'upload' directory.
	  // This list will be used by the page to build a image select box.
	  images.list(function(err, image_list) {
		if (err) {
		  throw err;
		}
		res.render('products/new', {locals: {
		  product: product,
		  images: image_list
		}});
	
	  }); 
	});
	// When the user selects the Edit button,
	// render the edit page.
	// Restrict access to logged in user.
	// Pass the list of available images for rendering a select box in the template.
	app.get('/products/:id/edit', authenticate.restrict, function(req, res) {
	  var product = find(req.params.id);
	  images.list(function(err, image_list) {
		if (err) {
		  throw err;
		}
		res.render('../views/products/edit', {locals: {
		  product: product,
		  images: image_list
		}});
	
	  });
	});
	
	// Handle the request for a particular product.
	// Check if the user is logged in or not to
	// show the login/logout links.
	app.get('/products/:id', function(req, res) {
		var user = req.session.user || '';
		var product = find(req.params.id);
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
		  res.redirect('/products');
		}
	});
	
	// Update edited product:
	app.put('/products/:id', function(req, res){
		var id = req.params.id;
		set(id, req.body.product);
		res.redirect('/products/' + id);
	});	
};