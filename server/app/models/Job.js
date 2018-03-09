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
	author: [{type: Schema.ObjectId, ref: "User"}]
});
