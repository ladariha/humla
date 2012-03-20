var typePrefix =require("../facetengine_ext.js").prefix;
var mongoose = require("mongoose"); 
var FacetRecord = mongoose.model("FacetRecord");
var Slideid = mongoose.model("Slideid");
var thisType = "Faq";
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
    processFaq(mapping, toProcess, course ,lecture);        
}


function processFaq(mapping, items , course, lecture){
    try{
        var prefix =new RegExp("^"+typePrefix); 
        var query = FacetRecord.find({
            type: prefix
        });
        var arr = [];
    
        for(var a in mapping){ // mapping[mdw_lecture1_1_xxx] = _id;
            arr.push(mapping[a]+'');
        }

        var handledSlides = {};

        query.where('slideid').in(arr);  // limit them to mapping records
        
        query.exec(function(err, data){ // get all data from db for given presentation (all slides)
            var data_assoc = {};
            for(var j=0;j<data.length;j++){
                data_assoc[data[j].slideid] = data[j]; 
            }

            for(var j=0;j<items.length;j++){
                if(typeof data_assoc[mapping[items[j].slideid]+'']!="undefined"){ // so the record is already in db for given slide, if it is true then nothing has to be done
                    if(data_assoc[mapping[items[j].slideid]+''].value !== "true"){
                        data_assoc[mapping[items[j].slideid]+''].value = "true";
                        data_assoc[mapping[items[j].slideid]+''].save(function (err){
                            if(err)
                                throw "Problem saving FacetRecord "+items[j].slideid+": "+err;
                        });   
                    }
                }else{
                    if(typeof handledSlides[items[j].slideid]=="undefined"){ // to avoid multiple records
                        var a  = new FacetRecord();
                        a.type =typePrefix;
                        a.value = "true";
                        a.slideid = mapping[items[j].slideid];
                        if(typeof mapping[items[j].slideid]!="undefined"){
                            a.save(function (err){
                                if(err)
                                    throw "Problem saving FacetRecord : "+err;
                            });   
                        }
                    }
                }
                handledSlides[items[j].slideid]=1
            }
            
            for(var a in mapping){ // a is data-slideid
                if(typeof handledSlides[a]=="undefined"){

                    // so this slide has not been handled, it could be in DB but doesn't have to'
                    if(typeof data_assoc[mapping[a]+'']=="undefined"){// so this mapping has no FR record yet
                        var t  = new FacetRecord();
                        t.type =typePrefix;
                        t.value = "false";
                        t.slideid = mapping[a]+'';
                        if(typeof mapping[a]!="undefined"){
                            t.save(function (err){
                                if(err)
                                    throw "Problem saving FacetRecord : "+err;
                            });   
                        }
                    }else{
                        if(data_assoc[mapping[a]+''].value !== "false"){
                            data_assoc[mapping[a]+''].value = "false";
                            data_assoc[mapping[a]+''].save(function (err){
                                if(err)
                                    throw "Problem saving FacetRecord : "+err;
                            });
                        } 
                    }
                }
            }
        });
    }catch(_err){
        console.error("processFaq: "+_err.toString());
    }
}