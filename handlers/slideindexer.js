var querystring = require('querystring');
var path = require('path');
var defaults = require('./defaults');

    

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

app.get('/api/:course/:lecture/index', function api(req, res) {
    var regx =/^\/api\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\/index/; 
    req.url.match(regx);
    var course = RegExp.$1;
    var lecture = RegExp.$2;
    var url = querystring.parse(require('url').parse(req.url).query)['url'];
    var alt = querystring.parse(require('url').parse(req.url).query)['alt'];
    var accept = req.headers.accept;
    
    if(typeof alt == "undefined"){
        switch(req.headers.accept){
            case "application/json":
                alt = "json";
                break;
            case "application/xml":
                alt = "xml";
                break;
            case "text/xml":
                alt = "xml";
                break;
            case "*/*":
                alt = "json";
                break;
            default:
                if(accept.indexOf("application/json")>-1 || accept.indexOf("*/*")>-1){
                    alt = "json";
                }else{
                    if(accept.indexOf("application/xml")>-1 || accept.indexOf("text/xml")>-1 ){
                        alt = "xml";
                    }else{
                        defaults.returnError(406, "Not Acceptable format: Try application/json or application/xml or text/xml or  */*", res);
                        return;
                    }
                }
                break;
        }
    
    }else{
        if(alt!=="json" && alt!=="xml"){
            // incorrect format requested
            res.writeHead(406, { // TODO fix status code
                'Content-Type': 'text/plain'
            });
            res.write("Not Acceptable. Allowed values are xml or json.");
            res.end();
        }
    }
    var refresh = querystring.parse(require('url').parse(req.url).query)['refresh'];
    require('../server_ext/slideindex/slideindex_ext.js').indexRest(res, course, lecture, alt, url, req.headers.host, refresh, undefined);
 
}
);

