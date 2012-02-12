var parseURL = require('url').parse;
var path = require('path');
var fs     = require('fs');
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var SLIDE_TEMPLATE = (path.join(path.dirname(__filename),'../public/data/templates')).toString();
var defaults = require('./defaults');
var microdata = require('./microdata/microdataparser');

app.get('/api/:course/:lecture/microdata', function api(req, res) {
    var course = req.params.course;//RegExp.$1;
    var lecture = req.params.lecture;
    
    fs.readFile(SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html", function (err, data) {
        if (err){
            defaults.returnError(404, err.message, res);
        }else{
            microdata.items(data.toString(), function(data){
                ;
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.write(JSON.stringify(data, undefined, 2));
                res.end();
            });
           
        }
  
    });
});
