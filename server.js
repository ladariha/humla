/**
 * Humla Server - using Express
 * 
 * 
 * 
 */

// Návod pro MongoDB na Win : http://www.webiyo.com/2011/02/install-mongodb-service-on-windows-7.html


var express = require("express");
var mongoose = require('mongoose');
var fs = require("fs");
var path = require('path')
var HANDLERS_DIRECTORY = (path.join(path.dirname(__filename), './handlers/')).toString();
var MODELS_DIRECTORY = (path.join(path.dirname(__filename), './models/')).toString();

var handlers = loadFiles(HANDLERS_DIRECTORY);
var models = loadFiles(MODELS_DIRECTORY);

app = null; // je to schválně bez var - aby to bylo v module contextu

exports.run = function run( PORT, WEBROOT) {    

    app = express.createServer();
    
    // Configuration
    app.configure( function() {
        app.set('view engine', 'jade');
        app.set('views', __dirname + '/views');
        app.set('view options', {
            layout: 'shared/layout'
        });
        app.use(express.methodOverride());   // pak mužeme z formu posílat put <input type="hidden" name="_method" value="put" />
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({
            secret: "HumlaSecretChange"
        }));
        app.use(app.router);
        app.set('db-uri', 'mongodb://localhost/humla');
    });
    app.configure('development', function(){
        app.use(express.logger({
            format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms :status'
        }))        
        app.use(express.errorHandler({
            dumpExceptions: true, 
            showStack: true
        }));
    });
    app.configure('production', function(){          
        app.use(express.errorHandler());
    });
    
    
    var db = mongoose.connect(app.set('db-uri'));    
    
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
    
    
    // Static route - after our routes to make AJAX Crawling and request on our slides possible
    app.configure( function() {
        var oneYear = 31557600000;      
        app.use(express.static(WEBROOT, {    //__dirname + '/public', {
            maxAge: oneYear
        }));
    });
   
    app.listen(PORT);   
    console.log("Humla (server) has started, 127.0.0.1:%d, Using Express %s", PORT, express.version);    
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