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
app.post('/api/:course/course', function(req, res){ // TODO database timeout
  
    if(req.body === undefined || req.body.longName === undefined || req.body.longName.length<1 || 
        req.body.isActive === undefined || req.body.isActive.length<1 || req.body.courseID ===undefined ||
        req.body.courseID.length<1 || req.body.owner === undefined || req.body.owner.length<1
        ){
         res.writeHead(400, {
            'Content-Type': 'text/plain'
        });
        
        res.write("Missing fields" );
        res.end();   
    }else{
        Course.find({
            courseID: req.params.course
        }, function(err,crs){   
            if(!err) {
                if(crs.length > 0){
                    res.writeHead(409, {
                        "Content-Type": "text/plain"
                    });
                    res.write("Course already exists");
                    res.end(); 
                }else{
                    var c = new Course();
                    c.longName = decodeURIComponent(req.body.longName);
                    var e = (req.body.isActive).toLowerCase()
                    if(e=='true'){
                        c.isActive = true;
                    }
                    else{
                        c.isActive = false;
                    }
                    c.courseID = decodeURIComponent(req.body.courseID);
                    c.owner = decodeURIComponent(req.body.owner);
                    c.lecturesURLPreffix = req.headers.host+'/data/slides/'+c.courseID;
                    c.url = req.headers.host+'/api/'+c.courseID+'/course';    
                    c.save(function(err) {
                        if(err) {
                            res.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            res.write("Problems with database");
                            res.end();  
                        }else{
                            fs.mkdir(SLIDES_DIRECTORY+'/'+c.courseID, 0777, function(e) {
                                if(!e){
                                    fs.mkdir(SLIDES_DIRECTORY+'/'+c.courseID+'/css', 0777, function(e) {
                                        if(!e){
                                            res.writeHead(200, {
                                                "Content-Type": "application/json"
                                            });
                                            res.write(JSON.stringify(c, null, 4));
                                            res.end(); 
                                   
                                        }else{
                                            res.writeHead(500, {
                                                "Content-Type": "text/plain"
                                            });
                                            res.write("Directory for css for lectures was not created");
                                            res.end(); 
                                        }
                                    });
                                   
                                }else{
                                    res.writeHead(500, {
                                        "Content-Type": "text/plain"
                                    });
                                    res.write("Directory for course was not created");
                                    res.end(); 
                                }
                            });
                        }
                    });   
                }         
            } else {
                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                res.write("Problems with database");
                res.end();   
            }             
        });
    }
}
);
    

/**
 * Edit existing course
 */
app.put('/api/:course/course', function(req, res){
 
    if(req.body === undefined){
        res.writeHead(400, {
            'Content-Type': 'text/plain'
        });
        
        res.write("Missing fields \"course\"" );
        res.end();   
    }else{
        Course.find({
            _id: encodeURIComponent(req.body.id)
        }, function(err,crs){   
            if(!err) {
                if(crs.length > 0){
                    var course = crs[0];
                    if(req.body.isActive!==undefined){
                        var e = (req.body.isActive).toLowerCase()
                        if(e=='true'){
                            course.isActive = true;
                        }
                        else{
                            course.isActive = false;
                        }
                    }
                    var prev = course.courseID;
                    course.courseID = (req.body.courseID === undefined) ? course.courseID : decodeURIComponent(req.body.courseID);
                    course.longName = (req.body.longName === undefined) ? course.longName : decodeURIComponent(req.body.longName);
                    course.owner = (req.body.owner === undefined) ? course.owner : decodeURIComponent(req.body.owner);
                    course.lecturesURLPreffix = req.headers.host+'/data/slides/'+course.courseID;
                    course.url = req.headers.host+'/api/'+course.courseID+'/course';    
                    course.save(function(err) {
                        if (err){
                            res.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            res.write("Problems with database");
                            res.end();  
                        }else{                    
                            fs.rename(SLIDES_DIRECTORY+'/'+prev, SLIDES_DIRECTORY+'/'+course.courseID, function (err) {
                                if (!err){
                                    res.writeHead(200, {
                                        "Content-Type": "application/json"
                                    });
                                    res.write(JSON.stringify(course, null, 4));
                                    res.end(); 
                                    
                                    
                                }else{
                                    res.writeHead(500, {
                                        "Content-Type": "text/plain"
                                    });
                                    res.write("Directory for course was not renamed");
                                    res.end();  
                                }
                                
                            });
                        }
                    });
                }else{
                    res.writeHead(404, {
                        "Content-Type": "text/plain"
                    });
                    res.write("Course not found");
                    res.end();   
                }
              
            } else {
                console.log(encodeURIComponent(req.body.id)+">>"+err);
                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                res.write("Problems with database");
                res.end();   
            
            }             
        });
    }
});




/**
 * Returns course info
 */
app.get('/api/:course/course', function(req, res){
    
    Course.find({
        courseID: req.params.course
    }, function(err,crs){   
        if(!err) {
            if(crs.length > 0){
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.write(JSON.stringify(crs[0], null, 4));
                res.end();  
            } else {
                res.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                res.write("Course not found");
                res.end();  
            
            }   
        }else{
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.write("Problems with database");
            res.end();    
        }
    });
 
});

/*
* Creates lecture
 */
app.post('/api/:course/:lecture/lecture', function(req, res){ // TODO database timeout
    if(req.body === undefined || req.body.title === undefined || req.body.title.length<1 || 
        req.body.isActive === undefined || req.body.isActive.length<1 || req.body.courseID ===undefined ||
        req.body.courseID.length<1 || req.body.author === undefined || req.body.author.length<1
        || req.body.order === undefined || req.body.order<1
        ){
        res.writeHead(400, {
            'Content-Type': 'text/plain'
        });
        
        res.write("Missing fields" );
        res.end();   
    }else{
        Lecture.find({
            courseID: req.params.course,
            order: req.body.order
        }, function(err,crs){   
            if(!err) {
                if(crs.length > 0){
                    res.writeHead(409, {
                        "Content-Type": "text/plain"
                    });
                    res.write("Lecture with given course and order already exists");
                    res.end(); 
                }else{
                    var c = new Lecture();
                    c.title = decodeURIComponent(req.body.title);
                    c.courseID = decodeURIComponent(req.body.courseID);
                    c.lectureID= 'lecture'+decodeURIComponent(req.body.order);
                    c.url = req.headers.host+'/api/'+c.courseID+'/'+c.lectureID;
                    c.presentationURL = req.headers.host+'/data/slides/'+c.courseID+'/'+c.lectureID+'.html';
                    c.authorEmail = (req.body.authorEmail === undefined) ? '' : decodeURIComponent(req.body.authorEmail);
                    c.authorTwitter = (req.body.authorTwitter === undefined) ? '' : decodeURIComponent(req.body.authorTwitter);
                    c.authorWeb = (req.body.authorWeb === undefined) ? '' : decodeURIComponent(req.body.authorWeb);
                    c.semester = (req.body.semester === undefined) ? '' : decodeURIComponent(req.body.semester);
                    c.organization = (req.body.org === undefined) ? '' : decodeURIComponent(req.body.org);
                    c.organizationFac = (req.body.orgfac === undefined) ? '' : decodeURIComponent(req.body.orgfac);
                    c.field = (req.body.spec === undefined) ? '' : decodeURIComponent(req.body.spec);
                    c.web = (req.body.web === undefined) ? '' : decodeURIComponent(req.body.web);
                    c.lectureAbstract = (req.body.abs === undefined) ? '' : decodeURIComponent(req.body.abs);
                    var e = (req.body.isActive).toLowerCase()
                    if(e=='true'){
                        c.isActive = true;
                    }
                    else{
                        c.isActive = false;
                    }

                    c.author = decodeURIComponent(req.body.author);
                    var k = (decodeURIComponent(req.body.keywords)).split(",");
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
                            res.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            res.write("Problems with database");
                            res.end();  
                        }else{
                            path.exists(SLIDES_DIRECTORY+'/'+c.courseID, function (exists) {
                                if(exists){ // course dir exists
                                    copyTemplateHTML(req, res, c, decodeURIComponent(req.body.order), decodeURIComponent(req.body.keywords));
                                }else{ // create dir
                                    
                                    fs.mkdir(SLIDES_DIRECTORY+'/'+c.courseID, 0777, function(e) {
                                        if(!e){
                                            res.writeHead(200, {
                                                "Content-Type": "application/json"
                                            });
                                            res.write(JSON.stringify(c, null, 4));
                                            res.end(); 
                                   
                                        }else{ // copy template
                                            copyTemplateHTML(req, res, c, decodeURIComponent(req.body.order), decodeURIComponent(req.body.keywords));
                                        }
                                    });   
                                } 
                            }); 
                        }
                    });   
                }         
            } else {
                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                res.write("Problems with database");
                res.end();   
            }             
        });
    }
}
);


/*
 * Edit lecture
 */
app.put('/api/:course/:lecture/lecture', function(req, res){ // TODO database timeout
   
    if(req.body === undefined){
        res.writeHead(400, {
            'Content-Type': 'text/plain'
        });
        
        res.write("Missing fields" );
        res.end();   
    }else{
        Lecture.find({
            _id: encodeURIComponent(req.body.id)
        }, function(err,crs){   
            if(!err) {
                if(crs.length > 0){
          
                    var c = crs[0];
                    c.title = (req.body.title === undefined) ? c.title : decodeURIComponent(req.body.title);
                    var prev = c.lectureID;
                    c.lectureID = (req.body.order === undefined) ? c.lectureID :  'lecture'+decodeURIComponent(req.body.order);
                    c.url = req.headers.host+'/api/'+c.courseID+'/'+c.lectureID;
                    c.presentationURL = req.headers.host+'/data/slides/'+c.courseID+'/'+c.lectureID+'.html';
                    
                    if(req.body.isActive!==undefined){
                        var e = (req.body.isActive).toLowerCase()
                        if(e=='true'){
                            c.isActive = true;
                        }
                        else{
                            c.isActive = false;
                        }
                    }
                    
                    c.authorEmail = (req.body.authorEmail === undefined) ? '' : decodeURIComponent(req.body.authorEmail);
                    c.authorTwitter = (req.body.authorTwitter === undefined) ? '' : decodeURIComponent(req.body.authorTwitter);
                    c.authorWeb = (req.body.authorWeb === undefined) ? '' : decodeURIComponent(req.body.authorWeb);
                    c.semester = (req.body.semester === undefined) ? '' : decodeURIComponent(req.body.semester);
                    c.organization = (req.body.org === undefined) ? '' : decodeURIComponent(req.body.org);
                    c.organizationFac = (req.body.orgfac === undefined) ? '' : decodeURIComponent(req.body.orgfac);
                    c.field = (req.body.spec === undefined) ? '' : decodeURIComponent(req.body.spec);
                    c.web = (req.body.web === undefined) ? '' : decodeURIComponent(req.body.web);
                    c.lectureAbstract = (req.body.abs === undefined) ? '' : decodeURIComponent(req.body.abs);
                    c.author = (req.body.author === undefined) ? c.author : decodeURIComponent(req.body.author);
                    if(!req.body.keywords === undefined){
                        var k = (decodeURIComponent(req.body.keywords)).split(",");
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
                            res.writeHead(500, {
                                "Content-Type": "text/plain"
                            });
                            res.write("Problems with database");
                            res.end();  
                        }else{
                            if(prev === c.lectureID){
                                path.exists(SLIDES_DIRECTORY+'/'+c.courseID, function (exists) {
                                    if(exists){ // course dir exists
                                        editTemplateHTML(req, res, c, decodeURIComponent(req.body.order), decodeURIComponent(req.body.keywords));
                                    }else{ // create dir
                                    
                                        fs.mkdir(SLIDES_DIRECTORY+'/'+c.courseID, 0777, function(e) {
                                            if(!e){
                                                res.writeHead(200, {
                                                    "Content-Type": "application/json"
                                                });
                                                res.write(JSON.stringify(c, null, 4));
                                                res.end(); 
                                   
                                            }else{ // copy template
                                                editTemplateHTML(req, res, c, decodeURIComponent(req.body.order), decodeURIComponent(req.body.keywords));
                                            }
                                        });   
                                    } 
                                }); 
                            }else{
                                path.exists(SLIDES_DIRECTORY+'/'+c.courseID, function (exists) {
                                    if(exists){ // course dir exists
                                        editTemplateMoveHTML(prev, req, res, c, decodeURIComponent(req.body.order), decodeURIComponent(req.body.keywords));
                                    }else{ // create dir
                                    
                                        fs.mkdir(SLIDES_DIRECTORY+'/'+c.courseID, 0777, function(e) {
                                            if(!e){
                                                res.writeHead(200, {
                                                    "Content-Type": "application/json"
                                                });
                                                res.write(JSON.stringify(c, null, 4));
                                                res.end(); 
                                   
                                            }else{ // copy template
                                                editTemplateMoveHTML(prev, req, res, c, decodeURIComponent(req.body.order), decodeURIComponent(req.body.keywords));
                                            }
                                        });   
                                    }
                                });
                            }
                        }
                    });
                }else{
                    
                    res.writeHead(409, {
                        "Content-Type": "text/plain"
                    });
                    res.write("Lecture with given course and order doesn't exists");
                    res.end();    
                }         
            } else {
                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                res.write("Problems with database");
                res.end();   
            }             
        });
    }
}
);

function copyTemplateCSS(req, res, lecture, prevFile, longName){
    
    fs.readFile(LECTURE_TEMPLATE+'/meta.css', function(err, data) {
        if(err){
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.write("Cannot load presentation css template");
            res.end();   
        }else{
            var content = data.toString();
            
            content = content.replace("##author", lecture.author);
            content = content.replace("##authoremail", lecture.authorEmail);
            content = content.replace("##authortwitter", lecture.authorTwitter);
            content = content.replace("##authorweb", lecture.authorWeb);
            content = content.replace("##semester", lecture.semester);
            content = content.replace("##org", lecture.organization);
            content = content.replace("##orgfac", lecture.organizationFac);
            content = content.replace("##field", lecture.field);
            content = content.replace("##orgweb", lecture.web);
            content = content.replace("##coursename", longName);
            fs.writeFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/css/meta_'+lecture.lectureID+'.css', content, function (err) {
                if (err) {   
                    res.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    res.write('Problem with saving lecture css file: '+err);
                    res.end();
                }else{
                 
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    res.write(JSON.stringify(lecture, null, 4));
                    res.end();
                }
            });  
            
        // ##coursename
        
        }
    });
}



function moveTemplateCSS(req, res, lecture, prevFile, longName){
    
    fs.readFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/css/meta_'+prevFile+'.css', function(err, data) {
        if(err){
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.write("Cannot load presentation css template "+SLIDES_DIRECTORY+'/'+lecture.courseID+'/css/meta_'+prevFile+'.css  '+err);
            res.end();   
        }else{
            var content = data.toString();
            
            content = content.replace("##author", lecture.author);
            content = content.replace("##authoremail", lecture.authorEmail);
            content = content.replace("##authortwitter", lecture.authorTwitter);
            content = content.replace("##authorweb", lecture.authorWeb);
            content = content.replace("##semester", lecture.semester);
            content = content.replace("##org", lecture.organization);
            content = content.replace("##orgfac", lecture.organizationFac);
            content = content.replace("##field", lecture.field);
            content = content.replace("##orgweb", lecture.web);
            content = content.replace("##coursename", longName);
            fs.writeFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/css/meta_'+lecture.lectureID+'.css', content, function (err) {
                if (err) {   
                    res.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    res.write('Problem with saving lecture css file: '+err);
                    res.end();
                }else{
                    fs.rename(SLIDES_DIRECTORY+'/'+lecture.courseID+'/css/meta_'+prevFile+'.css', SLIDES_DIRECTORY+'/'+lecture.courseID+'/css/meta_'+lecture.lectureID+'.css', function (err) {
                        if (err) {
                                        
                            res.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                            res.write('Problem with saving lecture file: '+err);
                            res.end();
                        }else{
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            res.write(JSON.stringify(lecture, null, 4));
                            res.end();

                        }                    
                    });
                    
                }
            });  
            
        // ##coursename
        }
    });
}



function copyTemplateHTML(req, res, lecture, order,keywords){
    fs.readFile(LECTURE_TEMPLATE+'/presentation.html', function(err, data) {
        if(err){
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.write("Cannot load presentation template");
            res.end();   
        }else{
            var content = data.toString();
            jsdom.env({
                html: LECTURE_TEMPLATE+'/presentation.html',
                src: [
                jquery
                ],
                done: function(errors, window) {
                    if(errors){
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.write('Error while parsing document by jsdom');
                        res.end();   
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
                                    newcontent = newcontent.replace("metaXXX", "meta_"+lecture.lectureID);
                                    newcontent = newcontent.replace(/\&amp;/g,'&');
                                    fs.writeFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html', newcontent, function (err) {
                                        if (err) {
                                        
                                            res.writeHead(500, {
                                                'Content-Type': 'text/plain'
                                            });
                                            res.write('Problem with saving lecture file: '+err);
                                            res.end();
                                        }else{
                                            getCourseFullNameAndContinue(res, req, lecture, lecture.courseID, copyTemplateCSS, '');
                                        //                                            copyTemplateCSS(request, response, lecture);

                                        }
                                    });  
                                }else{
                                    res.writeHead(500, {
                                        'Content-Type': 'text/plain'
                                    });
                                    res.write('Problem with saving lecture file - error during retrieving course info: '+err);
                                    res.end();
                                }
                        
                            });   
                        }
                        catch(err){
                            res.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                            res.write('Error while parsing document: '+err);
                            res.end();
                        }
                    }
                }
            }); 
        }
    });
}


function editTemplateHTML(req, res, lecture, order,keywords){
    fs.readFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html', function(err, data) {
        if(err){
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.write("Cannot load presentation template");
            res.end();   
        }else{
            var content = data.toString();
            jsdom.env({
                html: SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html',
                src: [
                jquery
                ],
                done: function(errors, window) {
                    if(errors){
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.write('Error while parsing document by jsdom');
                        res.end();   
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
                                    newcontent = newcontent.replace("metaXXX", "meta_"+lecture.lectureID);
                                    newcontent = newcontent.replace(/\&amp;/g,'&');
                                    fs.writeFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html', newcontent, function (err) {
                                        if (err) {
                                        
                                            res.writeHead(500, {
                                                'Content-Type': 'text/plain'
                                            });
                                            res.write('Problem with saving lecture file: '+err);
                                            res.end();
                                        }else{
                                            getCourseFullNameAndContinue(res, req, lecture, lecture.courseID, copyTemplateCSS, '');
                                        }
                                    });  
                                }else{
                                    res.writeHead(500, {
                                        'Content-Type': 'text/plain'
                                    });
                                    res.write('Problem with saving lecture file - error during retrieving course info: '+err);
                                    res.end();
                                }
                        
                            });   
                        }
                        catch(err){
                            res.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                            res.write('Error while parsing document: '+err);
                            res.end();
                        }
                    }
                }
            }); 
        }
    });
}

function editTemplateMoveHTML(prevFile, req, res, lecture, order,keywords){
    fs.readFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+prevFile+'.html', function(err, data) {
        if(err){
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.write("Cannot load presentation template");
            res.end();   
        }else{
            var content = data.toString();
            jsdom.env({
                html: SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+prevFile+'.html',
                src: [
                jquery
                ],
                done: function(errors, window) {
                    if(errors){
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.write('Error while parsing document by jsdom');
                        res.end();   
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
                                    newcontent = newcontent.replace("meta_"+prevFile+".css", "meta_"+lecture.lectureID+".css");
                                    newcontent = newcontent.replace(/\&amp;/g,'&');
                                    
                                    fs.writeFile(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+prevFile+'.html', newcontent, function (err) {
                                        if (err) {
                                        
                                            res.writeHead(500, {
                                                'Content-Type': 'text/plain'
                                            });
                                            res.write('Problem with saving lecture file: '+err);
                                            res.end();
                                        }else{
                                            
                                            
                                            fs.rename(SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+prevFile+'.html', SLIDES_DIRECTORY+'/'+lecture.courseID+'/'+lecture.lectureID+'.html', function (err) {
                                                if (err) {
                                        
                                                    res.writeHead(500, {
                                                        'Content-Type': 'text/plain'
                                                    });
                                                    res.write('Problem with saving lecture file: '+err);
                                                    res.end();
                                                }else{
                                                    getCourseFullNameAndContinue(res, req, lecture, lecture.courseID, moveTemplateCSS, prevFile);
                                                }
                                                
                                                
                                            });
                                        }
                                    });  
                                }else{
                                    res.writeHead(500, {
                                        'Content-Type': 'text/plain'
                                    });
                                    res.write('Problem with saving lecture file - error during retrieving course info: '+err);
                                    res.end();
                                }
                        
                            });   
                        }
                        catch(err){
                            res.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                            res.write('Error while parsing document: '+err);
                            res.end();
                        }
                    }
                }
            }); 
        }
    });
}

/*
 * Returns lecture info
 */
app.get('/api/:course/:lecture/lecture', function(req, res, next){
    if(req.params.course==="facet") {
        next(); // TODO: tenhle hack je tu proto, že to místno na facet skákalo sem (stejné url!) TODO: rozlišit url lépe!!
        return;
    }
    Lecture.find({
        isActive:true,
        courseID: req.params.course,
        lectureID:req.params.lecture
        
    }, function(err,lectures){
        if(!err){
            if(lectures.length > 0) {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.write(JSON.stringify(lectures[0], null, 4));
                res.end();  
            } else {
                res.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                res.write("Lecture not found");
                res.end(); 
            }    
        }else{
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.write("Problems with database");
            res.end();   
        }
    });
});

function getCourseFullNameAndContinue(res, req, lecture, id, callback, prevFile){

    Course.find({
        courseID: id
    }, function(err,crs){   
        if(!err) {
            if(crs.length > 0) {
                callback(req, res, lecture, prevFile, crs[0].longName);
            }else{
                res.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                res.write("Lecture not found");
                res.end(); 
            }
            
        }else{
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.write("Problems with database");
            res.end(); 
        }
    });
}

/**
 * Tests if string ends with given suffix
 */
function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}
