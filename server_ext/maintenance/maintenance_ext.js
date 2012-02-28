var mongoose = require("mongoose"); 
var LectureToUpdate = mongoose.model("LectureToUpdate");
var slideindex_ext =  require('../slideindex/slideindex_ext.js');
var editor_ext = require('../editor/editor_ext.js');
var mm = require('./maintenanceman_ext.js');

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
                        var man = mm.maintenanceMan(crs[i], crs[i].courseID+":"+crs[i].lectureID);            
                        man.maintenance_refreshIndexJSON = function(){
                            var _ref = this;
                            slideindex_ext.index(this.object.courseID, this.object.lectureID, "json", undefined, function(err, data){
                                if(err){
                                    console.error("refreshIndexFiles: "+err);
                                }else{
                                    _ref.notify();                          
                                }
                            }); 
                        }
    
                        man.maintenance_refreshIndexXML = function(){       
                            var _ref = this;
                            slideindex_ext.index(this.object.courseID, this.object.lectureID, "xml", undefined, function(err, data){
                                if(err){
                                    console.error("refreshIndexFiles: "+err);
                                }else{
                                    _ref.notify();                          
                                }
                            }); 
                        }
                        man.run();  
                    }
                }
            }
        });
    }catch(error){
        console.error("MM addLectureToQueue "+error);
    }
}