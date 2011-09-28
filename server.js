/**
 * Humla Server - using Express
 * 
 * 
 * 
 */

var express = require('express');



var app = null;

exports.run = function run(handlers, PORT, WEBROOT) {    

    app = express.createServer();
    
    // Configuration
    app.configure( function() {
        app.set('view engine', 'jade');
        app.set('views', __dirname + '/views');
        app.set('view options', {
            layout: 'shared/layout'
        });
        app.use(express.methodOverride());        
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({
            secret: "HumlaSecretChange"
        }));
    });
    app.configure('development', function(){
        app.use(express.logger({ format: ':method :url' }));
        app.use(app.router);
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
    
    
    
    
    // ROUTES -----
    app.get('/', handlers.begin);
    //app.get('/cache.manifest', handlers.manifest);
    
    // api
    app.get('/api/slideindexer/*', require("./handlers/slideindexer").api);
    app.get('/api/v1/', handlers.rest);

    app.post('/blog/new', function(req, res){});
    
    
    app.listen(PORT);   
    console.log("Humla-Server has started, 127.0.0.1:"+PORT)
    
}



function printRequest(request){
    var pathname = url.parse(request.url).pathname;
    console.log("<< Received request for "+pathname);
}

function log(statCode, url, ip, err) {
    var logStr = statCode + ' - ' + url + ' - ' + ip;
    if (err)
        logStr += ' - ' + err;
    console.log(logStr);
}


