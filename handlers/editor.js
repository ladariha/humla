var parseURL = require('url').parse;
var path = require('path');
var querystring = require('querystring');
var fs     = require('fs');
var jsdom = require('jsdom');
var http = require('http');
var jquery = fs.readFileSync('./public/lib/jquery-1.6.3.min.js').toString();
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var SLIDE_TEMPLATE = (path.join(path.dirname(__filename),'../public/data/templates')).toString();
var editorAPI={};
editorAPI.urls = [ // list of available URL that this plugin handles
    ['^/api/[A-Za-z0-9-_]+/[A-Za-z0-9-_]+/slide[0-9]+/editor',  editor],
    ];

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
                            var toReturn = "";
                            $('body').find('.slide').each(function(){
                                if(slideCounter === slide){                            
                                    $(this).remove();
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });   

                            var newcontent= $("html").html();
                            newcontent = "<!DOCTYPE html><html>"+newcontent.replace(/\&amp;/g,'&')+"</html>";
                            if(slideSend===0){
                                returnEditorError(404, "Slide "+slide+" not found", res);
                            }else{
                                fs.writeFile(htmlfile, newcontent, function (err) {
                                    if (err) {
                                        returnEditorError(500, 'Problem with saving document: '+err.message, res);
                                    }else{
                                        res.writeHead(200, {
                                            'Content-Type': 'application/json'
                                        });
                                        var t = {};
                                        t.URL = "http://"+resourceURL+"/v1";
                                        t.html =  "Document updated, <a href=\"http://"+resourceURL+"\">back to presentation</a>";
                                        res.write(JSON.stringify(t, null, 4));
                                        res.end();
                                    }
                                });
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


function editSlide(res, req){
    var host = req.headers.host;
    var regx =/^\/api\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\/slide([0-9]+)\/editor/; 
    req.url.match(regx);
    var course = RegExp.$1;
    var lecture = RegExp.$2;
    var slide = RegExp.$3;
    if(req.body === undefined || req.body.slide === undefined){
        returnEditorError(400, 'Missing field \"slide\" ', res); 
    }else{
        var content=req.body.slide;
        var append = req.body.append;
        content = decodeURIComponent(content);
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
                            var toReturn = "";
                            $('body').find('.slide').each(function(){
                                if(slideCounter === slide){                            
                                    //                                    $(this).after("<div class=\"slide\">"+content+"</div>");
                                    $(this).after(content);
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });   
                            var newcontent= $("html").html();
                            //                            newcontent = newcontent.replace(/\&amp;/g,'&');
                            newcontent = "<!DOCTYPE html><html>"+newcontent.replace(/\&amp;/g,'&')+"</html>";
                            if(slideSend===0){
                                returnEditorError(404, "Slide "+slide+" not found", res);
                            }else{
                                fs.writeFile(htmlfile, newcontent, function (err) {
                                    if (err) {
                                        returnEditorError(500, 'Problem with saving document: '+err.message, res);
                                    }else{
                                        
                                        res.writeHead(200, {
                                            'Content-Type': 'application/json'
                                        });
                                        var t = {};
                                        t.URL = "http://"+resourceURL+"/v1";
                                        t.html =  "Document updated, <a href=\"http://"+resourceURL+"\">back to presentation</a>";
                                        res.write(JSON.stringify(t, null, 4));
                                        res.end();
                                    }
                                });
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
                            var toReturn = "";
                            $('body').find('.slide').each(function(){
                                if(slideCounter === slide){                            
                                    $(this).replaceWith(content);
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });   

                            var newcontent= $("html").html();                            
                            //newcontent = newcontent.replace(/\&amp;/g,'&');
                            newcontent = "<!DOCTYPE html><html>"+newcontent.replace(/\&amp;/g,'&')+"</html>";
                            if(slideSend===0){
                                returnEditorError(404, "Slide "+slide+" not found", res);
                            }else{
                                fs.writeFile(htmlfile, newcontent, function (err) {
                                    if (err) {
                                        returnEditorError(500, 'Problem with saving document: '+err.message, res);
                                    }else{
                                        
                                        res.writeHead(200, {
                                            'Content-Type': 'application/json'
                                        });
                                        var t = {};
                                        t.URL = "http://"+resourceURL+"/v1";
                                        t.html =  "Document updated, <a href=\"http://"+resourceURL+"\">back to presentation</a>";
                                        res.write(JSON.stringify(t, null, 4));
                                        res.end();
                                    }
                                });
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

function getDocumentFromFileSystem(res, req, htmlfile, slide,resourceURL){
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            returnEditorError(500, err.message, res);
        }else{
            parseDocument(res, req, data, slide, resourceURL);   
        }
    });
}



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
                'Content-Type': 'text/plain'
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
    fs.writeFile(htmlfile, decodeURIComponent(req.body.content), function (err) {
        if (err) {
            returnEditorError(500, 'Problem with saving document: '+err.message, res);
        }else{
                                        
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            var t = {};
            t.URL = "http://"+resourceURL;
            t.html =  "Document updated, <a href=\"http://"+resourceURL+"\">back to presentation</a>";
            res.write(JSON.stringify(t, null, 4));
            res.end();                                    
        }
    });   
    
});

app.put('/api/:course/:lecture/editor', function api(req, res) { // TODO check changes in url

    var course = req.params.course;//RegExp.$1;
    var lecture = req.params.lecture;
    var d = decodeURIComponent(req.body.content);
    var host = req.headers.host;
    //    console.log(d);
    var data_slide = eval('(' +d+')');
    console.log("DATA RECEIVED");
 
    
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
                            var toReturn = "";

                            $('body').find('.slide').each(function(){
                                if(data_slide.content[slideCounter]!=null){
                                    $(this).replaceWith(data_slide.content[slideCounter]);    
                                }
                                slideCounter++;
                            });   
                            var newcontent= $("html").html();    
                            newcontent = "<!DOCTYPE html><html>"+newcontent.replace(/\&amp;/g,'&')+"</html>";
                            fs.writeFile(htmlfile, newcontent, function (err) {
                                if (err) {
                                    returnEditorError(500, 'Problem with saving document: '+err.message, res);
                                }else{
                                        
                                    res.writeHead(200, {
                                        'Content-Type': 'application/json'
                                    });
                                    var t = {};
                                    t.URL = "http://"+resourceURL;
                                    t.html =  "Document updated, <a href=\"http://"+resourceURL+"\">back to presentation</a>";
                                    res.write(JSON.stringify(t, null, 4));
                                    res.end();
                                    
                                // TODO FIX for some reasons it throws Error: ENOTFOUND, Domain name not found
                                // tried with following URL:
                                // http://127.0.0.1:1338/api/MI-MDW/lecture1/index?refresh=true 
                                // 127.0.0.1:1338/api/MI-MDW/lecture1/index?refresh=true
                                // temporary fallback => it's called in client side :(
                                //   refreshIndexFile(course, lecture, host);
                                    
                                    
                                }
                            });   
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
    console.log("URL JE "+url);
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
