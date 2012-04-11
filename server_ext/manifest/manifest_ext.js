var https = require('https');
var defaults = require('../../handlers/defaults');
var path = require('path');
var fs     = require('fs');
var jsdom = require('jsdom');
var http = require('http');
var jquery = fs.readFileSync('./public/lib/jquery-1.7.min.js').toString();
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../../public/data/slides')).toString();
var JSON_DIRECTORY = (path.join(path.dirname(__filename), '../../cache/index')).toString();
var CONFIG_DIRECTORY = (path.join(path.dirname(__filename), '../../public/humla/lib/config.json')).toString();
var JQUERY_DIRECTORY = (path.join(path.dirname(__filename), '../../public/lib/jquery-1.7.min.js')).toString();
var HUMLA_URL = "../../../humla/lib";
var config_json;
var config_data;
fs.readFile(CONFIG_DIRECTORY, function (err, data) {
    try {
        config_json = JSON.parse(data.toString()); 
        loadConfig(config_json);
    } catch(exception){
        console.log("Config file does not exist: "+exception);
    }
}); 
//TODO: humla-config.json?? pro nahravani css? nebo to mam parsovat sam? mozno nastavit, co (jestli vubec neco) chci nacpat do manifestu.....


/**
 * Returns created manifest file about the selected lecture.
 * @param course Selected course
 * @param lecture Selected lecture
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 */
var content = "";
exports.manifest = function(course, lecture, res, url, req_url){
    //console.log("URL: "+path);
    console.log("URL2: "+req_url);
    run(course, lecture, res);
    //loadSlides(course, lecture, res, "");
    
}

function run(course, lecture, res){
    lecture = removeHTML(lecture);
    try{
        console.log(course+" a "+lecture);
        fs.readFile(JSON_DIRECTORY+ '/'+course+'/'+lecture+".json", function (err, data) {
            if (err){
                console.error("Manifest not created with error: "+err.toString());
                defaults.returnError(500, err.toString(), res);
            }else{
                try{
                    var json_data = processJSON(data.toString(), res);
                    loadSlides(course, lecture, res, json_data);
                }catch(errs){
                    console.error("Manifest run error1: "+errs);
                    sendError("Manifest error: "+errs.toString(), res);
                }
            }
        }); 
    }catch(error){
        console.error("Soubor neni zpracovan "+error.toString());
        //TODO: Zavolat zpracovani souboru slide indexeru
        defaults.returnError(500, error.toString(), res);
    }
    
//returnThrowError(500, err.message, res);
}
function loadSlides(course, lecture, res, loaded_data){
    try{
        console.log("Nacitam slidy: "+course+" a "+lecture);
        fs.readFile(SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html", function (err, data) {
            if (err){
                console.error("Manifest not created with error: "+err.toString());
                defaults.returnError(500, err.toString(), res);
            }else{
                try{
                    var html_data = "\nCACHE";
                    html_data = "\n"+lecture+".html";
                    html_data += processHTML(data.toString(), res); 
                    html_data += loaded_data;
                    html_data += "\nNETWORK";
                    sendManifest(html_data, res);
                }catch(errs){
                    console.error("Manifest run error1: "+errs);
                    sendError("Manifest error: "+errs.toString(), res);
                }
            }
        }); 
    }catch(error){
        console.error("Soubor neni zpracovan "+error.toString());
        //TODO: Zavolat zpracovani souboru slide indexeru
        defaults.returnError(500, error.toString(), res);
    }
    
}
function offline(){
    var offline = "\nhttps://chart.googleapis.com"
    return offline;
}
function processJSON(json, res){
    var data = "";
    if (config_data != null && config_data != ""){
        data += config_data;
    }
    var jsonData = eval('(' + json + ')');
    for (var i = 0; i < jsonData.images.length; i++){
        data += "\n./";
        data += jsonData.images[i].url;
    }
    //sendManifest(data, res);
      return data;        
}
function processHTML(html){
    var links = "\n#linky: ";
    try {
        jsdom.env(html, [
            jquery
            ],
            function(errors, window) {
                if(errors){
                    returnThrowError(500, 'Error while parsing document by jsdom', res, callback);
                }else{
                    var $ = window.$;
                    $('script').each(function (){
                        links += "\n";
                        links += $(this).attr('src');
                    });
                    $('link').each(function (){
                        links += "\n";
                        links += $(this).attr('href');
                    });
                }
            });
    } catch (err){
        console.log("Chyba v jsdom: "+err);
    }
    return links;       
}

function sendError(data, res){
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.write(data);
    res.end();
}
function returnThrowError(code, msg, res, callback){
    if(typeof res!="undefined")
        defaults.returnError(code, msg, res);
    else{
        if(typeof callback!="undefined"){
            callback(msg, null);
        }else{
            console.error(msg);
        }
    }       
}
function sendManifest(data, res){
    
    var body = 'CACHE MANIFEST\n#'+(new Date());
    //body += "\nManifest: "
    
    if (data != ""){
        //console.log(data);
        body += data;        
    }
    res.writeHead(200, {
        "Content-Type": "text/cache-manifest"
    });
    res.write(body);
    res.end();
}
function loadConfig(json){
    if (json != null){
        for (var i = 0; i < json.views.length; i++){            
            if (json.views[i].script != null){
                config_data += "\n"+HUMLA_URL+"/";
                config_data += json.views[i].script.src;
            }
            if (json.views[i].style != null){
                config_data += "\n"+HUMLA_URL+"/";
                config_data += json.views[i].style.src;
            }
        }
        for (var k = 0; k < json.extensions.length; k++){ 
            //console.log(json.extensions);
            //console.log(json.extensions[k].scripts[0].src)
            if (json.extensions[k].scripts != null){
                for (var j = 0; j < json.extensions[k].scripts.length; j++){            
                    config_data += "\n"+HUMLA_URL+"/";
                    //console.log("Vypis: "+k+" a "+j+": "+json.extensions[k].scripts[j].src);
                    config_data += json.extensions[k].scripts[j].src;
                }
            }
            if(json.extensions[k].styles != null){
                for (var l = 0; l < json.extensions[k].styles.length; l++){            
                    config_data += "\n"+HUMLA_URL+"/";
                    config_data += json.extensions[k].styles[l].src;
                }
            }
            
        }
    }
}

function endsWith(string, suffix) {
    //console.log(string+" vs "+suffix);
        
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}
function removeHTML(string){
    if (endsWith(string, ".html")){
        //var newLength = (string.length-5);
        //console.log("Od 0 do "+newLength);
        string = string.substring(0, (string.length - 5));
    //console.log("Vypis OK: "+string);
    }else {
    //console.log("Vypis KO: "+string);
    }
        
    return string;
}
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
            console.error("Nor HTTP Response or callback function defined!");
    //            throw "Nor HTTP Response or callback function defined!";
    }
}