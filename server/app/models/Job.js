var mongoose = require("mongoose");

var Schema = mongoose.Schema;

module.exports = new Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	time: {
		type: Date,
		required: true
	},
	location: {
		type: String,
		required: true
	},
	number_required: {
		type: Number,
		required: true
	},
	contact_info: {
		type: String,
		required: true
	},
	skills_required: {
		type: String,
		required: false
	},
	payment_amount: {
		type: Number,
		required: false
	},
	confirmed: {
		type: Boolean,
		default: false,
		required: false
	},
	paid: {
		type: Boolean,
		default: false,
		required: false
	},
	author: [{type: Schema.ObjectId, ref: "User"}]
});
