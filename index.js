/**
 *  Humla-Server Main index file
 *  - bind url patterns to handlers
 *  - setup server
 *  - run server * 
 */

var path = require('path');
var server = require("./server");
var router = require("./router");
var handlers = require("./handlers");
var slideindexer = require("./handlers/slideindexer"); //  FIXME jen nez bude hotovy routovani



// root for static delivery
var WEBROOT = path.join(path.dirname(__filename), 'public');
var PORT = 1337; //TODO: musím předávat?


// setup url patterns
urls = [
    //['^/favicon.ico$',  handlers.favicon],
    ['^/cache.manifest$',  handlers.manifest],
    ['^/api/slideindexer/(.*)',  slideindexer.api],
    ['^/$',             handlers.start],        
    ['^/api/v1/(.*)$', handlers.rest],
    ['^/public/(.*)$',  handlers.serve],
    
    ];

//run server
server.run(router.route, urls, PORT, WEBROOT);