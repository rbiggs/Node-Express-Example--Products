
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , fs = require('fs')
  , Mongoose = require('mongoose').Mongoose
  , crypto = require('crypto');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'robot cowboy' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.dynamicHelpers({
  message: function(req){
    var err = req.session.error
      , msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    if (err) return err;
    if (msg) return msg;
  }
});

//Generate a salt for the user to prevent rainbow table attacks.

var users = {
  rbiggs: {
    name: 'rbiggs'
    , salt: 'randomly-generated-salt'
    , pass: hash('dingo', 'randomly-generated-salt')
  }
};
// Used to generate a hash of the plain-text password + salt

function hash(msg, key) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

// Authenticate using our plain-object database of doom!

function authenticate(name, pass, fn) {
  var user = users[name];
  // Query the db for the given username.
  if (!user) return fn(new Error('cannot find user'));
  /* 
     Apply the same algorithm to the POSTed password, applying
     the hash against the pass / salt, if there is a match we
     found the user. 
  */
  if (user.pass == hash(pass, user.salt)) return fn(null, user);
  // Otherwise password is invalid
  fn(new Error('invalid password'));
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

function accessLogger(req, res, next) {
  console.log('/restricted accessed by %s', req.session.user.name);
  next();
}

app.get('/', function(req, res){
  res.render('index');
});

app.get('/login', function(req, res) {
  if (req.session.user) {
    req.session.success = 'Authenticated as ' + req.session.user.name
    res.redirect('/products');
  } else {
    res.render('login');
  }
});

app.post('/login', function(req, res){
  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation 
      req.session.regenerate(function(){
        /*
          Store the user's primary key 
          in the session store to be retrieved,
          or in this case the entire user object,
        */
        req.session.user = user;
        res.redirect('back');
      });
    } else {
      req.session.error = 'Authentication failed. Please check your username and password.';
      res.redirect('back');
    }
  });
});

app.get('/logout', function(req, res){
  // Destroy the user's session to log them out.
  // Will be re-created next request.
  req.session.destroy(function(){
    res.redirect('/');
  });
});

// Routes

var products = require('./products');
var photos = require('./photos');

function getAllProducts(req, res) {  
  res.render('products/index', {locals: {
      products: products.all
  }});
}
app.get('/products', function(req, res) {
  getAllProducts(req, res);
});

// For new products, restrict access to logged in user.

app.get('/products/new', restrict, function(req, res) {
  var product = req.body && req.body.product || products.new();
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

app.post('/products', function(req, res) {
    var id = products.insert(req.body.product);
    res.redirect('/products/' + id);
});

app.get('/products/:id', function(req, res) {
    var product = products.find(req.params.id);
    if (product) {
      res.render('products/show', {
        locals: {product: product}
      });
    } else {
      getAllProducts(req, res);
    }
});

// For editing a product, restrict access to logged in user.

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

app.put('/products/:id', function(req, res){
    var id = req.params.id;
    products.set(id, req.body.product);
    res.redirect('/products/' + id);
});

/* Photos */

app.get('/photos', function(req, res) {
  photos.list(function(err, photo_list) {
    res.render('photos/index', {locals: {
      photos: photo_list
    }})
  });
});

// For new photos, restrict access to logged in user.

app.get('/photos/new', restrict, function(req, res) {
  res.render('photos/new');
});

app.post('/photos', function(req, res) {
	console.log(req.files.photo);
	var newFile =__dirname+'/public/uploads/photos/'+ req.files.photo.name;
  	fs.rename(req.files.photo.path , newFile, function (data,error) {
		console.log(data); 
		if(error) {
			throw error;
		}
	});
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

app.listen(3333);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
