const bcrypt = require('bcrypt');

// Default options
const options = {
	saltRounds: 10
};

module.exports = {
	generateHash: (password, cb) => {
		bcrypt.hash(password, options.saltRounds, cb);
	},
	verifyHash: bcrypt.compare
};
