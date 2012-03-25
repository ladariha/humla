/** 
 * Humla Server
 * ~~~~~~~~~~~
 * usage:
 * var humla = require("humla-server");
 * humla.run(config);
 * 
 * TODO: spojit s index.js ????
 */

var fs   = require('fs');
var path = require('path');
var server = require("./server");


//load JSON config file
//var config=loadConfig('./server-config.json') || {};



exports.use = function(config) {
    //initialize server environment
    //server.init(config);

    //server.run(handlers, PORT, WEBROOT);
    //server.run();
    var plugins = {};
    config.plugins.forEach(function(plugin){
        if (plugin.enable) {
            plugins[plugin.id] = require(plugin.src);
        }
    });
    
    exports.plugins = plugins;    
}






//Example usage:
// $ node humla-server.js

if(!module.parent) {    
    var humla = this; // in another module it would be var humla = require("humla-server");
    
    humla.use({   
        "server":{
            "runserver":true,
            "usedb":true,
            "webroot":"public",
            "domain":"http://localhost:1338",
            "port" :1338,        
            "db_uri": "mongodb://localhost/humla",
            "handlers_relative_path":"./handlers/",
            "models_relative_path":"./models/"
        },
        "plugins": [
            {"id":"slideindex","enable":true,"src":"./server_ext/slideindex/slideindex_ext.js"},
            {"id":"atom","enable":true,"src":"./server_ext/atom/atom_module_ext.js"},
            {"id":"editor","enable":true,"src":"./server_ext/editor/editor_ext.js"},
            {"id":"facetparser","enable":true,"src":"./server_ext/facet/facetparser_ext.js"},
            {"id":"facet","enable":true,"src":"./server_ext/facet/facetengine_ext.js"},
            {"id":"microdata","enable":true,"src":"./server_ext/microdata/microdataparser_ext.js"},
            {"id":"maintenance","enable":true,"src":"./server_ext/maintenance/maintenance_lecture_ext.js"},
            {"id":"gbooks","enable":true,"src":"./server_ext/gbooks/gbooks_ext.js"}
        ]
    });
    
    
    
}