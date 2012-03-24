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
    server.init(config);

    //server.run(handlers, PORT, WEBROOT);
    //server.run();
    
    
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
            "domain":"http://aaaaaa",
            "port" :1338,        
            "db_uri": "mongodb://localhost/humla",
            "handlers_relative_path":"./handlers/",
            "models_relative_path":"./models/"
        },
        "plugins": [
            {"id":null,"enable":true,"src":"./server_ext/slideindex/slideindex_ext.js"},
            {"id":null,"enable":true,"src":"./server_ext/atom/atom_module_ext.js"},
            {"id":null,"enable":true,"src":"./server_ext/editor/editor_ext.js"},
            {"id":null,"enable":true,"src":"./server_ext/facet/facetparser_ext.js"},
            {"id":null,"enable":true,"src":"./server_ext/facet/facetengine_ext.js"},
            {"id":null,"enable":true,"src":"./server_ext/microdata/microdataparser_ext.js"},
            {"id":null,"enable":true,"src":"./server_ext/maintenance/maintenance_lecture_ext.js"},
            {"id":null,"enable":true,"src":"./server_ext/gbooks/gbooks_ext.js"}
        ],  
        "//":"Tady by to asi chtelo prihodit i jednotlive handlery a modely a u kazdeho zase 'enabled'",
        "handlers":[],
        "models":[]
    });
    
}