var parseURL = require('url').parse;
var path = require('path');
var querystring = require('querystring');
var fs     = require('fs');
var jsdom = require('jsdom');
var http = require('http');
var jquery = fs.readFileSync('./public/lib/jquery-1.7.min.js').toString();
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../../public/data/slides')).toString();
var SLIDE_TEMPLATE = (path.join(path.dirname(__filename),'../../public/data/templates')).toString();
var mongoose = require("mongoose");
var Slideid = mongoose.model("Slideid");

var defaults = require('../../handlers/defaults');

/**
 * Returns HTML source code of given slide. 
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param course course ID
 * @param lecture lecture ID (lecture1...)
 * @param slide slide number
 * @param host hostname
 * @param res HTTP response
 * @param callback callback function
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.getSlide = function(course, lecture, slide, host, res, callback){
    var htmlfile = SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html";
    var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#!/"+slide;
    getDocumentFromFileSystem(res, htmlfile, slide,resourceURL, callback);   
}

/**
 *Removes given slide from presentation
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param course course ID
 * @param lecture lecture ID (lecture1...)
 * @param slide slide number
 * @param host hostname
 * @param res HTTP response
 * @param callback callback function
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.removeSlide = function(course ,lecture, slide, host, res, callback){
    var htmlfile = SLIDES_DIRECTORY+'/'+course+'/'+lecture+".html";
    var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#!/"+slide;
    deleteSlide(res, htmlfile, slide, resourceURL, course, lecture, callback);
}

/**
 * Replaces content of slide with data given by parameter content
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param course course ID
 * @param lecture lecture ID (lecture1...)
 * @param slide slide number
 * @param host hostname
 * @param res HTTP response
 * @param content new slide content (html text)
 * @param callback callback function
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.editSlide = function(course ,lecture, slide, host, res, content,callback){
 editSlideContent(course, lecture, slide, content, res, host, callback);
}

/**
 * Appends new slide after slide given by parameters
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param course course ID
 * @param lecture lecture ID (lecture1...)
 * @param slide slide number
 * @param host hostname
 * @param res HTTP response
 * @param content new slide content to be appended (html text)
 * @param callback callback function
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.appendSlide = function(course ,lecture, slide, host, res, content, callback){
    editSlideContentAppend(course, lecture, slide, content, res, host, callback);
}

/**
 * Returns slide template
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param templateNumber number of template
 * @param res HTTP response
 * @param callback callback function
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.getTemplate = function(templateNumber, res, callback){     
    fs.readFile(SLIDE_TEMPLATE+'/'+templateNumber+'.html', function (err, data) {
        if (err){
            returnThrowError(500, err.message, res, callback);
        }else{
            var r = new HTMLContent('', data.toString());
            r.html= data.toString();
            returnData(res, callback, r);
        }
    });
}

/**
 * Returns HTML source code of entire presentation
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param course course ID
 * @param lecture lecture ID
 * @param res HTTP response
 * @param callback callback function
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.getLecture = function(course, lecture, res, callback){
    var htmlfile = SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html";
    if(endsWith(lecture, ".html")){
        htmlfile = SLIDES_DIRECTORY+ '/'+course+'/'+lecture;
    }
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnThrowError(500, err.message, res, callback);
        }else{
            returnDataHTML(res, callback, data);
        }
    });
}

/**
 * Replaces presentation source code with given content parameter
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param course course ID
 * @param lecture lecture ID (lecture1...)
 * @param host hostname
 * @param res HTTP response
 * @param content new presentation content
 * @param callback callback function
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.editLecture = function(course, lecture, host, res, content, callback){
    var htmlfile = SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html";
    var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html";
    addIDsToSlidesAndWriteToFile(content, course, lecture, res, resourceURL, htmlfile, callback);
}

exports.editLectureViewMode = function(course, lecture, host,  res, data_slide, callback){
    var htmlfile = SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html";
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnThrowError(500, err.message, res, callback);
        }else{
            jsdom.env({
                html: htmlfile,
                src: [
                jquery
                ],
                done: function(errors, window) {
                    if(errors){
                        defaults.returnError(500, 'Error while parsing document by jsdom '+err.message, res);
                    }else{
                        try{
                            var $ = window.$;
                            var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html";
                            var slideCounter=0;

                            $('body').find('.slide').each(function(){
                                if(data_slide.content[slideCounter]!=null){
                                    $(this).replaceWith(data_slide.content[slideCounter]);    
                                }
                                slideCounter++;
                            });   
                            var newcontent= $("html").html();    
                            addIDsToSlidesAndWriteToFile(newcontent, course, lecture, res, resourceURL, htmlfile);
                        }
                        catch(err){
                            returnThrowErrorr(500, 'Error while parsing document: '+err.message, res, callback);
                        }
                    }
                }
            });   
        }
    });
    
}
/**
 * Performs the actual appending
 * @param course course ID (like "mdw")
 * @param lecture lecture ID (like "lecture1")
 * @param slide number of slide after which new content will be appended
 * @param content content to be appended
 * @param res HTTP response object
 * @param host hostname (domain)
 * @param callback callback function to be called
 */
function editSlideContentAppend(course, lecture, slide, content, res, host, callback){
    var pathToCourse = '/'+course+'/';
    var htmlfile = SLIDES_DIRECTORY+pathToCourse+lecture+".html";
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnThrowError(500, err.message, res,callback);
        }else{
            slide  = parseInt(slide);
            var slideSend=0;
            jsdom.env({
                html: htmlfile,
                src: [
                jquery
                ],
                done: function(errors, window) {
                    if(errors){
                        returnThrowError(500, 'Error while parsing document by jsdom ', res, callback);
                    }else{
                        try{
                            var $ = window.$;
                            var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#!/"+(slide+1);
                            var slideCounter=1;
                            $('body').find('.slide').each(function(){
                                if(slideCounter === slide){                            
                                    $(this).after(content);
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });   
                            var newcontent= $("html").html();
                            if(slideSend===0){
                                returnThrowError(404, "Slide "+slide+" not found", res, callback);
                            }else{
                                addIDsToSlidesAndWriteToFile(newcontent, course, lecture, res, resourceURL, htmlfile, callback);
                            }
                        }
                        catch(err){
                            returnThrowError(500, 'Problem while parsing document: '+err.message, res, callback);
                        }
                    }
                }
            });   
        }
    });
}

/**
 * Performs the actual editing
 * @param course course ID (like "mdw")
 * @param lecture lecture ID (like "lecture1")
 * @param slide number of slide to be edited
 * @param content new content of the edited slide
 * @param res HTTP response object
 * @param host hostname (domain)
 * @param callback callback function to be called
 */
function editSlideContent(course, lecture, slide, content, res, host, callback){
    var pathToCourse = '/'+course+'/';
    var htmlfile = SLIDES_DIRECTORY+pathToCourse+lecture+".html";
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnThrowError(500, err.message, res, callback);
        }else{
            
            slide  = parseInt(slide);
            var slideSend=0;
            jsdom.env({
                html: htmlfile,
                src: [
                jquery
                ],
                done: function(errors, window) {
                    if(errors){
                        returnThrowError(500, 'Problem while parsing document by jsdom ', res, callback);
                    }else{
                        try{
                            var $ = window.$;
                            var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#!/"+slide;
                            var slideCounter=1;
                            $('body').find('.slide').each(function(){
                                if(slideCounter === slide){                            
                                    $(this).replaceWith(content);
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });   

                            var newcontent= $("html").html();                
                            if(slideSend===0){
                                returnThrowError(404, "Slide "+slide+" not found", res, callback);
                            }else{
                                addIDsToSlidesAndWriteToFile(newcontent, course, lecture, res, resourceURL, htmlfile);
                            }
                        }
                        catch(err){
                            returnThrowError(500, 'Problem while parsing document ', res, callback);
                        }
                    }
                }
            });   
        }
    });
}

/**
 * Removes given slide from presentation and update slide ids
 */
function deleteSlide(res, htmlfile, slide, resourceURL, course, lecture, callback){

    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnThrowError(500, err.message,res, callback); 
        }else{
            slide  = parseInt(slide);
            var slideSend=0;
            jsdom.env({
                html: htmlfile,
                src: [
                jquery
                ],
                done: function(errors, window) {
                    if(errors){
                        returnThrowError(500, "Error while parsing document by jsdom", res, callback);  
                    }else{
                        try{
                            var $ = window.$;
                            var slideCounter=1;
                            $('body').find('.slide').each(function(){
                                if(slideCounter === slide){                            
                                    $(this).remove();
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });   

                            var newcontent= $("html").html();
                            if(slideSend===0){
                                returnThrowError(404, "Slide "+slide+" not found", res, callback);
                            }else{
                                addIDsToSlidesAndWriteToFile(newcontent, course, lecture, res, resourceURL, htmlfile,callback);
                            }
                        }
                        catch(err){    
                            returnThrowError(500, 'Error while parsing document: '+err.message, res, callback);
                        }
                    }
                }
            });   
        }
    });
     
    
}

/**
 * Adds, updates and removes IDs of slides. First of all, all slideids are loaded from db,  then ids for new 
 * slides are created, existing ids altered (i.e. after inserting/removing slides) and all deleted ids from 
 * HTML source are deleted from db as well.
 * @param content HTML source code of presentation
 * @param courseID course ID ("mdw")
 * @param lecture lecture ID ("lecture1")
 * @param res HTTP response
 * @param lectureURL URL address of presentation
 * @param file file where the presentation should be stored in
 * @param callback
 */
function addIDsToSlidesAndWriteToFile(content, courseID, lecture, res, lectureURL, file,callback){
    var prefix =new RegExp("^"+courseID+"_"+lecture+"_");
    Slideid.find({
        slideid: prefix
    }, function(err,crs){   
        if(!err) {
            var slidesToDelete = new Array();
            for(var i=0;i<crs.length;i++){
                slidesToDelete[crs[i].slideid]=1;
            }

            jsdom.env({
                html:content,
                src: [
                jquery
                ],
                done : function(errors, window) {
                    if(!errors){
                        var $ = window.$;
                        var d = new Date().getTime();
                        var updatedid = [];
                        var newids = new Array();
                        var it = 0;
                        var counter = 0;
            
                        $('body').find('.slide').each(function(){
                            counter++;
                            if (!$(this).attr('data-slideid')) { // slide doesn't have ID => all following slideids have to be update
                                var n = courseID+"_"+lecture+"_"+counter+"_"+(d+it);
                                $(this).attr('data-slideid', n);
                                newids.push(n);
                                it++;
                            }else{
                                delete slidesToDelete[$(this).attr('data-slideid')]; // this slideid is used, no need to delete it from db
                                if($(this).attr('data-slideid').indexOf( courseID+"_"+lecture+"_"+counter+"_", 0)<0){ // slide number is changed => update slideid
                                    var parts = ($(this).attr('data-slideid')).split("_");
                                    updatedid[$(this).attr('data-slideid')] = parts[0]+"_"+parts[1]+"_"+counter+"_"+parts[3];    // counter is a new slide number
                                    $(this).attr('data-slideid', parts[0]+"_"+parts[1]+"_"+counter+"_"+parts[3]);
                                }            
                            } 
                        });
                        var newcontent= $("html").html();    
                        newcontent = "<!DOCTYPE html><html>"+newcontent+"</html>";
                        // delete slidesToDelete
                        for(var key in slidesToDelete){
                            for(var k = 0;k<crs.length;k++){
                                if(crs[k].slideid===key){
                                    crs[k].remove(function (err){
                                        returnThrowError("Error removing slideid", callback);
                                    });
                                }
                            }
                        }
                    
                        // update existingids (slideid is unique!)
                        for(var key2 in updatedid){
                            for(var h = 0;h<crs.length;h++){
                                if(crs[h].slideid===key2){
                                    crs[h].slideid=updatedid[key2];
                                    crs[h].save(function(err) {
                                        if(err) {
                                            returnThrowError("Error updating slideid", callback);
                                        }
                                    });   
                                }
                            }
                        }
                        // insert new ids
                        for(var key3 in newids){
                            var sid = new Slideid();
                            sid.slideid = newids[key3];
                            sid.save(function(err) {
                                if(err) {
                                    returnThrowError("Error saving new slideid", callback);
                                }
                            });   
                        }
                        //write to file
                        writeToFile(res, file, lectureURL, newcontent, callback);
                    }else{
                        returnThrowError(500, errors, res, callback);
                    } 
                }
            });
        } else {
            returnThrowError(500, "Problems with database", res, callback); 
        }             
    });
}

function writeToFile(res, file, lectureUrl, content, callback){
    fs.writeFile(file, content, function (err) {
        if (err) {
            returnThrowError(500, 'Problem with saving document: '+err.message, res, callback);
        }else{
            var t = new HTMLContent("http://"+lectureUrl, "Document updated, <a href=\"http://"+lectureUrl+"\">back to presentation</a>");
            returnData(res, callback, t);

        }
    });   
}

/**
 * Reads presentation file if possible
 * @param res HTTP response
 * @param htmlfile actual presentation file to be read from
 * @param slide number of slide to be find
 * @param resourceURL URL of the presentation
 * @param callback
 */
function getDocumentFromFileSystem(res, htmlfile, slide,resourceURL, callback){
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnThrowError(500, err.message, res, callback);
        }else{
            parseDocument(res, data, slide, resourceURL, callback);   
        }
    });
}

/**
 * Returns concrete slide given by slide parameter
 * @param res HTTP response
 * @param html HTML source code of the presentation
 * @param slide number of slide to be processed
 * @param resourceURL URL of the presentation
 * @param callback
 */
function parseDocument(res, html, slide, resourceURL, callback){
    slide  = parseInt(slide);
    var slideSend=0;
    jsdom.env({
        html: html,
        src: [
        jquery
        ],
        done: function(errors, window) {
            if(errors){
                returnThrowError(500,  'Error while parsing document by jsdom ', res, callback);
            }else{
                try{
                    var $ = window.$;
                    var slideCounter=1;

                    $('body').find('.slide').each(function(){
                        if(slideCounter === slide){
                            var r = new HTMLContent(resourceURL, $("<div />").append($(this).clone()).html());
                            returnData(res, callback, r);
                            slideSend = 1;
                        }
                        slideCounter++;
                    });   
                    if(slideSend===0)
                        returnThrowError(404, "Slide "+slide+" not found", res, callback);
                }
                catch(err){
                    returnThrowError(500,'Error while parsing document: '+err, res, callback);
                }
            }
        }
    }); 
}

/**
 * Returns data in json format (if it's called via REST) or  calls  callback with javascript object as parameter
 * @param res HTTP response (if called via REST)
 * @param callback callback function (if called via internal API)
 * @param data data to be retuned
 */
function returnData(res, callback, data){
    if(typeof res!="undefined"){
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(JSON.stringify(data, null ,4));
        res.end();
    }else{
        if(typeof callback!="undefined")
            callback(null, data);
        else
            throw "Nor HTTP Response or callback function defined!";
    }
}

/**
 * Returns data in plain html format (if it's called via REST) or  calls  callback with javascript object as parameter
 * @param res HTTP response (if called via REST)
 * @param callback callback function (if called via internal API)
 * @param data data to be retuned
 */
function returnDataHTML(res, callback, data){
    if(typeof res!="undefined"){
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.write(data);
        res.end();
    }else{
        if(typeof callback!="undefined"){
            var o = {};
            o.html = data;
            callback(null, o);
        }else
            throw "Nor HTTP Response or callback function defined!";
    }
}

/**
 * Indicates error. If it's called via REST, reponse with error code and msg is returned. If it is called 
 * internally then callback function is called (with parameter is error msg, second null)
 * @param code HTTP status code
 * @param msg error message
 * @param res HTTP response
 * @param callback callback function
 */
function returnThrowError(code, msg, res, callback){
    if(typeof res!="undefined")
        defaults.returnError(code, msg, res);
    else{
        if(typeof callback!="undefined"){
            callback(msg, null);
        }else{
            throw msg;
        }
    }       
}

function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}


/**
 * Refreshes index files for given presentation. It should be called every time some edits are made
 * @param course course ID ("mdw")
 * @param lecture lecture ID ("lecture1")
 * @param host hostname (domain)
 */
function refreshIndexFile(course, lecture, host){
    
    var url = "http://"+host+'/api/'+course+'/'+lecture+'/index?refresh=true';
    //    url = url.replace('http://',''); // TODO no support for other than HTTP protocol
    var stop = url.indexOf('/');
    var options = {
        host: url.substring(0, stop),
        port: 80,
        path: url.substring(stop),
        method: 'GET'
    };

    var request = http.request(options, function(res) {});
    request.end();
    
    // refresh XML
    url = url +"&alt=xml";
    options = {
        host: url.substring(0, stop),
        port: 80,
        path: url.substring(stop),
        method: 'GET'
    };

    var request2 = http.request(options, function(res) {});
    request2.end();
    
}



/**
 * Instance of this function is always returned by this extension. If editor_ext is called via REST
 * then it returns JSON.stringify(instance, undefined, 4) of this function. If it's called internally then
 * the object itself is returned
 * @param url URL address of given slide/lecture
 * @param htmlCode html source code of given item (or status message in HTML form)
 */
function HTMLContent(url, htmlCode){
    this.url = url;
    this.html = htmlCode;
}