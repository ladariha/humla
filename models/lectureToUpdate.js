/**
 * LectureToUpdate
 * ~~~~~~~
 * MongoDB Entity
 * This schema is supposed to represent updated lecture which index and faceted items need to be
 * updated.
 * 
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var LectureToUpdate = new Schema({
    courseID: {type: String}, // mdw
    lectureID: {type: String} // lecture1
});

mongoose.model('LectureToUpdate', LectureToUpdate);  

