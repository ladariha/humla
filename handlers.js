
//TODO: oddělit view do jiného fajlu
var fs = require("fs");
var path = require('path');
//var paperboy = require("./lib/paperboy");


/**
 * Humla-Server index html page handler
 * - reports
 * - about 
 * ...
 */
exports.begin = function begin(req,res) {   
    fs.readFile('./public/pages/index.html', function(error, content) {
        if (error) {
            res.writeHead(500);
            res.end();
        }
        else {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end(content, 'utf-8');
        }
    });   
    
}

//Comments API
exports.rest = function rest(req, res) {
    console.log("REST API CALL" + req.url);   
        
    
    // LIST comments for all slides (in one presentation)
    
    // GET comments for one slide
    
    // CREATE new comment under slide
    
    // UPDATE comment under slide
    
    // DELETE comment under slide
    

    var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<div>REST API</div>'+
    '</body>'+
    '</html>';

    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.write(body);
    res.end();
}


exports.serve = function serve(req,res) {
    req.url = req.url.substring(7); // -("/static") TODO: udělat lépe
      
    //var ip = req.connection.remoteAddress;
    //var FILEPATH = path.join(path.dirname(__filename),  "..");
    var FILEPATH = path.dirname(__filename);
    console.log("FILE: " + FILEPATH);
    paperboy
    .deliver(FILEPATH, req, res)
    //.addHeader('Expires', 300)
    .addHeader('X-PaperRoute', 'Node')
    .before(function() {
        console.log('Received req: ' +req.url);
    })
    .after(function(statCode) {
        console.log('Data sent: ' +req.url);
    })
    .error(function(statCode, msg) {
        res.writeHead(statCode, {
            'Content-Type': 'text/plain'
        });
        res.end("Error " + statCode);
        console.log('Error: ' +req.url);
    })
    .otherwise(function() {
        res.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        res.write('Sorry, no paper this morning!');
        res.end();
    });
  
}

exports.manifest = function manifest(req,res) {
    var body = 'CACHE MANIFEST\n#'+(new Date());
    body += "\nError" //TODO: odebrat
    
    res.writeHead(200, {
        "Content-Type": "text/cache-manifest"
    });
    res.write(body);
    res.end();
}

