const mongoose = require('mongoose');

module.exports = {
	User: mongoose.model('User', require('./User.js')),
	Job: mongoose.model('Job', require('./Job.js')),
};
