/**
 * Likes Handler
 * 
 * 
 */

var mongoose = require("mongoose"); 
var Like = mongoose.model("Like"); // Model toho commentu, můžu instanciovat


app.get('/api/:course/:lecture/:slide/likes', function(req, res) {        
    var p = req.params;
    Like.find({
        courseID:p.course, 
        lectureID: p.lecture, 
        slideID: p.slide
    }, function(err,like){   
        if(!err) {            
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Encoding" : "utf-8"
            });            
            res.write(JSON.stringify(like));
        
        } else {            
            res.writeHead(404) ;
            res.write("No likes associated with this slide! : "+err+", like:"+like);
        }
        res.end();            
    })
});



app.post('/api/:course/:lecture/:slide/likes/:op', function(req, res, next){    
    //check logged user    
    if (!req.isAuthenticated()) { return next(); }
    //TODO: get like/dislike param
    var p = req.params;
    var parlike = p.op === "like";  // or "dislike"
    
    Like.find({
        courseID:p.course, 
        lectureID: p.lecture, 
        slideID: p.slide
    }, function(err,likes){
        var like;
        if(!err && likes.length > 0) {            
            like = likes[0];
            // TODO: Add username check
            if( parlike && like.likes.indexOf("admin-test") < 0) { //unique like - testing for username
                like.likes.push("admin"); // username;                
                like.likesCount += 1;                
            }
            else if (!parlike && like.dislikes.indexOf("admin-test") < 0) {
                like.dislikes.push("admin");
                like.dislikesCount += 1;                
            }
        
        } else {        
            like = new Like();
            like.courseID = p.course;
            like.lectureID = p.lecture;
            like.slideID = p.slide;
            if (parlike) {                
                like.likes.push("admin"); // username;
                like.likesCount = 1;
                like.dislikesCount = 0;                
            }else {
                like.dislikes.push("admin");
                like.likesCount = 0;
                like.dislikesCount = 1;
            }
        }
        
        like.save(function(err) {
            if(err) {
                console.log("ERR: "+err);
                throw err;
            }
            console.log("Like saved to DB: LIKES:"+like.likesCount+", DISLIKES:"+like.dislikesCount);
        
            res.writeHead(200);
            res.write("k thx bye");
            res.end();
        });
    });
});

