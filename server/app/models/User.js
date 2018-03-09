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
	balance: {
		type: Number,
		default: 0.0,
		required: false
	},
  phoneNumber: {
    type: String,
    required: true
  }
});
