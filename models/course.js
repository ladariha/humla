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
    courseID: String, // mdw
    owner: String,
    longName: String, // Full name
    isActive: Boolean // if it should be visible
});

mongoose.model('Course', CourseSchema);  

