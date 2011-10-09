var parseURL = require('url').parse;
var path = require('path');
var fs     = require('fs');
var jsdom = require('jsdom');
var jquery = fs.readFileSync('./public/lib/jquery-1.6.3.min.js').toString();
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();

var editorAPI={};
editorAPI.urls = [ // list of available URL that this plugin handles
    ['^/api/[A-Za-z0-9-_]+/[A-Za-z0-9-_]+/slide[0-9]+/editor',  editor],
    ];

app.all('/api/:lecture/:course/slide:id/editor', function api(req, res) {
    var query = require('url').parse(req.url).query;
    var args, path = parseURL(req.url).pathname;
    for (var i=0, n = editorAPI.urls.length; i<n; i++) { // projde vsechna url
        args = new RegExp(editorAPI.urls[i][0]).exec(path);
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

function editor(response, request){
    switch(request.method){
        case 'GET':
            getSlide(response, request);
            break;
        case 'PUT':
            editSlide(response, request);
            break;
//        case 'POST':
//            editSlide(response, request);
//            break;
        default:
            response.writeHead(405, {
                'Content-Type': 'text/plain'
            });
            response.write('405 Method Not Allowed');
            response.end();
    }   
}

function editSlide(response, request){
    var regx =/^\/api\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\/slide([0-9]+)\/editor/; 
    request.url.match(regx);
    var course = RegExp.$1;
    var lecture = RegExp.$2;
    var slide = RegExp.$3;
    if(request.body === undefined || request.body.slide === undefined){
        response.writeHead(400, {
            'Content-Type': 'text/plain'
        });
        
        response.write("Missing field \"slide\"" );
        response.end();   
    }else{
        var content=request.body.slide;
        var host = request.headers.host;
        console.log(content);// FIX CONTENT NENI UPLNY :(
        editSlideContent(course, lecture, slide, content, response, host);
    
    }
 
}


function editSlideContent(course, lecture, slide, content, response, host){
    var pathToCourse = '/'+course+'/';
    var htmlfile = SLIDES_DIRECTORY+pathToCourse+lecture+".html";
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
        
            response.write(err.message);
            response.end();  
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
                        response.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        response.write('Error while parsing document by jsdom');
                        response.end();   
                    }else{
                        try{
                            var $ = window.$;
                            var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#/"+slide;
                            var slideCounter=1;
                            var toReturn = "";
                            $('body').find('.slide').each(function(){
                                if(slideCounter === slide){                            
                                    $(this).html(content);
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });   
                            
                            
                            
                            if(slideSend === 0 && slideCounter === slide){
                                $('.slide').last().after(content);
                                slideSend=1;
                            }
                            var newcontent= $("html").html();
                            if(slideSend===0){
                                response.writeHead(404, {
                                    'Content-Type': 'text/plain'
                                });
                                response.write("Slide "+slide+" not found");
                                response.end();
                            }else{
                                fs.writeFile(htmlfile, newcontent, function (err) {
                                    if (err) {
                                        console.error('Error while saving '+err);
                                        response.writeHead(500, {
                                            'Content-Type': 'text/plain'
                                        });
                                        response.write('Problem with saving document: '+err);
                                        response.end();
                                    }else{
                                        console.log('It\'s saved!');
                                        response.writeHead(200, {
                                            'Content-Type': 'text/html'
                                        });
                                        toReturn = "Document updated, <a href=\"http://"+resourceURL+"\">back to presentation</a>";
                                        response.write(toReturn);
                                        response.end();
                                    }
                                });
                            }
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

function getSlide(response, request){
    
    var regx =/^\/api\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\/slide([0-9]+)\/editor/; 
    request.url.match(regx);
    var course = RegExp.$1;
    var lecture = RegExp.$2;
    var slide = RegExp.$3;
    var pathToCourse = '/'+course+'/';
    var htmlfile = SLIDES_DIRECTORY+pathToCourse+lecture+".html";
    var host = request.headers.host;
    var resourceURL = host+ RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+".html#/"+slide;
    getDocumentFromFileSystem(response, request, htmlfile, slide,resourceURL)   
}

function getDocumentFromFileSystem(response, request, htmlfile, slide,resourceURL){
    fs.readFile(htmlfile, function (err, data) {
        if (err){
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            response.write(err.message);
            response.end();  
        }else{
            parseDocument(response, request, data, slide, resourceURL);   
        }
    });
}



function parseDocument(response, request, htmlfile, slide, resourceURL){
    slide  = parseInt(slide);
    var slideSend=0;
    jsdom.env({
        html: htmlfile,
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
                    var slideCounter=1;
                    $('body').find('.slide').each(function(){
                        if(slideCounter === slide){                            
                            response.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                            var r = {};
                            r.url = resourceURL;
                            r.html= $(this).html();
                            response.write(JSON.stringify(r, null, 4));
                            response.end();
                            slideSend = 1;
                        }
                        slideCounter++;
                    });   
  
                    if(slideSend === 0 && slideCounter === slide){
                    // TODO return template for new empty slide
                    }
                    if(slideSend===0){
                        response.writeHead(404, {
                            'Content-Type': 'text/plain'
                        });
                        response.write("Slide "+slide+" not found");
                        response.end();
                    }
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