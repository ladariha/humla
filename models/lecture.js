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
    url: String, // api
    presentationURL: String, // presentation itself
    author: String,
    authorID: String, // for oauth etc.
    authorEmail: String,
    authorTwitter: String,
    authorWeb: String,
    semester: String,
    organization: String,
    organizationFac: String,
    field: String,
    web: String,
    title: String,
    lectureAbstract: String,
    isActive: Boolean,
    created: {
        type: Date
    },
    lastModified  :  {
        type: Date
    },
    keywords: [String]
});

mongoose.model('Lecture', LectureSchema);  

