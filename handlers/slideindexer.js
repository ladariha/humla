var parseURL = require('url').parse;
var exec = require('child_process').exec;
var querystring = require('querystring');
var http = require('http');
var https = require('https');
var jsdom = require('jsdom');
var fs     = require('fs');
var jquery = fs.readFileSync('./static/lib/jquery-1.6.3.min.js').toString();
var path = require('path');
var JSON_DIRECTORY = (path.join(path.dirname(__filename), '../../static/data/json')).toString();
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../../static/data/slides')).toString();

var slideindexer={};
slideindexer.urls = [ // list of available URL that this plugin handles
    ['^/api/slideindexer/index',  index],
    ];
    

// taken from http://alexgorbatchev.com/SyntaxHighlighter/manual/brushes/
slideindexer.styles = new Array();
slideindexer.styles["as3"]="ActionScript3";  
slideindexer.styles["actionscipt3"]="ActionScript3";  
slideindexer.styles["bash"]="Bash/shell";
slideindexer.styles["shell"]="Bash/shell";
slideindexer.styles["cf"]="ColdFusion";
slideindexer.styles["coldfusion"]="ColdFusion";
slideindexer.styles["csharp"]="C#";
slideindexer.styles["c-sharp"]="C#";
slideindexer.styles["cpp"]="C++";
slideindexer.styles["c"]="C++";
slideindexer.styles["css"]="CSS";
slideindexer.styles["delphi"]="Delphi";
slideindexer.styles["pas"]="Delphi";
slideindexer.styles["pascal"]="Delphi";
slideindexer.styles["diff"]="Diff";
slideindexer.styles["patch"]="Diff";
slideindexer.styles["erl"]="Erlang";
slideindexer.styles["erlang"]="Erlang";
slideindexer.styles["groovy"]="Groovy";
slideindexer.styles["js"]="JavaScript";  
slideindexer.styles["jscript"]="JavaScript";  
slideindexer.styles["javascript"]="JavaScript";  
slideindexer.styles["java"]="Java";  
slideindexer.styles["javafx"]="JavaFX";  
slideindexer.styles["jfx"]="JavaFX";  
slideindexer.styles["pl"]="Perl";  
slideindexer.styles["perl"]="Perl";  
slideindexer.styles["php"]="PHP";  
slideindexer.styles["plain"]="Plain Text";  
slideindexer.styles["text"]="Plain Text";  
slideindexer.styles["ps"]="PowerShell";  
slideindexer.styles["powershell"]="PowerShell";  
slideindexer.styles["py"]="Python";  
slideindexer.styles["python"]="Python";  
slideindexer.styles["rails"]="Ruby";  
slideindexer.styles["ruby"]="Ruby";  
slideindexer.styles["ror"]="Ruby";  
slideindexer.styles["scala"]="Scala";  
slideindexer.styles["sql"]="SQL";  
slideindexer.styles["vb"]="Visual Basic";  
slideindexer.styles["vbnet"]="Visual Basic";  
slideindexer.styles["xml"]="XML";  
slideindexer.styles["xhtml"]="XML";  
slideindexer.styles["html"]="XML";  
slideindexer.styles["xslt"]="XML";  



/**
 * api/slideindexer/
 * provides routing for slideindexer plugin
 */



/**
 *  slideindexer plugin
 *  <div>Parses html slides and saves their structure to JSON
 *  file, also provides RESTful API for requesting slide's structure. The
 *  parsing is done only once, then the index is saved to json file on disk and
 *  next time a request come, content of the json file is returned. This 
 *  pattern could be different in following circumstances:
 *  <ul>
 *  <li>The JSON file cannot be read - parsing is done again and the file is rewrited</li>
 *  <li>The HTTP Request has parameter "refresh" with vaule set to "true" - it means 
 *  that the index is supposed to be recreated due some updates in source html file</li>
 *  </ul>
 *  </div>
 *  <div>
 *  <h2>RESTful API description</h2>
 *  <ul>
 *  <li>URL: /api/slideindexer/index</li>
 *  <li>HTTP Methods: GET </li>
 *  <li>Parameters:
 *  <ul>
 *  <li>(optional) refresh: if you want to update index file; value: true</li>
 *  <li>One of following:
 *  <ul>
 *  <li> course & lecture
 *  <ul>
 *  <li>course: course code in lower cases; value: par, mdw...</li>
 *  <li>lecture: number of lecture; value: 1,2,...</li>
 *  </ul>
 *  </li>
 *  <li>url: full url of slide presentation encoded with decodeURI(); value: url address </li>
 *  </ul>
 *  </li>
 *  </ul>
 *  </li>
 *  </ul>
 *  <p>
 *  Sample urls:
 *  <ul>
 *  <li>api/slideindexer/index?course=mdw&lecture=1</li>
 *  <li>api/slideindexer/index?course=mdw&lecture=1&refresh=true</li>
 *  <li>api/slideindexer/index?url=[url]</li>
 *  </ul>
 *  </p>
 *  </div>
 */
function api(res, req) {
    //var query = require('url').parse(req.url).query;
    var args, path = parseURL(req.url).pathname;
    for (var i=0, n = slideindexer.urls.length; i<n; i++) { // projde vsechna url
        args = new RegExp(slideindexer.urls[i][0]).exec(path);
        if (args !== null){ // if shoda 
            args.shift();
            args.unshift(res, req);
            if (typeof passed_args == 'array')
                args.concat(passed_args);
            slideindexer.urls[i][1].apply(this, args);
        }
    }
}


/**
 * api/slideindexer/index
 * 
 */
function index(response, request){

    switch(request.method){
        case 'GET':
            //            getDocumentFromUrl(response, request)
            getIndex(response, request);
            break;
        default:
            response.writeHead(405, {
                'Content-Type': 'text/plain'
            });
            response.write('405 Method Not Allowed');
            response.end();
    }   
}

/**
 * Returns slide's index given by URL or course name and lecture<br/> 
 */
function getIndex(response, request){
    
    var course = querystring.parse(require('url').parse(request.url).query)['course'];
    var lecture = querystring.parse(require('url').parse(request.url).query)['lecture'];
    var url = querystring.parse(require('url').parse(request.url).query)['url'];
    var refresh = querystring.parse(require('url').parse(request.url).query)['refresh'];
    var pathToCourse = '/'+course+'/';
    var filename = "lecture"+lecture;
    var indexfile = JSON_DIRECTORY+pathToCourse+filename+".json";
    if(!refresh){
        path.exists(indexfile, function (exists) {
            if(exists){
                fs.readFile(indexfile, function(err, data) {
                    if(err){
                        console.error("ERROR reading JSON file "+indexfile);
                        console.error("   => parsing source html file instead");
                    }else{
                        response.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        var jsonindex = data.toString();
                        response.write(jsonindex);
                        response.end();    
                    }
                });
            }else{
                if(url === undefined){
                    getDocumentFromFileSystem(response, request, pathToCourse,filename);
                }else{
                    getDocumentFromUrl(response, request, url, pathToCourse, filename);    
                }      
                    
            } 
        });
    }else{ // parse the document again and update JSON index file
        if(refresh==="true"){
            if(url === undefined){
                getDocumentFromFileSystem(response, request, pathToCourse,filename);
            }else{
                getDocumentFromUrl(response, request, url, pathToCourse, filename);    
            }            
        }else{
            response.writeHead(400, {
                'Content-Type': 'text/plain'
            });
            response.write("Invalid value or parameter \"refresh\"");
            response.end();  
        }
    }
}

/**
 * Parses html document
 * @param response http response to be returned
 * @param request http request
 * @param body html source code to be parsed
 * @param pathToCourse name of folder for courses's slides and indices, for example "/mdw/"
 * @param filename file name (without preffix) based on lecture order, for example "lecture1"
 *
 */
function parseDocument(response, request, body, pathToCourse, filename){
    jsdom.env({
        html: body,
        src: [
        jquery
        ],
        done: function(errors, window) {
            if(errors){
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write('Error while parsing document by jsdom');
                response.end()   
            }else{
                try{
                    var $ = window.$;
                    var slideIndex = {};
                    var temporary = {};
                    temporary.images = []; // for internal usage only
                    temporary.drawings = [];
                    parseTitles(slideIndex, $);
                    slideIndex.images = [];
                    slideIndex.codeBlocks = [];
                    slideIndex.github= [];
                    slideIndex.drawingsCount = 0;
                    parseImagesAndCodeBlocks(slideIndex,temporary,$);
                    slideIndex.drawings = [];
                    parseDrawingAsync(slideIndex,temporary,response, pathToCourse, filename);
                }catch(err){
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.write('Error while parsing document: '+err.description);
                    response.end() 
                }
                         
            }
        }
    }); 
}

/**
 * Returns html document from remote URL
 */
 
function getDocumentFromUrl(response, request, url, pathToCourse, filename){
    url = decodeURI(url);
    url = url.replace('http://',''); // TODO no support for other than HTTP protocol
    var stop = url.indexOf('/');
    var content = '';
    var options = {
        host: url.substring(0, stop),
        port: 80,
        path: url.substring(stop),
        method: 'GET'
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf8'); 
        statusCode = res.statusCode;
        res.on('data', function (chunk) {
            content += chunk;
        });

        res.on('end', function () {
            if(res.statusCode === 200){
                parseDocument(response, request, content, pathToCourse, filename);
            }else{ // TODO verify
                response.writeHead(res.statusCode, {
                    'Content-Type': 'text/plain'
                });
                response.write(content);
                response.end(); 

            }   
        }); 
    });
    req.end();
    req.on('error', function(e) {
        response.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        
        response.write(e.message)
        response.end()  
    });
}


/**
 * Returns html document from file system
 */
 
function getDocumentFromFileSystem(response, request, pathToCourse, filename){
    fs.readFile(SLIDES_DIRECTORY+pathToCourse+filename+".html", function (err, data) {
        if (err){
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
        
            response.write(err.message)
            response.end()  
        }else{
            parseDocument(response, request, data, pathToCourse, filename);   
        }
    });
}

/**
 * Parses titles from document
 */
function parseTitles(slideIndex,$){

    slideIndex.title = $('title').text();
    slideIndex.course = $('meta[name="course"]').attr('content');
    slideIndex.lecture = $('meta[name="lecture"]').attr('content');
    var keywords = $('meta[name="keywords"]').attr('content');
    slideIndex.keywords=keywords.split(',');
    slideIndex.numberOfSlide = $('div.slide').length+1;// +1 for slide intro
        
    var content = {};
    content.titles = [];
    content.sectionSlide = [];
    content.chapterSlide = [];
    content.simpleSlide = [];
    slideIndex.content = content;
                
    var i=0;
    var iterator=1;
    var parent = -1;
    var chapterParent = -1;
    $('body').children().each(function (){
        switch($(this).prop('tagName').toLowerCase()){
            case 'div':
                if($(this).prop('class') === 'slide'){
                    parent++;
                    $(this).find('hgroup h1').each(function(){
                        //                                        console.log(iterator+'- '+ decodeURI($(this).text()));
                        iterator++;
                        slideIndex.content.sectionSlide.push(decodeURI($(this).text()));
                        slideIndex.content.titles.push(decodeURI($(this).text()));
                    })
                }
                break;
            case 'section':
                parent++; // TODO recheck if increasing here is correct???
                var sec='';
                var section = this;
                var section2;
                $(this).children('header').each(function(){
                    if($(this).text()!== ''){
                        sec = decodeURI($(this).text()).trim();
                        //                                        console.log(iterator+'- '+ (sec));
                        slideIndex.content.sectionSlide.push(sec);
                        slideIndex.content.titles.push(sec);
                        iterator++;
                    }
                    if($(section).has('section').length > 0){
                        $(section).children('section').each(function (){
                            section2=this;
                            $(this).children('header').each(function(){
                                           
                                if($(this).text()!== ''){
                                    sec=decodeURI($(this).text()).trim();
                                    var tmp = {
                                        parentSection: parent,
                                        title: sec
                                    };
                                    slideIndex.content.chapterSlide.push(tmp);
                                    slideIndex.content.titles.push(sec);
                                    chapterParent++;
                                    //                                                    console.log(iterator+'-- '+ decodeURI($(this).text()));
                                    iterator++;                                                
                                }
                                $(section2).find('div > hgroup').each(function (){
                                    if($(this).has('h1').length === 1){
                                        var tmpTitle = decodeURI($(this).has('h1').text()).trim();
                                        tmp = {
                                            parentChapter: chapterParent,
                                            title: tmpTitle
                                        };
                                        slideIndex.content.simpleSlide.push(tmp);
                                        slideIndex.content.titles.push(tmpTitle);
                                                    
                                        //                                                        console.log(iterator+'--- '+decodeURI($(this).has('h1').text()).trim());
                                        iterator++;
                                    }else{
                                        tmp = {
                                            parentChapter: chapterParent,
                                            title: sec
                                        };
                                        slideIndex.content.simpleSlide.push(tmp);
                                        slideIndex.content.titles.push(sec);
                                        //                                                        console.log(iterator+'--- '+sec);
                                        iterator++;
                                    }
                                })
                                            
                            })
                        })                            
                    }else{
                        $(section).find('div > hgroup').each(function (){
                            if($(this).has('h1').length === 1){
                                sec=decodeURI($(this).text()).trim();
                                var tmpTitle = decodeURI($(this).has('h1').text()).trim();
                                var tmp = {
                                    parentSection: parent,
                                    title: tmpTitle
                                };
                                slideIndex.content.chapterSlide.push(tmp);
                                slideIndex.content.titles.push(tmpTitle);
                                chapterParent++;
                                //                                                console.log(iterator+'-- '+decodeURI($(this).has('h1').text()).trim());
                                iterator++;
                            }else{
                                tmp = {
                                    parentSection: parent,
                                    title: sec
                                };
                                chapterParent++;
                                slideIndex.content.chapterSlide.push(tmp);
                                slideIndex.content.titles.push(sec);
                                //                                                console.log(iterator+'-- '+sec);
                                iterator++;
                            }
                        })
                    }
                });                    
                break;
        }
    })
}

/**
 * Parses "img" and "pre" tags from document
 */
function parseImagesAndCodeBlocks(slideIndex,temporary,$){
    //  console.log("   -- parseImagesAndCodeBlocks()");
    var image={};
    var code={};
    var slide=1; //
    if($('body').has('.slide intro').length>0){
    //TODO parse slide intro
    }else{
        slide = 0;
    }
    
    $('body').find('.slide').each(function(){ // each slide
        
        slide++; // first div with class slide has index 
        $(this).find('img').each(function(){
            image = {};
            image.alt = $(this).prop('alt');
            image.filename = $(this).prop('src');
            image.filename = image.filename.substring(image.filename.lastIndexOf('/')+1);
            image.slide = slide; // this corresponds to number in slide's URL, so first slide has number 1
            image.type = 'picture';
            slideIndex.images.push(image);
        });
        
        $(this).find('pre').each(function(){
            code = {};
            code.slide = slide;
            code.title= slideIndex.content.titles[slide-1];
            var classAtr = $(this).prop('class');
            var i = classAtr.indexOf("brush:")+6;
            var j = classAtr.indexOf(";", i);
            if(j>-1){
                code.language = (classAtr.substring(i,j )).trim();    
            }else{ // case <pre class="brush: js">
                code.language = (classAtr.substring(i)).trim();
            }
            code.language = slideindexer.styles[code.language];
            
            slideIndex.codeBlocks.push(code);
        });
        
        $(this).find('.h-github').each(function(){  
            code = {};
            code.owner = $(this).attr('user-repo');
            code.file = $(this).attr('name');
            if(code.owner!==null && code.owner.length>0){
                var githubInfo = (code.owner).split("/");
                code.owner = githubInfo[0];
                if(githubInfo.length===2){
                    code.project = githubInfo[1];
                }
            }
            code.title= slideIndex.content.titles[slide-1];
            code.slide = slide; // this corresponds to number in slide's URL, so first slide has number 1
            slideIndex.github.push(code);
        });
        
        $(this).find('.h-drawing').each(function(){
            slideIndex.drawingsCount++;
            image = {};
            image.alt = $(this).attr('alt'); // prop() doesn't work here
            image.id = $(this).prop('id');
            image.slide = slide; // this corresponds to number in slide's URL, so first slide has number 1
            image.type = 'drawing';
            temporary.drawings.push(image);
        });
    });   
}


/**
 * <b>OBSOLETE</b>, see <code>parseDrawingAsync()</code> instead
 * <p>Parses Google Docs Drawings from document and returns the requested index to client (blocking I/O)</p>
 * @obsolete
 */
function parseDrawings(slideIndex,temporary,response, request, pathToCourse, filename){
    // console.log("   -- parseDrawings()");
    if(temporary.drawings.length>0){ // if there are some drawings left, get their names
        var drawing = temporary.drawings.pop();
        var id = drawing.id;
    
        var options = {
            host: 'docs.google.com',
            port: 443,
            path: '/drawings/d/'+id+'/export/png?id='+id+'&pageid=p',
            method: 'HEAD'
        };

        var req = https.request(options, function(res) {
            if(res.statusCode === 200){
                var contDisp = res.headers["content-disposition"];
                var i = contDisp.indexOf("filename=\"")+10;
                var j = contDisp.lastIndexOf("\"");
                drawing.filename = contDisp.substring(i,j);
                slideIndex.drawings.push(drawing);
                parseDrawings(slideIndex, temporary,response, request, pathToCourse, filename);
            }else{
                // TODO handle error
                drawing.filename = 'Error while requesting from Google Docs '+res.statusCode;
                slideIndex.drawings.push(drawing);
                parseDrawings(slideIndex, temporary,response, request, pathToCourse, filename);
            }
            res.on('data', function(d) {
    
                });
        });
        req.end();

        req.on('error', function(e) {
            console.error(e.message);
            drawing.filename = 'Error while requesting from Google Docs '+e.message;
            slideIndex.drawings.push(drawing);
            parseDrawings(slideIndex, temporary,response, request, pathToCourse, filename);
        });
    }else{
        // all drawings has been processed
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        var jsonindex = JSON.stringify(slideIndex, null, 4);
        response.write(jsonindex);
        response.end();
        path.exists(JSON_DIRECTORY+pathToCourse, function (exists) {
            if(exists){
                fs.writeFile(JSON_DIRECTORY+pathToCourse+filename+".json", jsonindex, function (err) {
                    if (err) {
                        console.error('Error while saving '+err);
                    }else{
                        console.log('It\'s saved!');
                    }
                });
            }else{
                
                fs.mkdir(JSON_DIRECTORY+pathToCourse, 0777, function(e) {
                    if(!e){
                        fs.writeFile(JSON_DIRECTORY+pathToCourse+filename+".json", jsonindex, function (err) {
                            if (err) {
                                console.error('Error while saving '+err);
                            }else{
                                console.log('It\'s saved!');
                            }
                        });
                    }
                });
            }
            
        });   
    }
}

/**
 * Calls method to parse each parsing
 */
function parseDrawingAsync(slideIndex,temporary,response, pathToCourse, filename){
    console.log("Count: "+slideIndex.drawingsCount);
    
    for(i in temporary.drawings){
        parseSingleDrawing(temporary.drawings[i],slideIndex,response, pathToCourse, filename);
    }
    
}

/**
 * Parses single drawing. <p>Based on given drawing id, the HTTP HEAD request is made
 * and filename is taken from HTTP response. After this, the function checks
 * if all drawings have been parsed (variable slideIndex.drawingsCount is decreased
 * by one after each successful parsing), then method <code>sendResponse()</code> is called</p>
 * @param drawing Object that represents drawing, it's property id is use to 
 * identify the drawing on Google Docs
 *
 */
function parseSingleDrawing(drawing,slideIndex,response, pathToCourse, filename){
    
    var id = drawing.id;
    var options = {
        host: 'docs.google.com',
        port: 443,
        path: '/drawings/d/'+id+'/export/png?id='+id+'&pageid=p',
        method: 'HEAD'
    };
    
    var req = https.request(options, function(res) {
        if(res.statusCode === 200){
            var contDisp = res.headers["content-disposition"];
            var i = contDisp.indexOf("filename=\"")+10;
            var j = contDisp.lastIndexOf("\"");
            drawing.filename = contDisp.substring(i,j);
            slideIndex.drawings.push(drawing);
                
        }else{
            // TODO handle error
            drawing.filename = 'Error while requesting from Google Docs '+res.statusCode;
            slideIndex.drawings.push(drawing);
                
        }
        slideIndex.drawingsCount--;
        if(slideIndex.drawingsCount === 0){
            sendResponse(slideIndex,response, pathToCourse, filename); 
        }
            
        res.on('data', function(d) {
    
            });
    });
    req.end();

    req.on('error', function(e) {
        console.error(e.message);
        drawing.filename = 'Error while requesting from Google Docs '+e.message;
        slideIndex.drawings.push(drawing);
        if(slideIndex.drawingsCount === 0){
            sendResponse(slideIndex,response, pathToCourse, filename); 
        }
    });   
}


/**
 * Sends response to client after whole documents is parsed. If index file doesn't exist
 * yet, then it also creates new json index file
 */
function sendResponse(slideIndex,response, pathToCourse, filename){
    
       response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        var jsonindex = JSON.stringify(slideIndex, null, 4);
        response.write(jsonindex);
        response.end();
        path.exists(JSON_DIRECTORY+pathToCourse, function (exists) {
            if(exists){
                fs.writeFile(JSON_DIRECTORY+pathToCourse+filename+".json", jsonindex, function (err) {
                    if (err) {
                        console.error('Error while saving '+err);
                    }else{
                        console.log('It\'s saved!');
                    }
                });
            }else{
                
                fs.mkdir(JSON_DIRECTORY+pathToCourse, 0777, function(e) {
                    if(!e){
                        fs.writeFile(JSON_DIRECTORY+pathToCourse+filename+".json", jsonindex, function (err) {
                            if (err) {
                                console.error('Error while saving '+err);
                            }else{
                                console.log('It\'s saved!');
                            }
                        });
                    }
                });
            }
        }); 
}


exports.api = api;