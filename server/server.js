var http = require("http");
var url = require("url");

exports.run = function run(route, urls, port) {
  function onRequest(req, res) {    
    var pathname = url.parse(req.url).pathname;
    console.log("Request for " + pathname + " received.");
    
    route(req, res, urls);
  }

  http.createServer(onRequest).listen(port);
  console.log("Server has started.");
}

 