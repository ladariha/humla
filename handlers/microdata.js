var parseURL = require('url').parse;
var path = require('path');
var fs     = require('fs');
var querystring = require('querystring');
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var SLIDE_TEMPLATE = (path.join(path.dirname(__filename),'../public/data/templates')).toString();
var defaults = require('./defaults');
var microdataParser = require('../server_ext/microdata/microdataparser_ext');

/**
 * This associative array contains instances of ContentNegotiation (see below). Array keys are all possible formats 
 * that this api can return. 
 */
var accepts = {};
accepts["json"] = new ContentNegotiation("application/json", microdataParser.items,  JSON.stringify,additionalInfo);
accepts["xml"] = new ContentNegotiation("application/xml",microdataParser.items,  defaults.objectToXML,additionalInfo);
accepts["application/json"] = new ContentNegotiation("application/json",  microdataParser.items, JSON.stringify,additionalInfo);
accepts["application/xml"] = new ContentNegotiation("application/xml", microdataParser.items,  defaults.objectToXML,additionalInfo);
accepts["text/xml"] = new ContentNegotiation("text/xml", microdataParser.items,  defaults.objectToXML,additionalInfo);
accepts["*/*"] = new ContentNegotiation("application/json", microdataParser.items,   JSON.stringify,additionalInfo);
accepts["text/vcard"] = new ContentNegotiation("text/vcard",microdataParser.vcards, function(data){
    return data;
});
accepts["vcard"] = new ContentNegotiation("text/vcard", microdataParser.vcards, function(data){
    return data;
}, function(data){
    return data;
});

/**
 * Returns all microdata items in :lecture of :course
 */
app.get('/api/:course/:lecture/microdata', function api(req, res) {
    var course = req.params.course;//RegExp.$1;
    var lecture = req.params.lecture;
    var alt = querystring.parse(require('url').parse(req.url).query)['alt'];
    var negotiation = negotiateContent(alt, req.headers.accept);
    var presentationUrl = req.headers.host+RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+'.html';
    if(typeof negotiation=="undefined"){
        defaults.returnError(406, "Not Acceptable format: Try application/json or application/xml or text/xml or  */*", res);
    }else{

        fs.readFile(SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html", function (err, data) {
            if (err){
                defaults.returnError(404, err.message, res);
            }else{
                //                negotiation.microdataSelection
                negotiation.microdataSelection(presentationUrl, data.toString(),undefined ,function(err, data){
                    if(err){
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.write(err);
                        res.end(); 
                    }else{
                        var container = negotiation.finalize(data, req, course, lecture, undefined);
                        res.writeHead(200, {
                            'Content-Type': negotiation.contentType
                        });
                        res.write(negotiation.formatCallback(container, undefined,2));
                        res.end(); 
                    }
                });
            }
        });
    }
});

/**
 * Returns all microdata items of type given by :itemtype in presentation specified by :course and :lecture
 */
app.get('/api/:course/:lecture/microdata/:itemtype', function api(req, res) {
    var itemtype=decodeURIComponent(req.params.itemtype);
    var course = req.params.course;//RegExp.$1;
    var lecture = req.params.lecture;
    var alt = querystring.parse(require('url').parse(req.url).query)['alt'];
    var negotiation = negotiateContent(alt, req.headers.accept);

    if(typeof negotiation=="undefined"){
        defaults.returnError(406, "Not Acceptable format: Try application/json or application/xml or text/xml or  */*", res);
    }else{
        
        fs.readFile(SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html", function (err, data) {
            if (err){
                defaults.returnError(404, err.message, res);
            }else{
                negotiation.microdataSelection(undefined,data.toString(),itemtype, function(err, data){
                
                    if(err){
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.write(err);
                        res.end(); 
                    }else{
                        var container = {};
                        container.url = req.headers.host+"/api"+"/"+course+"/"+lecture+"/microdata/"+encodeURIComponent(itemtype);
                        container.course = course;
                        container.lecture = lecture;
                        container.allmicrodataUrl = req.headers.host+"/api"+"/"+course+"/"+lecture+"/microdata"
                        container.presentationUrl = req.headers.host+RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+'.html';
                        container.items =data.items;
                    
                        res.writeHead(200, {
                            'Content-Type': negotiation.contentType
                        });
                        res.write(negotiation.formatCallback(container, undefined,2));
                        res.end();
                    }
                 
                });
            }
        });   
    }
});

/**
 * Returns instance of ContentNegotiation.
 *  Sets up what format will be given in response. When request is received, preffered way to determine
 * response format is to use parameter in request URL called "alt". If "alt" is not defined 
 * request's header "Accept" is used. Then if the accepts array defined above contains instance of
 * ContentNegotiation on position specified by key with value of "alt" or "Accept", the appropriate
 *  ContentNegotiation is returned. If no instance is found it returns undefined.
 *  In case that in original request has multiple values in Accept header field, the first match is used (no priority check)
 *  @param alt String value of query parameter alt
 *  @param accept String value of HTTP header field Accept
 *  @return instance of ContentNegotiation or undefined if given format is not supported
 */
function negotiateContent(alt, accept){
    if(typeof  alt!="undefined" ){
        if(typeof accepts[alt]!="undefined")
            return accepts[alt];
        return undefined;
    }else{
        if(accept.indexOf(",")>-1){ // multiple values
            var choices = accept.split(",");
            for(var i=0;i<choices.length;i++){
                if(choices[i].indexOf(";")>-1){
                    var t = choices[i].split(";");
                    choices[i] = t[0];
                }
                if(typeof accepts[choices[i]]!="undefined") // return first match
                    return accepts[choices[i]];
            }
            return undefined;
        }else{
            if(typeof accepts[accept]!="undefined")
                return accepts[accept];
            return undefined;
        }
    }
}

/**
 * Adds additional information to be returned in HTTP response
 * @param data data returned by microdataparser.js
 * @param req HTTP request
 * @param course course ID (mi-mdw)
 * @param lecture lecture ID (lecture1)
 * @param itemtype used when received items in data paramater are restricted to itemtype of value given by this parameter
 */
function additionalInfo(data, req, course, lecture, itemtype){
 
    if(typeof req=="undefined")
        return data;
    if(typeof itemtype=="undefined"){
        var container = {};
        container.url = req.headers.host+"/api"+"/"+course+"/"+lecture+"/microdata"
        container.course = course;
        container.lecture = lecture;
        container.presentationUrl = req.headers.host+RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+'.html';
        container.itemtypes = new Array();
        container.items = data.items;
        var tmpTypes = [];
        for(var i=0;i<data.items.length;i++){
            finalize(data.items[i]);
        }
                
        function finalize(microitem){
            if(microitem.properties){ // if item contains other items
                for(var key in microitem.properties){
                    for(var j=0; j< microitem.properties[key].length; j++){
                        finalize(microitem.properties[key][j]);        
                    }
                }
            }
            if(microitem.type){
                for(var j=0; j<microitem.type.length;j++){ // iterate all itemtypes
                    var a  = {};
                    a.url = container.url+encodeURIComponent(microitem.type[j]+"");
                    a.type = microitem.type[j]+"";   
                    if(tmpTypes.indexOf(a.type)<0)
                    {
                        tmpTypes.push(a.type);
                        container.itemtypes.push(a);        // if new insert
                    }
                }
            }
        }
        return container;   
    }else{
        var container = {};
        container.url = req.headers.host+"/api"+"/"+course+"/"+lecture+"/microdata/"+encodeURIComponent(itemtype);
        container.course = course;
        container.lecture = lecture;
        container.allmicrodataUrl = req.headers.host+"/api"+"/"+course+"/"+lecture+"/microdata"
        container.presentationUrl = req.headers.host+RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+'.html';
        container.items =data.items;
        return container;
    } 
}


/**
 * Container class that holds information about Content-Type that will be used in HTTP response
 * and callback function that will be used to format the output
 * @param acceptType value to be set in HTTP response header field Content-Type
 * @param formatCallback callback function used to format output
 * @param microdataSelection callback that retreives microdata items from file
 * @param addInfo callback to add additional info
 */
function ContentNegotiation(acceptType, microdataSelection, formatCallback, addInfo){
    this.contentType = acceptType;
    this.microdataSelection = microdataSelection;
    this.formatCallback = formatCallback;
    this.finalize = addInfo;
}