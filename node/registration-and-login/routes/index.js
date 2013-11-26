var Everlive = require('everlive-sdk');
var config = require("./config");

var flash = {};

var el = new Everlive(config.key);

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.redirect('login');
};

/*
 * GET login page.
 */

exports.login = function(req, res) {
  res.render('login');
};

/*
 * GET register page.
 */

exports.register = function(req, res) {
  res.render('register');
};

exports.dashboard = function(req, res) {
  res.render('dashboard', { user: req.session.user });
};

/* 
 * GET logout
 */

exports.logout = function(req, res) {

  // clear the session object
  req.session.destroy();

  // log the user out via everlive, but don't wait for it
  el.Users.logout();

  res.redirect('login');
};

/*
 * POST register user.
 */

exports.registerUser = function(req, res) {
  
  // validate the input
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('display', 'DisplayName is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email does not appear to be valid').isEmail();

  // check the validation object for errors
  var errors = req.validationErrors();

  if (errors) {
    
    flash = { type: 'alert-danger', messages: errors };
    res.redirect('register');
  
  } else {
    
    // pull the form variables off the request body
    var username = req.body.username;
    var password = req.body.password;
    var additional = {
      Email: req.body.email,
      DisplayName: req.body.display
    };

    // register the user with everlive
    el.Users.register(username, password, additional).then(function() {
      
      // success
      
      flash.type = 'alert-success';
      flash.messages = [{ msg: 'Please check your email to verify your registration. Then you will be ready to log in!' }];

      res.render('login', { flash: flash });

    }, function(error){
      
      // failure
      
      flash.type = 'alert-danger';
      flash.messages = [{ msg: error.message }];

      res.render('register', { flash: flash });
    
    });
  }
};

/*
 * POST login user.
 */

exports.loginUser = function(req, res) {
  
  // pull the form variables off the request body
  var username = req.body.username;
  var password = req.body.password;

  // register the user with everlive
  el.Users.login(username, password).then(function() {
    
    // success

    el.Users.currentUser().then(function(data) {

      // success

      // only log this user in if they have verified their account
      if (data.result.IsVerified) {
      
        req.session.authenticated = true;
        req.session.user = data.result;

        res.redirect('dashboard');
      
      } else {

        flash.type = 'alert-info';
        flash.messages = [{ msg: 'You have registered, but have not yet verified your account.  Please check your email for registration confirmation and click on the provided link to verify your account.' }];

        res.render('login', { flash: flash });

      }

    }, function(error) {

      // failure

      flash.type = 'alert-danger';
      flash.message = error.message;

      res.render('login', { flash: flash });

    });

  }, function(error){

    // failure

    flash.type = 'alert-danger';
    flash.messages = [{ msg: error.message }];
    
    res.render('login', { flash: flash });

  });
};

var users = function(filter, res) {

  el.Users.get(filter).then(function(data) {

    // success
    console.log(data.count);
    res.json(data.count === 0);

  }, function(error) {

    // failure

    res.send(false);

  });

};

exports.validate = {

  username: function(req, res) {

    var value = req.param('value');

    var filter = {
      'Username': value
    };

    users(filter, res);

  },

  email: function(req, res) {

    var value = req.param('value');

    var filter = {
      'Email': value
    };

    users(filter, res);
  }

};
