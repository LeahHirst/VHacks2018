const express  = require('express');
const app      = express();
const mongoose = require('mongoose');
const passport = require('passport');
const session  = require('express-session');
const mstore   = require('connect-mongodb-session')(session);

const LocalStrategy = require('passport-local').Strategy;
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');

// Store setup
var store = new mstore(
	{
	  uri: 'mongodb://localhost:27017/vhacks-session',
	  collection: 'mySessions'
	});

// Catch errors
store.on('error', function(error) {
	assert.ifError(error);
	assert.ok(false);
});

// Setup view engine
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	store: store,
	secret: 'hackvat',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: "email",
	passwordField: "password"
}, require('./app/authenticate.js')(db)));

// Register db
var db = require('./app/database.js')(mongoose);

// Static directory
app.use(express.static('public'));

// Register routes
require('./app/routes.js')(app, passport, db);

// Set app to listen
app.listen(3000, () => { console.log('Listening on 3000'); });
