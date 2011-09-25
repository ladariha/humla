var http = require('http');
var url = require("url");
var paperboy = require("./lib/paperboy");


exports.run = function run(route, handle, PORT, WEBROOT) {
    
    function onRequest(request, response) {
        //var pathname = url.parse(request.url).pathname;
        var ip = request.connection.remoteAddress;
        printRequest(request);
        request.setEncoding("utf8");
        var postData = "";
        request.addListener("data", function(postDataChunk) {
            postData += postDataChunk;
            console.log("Received POST data chunk '"+  postDataChunk + "'.");
        });
    
        request.addListener("end", function() {

            paperboy // handle static files
            .deliver(WEBROOT, request, response)
            .addHeader('Expires', 300)
            .addHeader('X-PaperRoute', 'Node')
            .before(function() {
                //console.log('Received Request');
            })
            .after(function(statCode) {
                log(statCode, request.url, ip);
            })
            .error(function(statCode, msg) {
                response.writeHead(statCode, {
                    'Content-Type': 'text/plain'
                });
                response.end("Error " + statCode);
                log(statCode, request.url, ip, msg);
            })
            .otherwise(function(err) { // no static files => try to handle request with router
                console.log(">> Paperboy: No joy...");
                route(request, response, handle); // can handle any other request - REST API etc.
            });
        });
    }

    http.createServer(onRequest).listen(PORT);
    console.log("Humla-Server has started, 127.0.0.1:"+PORT);
}

function printRequest(request){
    var pathname = url.parse(request.url).pathname;
    console.log("<< Received request for "+pathname);
}

function log(statCode, url, ip, err) {
  var logStr = statCode + ' - ' + url + ' - ' + ip;
  if (err)
    logStr += ' - ' + err;
  console.log(logStr);
}


