/**
 * Comment
 * ~~~~~~~
 * MongoDB Entity
 * 
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

/*
 *
     How to control MongoDB from CLI: run "mongo" and insert:    
     use humla
     show collections
     db.comments.find()
     db.comments.remove();
     
 */

var CommentSchema = new Schema({
    commentID: ObjectId,
    courseID: String,
    lectureID: String,
    slideID: String,        
    title: String,
    body: String,
    state: {
        type:String, 
        'enum': ["draft","published","private"]
    }, //, default: "draft"}
    author: {
        username: String,
        email: {
            type: String, 
            validate: /^.*$/
        }
    },    
    date  :  {
        type: Date
    }
    
});

mongoose.model('Comment', CommentSchema);  



/*
var SlideSchema = new Schema({
    title: String,    
    date: Date,
    comments: [CommentSchema]
});
mongoose.model("Slide", SlideSchema);
 */  
    

