var parseURL = require('url').parse;
var path = require('path');
var querystring = require('querystring');
var fs     = require('fs');
var jsdom = require('jsdom');
var http = require('http');
//var jquery = fs.readFileSync('./public/lib/jquery-1.6.3.min.js').toString();
var jquery = fs.readFileSync('./public/lib/jquery-1.7.min.js').toString();
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var SLIDE_TEMPLATE = (path.join(path.dirname(__filename),'../public/data/templates')).toString();
var editorAPI={};
editorAPI.urls = [ // list of available URL that this plugin handles
    ['^/api/[A-Za-z0-9-_]+/[A-Za-z0-9-_]+/slide[0-9]+/editor',  editor],
    ];
var mongoose = require("mongoose");
var Slideid = mongoose.model("Slideid");

/**
 * General router for editor API
 */
app.all('/api/:course/:lecture/slide:id/editor', function api(req, res) { // TODO check changes in url
    var query = require('url').parse(req.url).query;
    var args, path = parseURL(req.url).pathname;
    for (var i=0, n = editorAPI.urls.length; i<n; i++) { // projde vsechna url
        args = (new RegExp(editorAPI.urls[i][0])).exec(path);
        if (args !== null){ // if shoda 
            args.shift();
            args.unshift(res, req);
            if (typeof passed_args == 'array')
                args.concat(passed_args);
            editorAPI.urls[i][1].apply(this, args);
        }
    }
}
);

/**
 * Routes requests based on HTTP method
 */
function editor(res, req){    
    switch(req.method){
        case 'GET':
            getSlide(res, req);
            break;
        case 'PUT':
            editSlide(res, req);
            break;
        case 'DELETE':
            deleteSlide(res, req);
            break;
        default:
            returnEditorError(405, "Method not Allowed", res);
    }   
}

/**
 * Removes given slide from presentation and update slide ids
 */
function deleteSlide(res, req){
    var host = req.headers.host;
    var regx =/^\/api\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\/slide([0-9]+)\/editor/; 
    req.url.match(regx);
    var course = RegExp.$1;
    var lecture = RegExp.$2;
    var slide = RegExp.$3;
    var pathToCourse = '/'+course+'/';
    var htmlfile = SLIDES_DIRECTORY+pathToCourse+lecture+".html";
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnEditorError(500, err.message,res); 
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
                        returnEditorError(500, "Error while parsing document by jsdom", res);  
                    }else{
                        try{
                            var $ = window.$;
                            var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#!/"+slide;
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
                                returnEditorError(404, "Slide "+slide+" not found", res);
                            }else{
                               addIDsToSlidesAndWriteToFile(newcontent, course, lecture, res, resourceURL, htmlfile);
                            }
                        }
                        catch(err){    
                            returnEditorError(500, 'Error while parsing document: '+err.message, res);
                        }
                    }
                }
            });   
        }
    });
     
    
}

/**
 * Calls methods for editing slides. If append in URL is set to true then new slide is appended to presentation
 */
function editSlide(res, req){
    var host = req.headers.host;
    var regx =/^\/api\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\/slide([0-9]+)\/editor/; 
    req.url.match(regx);
    var course = RegExp.$1;
    var lecture = RegExp.$2;
    var slide = RegExp.$3;
    if(req.body == undefined || req.body.slide == undefined){
        returnEditorError(400, 'Missing field \"slide\" ', res); 
    }else{
        var content=req.body.slide;
        var append = req.body.append;
        if(append==="true"){
            editSlideContentAppend(course, lecture, slide, content, res, host);
        }else{
            editSlideContent(course, lecture, slide, content, res, host);
        } 
    }
}


function editSlideContentAppend(course, lecture, slide, content, res, host){
    var pathToCourse = '/'+course+'/';
    var htmlfile = SLIDES_DIRECTORY+pathToCourse+lecture+".html";
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnEditorError(500, err.message, res);
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
                        returnEditorError(500, 'Error while parsing document by jsdom ', res);
                    }else{
                        try{
                            var $ = window.$;
                            var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#!/"+(slide+1);
                            var slideCounter=1;
                            $('body').find('.slide').each(function(){
                                if(slideCounter === slide){                            
                                    //                                    $(this).after("<div class=\"slide\">"+content+"</div>");
                                    $(this).after(content);
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });   
                            var newcontent= $("html").html();
                            if(slideSend===0){
                                returnEditorError(404, "Slide "+slide+" not found", res);
                            }else{
                               addIDsToSlidesAndWriteToFile(newcontent, course, lecture, res, resourceURL, htmlfile);
                            }
                        }
                        catch(err){
                            returnEditorError(500, 'Problem while parsing document: '+err.message, res);
                        }
                    }
                }
            });   
        }
    });
}

function editSlideContent(course, lecture, slide, content, res, host){
    var pathToCourse = '/'+course+'/';
    var htmlfile = SLIDES_DIRECTORY+pathToCourse+lecture+".html";
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnEditorError(500, err.message, res);
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
                        returnEditorError(500, 'Problem while parsing document by jsdom ', res);
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
                                returnEditorError(404, "Slide "+slide+" not found", res);
                            }else{
                               addIDsToSlidesAndWriteToFile(newcontent, course, lecture, res, resourceURL, htmlfile);
                            }
                        }
                        catch(err){
                            returnEditorError(500, 'Problem while parsing document ', res);
                        }
                    }
                }
            });   
        }
    });
}

function getSlide(res, req){
    
    var regx =/^\/api\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\/slide([0-9]+)\/editor/; 
    req.url.match(regx);
    var course = RegExp.$1;
    var lecture = RegExp.$2;
    var slide = RegExp.$3;
    var pathToCourse = '/'+course+'/';
    var htmlfile = SLIDES_DIRECTORY+pathToCourse+lecture+".html";
    var host = req.headers.host;
    var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#!/"+slide;
    getDocumentFromFileSystem(res, req, htmlfile, slide,resourceURL)   
}

/**
 * Reads presentation file if possible
 */
function getDocumentFromFileSystem(res, req, htmlfile, slide,resourceURL){
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnEditorError(500, err.message, res);
        }else{
            parseDocument(res, req, data, slide, resourceURL);   
        }
    });
}


/**
 * Returns concrete slide given by slide parameter
 */
function parseDocument(res, req, htmlfile, slide, resourceURL){
    slide  = parseInt(slide);
    var slideSend=0;
    jsdom.env({
        html: htmlfile,
        src: [
        jquery
        ],
        done: function(errors, window) {
            if(errors){
                returnEditorError(500, 'Error while parsing document by jsdom ', res);
            }else{
                try{
                    var $ = window.$;
                    var slideCounter=1;

                    $('body').find('.slide').each(function(){
                        if(slideCounter === slide){                            
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            var r = {};
                            r.url = resourceURL;
                            r.html = $("<div />").append($(this).clone()).html();
                            //                            r.html= $(this).html();
                            res.write(JSON.stringify(r, null, 4));
                            res.end();
                            slideSend = 1;
                        }
                        slideCounter++;
                    });   
  
                    if(slideSend === 0 && slide===0){
                        var tmpl = querystring.parse(parseURL(req.url).query)['tmpl'];
                        
                        tmpl = parseInt(tmpl);
                        if(isNaN(tmpl))
                            tmpl=0;
                        
                        fs.readFile(SLIDE_TEMPLATE+'/'+tmpl+'.html', function (err, data) {
                            if (err){
                                returnEditorError(500, err.message, res);
                            }else{
                                var r = {};
                                r.url = resourceURL;
                                r.html= data.toString();
                                res.write(JSON.stringify(r, null, 4));
                                res.end();
                                slideSend = 1;
              
                            }
                        });
                    
                    }else{
                        if(slideSend===0){
                            returnEditorError(404, "Slide "+slide+" not found", res);
                        }
                    }
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



app.get('/api/template/:templateID/editor', function api(req, res) {
    var template = req.params.templateID;
    fs.readFile(SLIDE_TEMPLATE+'/'+template+'.html', function (err, data) {
        if (err){
            returnEditorError(500, err.message, res);
        }else{
            var r = {};
            r.html= data.toString();
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.write(JSON.stringify(r, null, 4));
            res.end();
        }
    });
});


app.get('/api/:course/:lecture/editor', function api(req, res) { // TODO check changes in url

    var course = req.params.course;//RegExp.$1;
    var lecture = req.params.lecture;
    var htmlfile = SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html";
    if(endsWith(lecture, ".html")){
        htmlfile = SLIDES_DIRECTORY+ '/'+course+'/'+lecture;
    }
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnEditorError(500, err.message, res);
        }else{
        
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(data);
            res.end();
        }
    });
});

app.put('/api/:course/:lecture/raw/editor', function api(req, res) {
    var course = req.params.course;//RegExp.$1;
    var lecture = req.params.lecture;
    var htmlfile = SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html";
    var resourceURL = req.headers.host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html";
    addIDsToSlidesAndWriteToFile(req.body.content, course, lecture, res, resourceURL, htmlfile);
});

app.put('/api/:course/:lecture/editor', function api(req, res) { // TODO check changes in url

    var course = req.params.course;//RegExp.$1;
    var lecture = req.params.lecture;
    var data_slide = req.body;
    var host = req.headers.host;   
    var pathToCourse = '/'+course+'/';
    var htmlfile = SLIDES_DIRECTORY+pathToCourse+lecture+".html";
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnEditorError(500, err.message, res);
        }else{

            var slideSend=0;
            jsdom.env({
                html: htmlfile,
                src: [
                jquery
                ],
                done: function(errors, window) {
                    if(errors){
                        returnEditorError(500, 'Error while parsing document by jsdom '+err.message, res);
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
                            returnEditorError(500, 'Error while parsing document: '+err.message, res);
                        }
                    }
                }
            });   
        }
    });
});


function refreshIndexFile(course, lecture, host){
    
    
    // refesh JSON
    var url = "http://"+host+'/api/'+course+'/'+lecture+'/index?refresh=true';
    //    url = url.replace('http://',''); // TODO no support for other than HTTP protocol
    var stop = url.indexOf('/');
    var content = '';
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

function addIDsToSlidesAndWriteToFile(slide, courseID, lecture, res, lectureURL, file){
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
            html:slide,
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
                                        console.error("Error removing slideid");
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
                                        console.error("Error updating slideid");
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
                                console.error("Error saving new slideid");
                            }
                        });   
                    }
                    //write to file
                    writeToFile(res, file, lectureURL, newcontent);
                    }else{
                        console.error(errors);
                    } 
                }});
        } else {
            res.writeHead(500, {
                "Content-Type": "text/plain"
            });
            res.write("Problems with database");
            res.end();   
        }             
    });
}

function writeToFile(res, file, lectureUrl, content){
    fs.writeFile(file, content, function (err) {
        if (err) {
            returnEditorError(500, 'Problem with saving document: '+err.message, res);
        }else{
                                        
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            var t = {};
            t.URL = "http://"+lectureUrl;
            t.html =  "Document updated, <a href=\"http://"+lectureUrl+"\">back to presentation</a>";
            res.write(JSON.stringify(t, null, 4));
            res.end();                                    
        }
    });   
}

function returnEditorError(code, msg, res){
    res.writeHead(code, {
        'Content-Type': 'text/plain'
    });
    res.write(msg);
    res.end();
}

function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}
