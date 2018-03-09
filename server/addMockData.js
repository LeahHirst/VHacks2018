// Adds mock data to the database

var mongoose = require('mongoose');
var db = require('./app/database.js')(mongoose);

var password = require('./app/password.js');

// Remove prior ================================================================
if (process.argv[2] == "--drop" || process.argv[2] == "-d") {
	db.model.User.remove({}, () => {});
	db.model.Job.remove({}, () => {});
}

password.generateHash('password', (err, hash) => {
  var u1 = new db.model.User({
    password: hash,
    email: 'test@test.com',
    name: 'John Doe',
    phoneNumber: '0914921402890',
    type: 'Requester'
  });
  u1.save();
});
