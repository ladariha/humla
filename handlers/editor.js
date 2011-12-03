var parseURL = require('url').parse;
var path = require('path');
var querystring = require('querystring');
var fs     = require('fs');
var jsdom = require('jsdom');
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
            res.writeHead(405, {
                'Content-Type': 'text/plain'
            });
            res.write('405 Method Not Allowed');
            res.end();
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
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
        
            res.write(err.message);
            res.end();  
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
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.write('Error while parsing document by jsdom');
                        res.end();   
                    }else{
                        try{
                            var $ = window.$;
                            var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#/"+slide;
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
                            if(slideSend===0){
                                res.writeHead(404, {
                                    'Content-Type': 'text/plain'
                                });
                                res.write("Slide "+slide+" not found");
                                res.end();
                            }else{
                                fs.writeFile(htmlfile, newcontent, function (err) {
                                    if (err) {
                                        res.writeHead(500, {
                                            'Content-Type': 'text/plain'
                                        });
                                        res.write('Problem with saving document: '+err);
                                        res.end();
                                    }else{
                                        res.writeHead(200, {
                                            'Content-Type': 'application/json'
                                        });
                                        var t = {};
                                        t.URL = "http://"+resourceURL+"/v1";
                                        t.html =  "Document updated, <a href=\"http://"+resourceURL+"/v1\">back to presentation</a>";
                                        res.write(JSON.stringify(t, null, 4));
                                        res.end();
                                    }
                                });
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
        res.writeHead(400, {
            'Content-Type': 'text/plain'
        });
        
        res.write("Missing field \"slide\"" );
        res.end();   
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
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
        
            res.write(err.message);
            res.end();  
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
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.write('Error while parsing document by jsdom');
                        res.end();   
                    }else{
                        try{
                            var $ = window.$;
                            var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#/"+(slide+1);
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
                            newcontent = newcontent.replace(/\&amp;/g,'&');
                       
                            if(slideSend===0){
                                res.writeHead(404, {
                                    'Content-Type': 'text/plain'
                                });
                                res.write("Slide "+slide+" not found");
                                res.end();
                            }else{
                                fs.writeFile(htmlfile, newcontent, function (err) {
                                    if (err) {
                                        
                                        res.writeHead(500, {
                                            'Content-Type': 'text/plain'
                                        });
                                        res.write('Problem with saving document: '+err);
                                        res.end();
                                    }else{
                                        
                                        res.writeHead(200, {
                                            'Content-Type': 'application/json'
                                        });
                                        var t = {};
                                        t.URL = "http://"+resourceURL+"/v1";
                                        t.html =  "Document updated, <a href=\"http://"+resourceURL+"/v1\">back to presentation</a>";
                                        res.write(JSON.stringify(t, null, 4));
                                        res.end();
                                    }
                                });
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
    });
}

function editSlideContent(course, lecture, slide, content, res, host){
    var pathToCourse = '/'+course+'/';
    var htmlfile = SLIDES_DIRECTORY+pathToCourse+lecture+".html";
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
        
            res.write(err.message);
            res.end();  
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
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.write('Error while parsing document by jsdom');
                        res.end();   
                    }else{
                        try{
                            var $ = window.$;
                            var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#/"+slide;
                            var slideCounter=1;
                            var toReturn = "";
                            $('body').find('.slide').each(function(){
                                if(slideCounter === slide){                            
//                                    $(this).html(content);
                                    $(this).replaceWith(content);
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });   

                            var newcontent= $("html").html();                            
                            newcontent = newcontent.replace(/\&amp;/g,'&');
                            if(slideSend===0){
                                res.writeHead(404, {
                                    'Content-Type': 'text/plain'
                                });
                                res.write("Slide "+slide+" not found");
                                res.end();
                            }else{
                                fs.writeFile(htmlfile, newcontent, function (err) {
                                    if (err) {
                                        
                                        res.writeHead(500, {
                                            'Content-Type': 'text/plain'
                                        });
                                        res.write('Problem with saving document: '+err);
                                        res.end();
                                    }else{
                                        
                                        res.writeHead(200, {
                                            'Content-Type': 'application/json'
                                        });
                                        var t = {};
                                        t.URL = "http://"+resourceURL+"/v1";
                                        t.html =  "Document updated, <a href=\"http://"+resourceURL+"/v1\">back to presentation</a>";
                                        res.write(JSON.stringify(t, null, 4));
                                        res.end();
                                    }
                                });
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
    var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#/"+slide;
    getDocumentFromFileSystem(res, req, htmlfile, slide,resourceURL)   
}

function getDocumentFromFileSystem(res, req, htmlfile, slide,resourceURL){
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.write(err.message);
            res.end();  
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
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.write('Error while parsing document by jsdom');
                res.end();   
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
                                res.writeHead(500, {
                                    'Content-Type': 'text/plain'
                                });
        
                                res.write(err.message);
                                res.end();  
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
                            res.writeHead(404, {
                                'Content-Type': 'text/plain'
                            });
                            res.write("Slide "+slide+" not found");
                            res.end();
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