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

app.post('/api/complexQuery/facets', function(req, res){
    try{
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
        
        var q = facet_ext.query(req.body.booleanQueries, req.body.valueQueries);
        facet_ext.complexQuery(q, page, baseUrl, res);
    }catch(er){
        console.log(er);
        console.log(">>");
        require('./defaults.js').returnError(400, er.toString(), res);
    }
});

app.get('/api/facets/top/:shortName', function(req, res){
    facet_ext.topValues(decodeURIComponent(req.params.shortName),res);
});
    
app.get('/api/facets/total/:shortName', function(req, res){
    facet_ext.total(decodeURIComponent(req.params.shortName),res);
});