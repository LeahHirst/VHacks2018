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
	deadline: {
		type: Date,
		required: true
	},
	location: {
		latitude: {
			type: Number,
			required: true
		},
		longitude: {
			type: Number,
			required: true
		}
	},
	numberRequired: {
		type: Number,
		required: true
	},
	contactInfo: {
		type: String,
		required: true
	},
	payment: {
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
	author: [{type: Schema.ObjectId, ref: "User"}],
	claimedBy: [{type: Schema.ObjectId, ref: "User"}]
});
