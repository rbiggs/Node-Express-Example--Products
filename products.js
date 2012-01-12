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

// Make the data available to the app:
module.exports.list = products;

// Define a 'find' method for products.
// This will enable you to search products by id.
module.exports.find = function(id) {
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
module.exports.set = function(id, product) {
  id = parseInt(id, 10);
  product.id = id;
  products[id - 1] = product;
};

// Define method to create an empty object for a new product.
// This will be used to fill out the appropriate values in /views/partials/products/product_form.jade,
// which is loaded when the user requested /views/products/new.jade.
module.exports.new = function() {
  return {
    name: '',
    description: '',
    price: 0
  };
}

// Define a function to insert the new product into the product collection.
// This is executed when the user submits the new product.
module.exports.insert = function(product) {
  var id = products.length + 1;
  product.id = id;
  products[id - 1] = product;
  return id;
}