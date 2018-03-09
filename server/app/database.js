module.exports = (mongoose) => {
	// Establish db connection
	mongoose.connect('mongodb://127.0.0.1:27017/vhacks');

	// Handle errors
	mongoose.connection.on('error',
		console.error.bind(console, 'DB connection error: '));

	// Terminate the process on process end
	process.on('SIGINT', function() {
		mongoose.connection.close(function () {
			console.log('DB connection closed.');
			process.exit(0);
		});
	});

	// Register schemas
	var models = require('./models/models.js');

	// Return connection and models
	return {
		connection: mongoose.connection,
		model: models
	};
};
