/**
 * Comments handler
 * 
 * 
 */

var mongoose = require("mongoose"); 
var Comment = mongoose.model("Comment"); // Model toho commentu, můžu instanciovat


app.get('/api/:course/:lecture/:slide/comments', function(req, res) {    
    
    // show all comments TODO: filter by lecture
    var p = req.params;
    Comment.find({
        courseID:p.course, 
        lectureID: p.lecture, 
        slideID: p.slide
    }, function(err,com){   
        if(!err && com.length > 0) {
            console.log("found! "+com);
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Encoding" : "utf-8"
            });
            //res.write(JSON.stringify(com));            
            //res.write("ID:"+com[0].slideID+" --- "+com[0].body+" com:"+com[0].toString);
            res.write(JSON.stringify(com));
        //console.log(com)
        } else {
            
            res.writeHead(404) ;
            res.write("Comment not found: "+err+", com:"+com);
        }
        res.end();            
    })
});



app.post('/api/:course/:lecture/:slide/comments', function(req, res, next){
    if (!req.rawBody){
        res.writeHead(400); //BAD_REQUEST
        res.write("Gimme some text, bro!");
        res.end();
        return;
    }
    var com = new Comment();    
    com.body = req.rawBody ? req.rawBody : "Placeholder Body";
    com.courseID = req.params.course;
    com.lectureID = req.params.lecture;
    com.slideID = req.params.slide;
    com.date = new Date();
    com.author = {
        username:"admin", 
        email:"franta@novak.cz"
    }; // TODO: implementovat ověřování
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


app.del('/api/:course/:lecture/:slide/comments', function(req, res, next){ 
    //TODO: napsat buď jako DELETE, nebo jako PUT
});
