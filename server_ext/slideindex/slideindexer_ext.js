var parseURL = require('url').parse;
var exec = require('child_process').exec;
var querystring = require('querystring');
var http = require('http');
var https = require('https');
var jsdom = require('jsdom');
var fs     = require('fs');
//var jquery = fs.readFileSync('./public/lib/jquery-1.6.3.min.js').toString();
var jquery = fs.readFileSync('./public/lib/jquery-1.7.min.js').toString();
var path = require('path');
var RAW_SLIDES_DIRECTORY = '/data/slides';
var JSON_DIRECTORY = (path.join(path.dirname(__filename), '../../cache/index')).toString();
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../../public/data/slides')).toString();
var EXTENSIONS_DIRECTORY = (path.join(path.dirname(__filename), './ext')).toString();
var GENERAL_LECTURE_NAME = 'lecture';
var extensions = new Array();
var defaults = require('../../handlers/defaults');

fs.readdir( EXTENSIONS_DIRECTORY, function( err, files ) { // require() all js files in humla extensions directory
    files.forEach(function(file) {
        if(endsWith(file, "js")){
            var req = require( EXTENSIONS_DIRECTORY+'/'+file );
            extensions.push(req);
        }
    });
});

var slideindexer={};

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


exports.index = function(course, lecture, format, url, callback){
    getIndex(undefined, course, lecture, format, url, "true",callback );
};

exports.indexRest = getIndex;

/**
 * Returns slide's index given by URL or course name and lecture<br/> 
 * @param 
 */
function getIndex(res, course, lecture, alt, url, refresh, callback){
    
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
                        getDocumentFromFileSystem(res, pathToCourse,filename, lecture, course, alt,callback);
                    }else{
                        if(alt==="json"){
                            
                            returnData(res, 'application/json', callback, data.toString());
                        }else{
                            returnData(res, 'application/xml', callback, data.toString());
                        }
                    }
                });
            }else{
                if(typeof url == "undefined"){
                    getDocumentFromFileSystem(res, pathToCourse,filename, lecture, course, alt, callback);
                }else{
                    getDocumentFromUrl(res, url, pathToCourse, filename, lecture, course, alt,callback);    
                }      
                    
            } 
        });
    }else{ // parse the document again and update JSON index file
        if(refresh==="true"){
            if(typeof  url == "undefined"){
                getDocumentFromFileSystem(res, pathToCourse,filename, lecture, course, alt,callback);
            }else{
                getDocumentFromUrl(res, url, pathToCourse, filename,lecture, course, alt,callback);    
            }            
        }else{
            returnThrowError(400,  "Invalid value or parameter \"refresh\"", res, callback);
        }
    }
}
function returnData(res, contentType, callback, data){
    if(typeof res!="undefined"){
        res.writeHead(200, {
            'Content-Type': contentType
        });
        res.write(data);
        res.end();
    }else{
        if(typeof callback!="undefined")
            callback(null, data);
        else
            throw "Nor HTTP Response or callback function defined!";
    }
}

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
 * @param res http response to be returned (only used if index is retrieving via HTTP REST)
 * @param body html source code to be parsed
 * @param pathToCourse name of folder for courses's slides and indices, for example "/mdw/"
 * @param filename file name (without preffix) based on lecture order, for example "lecture1"
 * @param lecture
 * @param course
 * @param alt - output format, either json or xml (case sensitive)
 * * @param callback if index is retrieving via internal API, the callback parameter is a function that will be called when index is constructed
 *
 */
function parseDocument(res, body, pathToCourse, filename, lecture, course, alt,callback){
    console.log("PARSUJU");
    jsdom.env({
        html: body,
        src: [
        jquery
        ],
        done: function(errors, window) {
            if(errors){
                returnThrowError(500, 'Error while parsing document by jsdom', res, callback);
            }else{
                try{
                    var $ = window.$;
                    var slideIndex = {
                        pathToCourse : pathToCourse,
                        format : alt,
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
                                    textindex = JSON.stringify(this.content, null, 4);
                                    returnData(this.response, 'application/json', callback, textindex);
                                }else if(this.format==="xml"){
                                    textindex = createXMLIndex(this, 'index', encodeURIComponent(this.baseURL));
                                    returnData(this.response, 'application/xml', callback,textindex);
                                }else{ // JS object
                                    returnData(this.response, '', callback, this.content);
                                }

                                var pathToCourse = this.pathToCourse;
                                var slideIndex  = this;
                                var file = this.filename;
                                if(this.format==="json" || this.format==="xml"){
                                    path.exists(JSON_DIRECTORY+pathToCourse, function (exists) {
                                        if(exists){

                                            fs.writeFile(JSON_DIRECTORY+pathToCourse+file+"."+slideIndex.format, textindex, function (err) {
                                                if (err) {
                                                    console.error('Error while saving '+err);
                                                }else{
                                                    console.log('It\'s saved!'+JSON_DIRECTORY+"/"+ pathToCourse+file+"."+slideIndex.format);
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
                    returnThrowError(500, 'Error while parsing document: '+err, res, callback);
                }
            }
        }
    }); 
}

/**
 * Returns html document from remote URL
 * @deprecated
 * @param res http response to be returned (only used if index is retrieving via HTTP REST)
 * @param url URL address from which the document should be downloaded
 * @param pathToCourse name of folder for courses's slides and indices, for example "/mdw/"
 * @param filename file name (without preffix) based on lecture order, for example "lecture1"
 * @param lecture
 * @param course
 * @param alt - output format, either json or xml (case sensitive)
 * @param callback if index is retrieving via internal API, the callback parameter is a function that will be called when index is constructed
 */
function getDocumentFromUrl(res, url, pathToCourse, filename, lecture, course, alt, callback){
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
        //statusCode = res.statusCode; // PROBABLY USELESS
        res.on('data', function (chunk) {
            content += chunk;
        });

        res.on('end', function () {
            if(res.statusCode === 200){
                parseDocument(res, content, pathToCourse, filename,lecture, course, alt, callback);
            }else{
                defaults.returnError(res.statusCode, content, res);
            }   
        }); 
    });
    request.end();
    request.on('error', function(e) {
        returnThrowError(500, e.message, res, callback);
    });
}


/**
 * Returns html document from file system
 * @param res http response to be returned (only used if index is retrieving via HTTP REST)
 * @param pathToCourse name of folder for courses's slides and indices, for example "/mdw/"
 * @param filename file name (without preffix) based on lecture order, for example "lecture1"
 * @param lecture
 * @param course
 * @param alt - output format, either json or xml (case sensitive)
 * @param callback if index is retrieving via internal API, the callback parameter is a function that will be called when index is constructed
 */
function getDocumentFromFileSystem(res, pathToCourse, filename, lecture, course, alt,callback){
    fs.readFile(SLIDES_DIRECTORY+pathToCourse+filename+".html", function (err, data) {
        if (err){
            returnThrowError(500, err.message, res, callback);  
        }else{
            parseDocument(res, data, pathToCourse, filename,lecture, course, alt,callback);   
        }
    });
}

/**
 * Parses titles from document
 * @param slideIndex data container
 * @param $ jQuery object
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
 * @param slideIndex data container
 * @param $ jQuery object
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
            image.slideURL = slideIndex.baseURL+"#!/"+slide; // this corresponds to number in slide's URL, so first slide has number 1
            image.type = 'picture';
            slideIndex.content.images.push(image);
        });
        
        $(this).find('pre').each(function(){
            code = {};
            code.slideURL = slideIndex.baseURL+"#!/"+slide;
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

/**
 * Process information about titles/chapters/sections and make them hierarchical
 *@param slideIndex data container
 *@return hiararchical structure
 */
function makeStructureHierarchical(slideIndex){
    var sections = {};
    var newcontent = new Array();
    var baseURL = slideIndex.host+ RAW_SLIDES_DIRECTORY+"/"+slideIndex.course+"/"+slideIndex.lecture+".html"; //GENERAL_LECTURE_NAME+
    var counter = 1;
    slideIndex.baseURL = baseURL;
    baseURL = baseURL + "#!/";
    for(var section in slideIndex.content.slides.sectionSlide){
        counter++;
        var tmp = {};
        //        tmp.chapters = new Array();
        tmp.title  = slideIndex.content.slides.sectionSlide[section];
        tmp.url = baseURL+counter;
        for(var ch in slideIndex.content.slides.chapterSlide){
            if(slideIndex.content.slides.chapterSlide[ch].parentSection == section){
                if(typeof tmp.chapters=="undefined"){
                    tmp.chapters = new Array();
                }
                counter++;    
                var chapter = {};
                chapter.title = slideIndex.content.slides.chapterSlide[ch].title;
                chapter.url = baseURL+counter;
                for(var s in slideIndex.content.slides.simpleSlide){
                    if(slideIndex.content.slides.simpleSlide[s].parentChapter == ch){
                        if(typeof chapter.slides=="undefined"){
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

/**
 * Transforms javascript representation of slideIndexer to a XML format
 *@param slideIndexer data container
 *@param root xml root element (if undefined <code>data</code> is used
 *@param url value of url attribute of xml root element
 *@return xml representation of slideIndexer
 */
function createXMLIndex(slideIndexer, root, url){
    return defaults.objectToXML(slideIndexer.content, root, url);
}

/**
 * Tests if string ends with given suffix
 */
function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}

