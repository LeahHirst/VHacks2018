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
	image: {
		type: String,
		required: false
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
	created: {
		type: Date,
		default: Date.now,
		required: true
	},
	author: [{
	    type: Schema.ObjectId,
      ref: "User",
      required: true
	}],
  claimedBy: [{
    type: Schema.ObjectId,
    ref: "User",
    required: false
	}]
});
