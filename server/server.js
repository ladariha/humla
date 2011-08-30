var http = require("http");
var url = require("url");

exports.run = function run(route, handle, port) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    route(handle, pathname, response, request);
  }

  http.createServer(onRequest).listen(port);
  console.log("Server has started.");
}

 