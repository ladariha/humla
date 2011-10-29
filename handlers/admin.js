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
 * Creates new course (new entry in db, new folder)
 */
app.post('/api/:course/course', function(request, response){ // TODO database timeout
  
    if(request.body === undefined || request.body.longName === undefined || request.body.longName.length<1 || 
        request.body.isActive === undefined || request.body.isActive.length<1 || request.body.courseID ===undefined ||
        request.body.courseID.length<1 || request.body.owner === undefined || request.body.owner.length<1
        ){
        response.writeHead(400, {
            'Content-Type': 'text/plain'
        });
        
        response.write("Missing fields" );
        response.end();   
    }else{
        Course.find({
            courseID: request.params.course
        }, function(err,crs){   
            if(!err) {
                if(crs.length > 0){
                    response.writeHead(409, {
                        "Content-Type": "text/plain"
                    });
                    response.write("Course already exists");
                    response.end(); 
                }else{
                    var c = new Course();
                    c.longName = decodeURIComponent(request.body.longName);
                    var e = (request.body.isActive).toLowerCase()
                    if(e=='true'){
                        c.isActive = true;
                    }
                    else{
                        c.isActive = false;
                    }
                    c.courseID = decodeURIComponent(request.body.courseID);
                    c.owner = decodeURIComponent(request.body.owner);
                    c.lecturesURLPreffix = request.headers.host+'/data/slides/'+c.courseID;
                    c.url = request.headers.host+'/api/'+c.courseID+'/course';    
                    c.save(function(err) {
                        if(err) {
                            response.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            response.write("Problems with database");
                            response.end();  
                        }else{
                            response.writeHead(200, {
                                "Content-Type": "application/json"
                            });
                            response.write(JSON.stringify(c, null, 4));
                            response.end(); 
                        }
                    });   
                }         
            } else {
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.write("Problems with database");
                response.end();   
            }             
        });
    }
}
);
    

/**
 * Edit existing course
 */
app.put('/api/:course/course', function(request, response){
 
    if(request.body === undefined){
        response.writeHead(400, {
            'Content-Type': 'text/plain'
        });
        
        response.write("Missing fields \"course\"" );
        response.end();   
    }else{
        Course.find({
            _id: encodeURIComponent(request.body.id)
        }, function(err,crs){   
            if(!err) {
                if(crs.length > 0){
                    var course = crs[0];
                    if(request.body.isActive!==undefined){
                        var e = (request.body.isActive).toLowerCase()
                        if(e=='true'){
                            course.isActive = true;
                        }
                        else{
                            course.isActive = false;
                        }
                    }
                    course.courseID = (request.body.courseID === undefined) ? course.courseID : decodeURIComponent(request.body.courseID);
                    course.longName = (request.body.longName === undefined) ? course.longName : decodeURIComponent(request.body.longName);
                    course.owner = (request.body.owner === undefined) ? course.owner : decodeURIComponent(request.body.owner);
                    course.lecturesURLPreffix = request.headers.host+'/data/slides/'+c.courseID;
                    course.url = request.headers.host+'/api/'+c.courseID+'/course';    
                    course.save(function(err) {
                        if (err){
                            response.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            response.write("Problems with database");
                            response.end();  
                        }
                            
                        else{
                            response.writeHead(200, {
                                "Content-Type": "application/json"
                            });
                            response.write(JSON.stringify(course, null, 4));
                            response.end();   
                        }
                    });
                }else{
                    response.writeHead(404, {
                        "Content-Type": "text/plain"
                    });
                    response.write("Course not found");
                    response.end();   
                }
              
            } else {
                console.log(encodeURIComponent(request.body.id)+">>"+err);
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.write("Problems with database");
                response.end();   
            
            }             
        });
    }
});




/**
 * Returns course info
 */
app.get('/api/:course/course', function(request, response){
    
    Course.find({
        courseID: request.params.course
    }, function(err,crs){   
        if(!err) {
            if(crs.length > 0){
                var course = crs[0];
                response.writeHead(200, {
                    "Content-Type": "application/json"
                });
                response.write(JSON.stringify(course, null, 4));
                response.end();  
            } else {
                response.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                response.write("Course not found");
                response.end();  
            
            }   
        }else{
            response.writeHead(500, {
                "Content-Type": "text/plain"
            });
            response.write("Problems with database");
            response.end();    
        }
    });
 
});


app.post('/api/:course/lecture', function(request, response){ // TODO database timeout
  
    if(request.body === undefined || request.body.title === undefined || request.body.title.length<1 || 
        request.body.isActive === undefined || request.body.isActive.length<1 || request.body.courseID ===undefined ||
        request.body.courseID.length<1 || request.body.author === undefined || request.body.author.length<1
        || request.body.order === undefined || request.body.order<1
        ){
        response.writeHead(400, {
            'Content-Type': 'text/plain'
        });
        
        response.write("Missing fields" );
        response.end();   
    }else{
        Lecture.find({
            courseID: request.params.course,
            order: request.body.order
        }, function(err,crs){   
            if(!err) {
                if(crs.length > 0){
                    response.writeHead(409, {
                        "Content-Type": "text/plain"
                    });
                    response.write("Lecture with given course and order already exists");
                    response.end(); 
                }else{
                    var c = new Lecture();
                    c.title = decodeURIComponent(request.body.title);
                    c.lectureID= 'lecture'+request.body.order;
                    c.url = request.headers.host+'/api/'+c.courseID+'/'+c.lectureID;
                    c.presentationURL = request.headers.host+'/data/slides/'+c.courseID+'/'+c.lectureID+'.html';
                    c.isActive = decodeURIComponent(request.body.isActive);
                    c.courseID = decodeURIComponent(request.body.courseID);
                    c.author = decodeURIComponent(request.body.author);
                    var k = (decodeURIComponent(request.body.keywords)).split(",");
                    k.forEach(function(i){
                        i = i.replace(/^\s*/, "").replace(/\s*$/, "");
                    });
                    c.keywords = k;
                    c.save(function(err) {
                        if(err) {
                            response.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            response.write("Problems with database");
                            response.end();  
                        }else{
                            response.writeHead(200, {
                                "Content-Type": "application/json"
                            });
                            response.write(JSON.stringify(c, null, 4));
                            response.end(); 
                        }
                    });   
                }         
            } else {
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.write("Problems with database");
                response.end();   
            }             
        });
    }
}
);


/**
 * Tests if string ends with given suffix
 */
function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}