// Import cryptography for user authentication:
var crypto = require('crypto');

// Used to generate a hash of the plain-text password + salt.
function hash(msg, key) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

var users = {
  'joe': {
    'name': 'joe',
    'salt': 'randomly-generated-salt',
    'pass': hash('bozo', 'randomly-generated-salt')
  },
  'robert': {
    'name': 'robert',
    'salt': 'randomly-generated-salt',
    'pass': hash('dingo', 'randomly-generated-salt')
  }
};
//Generate salt for the user to prevent rainbow table attacks.
//var authorized = require('users_model');

// Authenticate using our plain object.
// For a real app you'd use some kind of data persistance (database).
exports.authenticate = function(name, pass, fn) {
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
exports.restrict = function(req, res, next) {
  // If the user is logged in, continue:
  if (req.session.user) {
    next();
  // Else redirect the user to login and inform them with a message:
  } else {
    req.session.error = 'Access denied! Please login.';
    res.redirect('/login');
  }
}
