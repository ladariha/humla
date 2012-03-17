var mongoose = require("mongoose"); 
var FacetRecord = mongoose.model("FacetRecord");
var Slideid = mongoose.model("Slideid");

var typePrefix =require("../facetengine_ext.js").prefix;
var thisType = "CodeSnippet";
var childType="Algorithm";
exports.type = thisType;
exports.childType=childType;

exports.parse = function(mapping, course, lecture, data){ 
    var toProcess =[];
    for(var j=0;j<data.items.length;j++){
        if(typeof data.items[j].type!="undefined"){// should be always true since microdataparser returns only typed items
            for(var i=0; i< data.items[j].type.length;i++){
                if(data.items[j].type[i] === typePrefix+thisType ||  data.items[j].type[i] === typePrefix+childType ){
                    try{
                        toProcess.push(data.items[j]);
                    }catch(e){
                        console.error("Problem parsing CodeSnippet_Language type "+e);
                    }
                }                   
            }
        }
    }
    parseSnippetType(mapping, toProcess, course ,lecture);        
}

function parseSnippetType(mapping, items, course, lecture){
    // only one call total (aka all slides and codesnippets at once)
    var arr = [];
    for(var a in mapping){
        arr.push(mapping[a]);
    }

    
    // find codesnippets for given presentation - check slideid and type
    // if found > 0
    // make the results assoc array dle ugly ID - var notTakenCareOf = {}
    // if match toInsert[uglyID (from FacRec)].Language === FacRec.value 
    //      delete toInsert[uglyID (from FacRec)]
    //      if(typeof notTakenCareOf[uglyID]!=Undefined) delete notTakenCareOf[uglyID]
    //      
    //      now all elements from toInsert insert as a new ones
    //      all elements in notTakenCareOf delete from DB
    // else
    // insert all new record (no existing )
    if(items.length<1){
        // no items in html => delete all records
        
        var query = FacetRecord.remove({  // remove all existing records for Gbooks for given presentation
            type: typePrefix+thisType
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err)
                console.error(err);
        });        
    }else{
        var query = FacetRecord.find({  // remove all existing records for Gbooks for given presentation
            type: typePrefix+thisType
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err){
                console.error(err);
            }else{
                if(data.length>0){
                    var data_toDelete= [];
                    for(var i=0;i<data.length;i++){   
                        var foundMatch = false;
                        for(var j=0;j<items.length;j++){   
                            if(data[i].slideid+'' === mapping[items[j].slideid]+'' && typeof items[j].properties.language!="undefined" 
                                && items[j].properties.language.length>0 &&
                                data[i].value === items[j].properties.language[0] && typeof items[j].properties.used=="undefined" 
                                && !foundMatch){ // keep the untouched
                                items[j].properties.used = 1; // mark already processed microdata
                                items[j].toInsert = false;
                                foundMatch = true;
                            }
                        }
                        if(!foundMatch){
                            data_toDelete.push(data[i]);
                        }
                    }
                
                      for(var a=0;a<items.length;a++){    // insert new records
                        if(typeof items[a].toInsert=="undefined"){
                            console.log("JEDEN NOVY");
                            var tmp = new FacetRecord();
                            tmp.type =typePrefix+thisType;
                            tmp.value = items[a].properties.language[0];
                            tmp.slideid = mapping[items[a].slideid];
                            tmp.save(function(err){
                                if(err)
                                    throw "Problem saving FacetRecord "+": "+err;
                            });
                        }
                    }
                
                    for(var j=0;j<data_toDelete.length;j++){
                        data_toDelete[j].remove(function(err){
                            if(err)
                                console.error("Problem removing old FacetRecord Snippet");
                        });
                    }
                }else{ //insert all new record (no existing )
                    for(var j=0;j<items.length;j++){   
                        if(typeof items[j].properties.language!="undefined" && items[j].properties.language.length>0){
                            var tmp = new FacetRecord();
                            tmp.type =typePrefix+thisType;
                            tmp.value = items[j].properties.language[0];
                            tmp.slideid = mapping[items[j].slideid];
                            tmp.save(function(err){
                                if(err)
                                    throw "Problem saving FacetRecord "+": "+err;
                            });
                        }    
                    }
                }
            }
        });
    }
}