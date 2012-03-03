/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var typePrefix =require("../facetengine_ext.js").prefix;

var GITHUB_TYPE = "Slideindex_Github";
var GBOOK_TYPE = "Slideindex_Gbook";
var GDRAWING_TYPE = "Slideindex_Gdrawing";

exports.parse= function(mapping, course, lecture, data){
  
    require('../../slideindex/slideindex_ext.js').index(course, lecture, "jsobject", undefined, host, function(err, index){
        if(err)
            console.log("Error getting index");
        else
            processData(mapping, course, lecture, data, index);
    });
};



function processData(mapping, course ,lecture, data, index){
    // gbooks
    
    // boolean github
    if(typeof index.github!="undefined")
        processGithub(index.github, course, lecture, mapping);
// boolean gdrawing
}



function processGithub(items, course, lecture, mapping){
    var existingValues = {};
    
//    for(var i=0; i < items.length;i++){
//        existingValues[items[i].slideid] = mapping[items[i].slideid];
//    }
    var prefix =new RegExp("^"+typePrefix+GITHUB_TYPE); // get all records for type /Slide at once
    for(var i=0; i < items.length;i++){
        FacetRecord.find({
            type: prefix,
            slideid: mapping[items[i].slideid] //_id
        }, function(err,crs){  // investigate all existing records
            if(err){
                throw err;
            }else{
                if(crs.length>0){
                    
                }
            }
        });
    
    }
    
}