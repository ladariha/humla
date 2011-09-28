/**
 *  Humla-Server Main index file
 *  - setup server
 *  - run server * 
 */

var path = require('path');
var server = require("./server");
var handlers = require("./handlers.js");

// root for static delivery
var WEBROOT = path.join(path.dirname(__filename), 'public');
var PORT = 1337; //TODO: musím předávat?

server.run(handlers, PORT, WEBROOT);