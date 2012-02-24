// Define products model.
// In real life this data would be retrieved from a database.
var products = [
  {
	id : 1,
	name : 'MacBook Pro',
	description : "The 15- and 17-inch MacBook Pro now feature quad-core Intel Core i7 processors. And the 13-inch models jump to dual-core Intel Core i5 and i7 processors. That means all three models are up to twice as fast.",
	price : "$1199"
  },
  {
	id : 2,
	name : 'iPad 2',
	description : "Dual-core A5 chip. Two cameras for FaceTime and HD video. 10-hour battery life. And only 0.34 inch thin and as little as 1.33 pounds. You never thought something so thin could hold so much.",
	price : "$500"
  },
  {
	id : 3,
	name : 'MacBook Air',
	description : "Intel Core i5 and i7 processors make the new MacBook Air up to 2.5x faster than before.* Breeze through everything — work, play, and all things in between — on a notebook that goes everywhere.",
	price : "$999"
  },
  {
  id : 4,
  name : 'Mac Mini',
  description : "The latest dual-core Intel Core i5 and i7 processors mean Mac mini can do double time.",
  price : "$500"
  }
];

// Define a 'find' method for products.
// This will enable you to search products by id.
var find = function(id) {
  id = parseInt(id, 10);
  var found = null;
  productloop: for(product_index in products) {
    var product = products[product_index];
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
  products[id - 1] = product;
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
  var id = products.length + 1;
  product.id = id;
  products[id - 1] = product;
  return id;
}

// When the user access the '/products' route, get all products.
// This is used to render out all the products defined in the data model (products.js).
exports.index = function(req, res) {
  // We want to pass in the logged state of the user.
  // This will be used to show either the login or logout link.
  var user = req.session.user || '';
  res.render('products/index', {locals: {
      products: products,
      user: user
  }});
}

// Handle adding a new product to the live data model.
exports.post = function(req, res) {
    var id = insert(req.body.product);
    // Redirect the user to the new product's page.
    res.redirect('/products/' + id);
}

// Import image helpers for 'new' and 'edit' methods:
var images = require('./images');

// Create a new product.
exports.new = function(req, res) {
  // products.new is defined in products.js.
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
}

// When the user selects the Edit button,
// render the edit page.
// Restrict access to logged in user.
// Pass the list of available images for rendering a select box in the template.
exports.edit = function(req, res) {
  var product = find(req.params.id);
  images.list(function(err, image_list) {
    if (err) {
      throw err;
    }
    res.render('products/edit', {locals: {
      product: product,
      images: image_list
    }});

  });
}

// Handle the request for a particular product.
// Check if the user is logged in or not to
// show the login/logout links.
exports.id = function(req, res) {
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
}

// Update edited product:
exports.update = function(req, res){
    var id = req.params.id;
    set(id, req.body.product);
    res.redirect('/products/' + id);
}