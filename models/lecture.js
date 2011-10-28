/**
 * Lecture
 * ~~~~~~~
 * MongoDB Entity
 * 
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var LectureSchema = new Schema({
    lectureID: String,
    courseID: String,
    url: String,
    author: String,
    title: String,
    isActive: Boolean,
    lastModified  :  {
        type: Date
    }
});

mongoose.model('Lecture', LectureSchema);  

