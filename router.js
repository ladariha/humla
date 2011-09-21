var sys = require('sys');
var parseURL = require('url').parse;

//TODO: cache regexps
exports.route = function(req, res, urls, passed_args){
    var args, path = parseURL(req.url).pathname;
    for (var i=0, n = urls.length; i<n; i++) { // projde vsechna url
        args = new RegExp(urls[i][0]).exec(path);
        if (args !== null){ // if shoda 
            args.shift();
            args.unshift(res, req);
            if (typeof passed_args == 'array')
                args.concat(passed_args);
            urls[i][1].apply(this, args);
            return true;
        }
    }
    
    console.log("No request handler found for " + path);
    res.writeHead(404, {
        "Content-Type": "text/plain"
    });
    res.write("404 Not found");
    res.end();
    
    return false;
};

//used for nesting url lookups
exports.include = function(urls){
    return function(req, res){
        route(req, res, urls, Array.prototype.slice.call(arguments, 2));
    };
};



