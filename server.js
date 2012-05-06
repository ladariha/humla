/**
 * Humla Server - using Express 
 * 
 */

var express = require("express");
var mongoose = require('mongoose');
var passport = require('passport')
var fs = require("fs");
var path = require("path");
var handlers = {};
var models = {};


app = null; // je to schválně bez var - aby to bylo v globálním contextu
config = {};

exports.init = function(config_in) {
    config = config_in;
    var HANDLERS_DIRECTORY = (path.join(path.dirname(__filename), config.server.handlers_relative_path)).toString();
    var MODELS_DIRECTORY = (path.join(path.dirname(__filename), config.server.models_relative_path)).toString();
    handlers = loadFiles(HANDLERS_DIRECTORY);
    models = loadFiles(MODELS_DIRECTORY);    
};


exports.run = function run() {     
    app = express.createServer();
    
    // Configuration
    app.configure( function() {
        //app.set('view engine', 'jade');
        //app.set('views', __dirname + '/views');
        //app.set('view options', {
        //            layout: 'shared/layout'
        //});
        //app.use(express.methodOverride());   // pak mužeme z formu posílat put <input type="hidden" name="_method" value="put" />
        app.use(express.bodyParser());
        app.use(express.cookieParser());        
        app.use(express.session({
            secret: "HumlaSecretChange"
        }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(app.router);
        app.set('db-uri',  config.server.db_uri);
    });
    app.configure('development', function(){
        app.use(express.logger({
            format:  "\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms :status"
        }))        
        app.use(express.errorHandler({
            dumpExceptions: true, 
            showStack: true
        }));
    });
    app.configure('production', function(){          
        app.use(express.errorHandler());
    });
    
    
     mongoose.connect(app.set('db-uri'));    
    
    //require("./models/comment")


    // Models (MongoDB)
    models.forEach(function (model){
        require(model);
    });    
    
    // Handlers (Routes)     
    handlers.forEach(function (hand){
        //console.log("X-"+hand)
        require(hand);
    });


    config.plugins.forEach(function(plugin){
        if (plugin.enable) require(plugin.src);
    });
    
    
    // Static route - after our routes to make AJAX Crawling and request on our slides possible
    app.configure( function() {
        var oneYear = 31557600000;     
        //var oneYear = 1;      // testing: nocache
        app.use(express["static"](path.join(path.dirname(__filename), config.server.webroot), {    //__dirname + '/public', {
            maxAge: oneYear
        }));
    });    
    
    app.listen(config.server.port);   

    console.log("Humla (server) has started, 127.0.0.1:%d, Using Express %s, Node %s", config.server.port, express.version, process.version);    
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
 * Reusable middleware for authentication
 * Usage: app.post('/:op', ensureAuthenticated, function(req, res, next){   ...
 */ 
function ensureAuthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/401'); // if failed...
}