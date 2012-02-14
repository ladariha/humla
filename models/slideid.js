/**
 * Slideid
 * ~~~~~~~
 * MongoDB Entity
 * 
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var SlideidSchema = new Schema({
    _id: ObjectId,
    slideid: String
});

mongoose.model('Slideid', SlideidSchema);  

