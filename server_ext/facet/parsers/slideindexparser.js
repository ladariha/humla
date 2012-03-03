/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var typePrefix =require("../facetengine_ext.js").prefix;
var mongoose = require("mongoose"); 
var FacetRecord = mongoose.model("FacetRecord");
var Slideid = mongoose.model("Slideid");
var GITHUB_TYPE = "Slideindex_Github";
var GBOOK_TYPE = "Slideindex_Gbook";
var GDRAWING_TYPE = "Slideindex_Gdrawing";
exports.name = "Slideindex parser";
exports.parse= function(mapping, course, lecture, data){
    require('../../slideindex/slideindex_ext.js').index(course, lecture, "jsobject", undefined, "", function(err, index){
        if(err)
            console.error("Error getting index");
        else
            processData(mapping, course, lecture, data, index);
    }, true);
};



function processData(mapping, course ,lecture, data, index){
    // gbooks
    // boolean github
    if(typeof index.github!="undefined")
        processGithubOrDrawing(index.github, course, lecture, mapping, GITHUB_TYPE);
    // boolean gdrawing
    if(typeof index.drawings!="undefined")
        processGithubOrDrawing(index.drawings, course, lecture, mapping, GDRAWING_TYPE);
}



function processGithubOrDrawing(items, course, lecture, mapping, type){
    try{
        var defaultTitle = course.toUpperCase()+": "+lecture;
        var prefix =new RegExp("^"+typePrefix+type); // get all records for type /Slide at once
        var query = FacetRecord.find({
            type: prefix
        });
        var arr = [];
    
        for(var a in mapping){
            arr.push(mapping[a]);
        }
        query.where('_id').in(arr);  
        query.exec(function(err, data){ // get all github data from db for given presentation (all slides)
            var toInsert = [];
            var data_assoc = {};
            for(var j=0;j<data.length;j++){
                data_assoc[data[j].slideid] = data[j];
            }
        
            var toDelete= {};
            for(var j=0;j<data.length;j++){
                toDelete[data[j].slideid] = data[j];
            }
        
            for(var j=0;j<items.length;j++){
                if(typeof data_assoc[items[j].slideid]!="undefined"){
                
                    if(data_assoc[items[j].slideid].title !== defaultTitle+  ": "+items[j].slide_title){
                        // update title
                        data_assoc[items[j].slideid].title = defaultTitle+  ": "+items[j].slide_title;
                        data_assoc[items[j].slideid].save(function(err){
                            console.error("Problem saving slideindex item "+err.toString());
                        });
                    }

                    delete toDelete[items[j].slideid];
                }else{
                    toInsert.push(items[j]);
                }
            }
        
            for(var i =0;i<toInsert.length;i++){
                try{
                    var a  = new FacetRecord();
                    a.title = toInsert[i].slide_title;
                    a.type =typePrefix+type;
                    a.value = 1;
                    a.slideid = mapping[toInsert[i].slideid];
                    a.save(function (err){
                        if(err)
                            throw "Problem saving FacetRecord slideindex: "+err;
                    });   
                }catch(e){
                    console.error("Error while saving slideindex "+e.toString());
                }
            }
        });
    }catch(_err){
        console.error("processGithubOrDrawing: "+_err.toString());
    }
}