var https = require('https');
var path = require('path');

app.get('/data/slides/:course/:lecture/manifest.mf', function(req, res){
    require('../server_ext/manifest/manifest_ext.js').manifest(req.params.course, req.params.lecture, res, path, req.url);
});


