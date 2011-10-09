/**
 * Comments handler
 * 
 * 
 */

//require("../models/comment")

var comments = require("../models/comment").comments;

app.get('/api/:course/:lecture/comments', function(req, res) {
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.write(JSON.stringify(comments));
    res.end();
    
    
});

app.get('/api/:course/:lecture/comments/:slideid',function(req, res) {    
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.write(JSON.stringify(comments[req.params.slideid]));
    res.end();
    
    
});


app.post('/api/:course/:lecture/comments/:slideid', function(req, res){
    comments[req.params.slideid] = {
        "id": 1,
        "name": "jmeno",
        "lecture": req.params.lecture,
        "course": req.params.course,
        "text": "comment"        
    };    
    res.write("k thx bye");
    res.end();
    
});


app.post('/api/:lecture/:course/comments/:slideid/:op', function(req, res, next){});
