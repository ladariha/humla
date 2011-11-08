/**
 * AJAX Crawling handler
 * 
 * Only slides are AJAX Crawable
 * 
 */
var fs   = require('fs');
var path = require('path');
var CRAWL_FILE = (path.join(path.dirname(__filename), '../public/pages/slidecrawl.html')).toString();

app.get('/data/slides/:course/:lecture', function(req, res, next) {            
    if(req.query.hasOwnProperty('_escaped_fragment_')) {
        var fragment = req.query['_escaped_fragment_'];               
       
        fs.readFile(CRAWL_FILE, function(err, data) {
            if(err){
                console.error("ERROR reading file "+CRAWL_FILE);                
            } else {
                
                res.writeHead(200, {
                    'Content-Type': 'application/html',
                    "Content-Encoding" : "utf-8"
                });
                console.log("AJAX CRAWL "+fragment);
                res.write("Ajax Crawl: "+fragment);
                
                var textdata = data.toString();
                res.write(textdata);
                
                res.end();    
            }
        });
       
              
    // TODO: udělat vlastní stránku, která se bide vracet na crawling ... protože tam pak budou keywords a tak
       
    // TODO: udělat ten společnej dokument
       
        
    } else {
        next();
    }
    
    
});