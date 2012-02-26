var defaults = require('../../handlers/defaults');
var mongoose = require("mongoose"); 
var FacetRecord = mongoose.model("FacetRecord");
var Slideid = mongoose.model("Slideid");
var typePrefix = "http://humla.org/microdata/"; // TODO fix sample URL
exports.prefix = typePrefix;

// List of all types. Instead of selecting distinct values from DB it's less expensive to use array'
var allTypes = [
"Slide",
"CodeSnippet",
"Algorithm"
];

var BASE_FACET_URL = "/api/facets/"; // TODO ADD REAL HOSTNAME

/**
 * Returns list of all types that are being tracked
 * @param res HTTP response (if called via REST otherwise undefined)
 * @param callback callback function (if called internally otherwise undefined)
 */
exports.types = function(res, callback){
    try{
        var structuredInfo = [];
        for(var i =0;i<allTypes.length;i++){
            var a = {};
            a.type = typePrefix+allTypes[i];
            a.url = BASE_FACET_URL+allTypes[i];
            structuredInfo.push(a);
        }
        returnData(res, callback, structuredInfo);
    }catch(error){
        returnThrowError(500, error, res, callback);
    }
}
/*
 *Perform simple query (=one key and one value). If value is empty string it returns records that have any value of specified schema and property
*@param schema searched Schema
*@param property searched property
*@param value searched value
* @param res HTTP response (if called via REST otherwise undefined)
* @param callback callback function (if called internally otherwise undefined)
 */
exports.simpleQuery = function(schema, property, value, res, callback){
    try{
        if(value.length ===0){
            FacetRecord.find({
                type: typePrefix+schema+"_"+property
            }, function(err,crs){  
                if(err){
                    returnThrowError(500, err, res, callback);
                }else{
                    returnData(res, callback, crs);
                }
            });
        }else{
            FacetRecord.find({
                value: value,
                type: typePrefix+schema+"_"+property
            }, function(err,crs){  
                if(err){
                    returnThrowError(500, err, res, callback);;
                }else{
                    returnData(res, callback, crs);
                }
            });
        }
    }catch(error){
        returnThrowError(500, error, res, callback);
    }
}

function addMapping(data, res, callback){
    
    var tmp = [];
    for(var j=0;j<data.length;j++){
        tmp[j]={
            slideid: tmp[j].slideid
        }
    }
    
    var query = Slideid.find({});
    query.$or(tmp);
    query.exec(function (err, docs) {
       
        });
}


function returnThrowError(code, msg, res, callback){
    if(typeof res!="undefined")
        defaults.returnError(code, msg, res);
    else{
        if(typeof callback!="undefined"){
            callback(msg, null);
        }else{
            throw msg;
        }
    }       
}

/**
 * Returns data in json format (if it's called via REST) or  calls  callback with javascript object as parameter
 * @param res HTTP response (if called via REST)
 * @param callback callback function (if called via internal API)
 * @param data data to be retuned
 */
function returnData(res, callback, data){
    if(typeof res!="undefined"){
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(JSON.stringify(data, null ,4));
        res.end();
    }else{
        if(typeof callback!="undefined")
            callback(null, data);
        else
            throw "Nor HTTP Response or callback function defined!";
    }
}
