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
var typePrefix = "";
itemParsers[typePrefix+'Slide'] = parseSlideType;

editor_ext.emitter.on("removedID",function(id){
    FacetRecord.find({
        slideid: id
    }, function(err,crs){  
        if(err){
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
});


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
                if(typeof itemParsers[data.items[j].type[i]]=="function")
                    itemParsers[data.items[j].type[i]](mapping, data.items[j], course ,lecture, res, callback);        
            }
        }
    }
    returnData(res, callback, data);
}


function parseSlideType(mapping, item, course, lecture, res, callback){
    // values searched: type, keywords, importance
    var _id = findId(item.slideid, mapping);               
    var done = 0; // +1 for type;+2 for importance; 
    var keywordRecords = [];
    var typeTest =  ( typeof item.properties.type != "undefined" && item.properties.type.length > 0 &&  item.properties.type[0].length >0);
    var impTest =  ( typeof item.properties.importance != "undefined" && item.properties.importance.length > 0 &&  item.properties.importance[0].length >0) 
    
    if(typeof _id!="undefined"){
        var prefix =new RegExp("^"+typePrefix+"Slide_"); // get all records for type /Slide at once
        FacetRecord.find({
            type: prefix,
            slideid: _id
        }, function(err,crs){  // investigate all existing records
            if(err){
                throw err;
            }else{
                if(crs.length >0){
                    
                    for(var i=0;i<crs.length;i++){
                        switch(crs[i].type){ 
                            case typePrefix+"Slide_Type":
                                done+=1;
                                crs[i].value = typeTest ? item.properties.type[0] : "";
                                break;
                            case typePrefix+"Slide_Importance":
                                done+=2;
                                crs[i].value = impTest? item.properties.importance[0] : "";
                                break;
                            case typePrefix+"Slide_Keyword":
                                keywordRecords[crs[i].value+''] = crs[i];
                                break;
                            default:
                                break;
                        }
                        if(crs[i].value.length>0){ // if there is a value, save it
                            crs[i].save(function (err){
                                if(err)
                                    throw "Problem saving FacetRecord "+_id+": "+err;
                            });
                        }else{ // otherwise no reason to keep empty record
                            crs[i].remove(function (err){
                                if(err)
                                    throw "Problem removing FacetRecord "+_id+": "+err;
                            });
                        } 
                    }
                }
                // insert new records that aren't  in db yet
                switch(done){
                    case 0: // importance & type
                        if(impTest){
                            var a  = new FacetRecord();
                            a.type =typePrefix+"Slide_Importance";
                            a.value = item.properties.importance[0] ;
                            a.slideid = _id;
                            a.save(function (err){
                                if(err)
                                    throw "Problem saving FacetRecord "+_id+": "+err;
                            });   
                        }
                        
                        if(typeTest){
                            var a  = new FacetRecord();
                            a.type =typePrefix+"Slide_Type";
                            a.value = item.properties.type[0] ;
                            a.slideid = _id;
                            a.save(function (err){
                                if(err)
                                    throw "Problem saving FacetRecord "+_id+": "+err;
                            });   
                        }
                        
                        break;
                    case 1:
                        //  importance
                        if(impTest){
                            var a  = new FacetRecord();
                            a.type =typePrefix+"Slide_Importance";
                            a.value = item.properties.importance[0] ;
                            a.slideid = _id;
                            a.save(function (err){
                                if(err)
                                    throw "Problem saving FacetRecord "+_id+": "+err;
                            });   
                        }
                        break;
                    case 2:
                        // type 
                        if(typeTest){
                            var a  = new FacetRecord();
                            a.type =typePrefix+"Slide_Type";
                            a.value = item.properties.type[0] ;
                            a.slideid = _id;
                            a.save(function (err){
                                if(err)
                                    throw "Problem saving FacetRecord "+_id+": "+err;
                            });   
                        }
                        break;
                    default:
                        break;
                }
                
                var keywordsLength = 0;
                for(var u in keywordRecords){ // because keywordRecords is associative array => length is not working
                    keywordsLength++;
                }
                // now keywords
                var keyTest = (typeof item.properties.keyword!="undefined" && item.properties.keyword.length>0);
                if(keyTest && keywordsLength>0){
                    // match items (insert new and remove unused and preserve existing)
                    for(var j=0; j< item.properties.keyword.length;j++){
                        if(typeof keywordRecords[item.properties.keyword[j]]=="undefined" && item.properties.keyword[j].length>0){ // keyword  is not in db
                            var a = new FacetRecord();
                            a.type =typePrefix+"Slide_Keyword";
                            a.value = item.properties.keyword[j] ;
                            a.slideid = _id;
                            a.save(function (err){
                                if(err)
                                    throw "Problem saving FacetRecord "+_id+": "+err;
                            });
                        }else{ // if the keyword is in db, let it be there
                            delete keywordRecords[item.properties.keyword[j]]; // so the values left in keywordRecords are meant to be deleted
                        }
                    }
                    
                    for(var k in keywordRecords){
                        if(typeof keywordRecords[k]!="undefined"){
                            keywordRecords[k].remove(function (err){
                                if(err)
                                    throw "Problem removing FacetRecord "+_id+": "+err;
                            });
                        }
                    } 
                }else if(keyTest && keywordsLength<1){
                    // only insert new
                    for(var j=0; j< item.properties.keyword.length;j++){
                        if( item.properties.keyword[j].length>0){
                            var a = new FacetRecord();
                            a.type =typePrefix+"Slide_Keyword";
                            a.value = item.properties.keyword[j] ;
                            a.slideid = _id;
                            a.save(function (err){
                                if(err)
                                    throw "Problem saving FacetRecord "+_id+": "+err;
                            });
                        }
                    
                    }
                }else if(!keyTest && keywordsLength>0){
                    // delete unused
                    for(var key in keywordRecords){
                        if(typeof keywordRecords[key]!="undefined"){
                            keywordRecords[key].remove(function (err){
                                if(err)
                                    throw "Problem removing FacetRecord "+_id+": "+err;
                            });
                        }
                    }
                }
            }
        });
    }
}

function findId(slideid, mapping){
    for(var i=0;i<mapping.length;i++){
        if(mapping[i].slideid === slideid)
            return mapping[i]._id;
    }
    return undefined;
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
