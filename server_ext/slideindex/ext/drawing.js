exports.parse =function parse($,slideIndex){   
    var temporary = {};      
    temporary.drawings = [];
    slideIndex.content.drawings = [];
    
    var _arr = {};
    for(var a=0;a<slideIndex.content.slides.titles.length;a++){
        _arr[slideIndex.content.slides.titles[a].order] = slideIndex.content.slides.titles[a];
    }
    
    slideIndex.drawingsCount = 0;
    $('body').find('.slide').each(function(index, element){
        $(this).find('.h-drawing').each(function(){
            slideIndex.drawingsCount++;
            var image = {};
            image.alt = $(this).attr('alt'); // prop() doesn't work here
            image.id = $(this).prop('id');
            image.slide = slideIndex.baseURL+'#!/'+_arr[index+1].order; // this corresponds to number in slide's URL, so first slide has number 1
            image.type = 'drawing';
            temporary.drawings.push(image);
        });
    });    
    if(temporary.drawings.length===0)
        slideIndex.sendResponse(slideIndex); 
    for(var i in temporary.drawings){
        parseSingleDrawing(temporary.drawings[i],slideIndex);
    }
};


/**
 * Parses single drawing. <p>Based on given drawing id, the HTTP HEAD request is made
 * and filename is taken from HTTP response. After this, the function checks
 * if all drawings have been parsed (variable slideIndex.drawingsCount is decreased
 * by one after each successful parsing), then method <code>sendResponse()</code> is called</p>
 * @param drawing Object that represents drawing, it's property id is use to  identify the drawing on Google Docs
 * @param slideIndex index container itself
 */
function parseSingleDrawing(drawing,slideIndex){
    //function parseSingleDrawing(drawing,slideIndex,response, _pathToCourse, _filename){
    
    var https = require('https');
    
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
            slideIndex.sendResponse(slideIndex); 
            return slideIndex;
        }
            
        res.on('data', function(d) {});
    });
    req.end();

    req.on('error', function(e) {
        drawing.filename = 'Error while requesting from Google Docs '+e.message;
        slideIndex.content.drawings.push(drawing);
        slideIndex.drawingsCount--;
        if(slideIndex.drawingsCount === 0){
            slideIndex.sendResponse(); 
            return slideIndex;
        }
    });   
};
