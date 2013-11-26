
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , validator = require('express-validator');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(validator([]));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  // add session support!
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'sauce' }));
  
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

function restrict(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/');
  }
}

// GET
app.get('/', routes.index);
app.get('/register', routes.register);
app.get('/login', routes.login);
app.get('/dashboard', restrict, routes.dashboard);
app.get('/logout', routes.logout);

app.get('/validate/username', routes.validate.username);
app.get('/validate/email', routes.validate.email);

// POST
app.post('/register', routes.registerUser);
app.post('/login', routes.loginUser);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
