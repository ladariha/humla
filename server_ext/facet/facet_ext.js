/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var microdata_ext =  require('../microdata/microdataparser_ext.js');
var editor_ext =  require('../editor/editor_ext.js');
var path = require('path');
var fs     = require('fs');
var defaults = require('../../handlers/defaults');
var mongoose = require("mongoose"); 
var FacetRecord = mongoose.model("FacetRecord");
var Slideid = mongoose.model("Slideid");
var JSON_DIRECTORY = (path.join(path.dirname(__filename), '../../cache/index')).toString();
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../../public/data/slides')).toString();

var itemParsers = [];
var typePreffix = "";
itemParsers[typePreffix+'Slide'] = parseSlide;


    
    
function parsePresentation(res, courseID, lectureID, callback){
    
    fs.readFile(SLIDES_DIRECTORY+ '/'+courseID+'/'+lectureID+".html", function (err, data) {
        if (err){
            returnThrowError(404, "Not found"+err, res, callback);
        }else{
            try{
                microdata_ext.itemsFaceted(data.toString(),undefined ,function(err, data){
                    if(err)
                        callback(err, null);
                    else
                        checkIDs(courseID, lectureID, data, res, callback);
                }, undefined);
            }catch(errs){
                callback(errs, null);
            }
        }
    });
}

exports.parsePresentation= parsePresentation;



function checkIDs(course, lecture, data, res, callback){
    if(data.items.length > 0 && data.items[0].slideid.length <1){
        // need to add ids to slides and call parsePresentation again
        editor_ext._addIDsToSlidesAndWriteToFileForFacets(course, res, lecture, exports.parsePresentation, callback);
    }else{    
        var prefix =new RegExp("^"+course+"_"+lecture+"_");
        Slideid.find({
            slideid: prefix
        }, function(err,crs){   
            if(!err) {
                processData(crs, course, lecture, data, res, callback);
            }else{
                returnThrowError(500 ,"Cannot retrieve slide ids", res, callback);
            }
        });
    }
}

function processData(mapping, course, lecture, data, res, callback){
    for(var j=0;j<data.items.length;j++){
        if(typeof data.items[j].type!="undefined"){// should be always true since microdataparser returns only typed items
            for(var i=0; i< data.items[j].type.length;i++){
                console.log(data.items[j].type[i]);
                if(typeof itemParsers[data.items[j].type[i]]=="function")
                    itemParsers[data.items[j].type[i]](mapping, data.items[j], course ,lecture, res, callback);        
            }
        }
    }
    returnData(res, callback, data);
}


function parseSlide(mapping, item, course, lecture, res, callback){
// values searched: type, keywords, importance
    
}


function returnData(res,callback, data){
    if(typeof res!="undefined"){
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(JSON.stringify(data, undefined, 2));
        res.end();
    }else{
        if(typeof callback!="undefined")
            callback(null, data);
        else
            throw "Nor HTTP Response or callback function defined!";
    }
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