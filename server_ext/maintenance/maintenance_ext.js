var mongoose = require("mongoose"); 
var LectureToUpdate = mongoose.model("LectureToUpdate");
var slideindexer_ext =  require('../slideindex/slideindexer_ext.js');
var editor_ext = require('../editor/editor_ext.js');

/**
 * When lecture the information is updated it is stored in queue.  The queue is periodically processed (index file and facet records are updated)
 */
editor_ext.emitter.on("fileUpdated",addLectureToQueue);

exports.addLectureToQueue = addLectureToQueue;

/**
 * Stores the information about updated lecture into DB (aka queue)
 * @param course course ID
 * @param lecture lecture ID
 */
function addLectureToQueue(course, lecture){
    try{
        LectureToUpdate.find({
            lectureID: lecture,
            courseID: course
        }, function(err,crs){  
            if(err){
                console.error("ERR");
                console.error(err);
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
    }catch(error){
        console.error("MM addLectureToQueue "+error);
    }

}
   
/**
 * This function is called peridically. When it happens it finds all records about updated lectures (stored in db/queue) and
 * triggers MaintenanceMan. MaintenanceMan runs all his methods prefixed with "maintenance_" upon this record.
 */
exports.refreshLectures= function(){
    try{
        LectureToUpdate.find({}, function(err,crs){  
            if(err){
                console.error(err);
            }else{
                if(crs.length> 0){ // lecture not in queue, otherwise it would have been found
                    var i=0;
                    for(i=0; i<crs.length;i++){
                        new MaintenanceMan(crs[i].courseID, crs[i].lectureID,crs[i]).run();
                    }
                }
            }
        });
    }catch(error){
        console.error("MM addLectureToQueue "+error);
    }
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

