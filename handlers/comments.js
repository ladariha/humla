/**
 * Comments handler
 * 
 * @author Petr Mikota <bubersson> URL: https://github.com/bubersson
 */

var mongoose = require("mongoose"); 
var Comment = mongoose.model("Comment"); // Model toho commentu, můžu instanciovat


app.get('/api/:course/:lecture/:slide/comments', function(req, res) {    
    
    // show all comments TODO: filter by lecture
    var p = req.params;
    
    var query = Comment.find({
        courseID:p.course, 
        lectureID: p.lecture, 
        slideID: p.slide
    });
    query.asc('date');    
    query.limit(10); // TODO: vymyslet listování po deseti!!!
    

    query.exec(function (err, com) {  
        if(!err && com.length > 0) {
            //console.log("found! "+com);
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Encoding" : "utf-8"
            });            
            res.write(JSON.stringify(com));
        //console.log(com)
        } else {
            
            res.writeHead(404) ;
            res.write("Comment not found: "+err+", com:"+com);
        }
        res.end();            
    });
    
});



app.post('/api/:course/:lecture/:slide/comments', function(req, res, next){
    console.log("REQ-body "+JSON.stringify(req.body));
    console.log("REQ-user "+JSON.stringify(req.user));
    if (!req.isAuthenticated()) {
        res.writeHead(401); //UNAUTHORIZED
        res.write("You ain't no logged, bro!");
        res.end();
        return;
    }
   
    if (!req.body){
        res.writeHead(400); //BAD_REQUEST
        res.write("Gimme some text, bro!");
        res.end();
        return;
    }
    var com = new Comment();    
    com.body = req.body.text ? req.body.text : "Err";
    com.courseID = req.params.course;
    com.lectureID = req.params.lecture;
    com.slideID = req.params.slide;
    com.date = new Date();
    com.author = {
        username:req.user.email, 
        email:req.user.email
    }; 
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


app.put('/api/:course/:lecture/:slide/comments', function(req, res, next){ 
    //TODO: napsat buď jako DELETE, nebo jako PUT
    });
