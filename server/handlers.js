//handlery nemůžou jenom returnovat odpověď, protože pak by to celé bylo blokující
// tady je správné místo na oddělení view do zvláštního fajlu

var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable"),
    path = require('path'),
    paperboy = require("./lib/paperboy");

exports.start = function start(response) {
  console.log("Request handler 'start' was called.");

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

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

exports.upload = function upload(response, request) {
  console.log("Request handler 'upload' was called.");

  var form = new formidable.IncomingForm();
  console.log("about to parse");
  form.parse(request, function(error, fields, files) {
    console.log("parsing done");
    fs.renameSync(files.upload.path, "/tmp/test.png");
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("received image:<br/>");
    response.write("<img src='/show' />");
    response.end();
  });
}

exports.show = function show(response) {
  console.log("Request handler 'show' was called.");
  fs.readFile("/tmp/test.png", "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
}

exports.rest = function rest(response) {
  console.log("Reuest handler 'rest' was called");

  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<div>REST API</div>'
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

exports.serve = function serve(res, req) {
  console.log("Request handler 'serve' was called.");  
    var ip = req.connection.remoteAddress;
    var FILEPATH = path.join(path.dirname(__filename),  '../examples');
    paperboy
    .deliver(FILEPATH, req, res)
    .addHeader('Expires', 300)
    .addHeader('X-PaperRoute', 'Node')
    .before(function() {
      console.log('Received Request ' +req.connection.remoteAddress + " " + FILEPATH + " : " + req.url);
    })
    .after(function(statCode) {
      console.log('Data sent');
    })
  
  /*req.
  fs.readFile("/tmp/test.png", "binary", function(error, file) {
    if(error) {
      res.writeHead(500, {"Content-Type": "text/plain"});
      res.write(error + "\n");
      res.end();
    } else {
      res.writeHead(200, {"Content-Type": "image/png"});
      res.write(file, "binary");
      res.end();
    }
  });*/
}
