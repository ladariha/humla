var fs = require("fs");
var path = require("path");
//var jquery = fs.readFileSync('./public/lib/jquery-1.6.3.min.js').toString();
var jquery = fs.readFileSync('./public/lib/jquery-1.7.min.js').toString();
var jsdom = require('jsdom');
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var LECTURE_TEMPLATE = (path.join(path.dirname(__filename),'../public/data/templates')).toString();
var facet_use_fs = 1;
var mongoose = require("mongoose"); 
var Course = mongoose.model("Course");
var Lecture = mongoose.model("Lecture");
var Slideid = mongoose.model("Slideid");
var defaults = require('./defaults');
var admin_ext =  require('../server_ext/administration/administration_ext.js');
var admin_auth_ext =  require('../server_ext/administration/a_authorization_ext.js');
/**
 * Creates new course (new entry in db, new folder)
 */
app.post('/api/:course/course', function(req, res){ // TODO database timeout
    if(typeof req.body == "undefined" || typeof req.body.longName == "undefined" || req.body.longName.length<1 || 
        typeof req.body.isActive == "undefined" || req.body.isActive.length<1 || typeof req.body.courseID =="undefined"||
        req.body.courseID.length<1 || typeof req.body.owner == "undefined" || req.body.owner.length<1
        ){
        defaults.returnError(400,"Missing fields", res);
    }else{
        var author = admin_auth_ext.user(req, res);
        admin_ext.createCourse(decodeURIComponent(req.body.courseID),  author, decodeURIComponent(req.body.longName), req.body.isActive, decodeURIComponent(req.body.owner), req.headers.host, res);
    }
});
    

/**
 * Edit existing course
 */
app.put('/api/:course/course', function(req, res){
    if(admin_auth_ext.canModifyCourseRealId(req, res, decodeURIComponent(req.body.id))){
        if(typeof req.body == "undefined"){
            defaults.returnError(400,"Missing fields \"course\"", res);
        }else{
            admin_ext.editCourse(decodeURIComponent(req.body.id),req.body.longName, req.body.isActive, req.body.owner, req.headers.host, res);
        }
    }else{
          defaults.returnError(401,"Unauthorized", res);
    }
});

/**
 * Returns course info
 */
app.get('/api/:course/course', function(req, res){
    admin_ext.getCourse(req.params.course, res);
});

/*
* Creates lecture
 */
app.post('/api/:course/:lecture/lecture', function(req, res){ // TODO database timeout
    if(typeof req.body == "undefined"|| typeof req.body.title == "undefined" || req.body.title.length<1 || 
        typeof req.body.isActive == "undefined" || req.body.isActive.length<1 || typeof req.body.courseID =="undefined" ||
        req.body.courseID.length<1 || typeof req.body.author == "undefined" || req.body.author.length<1
        || typeof req.body.order == "undefined" || req.body.order<1
        ){
        defaults.returnError(400,"Missing fields", res);
    }else{
        var author = admin_auth_ext.user(req, res);
        admin_ext.createLecture(req.body.courseID, author, req.body.title, req.body.order,req.body.author, req.body.authorEmail, req.body.authorTwitter, req.body.authorWeb, req.body.semester, req.body.org, req.body.orgfac, req.body.spec, req.body.web, req.body.abs, req.body.isActive, req.body.keywords, req.headers.host, res);
    }
});


/*
 * Edit lecture
 */
app.put('/api/:course/:lecture/lecture', function(req, res){ // TODO database timeout
    if(admin_auth_ext.canModifyLectureRealId(req, res, decodeURIComponent(req.body.id))){
        if(typeof req.body == "undefined"){
            defaults.returnError(400,"Missing fields", res);
        }else{
            admin_ext.editLecture(req.body.id,req.body.title, req.body.order,req.body.author, req.body.authorEmail, req.body.authorTwitter, req.body.authorWeb, req.body.semester, req.body.org, req.body.orgfac, req.body.spec, req.body.web, req.body.abs, req.body.isActive, req.body.keywords, req.headers.host, res);
        }
    }else{
          defaults.returnError(401,"Unauthorized", res);
    }
});

/*
 * Returns lecture info
 */
app.get('/api/:course/:lecture/lecture', function(req, res, next){
    if(req.params.course==="facet") {
        next(); // TODO: tenhle hack je tu proto, že to místno na facet skákalo sem (stejné url!) TODO: rozlišit url lépe!!
        return;
    }
    admin_ext.getLecture(req.params.course, req.params.lecture, res);
});