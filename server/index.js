var server = require("./server");
var router = require("./router");
var handlers = require("./handlers");

var handle = {
    "/":        handlers.start,    
    "/start":   handlers.start,
    "/upload" : handlers.upload,
    "/show":    handlers.show,
    "/rest/v1": handlers.rest    
}


server.run(router.route, handle, 1337);