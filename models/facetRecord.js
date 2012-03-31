/**
 * FacetRecord
 * ~~~~~~~
 * MongoDB Entity
 * This schema is supposed to represent general record for facet browsing. Property "type" represents 
 * type of record (keyword, language, codesnippet_language...), value is the value of this type ("REST", "en",  "java").
 * In order to keep records simple and easy to be searched this schema is key-value based and it is general for all records.
 * So if you want to save information that slide A and slide B are type of "image" the type property would be "slide_type" so it is 
 * possible do differ this from type of e.g. algorithm which has also property type (in this situation algorithm_type would be
 * used).
 * 
 * The property slideids is internall representation of slideid
 * 
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var FacetRecord = new Schema({
    type: {type: String}, 
    value: {type: String}, 
    slideid: {type:String}
});

FacetRecord.index({ type: 1, value: -1 });
mongoose.model('FacetRecord', FacetRecord);  

