var parseURL = require('url').parse;
var path = require('path');
var querystring = require('querystring');
var http = require('http');
var editorAPI={};
editorAPI.urls = [ // list of available URL that this plugin handles
    ['^/api/[A-Za-z0-9-_]+/[A-Za-z0-9-_]+/slide[0-9]+/editor',  editor],
    ];
var defaults = require('./defaults');
var editor_ext =  require('../server_ext/editor/editor_ext.js');
var editor_auth_ext =  require('../server_ext/editor/e_authorization_ext.js');
/**
 * General router for editor API
 */
app.all('/api/:course/:lecture/slide:id/editor', function api(req, res) { // TODO check changes in url
    var query = require('url').parse(req.url).query;
    var args, path = parseURL(req.url).pathname;
    for (var i=0, n = editorAPI.urls.length; i<n; i++) { // projde vsechna url
        args = (new RegExp(editorAPI.urls[i][0])).exec(path);
        if (args !== null){ // if shoda 
            args.shift();
            args.unshift(res, req);
            if (typeof passed_args == 'array')
                args.concat(passed_args);
            editorAPI.urls[i][1].apply(this, args);
        }
    }
}
);

/**
 * Routes requests based on HTTP method
 */
function editor(res, req){    
    switch(req.method){
        case 'GET':
            var regx =/^\/api\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\/slide([0-9]+)\/editor/; 
            req.url.match(regx);
            editor_ext.getSlide(RegExp.$1, RegExp.$2, RegExp.$3, req.headers.host, res);
            break;
        case 'PUT':
            var append = req.body.append;
            var regx =/^\/api\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\/slide([0-9]+)\/editor/; 
            req.url.match(regx);
            
            if(editor_auth_ext.canModifyLecture(req, res,decodeURIComponent(RegExp.$1), decodeURIComponent(RegExp.$2) )){
                if(typeof  req.body == "undefined" || typeof  req.body.slide == "undefined"){
                    defaults.returnError(400, 'Missing field \"slide\" ', res); 
                }else{
                    if(append === "true"){
                        editor_ext.appendSlide(decodeURIComponent(RegExp.$1), decodeURIComponent(RegExp.$2), decodeURIComponent(RegExp.$3), req.headers.host, res, req.body.slide);
                    }else{
                        editor_ext.editSlide(decodeURIComponent(RegExp.$1), decodeURIComponent(RegExp.$2), decodeURIComponent(RegExp.$3), req.headers.host, res, req.body.slide);
                    }
                }
            }else{
                defaults.returnError(401,"Unauthorized", res);
            }

            break;
        case 'DELETE':
            var regx =/^\/api\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)\/slide([0-9]+)\/editor/; 
            req.url.match(regx);
            if(editor_auth_ext.canModifyLecture(req, res,RegExp.$1, RegExp.$2 )){
                editor_ext.removeSlide(RegExp.$1, RegExp.$2, RegExp.$3, req.headers.host, res);
            }else{
                defaults.returnError(401,"Unauthorized", res);
            }
            break;
        default:
            defaults.returnError(405, "Method not Allowed", res);
    }   
}

/**
 * Returns HTML source code for slide template given by <code>templateID</code>
 */
app.get('/api/template/:templateID/editor', function api(req, res) {
    var template = req.params.templateID;
    editor_ext.getTemplate(template, res);
});

/**
 * Returns HTML source code of entire presentation
 */
app.get('/api/:course/:lecture/editor', function api(req, res) { // TODO check changes in url
    var course = decodeURIComponent(req.params.course);//RegExp.$1;
    var lecture = decodeURIComponent(req.params.lecture);
    editor_ext.getLecture(course, lecture, res);
});

/**
 * Replaces HTML source code of entire presentation with given data (for raw editor)
 */
app.put('/api/:course/:lecture/raw/editor', function api(req, res) {
    var course = decodeURIComponent(req.params.course);//RegExp.$1;
    var lecture = decodeURIComponent(req.params.lecture);
    if(editor_auth_ext.canModifyLecture(req, res,course, lecture)){
        editor_ext.editLecture(course, lecture,  req.headers.host, res, req.body.content);            
    }else{
        defaults.returnError(401,"Unauthorized", res);  
    }
});

/**
 * Replaces HTML source code of entire presentation with given data (for edit view mode only)
 */
app.put('/api/:course/:lecture/editor', function api(req, res) { // TODO check changes in url
    var course = decodeURIComponent(req.params.course);//RegExp.$1;
    var lecture = decodeURIComponent(req.params.lecture);
    if(editor_auth_ext.canModifyLecture(req, res,course, lecture)){
        editor_ext.editLectureViewMode(course, lecture, req.headers.host,  res, req.body);
    }else{
        defaults.returnError(401,"Unauthorized", res);        
    }
});