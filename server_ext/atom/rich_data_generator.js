/**
 * @author Vladimir Riha <rihavla1> URL: https://github.com/ladariha
 */

var extensions = new Array();
var path = require("path");
var EXTENSIONS_DIRECTORY = (path.join(path.dirname(__filename), './ext')).toString();
var fs   = require('fs');


fs.readdir( EXTENSIONS_DIRECTORY, function( err, files ) { // require() all js files in humla extensions directory
    files.forEach(function(file) {
        if(endsWith(file, "js")){
            var req = require( EXTENSIONS_DIRECTORY+'/'+file );
            extensions.push(req);
        }
    });
});

/**
 * Creates HTML content for lecure in atom parameter specified by iterator
 * @param atom atom container (instance of AtomModule)
 * @param iterator index of lecture in atom.lectures
 * @param domain domain
 */
exports.create =  function(atom, iterator, domain){
    var port = 80;
    if(domain.indexOf(":",0)>-1){// contains port
        domain = domain.substring(0, domain.indexOf(":",0));
        port = 1*domain.substring(domain.indexOf(":",0)+1, domain.length)
    }
    var http = require('http');
    var p =domain+""+"/api/"+atom.lectures[iterator].courseID+"/"+atom.lectures[iterator].lectureID+"/index?refresh=true";
    var options = {
        host: domain,
        port: port,
        path:"api/"+atom.lectures[iterator].courseID+"/"+atom.lectures[iterator].lectureID+"/index?refresh=true",
        method: 'GET'
    };
    
    var content = '';
    var request = http.request(options, function(res2) {
        res2.setEncoding('utf8'); 
        res2.on('data', function (chunk) {
            content += chunk;
        });

        res2.on('end', function () {
            if(res2.statusCode === 200){
                var index = eval('(' + content + ')');
                var generatedLists = "";
                generatedLists+= imagesToHtml(index);
                generatedLists+= codeBlocksToHtml(index);
                generatedLists+= structureToHtml(index);
                extensions.forEach(function (ext){
                    if(ext.createFeedList !== null && typeof ext.createFeedList== 'function'){
                        try{
                            generatedLists+="<div>"+ext.createFeedList(index)+"</div>\n";  // THIS IS SYNCHRONOUS SINCE EXTENSIONS SHOULD ONLY CREATE STRUCTURE FROM GIVEN DATA, NO I/O NEEDED   
                        }catch(err){
                            generatedLists+="";
                        }
                    }
                });
                atom.notify(generatedLists, iterator);
            }else{
                atom.notify('', iterator);            
            }   
        }); 
    });
    request.end();
    request.on('error', function(e) {
        atom.notify('', iterator);
    });
};


function imagesToHtml(index){
    var ul = "<p>Images </p><ul>";
    for(var i in index.images){
        var d = index.images[i];
        ul+="<li>";
            
        if(d.alt.length>0){
            ul+="<a href=\""+d.slideURL+"\">"+d.alt+"</a>";
        }else{
            ul+="<a href=\""+d.slideURL+"\">"+d.filename+"</a>";
        }
        ul+="</li>";
    }
        
    ul+="</ul>"
    return ul;   
}
    
    
function codeBlocksToHtml(index){
    var ul = "<p>Code blocks</p><ul>";
    for(var i in index.codeBlocks){
        var d = index.codeBlocks[i];
        ul+="<li><a href=\""+d.slideURL+"\">"+d.title+" ("+d.language+")"+"</a></li>";
    }
    ul+="</ul>"
    return ul; 
}
    
function structureToHtml(index){
    var ul = "<p>Slides:</p><ul>\n";
    for(var item in index.structure.index){
        var t = index.structure.index[item]; 
        ul +="<li><a href=\"http://"+t.url+"\">"+t.title+"</a>\n"
            
        if(t.chapters && t.chapters.length>0){
            ul+="<ul>\n";
            for(var chapter in t.chapters){
                var ch = t.chapters[chapter];
                ul +="<li><a href=\"http://"+ch.url+"\">"+ch.title+"</a>\n"
                if(ch.slides && ch.slides.length>0){
                    ul+="<ul>\n";
                    for(var s in ch.slides){
                        var simpleSlide = ch.slides[s];
                        ul +="<li><a href=\"http://"+simpleSlide.url+"\">"+simpleSlide.title+"</a>\n"
                     
                    }
                    ul +="</ul>\n"
                }
            }
            ul +="</ul>\n"
        }
        ul += "</li>";
    }
    ul+="</ul>"
    return ul;
}

function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}