var typePrefix =require("../facetengine_ext.js").prefix;
var mongoose = require("mongoose"); 
var FacetRecord = mongoose.model("FacetRecord");
var Slideid = mongoose.model("Slideid");
var thisType = "Presentation";
exports.type = thisType;



exports.parse = function(mapping, course, lecture, data){ 
    var toProcess =[];
    for(var j=0;j<data.items.length;j++){
        if(typeof data.items[j].type!="undefined"){// should be always true since microdataparser returns only typed items
            for(var i=0; i< data.items[j].type.length;i++){
                if(data.items[j].type[i] === typePrefix+thisType){
                    try{
                        toProcess.push(data.items[j]);
                    }catch(e){
                        console.error("Problem parsing Tasks type "+e);
                    }
                }                   
            }
        }
    }
    parseField(mapping, toProcess, course ,lecture);        
}


// field
function parseField(mapping, items, course, lecture){
 
    var arr = [];
    for(var a in mapping){
        arr.push(mapping[a]);
    }
    if(items.length<1 || typeof items[0].properties.field=="undefined"){
        // no items in html => delete all records
        var query = FacetRecord.remove({  // remove all existing records for Gbooks for given presentation
            type: typePrefix+thisType+"_Field"
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err)
                console.error(err);
        });        
    }else{
        var query = FacetRecord.find({  // remove all existing records for Gbooks for given presentation
            type:  typePrefix+thisType+"_Field"
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err){
                console.error(err);
            }else{
                if(data.length>0){
                    if(data.length === arr.length && data.length>0 && data[0].value === items[0].properties.field[0]){
                    // aka same number of slides with same and correct value => nothing has to be done
                    }else{
                    
                        if(data.length === arr.length){
                            // different value of field, just update & save
                            for(var i=0;i<data.length;i++){   
                                data[i].value = items[0].properties.field[0];
                                data[i].save(function(err){
                                    if(err)
                                        console.error("Problem saving FacetRecord: "+err);
                                });
                            }
                        }else{
                            var updated = {};
                            // iterate over mapping and change data.value for each and mark changed mapping item
                            for(var a in mapping){
                                for(var i=0;i<data.length;i++){   
                                    if(data[i].slideid+''=== mapping[a]+''){
                                        data[i].value = items[0].properties.field[0];
                                        data[i].save(function(err){
                                            if(err)
                                                console.error("Problem saving FacetRecord: "+err);
                                        })
                                        updated[mapping[a]]=1;
                                        i = data.length+1;
                                    }
                                }
                            }
                        
                            // for unchanged mapping items insert new
                            for(var a in mapping){
                                if(typeof updated[mapping[a]]=="undefined"){
                                    var d = new FacetRecord();
                                    d.type =typePrefix+thisType+"_Field";
                                    d.value =items[0].properties.field[0];
                                    d.slideid = mapping[a];
                                    d.save(function (err){
                                        if(err)
                                            console.error("Problem saving FacetRecord: "+err);
                                    });          
                                }
                            }
                        }
                    }
                       
                }else{ //insert all new record (no existing )
                    for(var a in mapping){
                        var tmp = new FacetRecord();
                        tmp.type = typePrefix+thisType+"_Field"
                        tmp.value = items[0].properties.field[0];
                        tmp.slideid = mapping[a];
                        tmp.save(function(err){
                            if(err)
                                console.error("Problem saving FacetRecord: "+err);
                        });
                        
                    }
                }
            }
        });
    }
}

// language

function parseLanguage(mapping, items, course, lecture){
 
    var arr = [];
    for(var a in mapping){
        arr.push(mapping[a]);
    }
    if(items.length<1 || typeof items[0].properties.language=="undefined"){
        // no items in html => delete all records
        var query = FacetRecord.remove({  // remove all existing records for Gbooks for given presentation
            type: typePrefix+thisType+"_Language"
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err)
                console.error(err);
        });        
    }else{
        var query = FacetRecord.find({  // remove all existing records for Gbooks for given presentation
            type:  typePrefix+thisType+"_Language"
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err){
                console.error(err);
            }else{
                if(data.length>0){
                    if(data.length === arr.length && data.length>0 && data[0].value === items[0].properties.language[0]){
                    // aka same number of slides with same and correct value => nothing has to be done
                    }else{
                    
                        if(data.length === arr.length){
                            // different value of field, just update & save
                            for(var i=0;i<data.length;i++){   
                                data[i].value = items[0].properties.language[0];
                                data[i].save(function(err){
                                    if(err)
                                        console.error("Problem saving FacetRecord: "+err);
                                });
                            }
                        }else{
                            var updated = {};
                            // iterate over mapping and change data.value for each and mark changed mapping item
                            for(var a in mapping){
                                for(var i=0;i<data.length;i++){   
                                    if(data[i].slideid+''=== mapping[a]+''){
                                        data[i].value = items[0].properties.language[0];
                                        data[i].save(function(err){
                                            if(err)
                                                console.error("Problem saving FacetRecord: "+err);
                                        })
                                        updated[mapping[a]]=1;
                                        i = data.length+1;
                                    }
                                }
                            }
                        
                            // for unchanged mapping items insert new
                            for(var a in mapping){
                                if(typeof updated[mapping[a]]=="undefined"){
                                    var d = new FacetRecord();
                                    d.type =typePrefix+thisType+"_Language";
                                    d.value =items[0].properties.language[0];
                                    d.slideid = mapping[a];
                                    d.save(function (err){
                                        if(err)
                                            console.error("Problem saving FacetRecord: "+err);
                                    });          
                                }
                            }
                        }
                    }
                       
                }else{ //insert all new record (no existing )
                    for(var a in mapping){
                        var tmp = new FacetRecord();
                        tmp.type = typePrefix+thisType+"_Language"
                        tmp.value = items[0].properties.language[0];
                        tmp.slideid = mapping[a];
                        tmp.save(function(err){
                            if(err)
                                console.error("Problem saving FacetRecord: "+err);
                        });
                        
                    }
                }
            }
        });
    }
}



// organization

function parseOrganization(mapping, items, course, lecture){
 
    var arr = [];
    for(var a in mapping){
        arr.push(mapping[a]);
    }
    if(items.length<1 || typeof items[0].properties.organization[0].properties.name[0]=="undefined"){
        // no items in html => delete all records
        var query = FacetRecord.remove({  // remove all existing records for Gbooks for given presentation
            type: typePrefix+thisType+"_Organization"
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err)
                console.error(err);
        });        
    }else{
        var query = FacetRecord.find({  // remove all existing records for Gbooks for given presentation
            type:  typePrefix+thisType+"_Organization"
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err){
                console.error(err);
            }else{
                if(data.length>0){
                    if(data.length === arr.length && data.length>0 && data[0].value === items[0].properties.organization[0].properties.name[0]){
                    // aka same number of slides with same and correct value => nothing has to be done
                    }else{
                    
                        if(data.length === arr.length){
                            // different value of field, just update & save
                            for(var i=0;i<data.length;i++){   
                                data[i].value = items[0].properties.organization[0].properties.name[0];
                                data[i].save(function(err){
                                    if(err)
                                        console.error("Problem saving FacetRecord: "+err);
                                });
                            }
                        }else{
                            var updated = {};
                            // iterate over mapping and change data.value for each and mark changed mapping item
                            for(var a in mapping){
                                for(var i=0;i<data.length;i++){   
                                    if(data[i].slideid+''=== mapping[a]+''){
                                        data[i].value = items[0].properties.organization[0].properties.name[0];
                                        data[i].save(function(err){
                                            if(err)
                                                console.error("Problem saving FacetRecord: "+err);
                                        })
                                        updated[mapping[a]]=1;
                                        i = data.length+1;
                                    }
                                }
                            }
                        
                            // for unchanged mapping items insert new
                            for(var a in mapping){
                                if(typeof updated[mapping[a]]=="undefined"){
                                    var d = new FacetRecord();
                                    d.type =typePrefix+thisType+"_Organization";
                                    d.value =items[0].properties.organization[0].properties.name[0];
                                    d.slideid = mapping[a];
                                    d.save(function (err){
                                        if(err)
                                            console.error("Problem saving FacetRecord: "+err);
                                    });          
                                }
                            }
                        }
                    }
                       
                }else{ //insert all new record (no existing )
                    for(var a in mapping){
                        var tmp = new FacetRecord();
                        tmp.type = typePrefix+thisType+"_Organization"
                        tmp.value =items[0].properties.organization[0].properties.name[0];
                        tmp.slideid = mapping[a];
                        tmp.save(function(err){
                            if(err)
                                console.error("Problem saving FacetRecord: "+err);
                        });
                        
                    }
                }
            }
        });
    }
}

// course

function parseCourse(mapping, items, course, lecture){
 
    var arr = [];
    for(var a in mapping){
        arr.push(mapping[a]);
    }
    if(items.length<1){
        // no items in html => delete all records
        var query = FacetRecord.remove({  // remove all existing records for Gbooks for given presentation
            type: typePrefix+thisType+"_Course"
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err)
                console.error(err);
        });        
    }else{
        var query = FacetRecord.find({  // remove all existing records for Gbooks for given presentation
            type:  typePrefix+thisType+"_Course"
        });
        query.where('slideid').in(arr);  
        query.exec(function(err,data){
            if(err){
                console.error(err);
            }else{
                if(data.length>0){
                    if(data.length === arr.length && data.length>0 && data[0].value === course){
                    // aka same number of slides with same and correct value => nothing has to be done
                    }else{
                    
                        if(data.length === arr.length){
                            // different value of field, just update & save
                            for(var i=0;i<data.length;i++){   
                                data[i].value =course;
                                data[i].save(function(err){
                                    if(err)
                                        console.error("Problem saving FacetRecord: "+err);
                                });
                            }
                        }else{
                            var updated = {};
                            // iterate over mapping and change data.value for each and mark changed mapping item
                            for(var a in mapping){
                                for(var i=0;i<data.length;i++){   
                                    if(data[i].slideid+''=== mapping[a]+''){
                                        data[i].value = course;
                                        data[i].save(function(err){
                                            if(err)
                                                console.error("Problem saving FacetRecord: "+err);
                                        })
                                        updated[mapping[a]]=1;
                                        i = data.length+1;
                                    }
                                }
                            }
                        
                            // for unchanged mapping items insert new
                            for(var a in mapping){
                                if(typeof updated[mapping[a]]=="undefined"){
                                    var d = new FacetRecord();
                                    d.type =typePrefix+thisType+"_Course";
                                    d.value =course;
                                    d.slideid = mapping[a];
                                    d.save(function (err){
                                        if(err)
                                            console.error("Problem saving FacetRecord: "+err);
                                    });          
                                }
                            }
                        }
                    }
                       
                }else{ //insert all new record (no existing )
                    for(var a in mapping){
                        var tmp = new FacetRecord();
                        tmp.type = typePrefix+thisType+"_Course"
                        tmp.value = course;
                        tmp.slideid = mapping[a];
                        tmp.save(function(err){
                            if(err)
                                console.error("Problem saving FacetRecord: "+err);
                        });
                        
                    }
                }
            }
        });
    }
}

// authors


// keywords