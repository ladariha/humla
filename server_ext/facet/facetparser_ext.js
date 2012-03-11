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
var typePrefix =require("./facetengine_ext.js").prefix;
var TYPE_PARSERS_DIRECTORY = (path.join(path.dirname(__filename), './types')).toString();
var EXTRA_PARSERS_DIRECTORY = (path.join(path.dirname(__filename), './parsers')).toString();
// load extra parsers
var types = new Array();

fs.readdir( TYPE_PARSERS_DIRECTORY, function( err, files ) { // require() all js files in humla extensions directory
    files.forEach(function(file) {
        if(endsWith(file, "js")){
            var req = require( TYPE_PARSERS_DIRECTORY+'/'+file );
            types.push(req);
        }
    });
});



var extraParsers = new Array();

fs.readdir(EXTRA_PARSERS_DIRECTORY, function( err, files ) { // require() all js files in humla extensions directory
    files.forEach(function(file) {
        if(endsWith(file, "js")){
            var req = require( EXTRA_PARSERS_DIRECTORY+'/'+file );
            extraParsers.push(req);
        }
    });
});

/**
 * Editor emitter emits event removeID when some ID is removed from DB. Then all facet records related to this
 * ID should be removed from DB as well
 */
editor_ext.emitter.on("removedID",function(id){
    try{
        FacetRecord.find({
            slideid: id
        }, function(err,crs){  
            if(err){
                throw err;
            }else{
                for(var i=0;i<crs.length;i++){
                    crs[i].remove(function (err){
                        if(err)
                            throw "Facet Event on removedID: Problem with removing id "+id+": "+err+err.message;
                    });
                }
            }
        });
    }catch(error){
        console.error(error);
    }
});

/**
 * Parses presentation given by course ID and lecture ID and searches for microdata for faceted purposes
 * @param courseID course ID
 * @param lectureID lecture ID
 */
function parsePresentation(courseID, lectureID){
    //var parser = new FacetParser(extraParsers, types);
    run(courseID, lectureID, true);
}

exports.parsePresentation= parsePresentation;



function processData(_mapping, course, lecture, data){
    var mapping = {};
    for(var k=0;k<_mapping.length;k++){
        mapping[_mapping[k].slideid] = _mapping[k]._id;
    }
 
    for(var i=0;i<types.length;i++){
        try{
            types[i].parse(mapping, course, lecture, data);    
        }catch(e){
            console.error("Failed type parser: "+types[i].type);
            console.error(e);
        }
    }
    for(var j=0;j<extraParsers.length;j++){
        try{
            extraParsers[j].parse(mapping, course, lecture, data);    
        }catch(e){
            console.error("Failed extra parser:"+extraParsers[j].name+" > " + e);         
        }
    }    
};
    
exports.processData = processData;
    
/**
 * Checks if given lecture already contains attributes data-slideid. If yes processes with parsing. If not calls method in editor_ext which adds 
 * the attributes and store their values to DB. After that the editor_ext method calls back parsePresentation() method causing the process is restarted
 * and run again but now checkID will not call editor_ext but continue with parsing
 * @param course course ID
 * @param lecture lecture ID
 * @param data microdata from microdataparser_ext
 *@param checkID boolean if check ID is neccessary
 */
function checkIDs(course, lecture, data,checkID){
    if(data.items.length >= 0){
        var fileOK = true;
        // need to add ids to slides and call parsePresentation again
        if(checkID){
            for(var i = 0;i<data.items.length;i++){
                if(data.items[i].slideid.length <1){
                    fileOK = false;
                    editor_ext._addIDsToSlidesAndWriteToFileForFacets(course, undefined, lecture, exports.run, undefined);
                    i = data.items.length+1;
                }
            }
        }

        if(fileOK){
            var prefix =new RegExp("^"+course+"_"+lecture+"_");
            Slideid.find({
                slideid: prefix
            }, function(err,crs){   
                if(!err) {
                    processData(crs, course, lecture, data);
                }else{
                    console.error("Facetparser checkIDs error: "+err.toString());
                }
            });          
        }
    }
};
    
/**
 * Parses presentation given by course ID and lecture ID and searches for microdata for faceted purposes
 * @param courseID course ID
 * @param lectureID lecture ID
 * @param checkID if check id procedure is necessary
 */
function run(courseID, lectureID, checkID){
    try{
        fs.readFile(SLIDES_DIRECTORY+ '/'+courseID+'/'+lectureID+".html", function (err, data) {
            if (err){
                console.error("Facetparser run error: "+err.toString());
            }else{
                try{
                    microdata_ext.itemsFaceted(data.toString(),undefined ,function(err, data){
                        if(!err)
                            checkIDs(courseID, lectureID, data,checkID);
                        else
                            console.error("Facetparser run error: "+err.toString());
                    }, undefined);
                }catch(errs){
                    console.error("Facetparser run error: "+errs.toString());
                }
            }
        }); 
    }catch(error){
        console.error("Facetparser run error: "+error.toString());
    }
};

exports.run  =run;

function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}