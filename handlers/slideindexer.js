var parseURL = require('url').parse;
var exec = require('child_process').exec;
var querystring = require('querystring');
var http = require('http');
var https = require('https');
var jsdom = require('jsdom');
var fs     = require('fs');
var jquery = fs.readFileSync('./public/lib/jquery-1.6.3.min.js').toString();
var path = require('path');
var RAW_SLIDES_DIRECTORY = '/data/slides';
var JSON_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/index')).toString();
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var EXTENSIONS_DIRECTORY = (path.join(path.dirname(__filename), './ext')).toString();
var GENERAL_LECTURE_NAME = 'lecture';
var extensions = new Array();

fs.readdir( EXTENSIONS_DIRECTORY, function( err, files ) { // require() all js files in humla extensions directory
    files.forEach(function(file) {
        if(endsWith(file, "js")){
            var req = require( EXTENSIONS_DIRECTORY+'/'+file );
            extensions.push(req);
        }
    });
});

var slideindexer={};
slideindexer.urls = [ // list of available URL that this plugin handles
    ['^/api/[A-Za-z0-9-_]+/[A-Za-z0-9-_]+/index',  index],
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
 *  <li>URL: /api/{course}/{lectureX}/index - where X is number of lecture</li>
 *  <li>HTTP Methods: GET </li>
 *  <li>Parameters:
 *  <ul>
 *  <li>(optional) refresh: if you want to update index file; value: true</li>
 *  <li>optionally:
 *  <ul>
 *  <li>url: full url of slide presentation encoded with decodeURI(); value: url address </li>
 *  </ul>
 *  </li>
 *  </ul>
 *  </li>
 *  </ul>
 *  <p>
 *  Sample urls:
 *  <ul>
 *  <li>api/mdw/lecture1/index</li>
 *  <li>api/mdw/lecture1/index?refresh=true</li>
 *  <li>api/mdw/lecture1/index?url=[url]</li>
 *  </ul>
 *  </p>
 *  </div>
 */

app.all('/api/:course/:lecture/index', function api(req, res) {
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
);


/**
 * api/slideindexer/index
 * 
 */
function index(res, req){
    switch(req.method){
        case 'GET':
            //            getDocumentFromUrl(res, request)
            getIndex(res, req);
            break;
        default:
            res.writeHead(405, {
                'Content-Type': 'text/plain'
            });
            res.write('405 Method Not Allowed');
            res.end();
    }   
}

/**
 * Returns slide's index given by URL or course name and lecture<br/> 
 */
function getIndex(res, req){
    
    var regx =/^\/api\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\/index/; 
    req.url.match(regx);
    var course = RegExp.$1;
    var lecture = RegExp.$2;
    var url = querystring.parse(require('url').parse(req.url).query)['url'];
    var alt = querystring.parse(require('url').parse(req.url).query)['alt'];
    if(alt == undefined){
        alt = "json"; // set json as default
    }else{
        if(alt!=="json" && alt!=="xml"){
            // incorrect format requested
            res.writeHead(400, { // TODO fix status code
                'Content-Type': 'text/plain'
            });
            res.write("Incorrect value of optional alt attribute. Allowed values are xml or json.");
            res.end();
        }
    }
    var refresh = querystring.parse(require('url').parse(req.url).query)['refresh'];
    var pathToCourse = '/'+course+'/';
    var filename = lecture;
    var indexfile = JSON_DIRECTORY+pathToCourse+filename+"."+alt;
    if(!refresh){
        path.exists(indexfile, function (exists) {
            if(exists){
                fs.readFile(indexfile, function(err, data) {
                    if(err){
                        console.error("ERROR reading "+alt+" file "+indexfile);
                        console.error("   => parsing source html file instead");
                        getDocumentFromFileSystem(res, req, pathToCourse,filename, lecture, course, alt);
                    }else{
                        if(alt==="json"){
                            res.writeHead(200, {
                                'Content-Type': 'application/json'
                            });
                        }else{
                            res.writeHead(200, {
                                'Content-Type': 'application/xml'
                            });
                        }
                        var textindex = data.toString();
                        res.write(textindex);
                        res.end();    
                    }
                });
            }else{
                if(url === undefined){
                    getDocumentFromFileSystem(res, req, pathToCourse,filename, lecture, course, alt);
                }else{
                    getDocumentFromUrl(res, req, url, pathToCourse, filename, lecture, course, alt);    
                }      
                    
            } 
        });
    }else{ // parse the document again and update JSON index file
        if(refresh==="true"){
            if(url === undefined){
                getDocumentFromFileSystem(res, req, pathToCourse,filename, lecture, course, alt);
            }else{
                getDocumentFromUrl(res, req, url, pathToCourse, filename,lecture, course, alt);    
            }            
        }else{
            res.writeHead(400, {
                'Content-Type': 'text/plain'
            });
            res.write("Invalid value or parameter \"refresh\"");
            res.end();  
        }
    }
}

/**
 * Parses html document. This is the new version where parsing of drawings, 
 * github codes etc is left to Humla's extensions. Each extension has to export
 * function parse($,slideIndex), which 
 * takes following parameters:
 * <ul>
 * <li>$ - jQuery operator, so you can perform common jQuery operations</li>
 * <li>slideIndex - object that will be returned in HTTP Request, feel free to add properties that you want to return to client</li>
 * </ul>
 * After parse() method in your extension performs all operations you want, the extensio
 * must call method slideIndex.sendResponse(slideIndex). The slideIndex parameter 
 * is again what will be returned. This calling will notify SlideIndexer that 
 * you have finished. After all extension called sendResponse(), HTTP response
 * will be send to client
 * @param res http response to be returned
 * @param req http request
 * @param body html source code to be parsed
 * @param pathToCourse name of folder for courses's slides and indices, for example "/mdw/"
 * @param filename file name (without preffix) based on lecture order, for example "lecture1"
 * @param lecture
 * @param course
 * @param alt - output format, either json or xml (case sensitive)
 *
 */
function parseDocument(res, req, body, pathToCourse, filename, lecture, course, alt){
    jsdom.env({
        html: body,
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
                    var slideIndex = {
                        pathToCourse : pathToCourse,
                        format : alt,
                        host : req.headers.host,
                        filename : filename,
                        course : course,
                        lecture: lecture,
                        numberOfCalledExtensions : 0,
                        check :0,
                        drawingsCount: 0,
                        images: [],
                        content: {
                            title : "",
                            course : "",
                            lecture : "",
                            keywords: [],
                            numberOfSlide : 0,
                            slides : {
                                titles : [],
                                sectionSlide : [],
                                chapterSlide : [],
                                simpleSlide : []
                                  
                            },
                            images : [],
                            codeBlocks : []                            
                        },
                        sendResponse : function(){
                            this.check = this.check+1;
                            if(this.check === this.numberOfCalledExtensions || this.numberOfCalledExtensions===0){
                       
                                delete this.content.slides;
                                
                                var textindex ="";
                                if(this.format === "json"){
                                    this.response.writeHead(200, {
                                        'Content-Type': 'application/json'
                                    });
                                    textindex = JSON.stringify(this.content, null, 4);
                                }else{
                                    this.response.writeHead(200, {
                                        'Content-Type': 'application/xml'
                                    });
                                    textindex ="<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n<index url='"+encodeURIComponent(this.baseURL)+"'>\n"+createXMLIndex(this)+"\n</index>";
                                }
                                this.response.write(textindex);
                                this.response.end();
                                var pathToCourse = this.pathToCourse;
                                var slideIndex  = this;
                                var file = this.filename;
                                path.exists(JSON_DIRECTORY+pathToCourse, function (exists) {
                                    if(exists){

                                        fs.writeFile(JSON_DIRECTORY+pathToCourse+file+"."+slideIndex.format, textindex, function (err) {
                                            if (err) {
                                                console.error('Error while saving '+err);
                                            }else{
                                                console.log('It\'s saved!'+ pathToCourse+file+"."+slideIndex.format);
                                            }
                                        });
                                    }else{
                
                                        fs.mkdir(JSON_DIRECTORY+pathToCourse, 0777, function(e) {
                                            if(!e){
                                                fs.writeFile(JSON_DIRECTORY+pathToCourse+file+"."+slideIndex.format, textindex, function (err) {
                                                    if (err) {
                                                        console.error('Error while saving '+err);
                                                    }else{
                                                        console.log('It\'s saved!'+ pathToCourse+file+"."+slideIndex.format);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                           
                        }  
                    };
                    slideIndex.response = res;
                    parseTitles(slideIndex, $);
                    slideIndex.content.structure = makeStructureHierarchical(slideIndex);
                    parseImagesAndCodeBlocks(slideIndex,$);
                    
                    
                    extensions.forEach(function (ext){
                        if(ext.parse !== null && typeof ext.parse== 'function'){
                            slideIndex.numberOfCalledExtensions = slideIndex.numberOfCalledExtensions +1;
                        }
                    });
                                        
                    extensions.forEach(function (ext){
                        if(ext.parse !== null && typeof ext.parse== 'function'){
                            ext.parse($,slideIndex);     
                        }
                    });

                    if(slideIndex.numberOfCalledExtensions === 0){
                        slideIndex.sendResponse();
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

/**
 * Returns html document from remote URL
 */
 
function getDocumentFromUrl(res, req, url, pathToCourse, filename, lecture, course, alt){
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

    var request = http.request(options, function(res) {
        res.setEncoding('utf8'); 
        statusCode = res.statusCode;
        res.on('data', function (chunk) {
            content += chunk;
        });

        res.on('end', function () {
            if(res.statusCode === 200){
                parseDocument(res, req, content, pathToCourse, filename,lecture, course, alt);
            }else{
                res.writeHead(res.statusCode, {
                    'Content-Type': 'text/plain'
                });
                res.write(content);
                res.end(); 

            }   
        }); 
    });
    request.end();
    request.on('error', function(e) {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        
        res.write(e.message);
        res.end();  
    });
}


/**
 * Returns html document from file system
 */
 
function getDocumentFromFileSystem(res, req, pathToCourse, filename, lecture, course, alt){
    fs.readFile(SLIDES_DIRECTORY+pathToCourse+filename+".html", function (err, data) {
        if (err){
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
        
            res.write(err.message);
            res.end();  
        }else{
            parseDocument(res, req, data, pathToCourse, filename,lecture, course, alt);   
        }
    });
}

/**
 * Parses titles from document
 */
function parseTitles(slideIndex,$){

    slideIndex.content.title = $('title').text();
    slideIndex.content.course = $('meta[name="course"]').attr('content');
    slideIndex.content.lecture = $('meta[name="lecture"]').attr('content');
    var keywords = $('meta[name="keywords"]').attr('content');
    slideIndex.content.keywords=keywords.split(',');
    slideIndex.content.numberOfSlide = $('div.slide').length+1;// +1 for slide intro
                
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
                        slideIndex.content.slides.sectionSlide.push(decodeURI($(this).text()));
                        slideIndex.content.slides.titles.push(decodeURI($(this).text()));
                    })
                }
                break;
            case 'section':
                parent++;
                var sec='';
                var section = this;
                var section2;
                $(this).children('header').each(function(){
                    if($(this).text()!== ''){
                        sec = decodeURI($(this).text()).trim();
                        //                                        console.log(iterator+'- '+ (sec));
                        slideIndex.content.slides.sectionSlide.push(sec);
                        slideIndex.content.slides.titles.push(sec);
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
                                    slideIndex.content.slides.chapterSlide.push(tmp);
                                    slideIndex.content.slides.titles.push(sec);
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
                                        slideIndex.content.slides.simpleSlide.push(tmp);
                                        slideIndex.content.slides.titles.push(tmpTitle);
                                                    
                                        //                                                        console.log(iterator+'--- '+decodeURI($(this).has('h1').text()).trim());
                                        iterator++;
                                    }else{
                                        tmp = {
                                            parentChapter: chapterParent,
                                            title: sec
                                        };
                                        slideIndex.content.slides.simpleSlide.push(tmp);
                                        slideIndex.content.slides.titles.push(sec);
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
                                slideIndex.content.slides.chapterSlide.push(tmp);
                                slideIndex.content.slides.titles.push(tmpTitle);
                                chapterParent++;
                                //                                                console.log(iterator+'-- '+decodeURI($(this).has('h1').text()).trim());
                                iterator++;
                            }else{
                                tmp = {
                                    parentSection: parent,
                                    title: sec
                                };
                                chapterParent++;
                                slideIndex.content.slides.chapterSlide.push(tmp);
                                slideIndex.content.slides.titles.push(sec);
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
function parseImagesAndCodeBlocks(slideIndex,$){
    var image={};
    var code={};
    var slide=1; //
    if($('body').has('.slide intro').length>0){
    //TODO parse slide intro
    }else{
        slide = 0;
    }
    //    slideIndex.content.codeBlocks = [];
    $('body').find('.slide').each(function(){ // each slide
        
        slide++; // first div with class slide has index 
        $(this).find('img').each(function(){
            image = {};
            image.alt = $(this).prop('alt');
            image.url = $(this).prop('src'); // TODO FIX RELATIVE URL
            image.filename = image.url.substring(image.url.lastIndexOf('/')+1);
            image.slideURL = slideIndex.baseURL+"#/"+slide; // this corresponds to number in slide's URL, so first slide has number 1
            image.type = 'picture';
            slideIndex.content.images.push(image);
        });
        
        $(this).find('pre').each(function(){
            code = {};
            code.slideURL = slideIndex.baseURL+"#/"+slide;
            code.title= slideIndex.content.slides.titles[slide-1];
            var classAtr = $(this).prop('class');
            var i = classAtr.indexOf("brush:")+6;
            var j = classAtr.indexOf(";", i);
            if(j>-1){
                code.language = (classAtr.substring(i,j )).trim();    
            }else{ // case <pre class="brush: js">
                code.language = (classAtr.substring(i)).trim();
            }
            code.language = slideindexer.styles[code.language];
            
            slideIndex.content.codeBlocks.push(code);
        });
    });   
}


function makeStructureHierarchical(slideIndex){
    var sections = {};
    var newcontent = new Array();
    var baseURL = slideIndex.host+ RAW_SLIDES_DIRECTORY+"/"+slideIndex.course+"/"+slideIndex.lecture+".html"; //GENERAL_LECTURE_NAME+
    var counter = 1;
    slideIndex.baseURL = baseURL;
    baseURL = baseURL + "#/";
    for(var section in slideIndex.content.slides.sectionSlide){
        counter++;
        var tmp = {};
        //        tmp.chapters = new Array();
        tmp.title  = slideIndex.content.slides.sectionSlide[section];
        tmp.url = baseURL+counter;
        for(var ch in slideIndex.content.slides.chapterSlide){
            if(slideIndex.content.slides.chapterSlide[ch].parentSection == section){
                if(tmp.chapters==undefined){
                    tmp.chapters = new Array();
                }
                counter++;    
                var chapter = {};
                chapter.title = slideIndex.content.slides.chapterSlide[ch].title;
                chapter.url = baseURL+counter;
                for(var s in slideIndex.content.slides.simpleSlide){
                    if(slideIndex.content.slides.simpleSlide[s].parentChapter == ch){
                        if(chapter.slides==undefined){
                            chapter.slides = new Array();
                        }
                        counter++;
                        var slide = {};
                        slide.title = slideIndex.content.slides.simpleSlide[s].title;
                        slide.url = baseURL+counter;
                        chapter.slides.push(slide);
                    }         
                }   
                tmp.chapters.push(chapter);    
            }       
        }
        newcontent.push(tmp);    
    } 
    sections.index = newcontent;
    return sections;
}

function createXMLIndex(slideIndexer){
    return parseObjectToXML(slideIndexer.content, 0);
}

function parseObjectToXML(object, ind){
    var indentation = "";
    var toReturn = '';
    for (var i = 0;  i < ind*3;  i++) {
        indentation = indentation+" ";
    }
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            toReturn = toReturn + indentation+'<'+encodeURIComponent(key)+'>'+"\n";
            if(typeof(object[key])=='object'){
                var t_ind = ind+1;
                if(object[key].length){
                    toReturn = toReturn+parseArrayToXML(object[key], t_ind ,key);
                }else{
                    toReturn = toReturn+parseObjectToXML(object[key], t_ind);    
                }
                
            }else{
                toReturn = toReturn+indentation+encodeURIComponent(object[key])+"\n";
            }
            toReturn = toReturn + indentation+'</'+encodeURIComponent(key)+'>'+"\n";
        }
    }
    return toReturn;   
}

function parseArrayToXML(array, ind, string){
    var indentation = "";
    var toReturn = '';
    for (var i = 0;  i < ind*3;  i++) {
        indentation = indentation+" ";
    }
    var t_ind = ind+1;
    for(var object in array){
        toReturn = toReturn+indentation+'<'+encodeURIComponent(string)+'_'+object+'>'+"\n";
        if(typeof(array[object])=='object'){
            if(array[object].length){
                toReturn = toReturn+parseArrayToXML(array[object], t_ind, string);
            }else{
                toReturn = toReturn+parseObjectToXML(array[object], t_ind);
            }
        }else{
            toReturn = toReturn+indentation+encodeURIComponent(array[object])+"\n";
        }
        toReturn = toReturn + indentation+'</'+encodeURIComponent(string)+'_'+object+'>'+"\n";
    }
    return toReturn;
}


/**
 * Tests if string ends with given suffix
 */
function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}

