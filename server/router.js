var path = require('path'),
    paperboy = require("./lib/paperboy");


exports.route = function route(handle, pathname, res, req) {
  console.log("About to route a request for " + pathname);
  
  
  //TODO: zatim jenom paperboy, ale pak udělat dynamickej router
  
  var ip = req.connection.remoteAddress;
    var FILEPATH = path.join(path.dirname(__filename),  '..');
    paperboy
    .deliver(FILEPATH, req, res)
    //.addHeader('Expires', 300)
    .addHeader('X-PaperRoute', 'Node')
    .before(function() {
      console.log('Received Request ' +req.url);
    })
    .after(function(statCode) {
      console.log('Data sent ' +req.url);
    })
     .otherwise(function() {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('Sorry, no paper this morning!');
      res.end();
    });
  
  
/*  
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response, request);
  } else {
    console.log("No request handler found for " + pathname);
    response.writeHead(404, {"Content-Type": "text/html"});
    response.write("404 Not found");
    response.end();
  }
*/
}

