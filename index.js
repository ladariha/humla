var server = require("./server");
var router = require("./router");
var handlers = require("./handlers");

urls = [
    ['^/favicon.ico$',  handlers.favicon],
    ['^/cache.manifest$',  handlers.manifest],
    ['^/$',             handlers.start],    
    //['^/tests/(.*)$',   handlers.serve],
    ['^/rest/v1/(.*)$', handlers.rest],
    ['^/static/(.*)$',  handlers.serve],
    
];

server.run(router.route, urls, 1337);