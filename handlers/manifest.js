var https = require('https');
var path = require('path');
/**
 * Processes the GET request for the manigest file. 
 * @param req
 * @param res
 */
app.get('/data/slides/:course/:lecture/manifest.mf', function(req, res){
    require('../server_ext/manifest/manifest_ext.js').manifest(req.params.course, req.params.lecture, res, path, req.url);
});


