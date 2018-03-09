module.exports = new require('mongoose').Schema({
	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	type: {
		type: String,
		enum: ['Requester', 'Seeker'],
		required: true
	},
	name: {
		type: String,
		required: true
	},
  phoneNumber: {
    type: String,
    required: true
  }
});
