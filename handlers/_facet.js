var facet_ext = require('../server_ext/facet/facetengine_ext.js');



app.get('/api/facets', function(req, res){
    
    facet_ext.types(res);
    
    
    });




app.get('/api/facets/:schema/:key/:value', function(req, res){
    var course = req.params.course;
    Lecture.find({
        isActive:true,
        courseID: course
        
    }, function(err,lectures){
        if(!err && lectures.length > 0) {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.write(JSON.stringify(lectures, null, 4));
            res.end();  
        } else {
            getLecturesFromFS(req, res, course);
        }             
    });
});

app.get('/api/facets/complex', function(req, res){
    var course = req.params.course;
    Lecture.find({
        isActive:true,
        courseID: course
        
    }, function(err,lectures){
        if(!err && lectures.length > 0) {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.write(JSON.stringify(lectures, null, 4));
            res.end();  
        } else {
            getLecturesFromFS(req, res, course);
        }             
    });
});