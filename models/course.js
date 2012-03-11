/**
 * Course
 * ~~~~~~~
 * MongoDB Entity
 * 
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var CourseSchema = new Schema({
    courseID: {type: String, unique: true}, // mdw
    owner: String,
    authorID: String, // for oauth etc.
    lecturesURLPreffix: String,
    url: String,
    longName: String, // Full name
    isActive: Boolean // if it should be visible
});

mongoose.model('Course', CourseSchema);  

