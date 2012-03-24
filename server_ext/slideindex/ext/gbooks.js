/**
 * @author Vladimir Riha <rihavla1> URL: https://github.com/ladariha
 */

/**
 * Parses Google Books
 * @param $ jQuery
 * @param slideIndex index container itself
 */
exports.parse =function parse($,slideIndex){   
    try{
        var temporary = {};      
        temporary.gbooks = [];
        slideIndex.content.gbooks= [];
        var _arr = {};
        for(var a=0;a<slideIndex.content.slides.titles.length;a++){
            _arr[slideIndex.content.slides.titles[a].order] = slideIndex.content.slides.titles[a];
        }
    
        slideIndex.gBooksCount = 0;
        $('body').find('.slide').each(function(index, element){
            $(this).find('.h-gbooks').each(function(){
                slideIndex.gBooksCount++;
                var gbook = {};
                gbook.id = $(this).prop('id');
                gbook.slideid = _arr[index+1].slideid;
                gbook.slide_title= _arr[index+1].title;
                gbook.slide = slideIndex.baseURL+'#!/'+_arr[index+1].order; // this corresponds to number in slide's URL, so first slide has number 1
                gbook.type = 'gbooks';
                temporary.gbooks.push(gbook);
            });
        });   
    
        if(temporary.gbooks.length===0)
            slideIndex.sendResponse(slideIndex); 
    
        for(var i in temporary.gbooks){
            parseSingleGbook(temporary.gbooks[i],slideIndex);
        }
    }catch(e){
       slideIndex.sendResponse(); 
    }
};


/**
 * Parses single Google Book
 * @param gbook object with information about gbook that was found in parse method
 * @param slideIndex index container itself
 */
function parseSingleGbook(gbook,slideIndex){
    var https = require('https');
    var id = gbook.id;
    var options = {
        host: 'www.googleapis.com',
        port: 443,
        path: "/books/v1/volumes/"+id,
        method: 'GET'
    };
    
    var content = '';
    var request = https.request(options, function(res2) {
        res2.setEncoding('utf8'); 
        res2.on('data', function (chunk) {
            content += chunk;
        });

        res2.on('end', function () {
            if(res2.statusCode === 200){
                var data = eval('(' + content + ')');
                if(typeof data.volumeInfo.industryIdentifiers[1] != "undefined"){
                    gbook.isbn=data.volumeInfo.industryIdentifiers[1].identifier;
                }else{
                    if(typeof content.volumeInfo.industryIdentifiers[0]!= "undefined"){
                        gbook.isbn = data.volumeInfo.industryIdentifiers[0].identifier;    
                    }else{
                        gbook.isbn = "-1";
                    }
                }
                gbook.id = data.id;
                gbook.url = data.volumeInfo.infoLink;
                gbook.title = data.volumeInfo.title;
                gbook.imageUrl = data.volumeInfo.imageLinks.thumbnail;
                gbook.publisher  = data.volumeInfo.publisher;
                gbook.date = data.volumeInfo.publishedDate;
                gbook.category = [];
                var temp="";
                if(typeof data.volumeInfo.categories !="undefined")
                    for (var i = 0; i < data.volumeInfo.categories.length; i++)
                        gbook.category[i] = data.volumeInfo.categories[i];
           
                gbook.author = [];
                if(typeof data.volumeInfo.authors !="undefined")
                    for (var i = 0; i < data.volumeInfo.authors.length; i++)
                        gbook.author[i]=data.volumeInfo.authors[i];

                slideIndex.content.gbooks.push(gbook);
            }else{
                gbook.title = "Error on loading Google Books info";
                slideIndex.content.gbooks.push(gbook); 
            }   

            slideIndex.gBooksCount--;
            if(slideIndex.gBooksCount === 0){
                slideIndex.sendResponse(slideIndex); 
                return slideIndex;
            }
            
        }); 
    });
    request.end();
    request.on('error', function(e) {
        gbook.title = "Error on loading Google Books info";
        slideIndex.content.gbooks.push(gbook);
        slideIndex.gBooksCount--;
        if(slideIndex.gBooksCount === 0){
            slideIndex.sendResponse(slideIndex); 
            return slideIndex;
        }
    });
};
