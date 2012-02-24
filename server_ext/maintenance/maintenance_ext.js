var mongoose = require("mongoose"); 
var LectureToUpdate = mongoose.model("LectureToUpdate");
var operations = [];
var slideindexer_ext =  require('../slideindex/slideindexer_ext.js');
var editor_ext = require('../editor/editor_ext.js');

editor_ext.emitter.on("fileUpdated",addLectureToQueue);

exports.addLectureToQueue = addLectureToQueue;

function addLectureToQueue(course, lecture){
    LectureToUpdate.find({
        lectureID: lecture,
        courseID: course
    }, function(err,crs){  
        if(err){
            console.log("ERR");
            console.log(err);
        }else{
            if(crs.length===0){ // lecture not in queue, otherwise it would have been found
                // save to db
                var c = new LectureToUpdate();
                c.courseID = course;
                c.lectureID = lecture;
                c.save(function(err) {
                    if(err) {
                        console.error("addLectureToQueue  failed.");
                        console.error(err);
                    }else{
                        console.log("addLectureToQueue success: "+course+" > "+lecture);
                    }
                    
                });   
            }
        }
    });
}
   

exports.refreshLectures= function(){
    LectureToUpdate.find({}, function(err,crs){  
        if(err){
            console.log(err);
        }else{
            if(crs.length> 0){ // lecture not in queue, otherwise it would have been found
                var i=0;
                for(i=0; i<crs.length;i++){
                    new MaintenanceMan(crs[i].courseID, crs[i].lectureID,crs[i]).run();
                }
            }
        }
    });
}


/**
 * MaintenanceMan is a function ("class") designed to perform maintein operations on/with given object.
 * Every function which name starts with "maintenance_" will be called when method run is invoked over 
 * the MaintenanceMan. The run method can be called with or without arguments. If any arguments are 
 * passed to run method, then these arguments will be available to all "maintenance_" methods as well.
 * You can create your own "maintenance_" methods that should be called.
 * @param object object that is available to all methods (access via this.object)
 */
function MaintenanceMan(object){
    this.object  = object;
    this.limit = 0;
    this.counter = 0;

    this.notify = function(){
        this.counter++;
        if(this.counter === this.limit)
        {
            this.object.remove(function(err) { // once its finished remove record from queue
                if (err) {
                    console.error("refreshIndexFiles: "+err);
                }else
                    console.log("REMOVED");
            });    
        }
    }
    
    this.maintenance_refreshIndexJSON = function(){
        var _ref = this;
        slideindexer_ext.index(this.object.courseID, this.object.lectureID, "json", undefined, function(err, data){
            if(err){
                console.error("refreshIndexFiles: "+err);
            }else{
                _ref.notify();                          
            }
        }); 
    }
    
    this.maintenance_refreshIndexXML = function(){       
        var _ref = this;
        slideindexer_ext.index(this.object.courseID, this.object.lectureID, "xml", undefined, function(err, data){
            if(err){
                console.error("refreshIndexFiles: "+err);
            }else{
                _ref.notify();                          
            }
        }); 
    }
    
    this.run = function(args){
        
        for(var key in this){ // to set number of called methods
            if(this.hasOwnProperty(key) && typeof this[key]=="function" && key.indexOf("maintenance_") >-1){
                this.limit++;
            }
        }
        
        for(var key in this){
            if(this.hasOwnProperty(key) && typeof this[key]=="function" && key.indexOf("maintenance_") >-1){
                this[key].apply(this, args); // call all maintenance_ preffixed functions
            }
        }
    }
}

