var defaults = require('../../handlers/defaults');
var mongoose = require("mongoose"); 
var FacetRecord = mongoose.model("FacetRecord");
var Slideid = mongoose.model("Slideid");
var typePrefix = "";

exports.simpleQuery = function(schema, key, value, res, callback){
    if(value.length ===0){
        FacetRecord.find({
            type: typePrefix+schema+"_"+key
        }, function(err,crs){  
            if(err){
                returnThrowError(500, err, res, callback);
                throw err;
            }else{
                for(var i=0;i<crs.length;i++){
                    crs[i].remove(function (err){
                        if(err)
                            throw "Event on removedID: Problem with removing id "+id+": "+err;
                    });
                }
            }
        });
    }else{
        FacetRecord.find({
            value: value,
            type: typePrefix+schema+"_"+key
        }, function(err,crs){  
            if(err){
                returnThrowError(500, err, res, callback);
                throw err;
            }else{
                for(var i=0;i<crs.length;i++){
                    crs[i].remove(function (err){
                        if(err)
                            throw "Event on removedID: Problem with removing id "+id+": "+err;
                    });
                }
            }
        });
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
