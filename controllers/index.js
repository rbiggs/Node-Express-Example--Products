// Load main page:
module.exports = function(app){
  app.get('/', function(req, res){
    // If the user is logged in, pass that info to the page.
    // Use that to show a 'logout' link, otherwise
    // it will show a login link. All of this gets handled
    // by the view (index.jade).
    var user = req.session.user || '';
    res.render('index', {locals: {
      user: user
  }});
  });
}