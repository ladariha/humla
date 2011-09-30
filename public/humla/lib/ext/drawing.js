var fs     = require('fs');
var jquery = fs.readFileSync('./public/lib/jquery-1.6.3.min.js').toString();
var https = require('https');
var http = require('http');


var ex_drawing = {
    
    processSlide : function(slide) {

        var ext = this;
        var processDrawing = function(div) {
            var isrc = "https://docs.google.com/drawings/export/" + 
            ext.getParam(div, "format", ext.config.params.format) + "?id=" + div.id;
            var img = new Image();
            div.innerHTML = 'Loading picture...';
            img.setAttribute("alt", ext.getParam(div, "alt", ""));
            
            slide.async_cntr[ext.config.id]++;

            // check if there was an error
            img.onerror = function() {
                slide.error("error downloading the drawing from Google with id " + div.id + 
                    ". The drawing may not exist or you do not have persmissions to access it.");
                div.innerHTML = "Error!";
            };

            // clear info when loaded and add picture to slide
            img.onload = function() {
                div.innerHTML = '';
                div.appendChild(this);
                
                slide.async_cntr[ext.config.id]--;
            };

            img.src = isrc;
            
        };

        slide.async_cntr[this.config.id] = 0;
        divs = slide.element.getElementsByClassName('h-drawing');
        for (var i = 0; i < divs.length; i++)
            processDrawing(divs[i]);    
    
    }
    
};
exports.parse =function parse($,slideIndex){
//exports.parse =function parse($,slideIndex,response, _pathToCourse, _filename){
    var temporary = {};      
    temporary.drawings = [];
    var slide=1; 
    slideIndex.drawingsCount = 0;
    $('body').find('.slide').each(function(){
        $(this).find('.h-drawing').each(function(){
            slideIndex.drawingsCount++;
            var image = {};
            image.alt = $(this).attr('alt'); // prop() doesn't work here
            image.id = $(this).prop('id');
            image.slide = slideIndex.baseURL+'#/'+slide; // this corresponds to number in slide's URL, so first slide has number 1
            image.type = 'drawing';
            temporary.drawings.push(image);
        });
        slide++;    
    });    
    for(i in temporary.drawings){
//        parseSingleDrawing(temporary.drawings[i],slideIndex,response, _pathToCourse, _filename);
        parseSingleDrawing(temporary.drawings[i],slideIndex);
    }

}


/**
 * Parses single drawing. <p>Based on given drawing id, the HTTP HEAD request is made
 * and filename is taken from HTTP response. After this, the function checks
 * if all drawings have been parsed (variable slideIndex.drawingsCount is decreased
 * by one after each successful parsing), then method <code>sendResponse()</code> is called</p>
 * @param drawing Object that represents drawing, it's property id is use to 
 * identify the drawing on Google Docs
 *
 */
function parseSingleDrawing(drawing,slideIndex){
//function parseSingleDrawing(drawing,slideIndex,response, _pathToCourse, _filename){
    
    var id = drawing.id;
    var options = {
        host: 'docs.google.com',
        port: 443,
        path: '/drawings/d/'+id+'/export/png?id='+id+'&pageid=p',
        method: 'HEAD'
    };
    
    var req = https.request(options, function(res) {
        if(res.statusCode === 200){
            var contDisp = res.headers['content-disposition'];
            var i = contDisp.indexOf("filename=\"")+10;
            var j = contDisp.lastIndexOf("\"");
            drawing.exportURL = 'https://docs.google.com/drawings/d/'+id+'/export/png?id='+id+'&pageid=p';
            drawing.filename = contDisp.substring(i,j);
            slideIndex.content.drawings.push(drawing);
                
        }else{
            // TODO handle error
            drawing.filename = 'Error while requesting from Google Docs '+res.statusCode;
            slideIndex.content.drawings.push(drawing);
                
        }
        slideIndex.drawingsCount--;
        if(slideIndex.drawingsCount === 0){
            console.log("CAS");
            slideIndex.sendResponse(slideIndex); 
//            slideIndex.sendResponse(slideIndex,response, _pathToCourse, _filename); 
            return slideIndex;
        }
            
        res.on('data', function(d) {});
    });
    req.end();

    req.on('error', function(e) {
        drawing.filename = 'Error while requesting from Google Docs '+e.message;
        slideIndex.content.drawings.push(drawing);
        if(slideIndex.drawingsCount === 0){
            slideIndex.sendResponse(slideIndex); 
//            slideIndex.sendResponse(slideIndex,response, _pathToCourse, _filename); 
            return slideIndex;
        }
    });   
}