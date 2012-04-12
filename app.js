/*  Module dependencies  */
var express = require('express');

/*  Server setup  */
// Create an instance of the server:
var app = express.createServer();
// Import configuration settings and initialize server:
require('./controllers/configuration').setup(app);

/*  Handle routes:  */
// Handle access to the main page
require('./controllers/index')(app);

// Import routes for login/logout:
require('./controllers/login')(app);

// Import routes for products:
require('./controllers/products')(app);

// Import routes for images:
require('./controllers/images')(app);

/* Route Error Handling  */
// If the route provided was not trapped by the previous handlers,
// render it as a 404 error page.
app.use(function(req, res, next) {
  // respond with html page
  res.render('404');
  return;
});

// Tell the server what port to listen to.
app.listen(4444);
console.log('Express server listening on port %d in %s mode', app.address().port, app.settings.env);