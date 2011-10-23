/**
 * Like
 * ~~~~~~~
 * MongoDB Entity
 * 
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var LikeSchema = new Schema({
    likeID: ObjectId,
    courseID: String,
    lectureID: String,
    slideID: String,        
    
    likes: [String],   //like usernames
    dislikes: [String],
    
    likesCount: Number,
    dislikesCount: Number
    
});

mongoose.model('Like', LikeSchema);  

