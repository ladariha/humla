/**
 * AJAX Crawling handler
 * 
 * Only slides are AJAX Crawable
 * 
 */

app.get('/data/slides/:course/:lecture', function(req, res, next) {            
    if(req.query.hasOwnProperty('_escaped_fragment_')) {
       var fragment = req.query['_escaped_fragment_'];
       //TODO:
       
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Content-Encoding" : "utf-8"
        });
    
        res.write("Ajax Crawl: ");
        console.log("AJAX CRAWL "+fragment);
    
        res.end();            
    } else {
        next();
    }
    
    
});