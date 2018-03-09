const express  = require('express');
const app      = express();
const mongoose = require('mongoose');
const passport = require('passport');
const session  = require('express-session');
const flash    = require('connect-flash');

const LocalStrategy = require('passport-local').Strategy;
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');

// Register db
var db = require('./app/database.js')(mongoose);

passport.serializeUser(function(user, done) {

	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	db.model.User.findOne({ _id: id }, (err, user) => {
		if (err) return done(err);
		if (!user) return done(null, false, 'User not found.');
		return done(null, user);
	});
});

// Setup view engine
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	secret: 'hackvat',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new LocalStrategy({
  usernameField: "email",
	passwordField: "password"
}, require('./app/authenticate.js')(db)));

// Static directory
app.use(express.static('public'));

// Register routes
require('./app/routes.js')(app, passport, db);

// Set app to listen
app.listen(3000, () => { console.log('Listening on 3000'); });
