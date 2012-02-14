var parseURL = require('url').parse;
var path = require('path');
var fs     = require('fs');
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var SLIDE_TEMPLATE = (path.join(path.dirname(__filename),'../public/data/templates')).toString();
var defaults = require('./defaults');
var microdataParser = require('./microdata/microdataparser');

app.get('/api/:course/:lecture/microdata', function api(req, res) {
    var course = req.params.course;//RegExp.$1;
    var lecture = req.params.lecture;
    
    fs.readFile(SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html", function (err, data) {
        if (err){
            defaults.returnError(404, err.message, res);
        }else{
            microdataParser.items(data.toString(), function(data){
                
                var container = {};
                container.url = req.headers.host+"/api"+"/"+course+"/"+lecture+"/microdata"
                container.course = course;
                container.lecture = lecture;
                container.presentationUrl = req.headers.host+RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+'.html';
                container.itemtypes = new Array();
                container.items = data.items;
                
                for(var i=0;i<data.items.length;i++){
                    finalize(data.items[i]);
                }
                
                
                function finalize(microitem){
                    if(microitem.properties){ // if item contains other items
                        for(var key in microitem.properties){
                            for(var j=0; j< microitem.properties[key].length; j++){
                                finalize(microitem.properties[key][j]);        
                            }
                        }
                    }
                    if(microitem.type){
                        for(var j=0; j<microitem.type.length;j++){ // iterate all itemtypes
                            var a  = {};
                            a.url = container.url+encodeURIComponent(microitem.type[j]+"");
                            a.type = microitem.type[j]+"";   
                        
                            if(container.items.indexOf(a)<0)
                                container.itemtypes.push(a);        // if new insert
                        }
                    }
                }
                
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.write(JSON.stringify(container, undefined, 2));
                res.end();
            });
        }
    
    });
});



app.get('/api/:course/:lecture/microdata/:itemtype', function api(req, res) {
    var itemtype=decodeURIComponent(req.params.itemtype);
    var course = req.params.course;//RegExp.$1;
    var lecture = req.params.lecture;
    
    fs.readFile(SLIDES_DIRECTORY+ '/'+course+'/'+lecture+".html", function (err, data) {
        if (err){
            defaults.returnError(404, err.message, res);
        }else{
            microdataParser.items(data.toString(), function(data){
                
                var container = {};
                container.url = req.headers.host+"/api"+"/"+course+"/"+lecture+"/microdata/"+encodeURIComponent(itemtype);
                container.course = course;
                container.lecture = lecture;
                container.allmicrodataUrl = req.headers.host+"/api"+"/"+course+"/"+lecture+"/microdata"
                container.presentationUrl = req.headers.host+RAW_SLIDES_DIRECTORY+"/"+course+"/"+lecture+'.html';
                container.items = new Array();
                
                for(var i=0;i<data.items.length;i++){
                    finalize(data.items[i]);
                }
                
                function finalize(microitem){
                    if(microitem.properties){ // if item contains other items
                        for(var key in microitem.properties){
                            for(var j=0; j< microitem.properties[key].length; j++){
                                finalize(microitem.properties[key][j]);        
                            }
                        }
                    }

                    if(microitem.type){
                        for(var j=0; j<microitem.type.length;j++){ // iterate all itemtypes
                            if(microitem.type[j] && microitem.type[j].toLowerCase() === itemtype.toLowerCase()){
                                container.items.push(microitem);
                                j = microitem.type.length+1;
                            }
                        }
                    }
                }
               
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.write(JSON.stringify(container, undefined, 2));
                res.end();
            });
        }
    
    });
});