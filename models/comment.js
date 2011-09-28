/**
 * Comment
 * ~~~~
 * MongoDB Entity
 * 
 */

var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var comments = new Schema({
	commentID: ObjectId,
	title: '',
	body: '',
	state: Number
});

exports.comments = comments;
