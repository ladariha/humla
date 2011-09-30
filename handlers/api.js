/**
 * REST handlers
 * 
 * 
 */

var fs = require("fs");
var path = require('path');

// API documentation - interaction

app.get('/api/v1/',function rest(req, res) {
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
});


/*
get('/posts/:id', function(req) {
    return db.openDoc(req.params.id).then(function(post) {
        return viewEngine.respond('post.html', {
            locals: post
        });
    });
});

post('/posts/:id/comments', function(req) {
    var comment = req.params;

    return db.openDoc(req.params.id).then(function(post) {
        post.comments = post.comments || [];
        post.comments.push(comment);

        return db.saveDoc(post).then(function(resp) {
            return bogart.redirect('/posts/'+req.params.id);
        });
    });
});
*/