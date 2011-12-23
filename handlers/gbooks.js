var https = require('https');


app.get('/api/gbooks/:id', function(req, res){
    
    var id = req.params.id;
    console.log(id);
    var options = {
        host: 'www.googleapis.com',
        port: 443,
        path: "/books/v1/volumes/"+id,
        method: 'GET'
    };
    var content = '';
    var request = https.request(options, function(res2) {
        res2.setEncoding('utf8'); 
        statusCode = res2.statusCode;
        res2.on('data', function (chunk) {
            content += chunk;
        });

        res2.on('end', function () {
            if(res2.statusCode === 200){
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.write(content);
                res.end();  
            }else{
                res2.writeHead(res2.statusCode, {
                    'Content-Type': 'text/plain'
                });
                res2.write(content);
                res2.end(); 
            }   
        }); 
    });
    request.end();
    request.on('error', function(e) {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        
        res.write(e.message);
        res.end();  
    });
    
});