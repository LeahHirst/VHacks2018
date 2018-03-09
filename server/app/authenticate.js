module.exports = (db) => {
	return (email, password, done) => {
		db.model.User.findOne({ email: email }, (err, user) => {
			if (err) return done(err);
			if (!user) return done(null, false, { message: 'Incorrect username.' });
			require('./password.js').verifyHash(password, user.password, (err, res) => {
				if (err) return done(err);
				if (!res) return done(null, false, { message: 'Incorrect password.' });
				return done(null, user);
			});
		});
	};
};
