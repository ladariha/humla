var defaults = require('../../handlers/defaults');
var mongoose = require("mongoose"); 
var fs     = require('fs');
var FacetRecord = mongoose.model("FacetRecord");
var Slideid = mongoose.model("Slideid");
var typePrefix = "";//http://humla.org/microdata/"; // TODO fix sample URL
exports.prefix = typePrefix;
var PAGE_SIZE = 200;
// List of all types. Instead of selecting distinct values from DB it's less expensive to use array'
var path = require('path');


var BASE_FACET_URL = "/api/facets/"; // TODO ADD REAL HOSTNAME

/**
 * Returns list of all types that are being tracked
 * @param res HTTP response (if called via REST otherwise undefined)
 * @param callback callback function (if called internally otherwise undefined)
 */
exports.types = function(res, callback){
    try{
        fs.readFile( (path.join(path.dirname(__filename), './')).toString()+"types.json", function(err, data) {
            if(err){
                returnThrowError(500, err.toString(), res, callback);
            }else{
                if(typeof res!="undefined"){
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    res.write(data.toString(), null ,4);
                    res.end();
                }else{
                    if(typeof callback!="undefined")
                        callback(null, data);
                    else
                        throw "Nor HTTP Response or callback function defined!";
                }
            }
        });
    }catch(error){
        returnThrowError(500, error, res, callback);
    }
}
exports.total = function(schemaproperty, res, callback){
    var q = FacetRecord.distinct("slideid");
    q.where('type', typePrefix+schemaproperty);
    q.run(function(err,crs){  
        if(err){
            returnThrowError(500, err, res, callback);;
        }else{
            returnData(res, callback, crs.length)
        }
    });
}

exports.topValues = function(schemaproperty, res, callback){
    // FacetRecord.group({key: {value:true},cond: {type:"Slideindex_Gbook_Category"},reduce: function(obj,prev) {prev.csum += 1;},initial: {csum: 0}});
    var tagReduce = function(previous, current) { 
        var count = 0; 
        for (var index in current) { 
            count += current[index]; 
        } 
        return count; 
    }; 

    mongoose.connect('mongodb://localhost/humla'); 

    var command = { 
        mapreduce: "facetrecords",
        query:{
            'type':schemaproperty
        },
        map: "function(){emit(this.value,1);}", 
        reduce: tagReduce.toString(),
        sort: {
            value: -1
        }, 
        out: schemaproperty
    }; 

    mongoose.connection.db.executeDbCommand(command, function(err, dbres) 
    { 
        if (err !== null) { 
            returnThrowError(500, err.toString(), res, callback);
        }else { 
            mongoose.connection.db.collection(schemaproperty, function(err, collection) { //query the new map-reduced table
                if(!err){
                    collection.find({}).sort({
                        'value': -1
                    }).limit(20).toArray(function(err, pings) { //only pull in the top 10 results and sort descending by number of pings
                        if(err)
                            returnThrowError(500, err, res, callback);
                        else
                            returnData(res, callback, pings);
                    });
                }else{
                    returnThrowError(500, err, res, callback);
                }
            });
        } 
    }); 
};
/*
*Perform simple query (=one key and one value). If value is empty string it returns records that have any value of specified schema and property
*@param schemaproperty searched Schema_Property
*@param value searched value
*@param page offset
* @param res HTTP response (if called via REST otherwise undefined)
* @param baseUrl base url for HATEOAS
* @param callback callback function (if called internally otherwise undefined)
*/
exports.simpleQuery = function(schemaproperty, value, page, baseUrl,res,  callback){
    try{
        if(value.length ===0){
            var q = FacetRecord.find({});
            q.where('type', typePrefix+schemaproperty);
            q.skip((parseInt(page)-1)*PAGE_SIZE);
            q.limit(page*PAGE_SIZE);
            q.run(function(err,crs){  
                if(err){
                    returnThrowError(500, err, res, callback);
                }else{
                    addMapping(crs, page, baseUrl, res, callback);
                }
            });
        }else{
            var q = FacetRecord.find({});
            q.where('type', typePrefix+schemaproperty);
            q.where('value', value);
            q.skip((parseInt(page)-1)*PAGE_SIZE);
            q.limit(PAGE_SIZE);
            q.run(function(err,crs){  
                if(err){
                    returnThrowError(500, err, res, callback);;
                }else{
                    addMapping(crs, page, baseUrl, res,  callback);
                }
            });
        }
    }catch(error){
        returnThrowError(500, error, res, callback);
    }
}

exports.complexQuery = recursiveQuery;

function recursiveQuery(depth, query, result, res, callback){
    if(result.length < 1 && depth !== 0 ){ // nothing found and algorithm have run atleast over one search parameter
        returnData(res, callback, []);
    }else{
        
        
        
    }
    
}

function addMapping(data, page, baseUrl,res, callback){
    var tmp = [];
    for(var j=0;j<data.length;j++){
        tmp[j]={
            _id: data[j].slideid
        }
    }
    
    var query = Slideid.find({});
    query.$or(tmp);
    query.exec(function (err, docs) {
        for(var i=0;i<data.length;i++){
            for(var j=0;j<docs.length;j++){
                if(docs[j]._id+"" === data[i].slideid){
                    data[i].slideid = docs[j].slideid;
                    j = docs.length+1;
                }
            }
        }
        var results = {};
        results.results = data;
        if(page>1)
            results.previous = baseUrl+"?page="+(page-1);
        results.next = baseUrl+"?page="+(page+1);
        returnData(res, callback, results);
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
