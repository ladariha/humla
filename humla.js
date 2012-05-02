/** 
 * Humla Server
 * ~~~~~~~~~~~~
 * usage:
 * var humla = require("./humla");
 * humla.init(config);
 * 
 * -- Full usage example at the bottom of this file
 *
 */

var fs   = require('fs');
var path = require('path');

// global config variable // TODO: this is pretty ugly to bind var to global context...
config = {};
var models = {};

/**
 * Init Humla, setup and load plugins from config file.
 * Plugins can be listed with or without src param
 * Note that some extensions may require Mongoose DB 
 * @param plugins Object of plugins (e.g. {"slideindex":{"enable":true,"src":"./server_ext/slideindex/slideindex_ext.js"}})
 * @param usedb boolean value 
 */
exports.init = function(plugins, usedb){
    var c_in = plugins;
    var plugin,src;
        
    // load config to global context
    config=loadConfig('./server-config.json') || {};
    
    
    // load plugins from confi if no plugins param is provided
    if(!c_in) {
        c_in = {};
        for(var i = 0; i<config.plugins.length;i++) {
            c_in[config.plugins[i].id] = config.plugins[i];
        }
    }
    
    // initialize db and load models
    if(usedb) {       
        var mongoose = require('mongoose');
        mongoose.connect(config.server.db_uri);    
        var MODELS_DIRECTORY = (path.join(path.dirname(__filename), config.server.models_relative_path)).toString();    
        models = loadFiles(MODELS_DIRECTORY);      
        models.forEach(function (model){
            require(model);
        });    
    }    
    
    // load and export plugins
    for(var p in c_in) {
        if(c_in.hasOwnProperty(p))   {
            plugin = c_in[p];
            
            if(plugin.src) {
                src = plugin.src
            } else {
                src = getPluginConfig(p,config).src;
                if(!src) {
                    //console.log("ERR: Plugin with name '"+p+"' is not in server-config.json");
                    throw new Error("Plugin with name '"+p+"' is not in server-config.json");
                }
            }                        
            if(plugin.enable) {
                console.log("Loading Humla plugin... "+JSON.stringify(p));
                exports[p] = require(src);
            }
        }
    }
    
}

/**
 * Load and parse JSON config file
 * @param filename Relative path to JSON config file
 */
function loadConfig(filename) {
    try {    
        var data = fs.readFileSync(filename).toString();    
        config = JSON.parse(data);
        return config;    
    } catch (err) {
        /*console.log('There has been an error parsing your JSON Configuration (server-config.json)');
        console.log(err);*/
        throw 'There has been an error parsing your JSON Configuration (server-config.json)\n'+err;
    }    
}

/**
* Tests if string ends with given suffix
*/
function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}


/**
 * Return array of paths
 * @param path Folder path to .js files
 */
function loadFiles(path) {
    var arr =[];
    var files = fs.readdirSync( path);    
    files.forEach(function(file) {
        if(endsWith(file, "js")){
            //var req = require( HANDLERS_DIRECTORY+'/'+file );
            arr.push(path+file );
        }
    });    
    return arr;
}

/**
 * Load single plugin object from config object
 * @param name Name of the plugin
 * @param config Configurarion object with structure {"plugins":[]}
 */
function getPluginConfig(name,config){
    for(var i=0; i<config.plugins.length;i++) {
        if (config.plugins[i].id === name) return config.plugins[i];
    }
    return false;
}



/**
 * Example usage
 * ~~~~~~~~~~~~~
 * 
 * var humla = require("humla");
 *  
 * This example is executed automatically when run as $node humla.js
 * 
 */
if(!module.parent) {    
    //var humla = require("humla"); // use this one in your code
    var humla = this;               // only for example usage    
    
    // Either load default plugins by:
    // humla.init(false,true); // OR list them as following
    
    // load plugins and enable db
    humla.init({
            "administration":{"enable":true},
            "atom":{"enable":true},
            "editor":{"enable":true},
            "facetparser":{"enable":true},
            "facet":{"enable":true},
            "maintenance":{"enable":true},
            "gbooks":{"enable":true},
            "microdata":{"enable":true},
            "slideindex":{"enable":true}
    },true);
    
    
    // get course, params: courseID, express_callback, internal_callback 
    
    // list all available methods
    console.log(humla.administration);
    console.log(humla.gbooks);
    
    // See extension docs for further details
    humla.administration.getCourse("MI-MDW",undefined,function(err,data){        
        if(!err) console.log(JSON.stringify(data));        
        else console.log("MI-MDW not found");
    });
    
    
    humla.administration.getCourse("MI-MDW",undefined,function(err,data){        
        console.log(JSON.stringify(data));        
    });
    
    
    
}



