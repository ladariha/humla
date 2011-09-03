//handlery nemůžou jenom returnovat odpověď, protože pak by to celé bylo blokující
//tady je správné místo na oddělení view do zvláštního fajlu

var fs = require("fs");
var path = require('path');
var paperboy = require("./lib/paperboy");

exports.start = function start(res) {

  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/upload" enctype="multipart/form-data" '+
    'method="post">'+
    '<input type="file" name="upload" multiple="multiple">'+
    '<input type="submit" value="Upload file" />'+
    '</form>'+
    '</body>'+
    '</html>';

    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(body);
    res.end();
}

exports.rest = function rest(res) {
  console.log("Reuest handler 'rest' was called");

  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<div>REST API</div>'+
    '</body>'+
    '</html>';

    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(body);
    res.end();
}


exports.serve = function serve(res,req) {
    req.url = req.url.substring(7); // -("/static") TODO: udělat lépe
      
    //var ip = req.connection.remoteAddress;
    var FILEPATH = path.join(path.dirname(__filename),  "..");
    //var FILEPATH = path.dirname(__filename);
    console.log("FILE: " + FILEPATH);
    paperboy
    .deliver(FILEPATH, req, res)
    //.addHeader('Expires', 300)
    .addHeader('X-PaperRoute', 'Node')
    .before(function() {
      console.log('Received req: ' +req.url);
    })
    .after(function(statCode) {
      console.log('Data sent: ' +req.url);
    })
    .error(function(statCode, msg) {
      res.writeHead(statCode, {'Content-Type': 'text/plain'});
      res.end("Error " + statCode);
      console.log('Error: ' +req.url);
    })
    .otherwise(function() {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('Sorry, no paper this morning!');
      res.end();
    });
  
}


exports.favicon = function favicon(res,req) {
    fs.readFile(path.join(path.dirname(__filename),  "favicon.ico"), "binary", function(error, file) {
    if(error) {
      res.writeHead(500, {"Content-Type": "text/plain"});
      res.write(error + "\n");
      res.end();
    } else {
      res.writeHead(200, {"Content-Type": "image/png"});
      res.write(file, "binary");
      res.end();
    }
  });

}

exports.manifest = function manifest(res) {
    var body = 'CACHE MANIFEST\n'+(new Date());
    
    res.writeHead(200, {"Content-Type": "text/cache-manifest"});
    res.write(body);
    res.end();
}

