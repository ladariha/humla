var fs = require("fs");
var path = require("path");
var jquery = fs.readFileSync('./public/lib/jquery-1.6.3.min.js').toString();
var jsdom = require('jsdom');
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var LECTURE_TEMPLATE = (path.join(path.dirname(__filename),'../public/data/templates')).toString();
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
                            fs.mkdir(SLIDES_DIRECTORY+'/'+c.courseID, 0777, function(e) {
                                if(!e){
                                    response.writeHead(200, {
                                        "Content-Type": "application/json"
                                    });
                                    response.write(JSON.stringify(c, null, 4));
                                    response.end(); 
                                   
                                }else{
                                    response.writeHead(500, {
                                        "Content-Type": "text/plain"
                                    });
                                    response.write("Directory for course was not created");
                                    response.end(); 
                                }
                            });
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
                    var prev = course.courseID;
                    course.courseID = (request.body.courseID === undefined) ? course.courseID : decodeURIComponent(request.body.courseID);
                    course.longName = (request.body.longName === undefined) ? course.longName : decodeURIComponent(request.body.longName);
                    course.owner = (request.body.owner === undefined) ? course.owner : decodeURIComponent(request.body.owner);
                    course.lecturesURLPreffix = request.headers.host+'/data/slides/'+course.courseID;
                    course.url = request.headers.host+'/api/'+course.courseID+'/course';    
                    course.save(function(err) {
                        if (err){
                            response.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            response.write("Problems with database");
                            response.end();  
                        }else{                    
                            fs.rename(SLIDES_DIRECTORY+'/'+prev, SLIDES_DIRECTORY+'/'+course.courseID, function (err) {
                                if (!err){
                                    response.writeHead(200, {
                                        "Content-Type": "application/json"
                                    });
                                    response.write(JSON.stringify(course, null, 4));
                                    response.end(); 
                                    
                                    
                                }else{
                                    response.writeHead(500, {
                                        "Content-Type": "text/plain"
                                    });
                                    response.write("Directory for course was not renamed");
                                    response.end();  
                                }
                                
                            });
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


app.post('/api/:course/:lecture', function(request, response){ // TODO database timeout
   
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
                    c.courseID = decodeURIComponent(request.body.courseID);
                    c.lectureID= 'lecture'+decodeURIComponent(request.body.order);
                    c.url = request.headers.host+'/api/'+c.courseID+'/'+c.lectureID;
                    c.presentationURL = request.headers.host+'/data/slides/'+c.courseID+'/'+c.lectureID+'.html';

                    var e = (request.body.isActive).toLowerCase()
                    if(e=='true'){
                        c.isActive = true;
                    }
                    else{
                        c.isActive = false;
                    }

                    c.author = decodeURIComponent(request.body.author);
                    var k = (decodeURIComponent(request.body.keywords)).split(",");
                    var k1 = new Array();
                    k.forEach(function(i){
                        var i1 = i.replace(/^\s*/, "").replace(/\s*$/, "");
                        if(i1.length>0){
                            k1.push(i1);    
                        }
                        
                    });
                    c.keywords = k1;
                    c.save(function(err) {
                        if(err) {
                            response.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            response.write("Problems with database");
                            response.end();  
                        }else{
                            
                            // if adresar neexistuje
                            // create dir
                            // copy template
                            // fill in values
                            
                            path.exists(SLIDES_DIRECTORY+'/'+c.courseID, function (exists) {
                                if(exists){ // course dir exists
                                    copyTemplate(request, response, c, decodeURIComponent(request.body.order), decodeURIComponent(request.body.keywords));
                                }else{ // create dir
                                    
                                    fs.mkdir(SLIDES_DIRECTORY+'/'+c.courseID, 0777, function(e) {
                                        if(!e){
                                            response.writeHead(200, {
                                                "Content-Type": "application/json"
                                            });
                                            response.write(JSON.stringify(c, null, 4));
                                            response.end(); 
                                   
                                        }else{ // copy template
                                            copyTemplate(request, response, c, decodeURIComponent(request.body.order), decodeURIComponent(request.body.keywords));
                                        }
                                    });   
                                } 
                            }); 
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



app.put('/api/:course/:lecture', function(request, response){ // TODO database timeout
   
    if(request.body === undefined){
        response.writeHead(400, {
            'Content-Type': 'text/plain'
        });
        
        response.write("Missing fields" );
        response.end();   
    }else{
        Lecture.find({
            _id: encodeURIComponent(request.body.id)
        }, function(err,crs){   
            if(!err) {
                if(crs.length > 0){
          
                    var c = crs[0];
                    c.title = (request.body.title === undefined) ? c.title : decodeURIComponent(request.body.title);
                    console.log(">>>>> "+decodeURIComponent(request.body.order));
                    var prev = c.lectureID;
                    c.lectureID = (request.body.order === undefined) ? c.lectureID :  'lecture'+decodeURIComponent(request.body.order);
                    c.url = request.headers.host+'/api/'+c.courseID+'/'+c.lectureID;
                    c.presentationURL = request.headers.host+'/data/slides/'+c.courseID+'/'+c.lectureID+'.html';
                    
                    if(request.body.isActive!==undefined){
                        var e = (request.body.isActive).toLowerCase()
                        if(e=='true'){
                            c.isActive = true;
                        }
                        else{
                            c.isActive = false;
                        }
                    }
                    
                   
                    c.author = (request.body.author === undefined) ? c.author : decodeURIComponent(request.body.author);
                    if(!request.body.keywords === undefined){
                        var k = (decodeURIComponent(request.body.keywords)).split(",");
                        k.forEach(function(i){
                            var i1 = i.replace(/^\s*/, "").replace(/\s*$/, "");
                            var k1 = new Array();
                            if(i1.length>0){
                                k1.push(i1);    
                            }
                        
                        });
                        c.keywords = k1;
                        
                    }else{
                        c.keywords = [];
                    }
             
                    c.save(function(err) {
                        if(err) {
                            response.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            response.write("Problems with database");
                            response.end();  
                        }else{
                            if(prev === c.lectureID){
                                path.exists(SLIDES_DIRECTORY+'/'+c.courseID, function (exists) {
                                    if(exists){ // course dir exists
                                        editTemplate(request, response, c, decodeURIComponent(request.body.order), decodeURIComponent(request.body.keywords));
                                    }else{ // create dir
                                    
                                        fs.mkdir(SLIDES_DIRECTORY+'/'+c.courseID, 0777, function(e) {
                                            if(!e){
                                                response.writeHead(200, {
                                                    "Content-Type": "application/json"
                                                });
                                                response.write(JSON.stringify(c, null, 4));
                                                response.end(); 
                                   
                                            }else{ // copy template
                                                editTemplate(request, response, c, decodeURIComponent(request.body.order), decodeURIComponent(request.body.keywords));
                                            }
                                        });   
                                    } 
                                }); 
                            }else{
                                path.exists(SLIDES_DIRECTORY+'/'+c.courseID, function (exists) {
                                if(exists){ // course dir exists
                                    editTemplateMove(prev, request, response, c, decodeURIComponent(request.body.order), decodeURIComponent(request.body.keywords));
                                }else{ // create dir
                                    
                                    fs.mkdir(SLIDES_DIRECTORY+'/'+c.courseID, 0777, function(e) {
                                        if(!e){
                                            response.writeHead(200, {
                                                "Content-Type": "application/json"
                                            });
                                            response.write(JSON.stringify(c, null, 4));
                                            response.end(); 
                                   
                                        }else{ // copy template
                                            editTemplateMove(prev, request, response, c, decodeURIComponent(request.body.order), decodeURIComponent(request.body.keywords));
                                        }
                                    });   
                                }
                                });
                            }
                        }
                    });
                }else{
                    
                    response.writeHead(409, {
                        "Content-Type": "text/plain"
                    });
                    response.write("Lecture with given course and order doesn't exists");
                    response.end();    
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



function copyTemplate(request, response, lecture, order,keywords){
    fs.readFile(LECTURE_TEMPLATE+'/presentation.html', function(err, data) {
        if(err){
            response.writeHead(500, {
                "Content-Type": "text/plain"
            });
            response.write("Cannot load presentation template");
            response.end();   
        }else{
            var content = data.toString();
            jsdom.env({
                html: LECTURE_TEMPLATE+'/presentation.html',
                src: [
                jquery
                ],
                done: function(errors, window) {
                    if(errors){
                        response.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        response.write('Error while parsing document by jsdom');
                        response.end();   
                    }else{
                        try{
                            var $ = window.$;
                            $('meta[name="keywords"]').attr('content');
                            Course.find({
                                courseID: lecture.courseID
                            }, function(err,crs){
                                if(!err) {
                                    if(crs.length > 0){
                                        $('meta[name="course"]').attr('content', crs[0].longName);
                                    }
                                    $('meta[name="author"]').attr('content', lecture.author);
                                    $('meta[name="lecture"]').attr('content', 'Lecture '+order);
                                    $('meta[name="keywords"]').attr('content', keywords);
                                    $('title').text(lecture.title);
                                    var newcontent= $("html").html();                            
                                    fs.writeFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html', newcontent, function (err) {
                                        if (err) {
                                        
                                            response.writeHead(500, {
                                                'Content-Type': 'text/plain'
                                            });
                                            response.write('Problem with saving lecture file: '+err);
                                            response.end();
                                        }else{
                                            console.log(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html');
                                            response.writeHead(200, {
                                                'Content-Type': 'application/json'
                                            });
                                            response.write(JSON.stringify(lecture, null, 4));
                                            response.end();
                                        }
                                    });  
                                }else{
                                    response.writeHead(500, {
                                        'Content-Type': 'text/plain'
                                    });
                                    response.write('Problem with saving lecture file - error during retrieving course info: '+err);
                                    response.end();
                                }
                        
                            });   
                        }
                        catch(err){
                            response.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                            response.write('Error while parsing document: '+err);
                            response.end();
                        }
                    }
                }
            }); 
        }
    });
}


function editTemplate(request, response, lecture, order,keywords){
    fs.readFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html', function(err, data) {
        if(err){
            response.writeHead(500, {
                "Content-Type": "text/plain"
            });
            response.write("Cannot load presentation template");
            response.end();   
        }else{
            var content = data.toString();
            jsdom.env({
                html: SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html',
                src: [
                jquery
                ],
                done: function(errors, window) {
                    if(errors){
                        response.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        response.write('Error while parsing document by jsdom');
                        response.end();   
                    }else{
                        try{
                            var $ = window.$;
                            $('meta[name="keywords"]').attr('content');
                            Course.find({
                                courseID: lecture.courseID
                            }, function(err,crs){
                                if(!err) {
                                    if(crs.length > 0){
                                        $('meta[name="course"]').attr('content', crs[0].longName);
                                    }
                                    $('meta[name="author"]').attr('content', lecture.author);
                                    $('meta[name="lecture"]').attr('content', 'Lecture '+order);
                                    $('meta[name="keywords"]').attr('content', keywords);
                                    $('title').text(lecture.title);
                                    var newcontent= $("html").html();                            
                                    fs.writeFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html', newcontent, function (err) {
                                        if (err) {
                                        
                                            response.writeHead(500, {
                                                'Content-Type': 'text/plain'
                                            });
                                            response.write('Problem with saving lecture file: '+err);
                                            response.end();
                                        }else{
                                            console.log(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html');
                                            response.writeHead(200, {
                                                'Content-Type': 'application/json'
                                            });
                                            response.write(JSON.stringify(lecture, null, 4));
                                            response.end();
                                        }
                                    });  
                                }else{
                                    response.writeHead(500, {
                                        'Content-Type': 'text/plain'
                                    });
                                    response.write('Problem with saving lecture file - error during retrieving course info: '+err);
                                    response.end();
                                }
                        
                            });   
                        }
                        catch(err){
                            response.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                            response.write('Error while parsing document: '+err);
                            response.end();
                        }
                    }
                }
            }); 
        }
    });
}

function editTemplateMove(prevFile, request, response, lecture, order,keywords){
    fs.readFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+prevFile+'.html', function(err, data) {
        if(err){
            response.writeHead(500, {
                "Content-Type": "text/plain"
            });
            response.write("Cannot load presentation template");
            response.end();   
        }else{
            var content = data.toString();
            jsdom.env({
                html: SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+prevFile+'.html',
                src: [
                jquery
                ],
                done: function(errors, window) {
                    if(errors){
                        response.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        response.write('Error while parsing document by jsdom');
                        response.end();   
                    }else{
                        try{
                            var $ = window.$;
                            $('meta[name="keywords"]').attr('content');
                            Course.find({
                                courseID: lecture.courseID
                            }, function(err,crs){
                                if(!err) {
                                    if(crs.length > 0){
                                        $('meta[name="course"]').attr('content', crs[0].longName);
                                    }
                                    $('meta[name="author"]').attr('content', lecture.author);
                                    $('meta[name="lecture"]').attr('content', 'Lecture '+order);
                                    $('meta[name="keywords"]').attr('content', keywords);
                                    $('title').text(lecture.title);
                                    var newcontent= $("html").html();                            
                                    fs.writeFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+prevFile+'.html', newcontent, function (err) {
                                        if (err) {
                                        
                                            response.writeHead(500, {
                                                'Content-Type': 'text/plain'
                                            });
                                            response.write('Problem with saving lecture file: '+err);
                                            response.end();
                                        }else{
                                            
                                            
                                            fs.rename(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+prevFile+'.html', SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html', function (err) {
                                                if (err) {
                                        
                                                    response.writeHead(500, {
                                                        'Content-Type': 'text/plain'
                                                    });
                                                    response.write('Problem with saving lecture file: '+err);
                                                    response.end();
                                                }else{
                                                    console.log(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html');
                                                    response.writeHead(200, {
                                                        'Content-Type': 'application/json'
                                                    });
                                                    response.write(JSON.stringify(lecture, null, 4));
                                                    response.end();
                                                
                                                }
                                                
                                                
                                            });
                                            
                                            
                                            
                                          
                                        }
                                    });  
                                }else{
                                    response.writeHead(500, {
                                        'Content-Type': 'text/plain'
                                    });
                                    response.write('Problem with saving lecture file - error during retrieving course info: '+err);
                                    response.end();
                                }
                        
                            });   
                        }
                        catch(err){
                            response.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                            response.write('Error while parsing document: '+err);
                            response.end();
                        }
                    }
                }
            }); 
        }
    });
}

app.get('/api/:course/:lecture', function(request, response){
    Lecture.find({
        isActive:true,
        courseID: request.params.course,
        lectureID:request.params.lecture
        
    }, function(err,lectures){
        if(!err){
            if(lectures.length > 0) {
                response.writeHead(200, {
                    "Content-Type": "application/json"
                });
                response.write(JSON.stringify(lectures[0], null, 4));
                response.end();  
            } else {
                response.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                response.write("Lecture not found");
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


/**
 * Tests if string ends with given suffix
 */
function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}