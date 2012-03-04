var facet_ext = require('../server_ext/facet/facetengine_ext.js');
var querystring = require('querystring');


app.get('/api/facets', function(req, res){
    facet_ext.types(res);
});




app.get('/api/facets/s_query/:schemakey', function(req, res){
    var page = querystring.parse(require('url').parse(req.url).query)['page'];
    var baseUrl = req.headers.host+req.url+"";
    if(baseUrl.lastIndexOf("?",0)>-1)
        baseUrl  = baseUrl.substring(0, baseUrl.lastIndexOf("?",0));
    if(typeof page=="undefined"){
        page =1;
    }else{
        page = parseInt(page);
        if(page<1)
            page=1;
    }
    facet_ext.simpleQuery(decodeURIComponent(req.params.schemakey),"",page, baseUrl, res);
});

app.get('/api/facets/s_query/:schemakey/:value', function(req, res){
    var baseUrl = req.headers.host+req.url+"";
    if(baseUrl.lastIndexOf("?")>-1){
        baseUrl  = baseUrl.substring(0, baseUrl.lastIndexOf("?"));
    }
    var page = querystring.parse(require('url').parse(req.url).query)['page'];
    if(typeof page=="undefined"){
        page =1;
    }else{
        page = parseInt(page);
        if(page<1)
            page=1;
    }
    facet_ext.simpleQuery(decodeURIComponent(req.params.schemakey), decodeURIComponent(req.params.value), page, baseUrl, res);
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

app.get('/api/facets/top/:shortName', function(req, res){
   facet_ext.topValues(decodeURIComponent(req.params.shortName),res);
    });