/**
 * Humla Server - using Express
 * 
 * 
 * 
 */

var express = require("express");
var models = require("./models/comment");
var mongoose = require('mongoose');


app = null; // je to schválně bez var - aby to bylo v module contextu

exports.run = function run(handlers, PORT, WEBROOT) {    

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
            format: '\x1b[1m:method\x1b[0m \x1b[33m:url\x1b[0m :response-time ms'
        }))
        app.use(express.static(WEBROOT));
        app.use(express.errorHandler({
            dumpExceptions: true, 
            showStack: true
        }));
    });
    app.configure('production', function(){
        var oneYear = 31557600000;
        app.use(express.static(WEBROOT, {    //__dirname + '/public', {
            maxAge: oneYear
        }));
        app.use(express.errorHandler());
    });
    
    /*models.defineModels(mongoose, function() {
        app.Document = Document = mongoose.model('Document');
        app.User = User = mongoose.model('User');
        app.LoginToken = LoginToken = mongoose.model('LoginToken');
        db = mongoose.connect(app.set('db-uri'));
    })*/


    
    // Handlers (Routes) 
    
    require("./handlers/defaults")
    require("./handlers/api");
    
    // plugins (TODO: move to plugins folder and make auto-loading mechanism)
    require("./handlers/comments");
    require("./handlers/likes");
    
    app.get('/api/slideindexer/*', require("./handlers/slideindexer").api);
    

    
    
    
   
    app.listen(PORT);   
    console.log("Humla (server) has started, 127.0.0.1:%d, Using Express %s",PORT,express.version);    
    
}



