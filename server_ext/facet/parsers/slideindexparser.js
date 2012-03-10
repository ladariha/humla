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
var GBOOK_CATEGORY = "Slideindex_Gbook_Category";
var GBOOK_AUTHOR = "Slideindex_Gbook_Author";
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
    if(typeof index.gbooks!="undefined")
        processGbooks(index.gbooks, course, lecture, mapping);
    // boolean github
    if(typeof index.github!="undefined")
        processGithubOrDrawing(index.github, course, lecture, mapping, GITHUB_TYPE);
    // boolean gdrawing
    if(typeof index.drawings!="undefined")
        processGithubOrDrawing(index.drawings, course, lecture, mapping, GDRAWING_TYPE);
}

function processGbooks(items, course, lecture, mapping){
    try{
        var prefix =new RegExp("^"+typePrefix+GBOOK_TYPE); 
        var arr = [];
        for(var a in mapping){
            arr.push(mapping[a]);
        }
        var query = FacetRecord.remove({  // remove all existing records for Gbooks for given presentation
            type: prefix
        });
        query.where('_id').in(arr);  
        query.exec(function(err,data){
            if(err){
                console.error(err);
            }else{ // if ok, insert all new items
                for(var i=0;i<items.length;i++){
                    // each author
                    try{
                        for(var j=0;j<items[i].author.length;j++){
                            if(items[i].author[j].length>0){
                                try{
                                    var a = new FacetRecord();
                                    a.type =typePrefix+GBOOK_AUTHOR;
                                    a.value = items[i].author[j];
                                    a.slideid = mapping[items[i].slideid];
                                    if(typeof mapping[items[i].slideid]!="undefined"){
                                        a.save(function (err){
                                            if(err)
                                                throw "Problem saving FacetRecord "+items[i].slideid+": "+err.toString();
                                        });   
                                    }
                                }catch(e){
                                    console.error(e);
                                }
                            }  
                        }
                
                        // each category
                        var cat_records = {};
                        for(var j=0;j<items[i].category.length;j++){
                            if(items[i].category[j].length>0){
                                var cats = items[i].category[j].split("/");
                                for(var b=0;b<cats.length;b++){
                                    var category = cats[b].replace(/^\s+|\s+$/g, '');
                                    //                                    category = category.toLowerCase();
                                    if(typeof cat_records[category]=="undefined"){ // insert only new value
                                        cat_records[category]=1; // mark inserted
                                        try{
                                            var a = new FacetRecord();
                                            a.type =typePrefix+GBOOK_CATEGORY;
                                            a.value = category;
                                            a.slideid = mapping[items[i].slideid];
                                            if(typeof mapping[items[i].slideid]!="undefined"){
                                                a.save(function (err){
                                                    if(err)
                                                        throw "Problem saving FacetRecord "+items[i].slideid+": "+err;
                                                });   
                                            }                              
                                        }catch(e){
                                            console.error(e.toString());
                                        }   
                                    }
                                }
                            }  
                        }
                    }catch(er){
                        console.error(er.toString());
                    }
                }
            }
        });
    }catch(ee){
        console.error(ee.toString());
    }
}


function processGithubOrDrawing(items, course, lecture, mapping, type){
    try{
        var prefix =new RegExp("^"+typePrefix+type); // get all records for type /GithubOrDrawing at once
        var query = FacetRecord.find({
            type: prefix
        });
        var arr = [];
    
        for(var a in mapping){
            arr.push(mapping[a]);
        }
        
        var handledSlides = {};
        
        query.where('_id').in(arr);  
        
        query.exec(function(err, data){ // get all github data from db for given presentation (all slides)
            var toInsert = [];
            var alreadyInToInsert = {};
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
                    delete toDelete[items[j].slideid];
                }else{
                    if(typeof alreadyInToInsert[items[j].slideid]=="undefined"){ // to avoid multiple records (2 gdrawings in one slide)
                        toInsert.push(items[j]);
                        alreadyInToInsert[items[j].slideid]=1
                    }
                }
            }
        
            for(var i =0;i<toInsert.length;i++){ // existing records to TRUE
                try{
                    var a  = new FacetRecord();
                    a.type =typePrefix+type;
                    a.value = "true";
                    a.slideid = mapping[toInsert[i].slideid];
                    handledSlides[mapping[toInsert[i].slideid]]=1; // add not that this slide is taken care of
                    if(typeof mapping[toInsert[i].slideid]!="undefined"){
                        a.save(function (err){
                            if(err)
                                throw "Problem saving FacetRecord slideindex: "+err;
                        });   
                    }
                }catch(e){
                    console.error("Error while saving slideindex "+e.toString());
                }
            }
            
            for(var b in toDelete){// all already existing records that are no longer in presentation set to FALSE
                if(typeof toDelete[b]!="undefined"){
                    toDelete[b].value = "false";
                    handledSlides[toDelete[b]._id]=1; // add not that this slide is taken care of
                    toDelete[b].save(function (err){
                        if(err)
                            throw "Problem saving FacetRecord slideindex: "+err;
                    });   
                }
            }
            
            
            // now there is  all mapping in mapping and slides _id in handledSlides. To diff between these two sets needs to be inserted as a false record
            for(var q in mapping){
                if(typeof handledSlides[mapping[q]]=="undefined"){
                    try{
                        var a  = new FacetRecord();
                        a.type =typePrefix+type;
                        a.value = "false";
                        a.slideid = mapping[q];
                        if(typeof mapping[q]!="undefined"){
                            a.save(function (err){
                                if(err)
                                    throw "Problem saving FacetRecord slideindex: "+err;
                            });   
                        }         
                    }catch(e){
                        console.error("Error while saving slideindex "+e.toString());
                    }
                }
            }
            
        });
    }catch(_err){
        console.error("processGithubOrDrawing: "+_err.toString());
    }
}