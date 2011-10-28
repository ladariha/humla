var fs = require("fs");
var path = require("path");
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var SLIDE_TEMPLATE = (path.join(path.dirname(__filename),'../public/data/templates')).toString();
var facet_use_fs = 1;
var mongoose = require("mongoose"); 
var Course = mongoose.model("Course");
var Lecture = mongoose.model("Lecture");
/**
 * Returns all courses
 */
app.get('/api/facet/courses', function(request, response){ // TODO database timeout
    Course.find({
        isActive:true
        
    }, function(err,crs){   
        if(!err && crs.length > 0) {
            var courses = new Array();
            crs.forEach(function(course){
                var c = {};
                c.courseID = course.courseID;
                c.longName = course.longName;
                c.owner = course.owner;
                c.isActive = course.isActive;
                courses.push(c);
            });
            response.writeHead(200, {
                "Content-Type": "application/json"
            });
            response.write(JSON.stringify(courses, null, 4));
            response.end();  
        } else {
            getCoursesFromFS(request, response);
        }             
    });
}
);
    
    
/**
 * Returns all presentations for given course
 */
app.get('/api/facet/:course/lectures', function(request, response){
    var course = request.params.course;
    Lecture.find({
        isActive:true,
        courseID: course
        
    }, function(err,lectures){
        if(!err && lectures.length > 0) {
            var lecs = new Array();
            lectures.forEach(function(lecture){
                var c = {};
                c.title = lecture.title;
                c.url = lecture.url;
                lecs.push(c);

            });
            response.writeHead(200, {
                "Content-Type": "application/json"
            });
            response.write(JSON.stringify(lecs, null, 4));
            response.end();  
        } else {
            getLecturesFromFS(request, response, course);
        }             
    });
});
    

function getCoursesFromFS(request, response){
    fs.readdir(SLIDES_DIRECTORY, function(err, list) {
        
        if(err){
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            response.write('500 Internal error '+err);
            response.end();
        }else{  
            saveCoursesToDB(list);
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.write(JSON.stringify(list, null, 4));
            response.end();
        }
    });
}

function saveCoursesToDB(courses){
    console.log("saving");
    courses.forEach(function(course){
        
        var c = new Course();
        c.longName = course; // fallback, this way courses are not supposed to be created => UI needed for it
        c.isActive = true;
        c.courseID = course;
        c.owner = "";
        c.save(function(err) {
            if(err) {
                console.log("ERR "+err);
            }else{
                console.log("course in DB");
            }
        });
    });
}

function saveLecturesToDB(request, lectures, course){
    lectures.forEach(function(lec){
        var c = new Lecture();
        c.courseID = course;
        c.title = lec;// fallback, this way lectures are not supposed to be created => UI needed for it
        c.lectureID = lec; 
        c.isActive = true;
        c.url = request.headers.host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lec;
        c.save(function(err) {
            if(err) {
                console.log("ERR "+err);
            }else{
                console.log("Lecture in DB");
            }
        });
    });
}

function getLecturesFromFS(request, response, course){
    var files2 = new Array();
    fs.readdir(SLIDES_DIRECTORY+'/'+course, function(err, list) {
        
        if(err){
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            response.write('500 Internal error '+err);
            response.end();
        }else{
            
            list.forEach(function(file){              
                if(endsWith(file, ".html")){
                    files2.push(file);
                }
            });
            saveLecturesToDB(request, files2, course);
            var files = JSON.stringify(files2, null, 4);
            response.writeHead(405, {
                'Content-Type': 'application/json'
            });
            response.write(files);
            response.end(); 
        }
    });
}

/**
 * Tests if string ends with given suffix
 */
function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}