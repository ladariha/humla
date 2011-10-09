/**
 * Comments handler
 * 
 * 
 */

var mongoose = require("mongoose"); 
var Comment = mongoose.model("Comment"); // Model toho commentu, můžu instanciovat


app.get('/api/:course/:lecture/:slide/comments', function(req, res) {    
    
    // show all comments TODO: filter by lecture
    Comment.find({}, function(err,com){   
        if(!err) console.log("found! "+com)        
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.write(JSON.stringify(com));
        res.end();            
    })
});



app.post('/api/:course/:lecture/:slide/comments/', function(req, res, next){
    var com = new Comment();
    com.body = "Tělo komentáře";
    com.courseID = req.params.course;
    com.lectureID = req.params.lecture;
    com.save(function(err) {
        if(err) {
            console.log("ERR");
            throw err;
        }
        console.log("Comment saved to DB");
        
        res.writeHead(200);
        res.write("k thx bye");
        res.end();
    });
});
