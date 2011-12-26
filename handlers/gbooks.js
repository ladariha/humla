var https = require('https');

app.get('/api/gbooks/:id/:mode', function(req, res){
    
    var id = req.params.id;
    var mode = req.params.mode;
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
                generateGbooksOutput(mode, content, req, res);
            }else{
                res2.writeHead(res2.statusCode, {
                    'Content-Type': 'text/plain'
                });
                res2.write(content);
                res2.end(); 
            }   
        }); 
    });
    request.end();
    request.on('error', function(e) {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        
        res.write(e.message);
        res.end();  
    });
    
});


function generateGbooksOutput(mode, content, req, res){
    
    switch(mode){
        case "0":
            generateGbooksSimpleList(content, req, res);
            break;
        case "1":
            generateGbooksBigThumbnail(content, req, res);
            break;
        case "2":
            generateGbooksSmallThumbnail(content, req, res);
            break;
        default:
            res.writeHead(400, {
                'Content-Type': 'text/plain'
            });
            res.write("Not supported mode "+mode);
            res.end();    
    }
}


function generateGbooksSmallThumbnail(data, req, res){
    // better ugly variable than IO operation... 
    //    var content = "<h4><a href=\"##INFOLINK\">##TITLE</a></h4><div class=\"gbooksColumns2\"><div class=\"gbooksImgLeft\"><img class=\"gbooksImgLarge\" src=\"##IMG\"/></div><div class=\"gbooksRight\" data-gbooks-isbn=\"##ISBN\" data-gbooks-id=\"##ID\" data-gbooks-category=\"##CATEGORY\"><ul class=\"gbooksListSecret\"><li>##AUTHOR </li><li> ##PUBLISHER, ##DATE</li><br/><li class=\"gbooksDesc\">##DESC</li></ul></div></div>";
    var content = "<div class=\"gbooksSmall\"><div class=\"gbooksColumns2\"><table><tbody><tr><td><img class=\"gbooksImgLarge\" src=\"##IMG\"/></td><td><div class=\"gbooksRight\" data-gbooks-isbn=\"##ISBN\" data-gbooks-id=\"##ID\" data-gbooks-category=\"##CATEGORY\"><ul class=\"gbooksListSecret\"><li><span><a href=\"##INFOLINK\">##TITLE</a></span></li><li class=\"gbooksTitle\">##AUTHOR </li><li> ##PUBLISHER, ##DATE</li></ul></div></td></tr></tbody></table></div></div>";
 
    data = eval('(' + data + ')');
    if(data.volumeInfo.industryIdentifiers[1] !== undefined){
        content = content.replace("##ISBN", data.volumeInfo.industryIdentifiers[1].identifier);
    }else{
        if(content.volumeInfo.industryIdentifiers[0]!== undefined){
            content = content.replace("##ISBN", data.volumeInfo.industryIdentifiers[0].identifier);    
        }else{
            content = content.replace("##ISBN", "-1");    
        }
    }
    content = content.replace("##ID", data.id);
    content = content.replace("##INFOLINK", data.volumeInfo.infoLink);
    content = content.replace("##TITLE", data.volumeInfo.title);
    content = content.replace("##IMG", data.volumeInfo.imageLinks.smallThumbnail);
    content = content.replace("##PUBLISHER", data.volumeInfo.publisher);
    content = content.replace("##DATE", data.volumeInfo.publishedDate);
           
    var temp="";
    for (var i = 0; i < data.volumeInfo.categories.length; i++)
        temp +=data.volumeInfo.categories[i]+",";
           
    temp = temp.substr(0, temp.length-1);
    content = content.replace("##CATEGORY", temp);

    temp="";
    for (var i = 0; i < data.volumeInfo.authors.length; i++)
        temp +=data.volumeInfo.authors[i]+",";
           
    temp = temp.substr(0, temp.length-1);
    content = content.replace("##AUTHOR", temp);
            
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    }); 
    res.write(content);
    res.end(); 

}
function generateGbooksSimpleList(data, req, res){
    // better ugly variable than IO operation... 
    var content = "<ul class=\"gbooksList\"><li title=\"Google Books Link\" data-gbooks-isbn=\"##ISBN\" data-gbooks-id=\"##ID\" data-gbooks-category=\"##CATEGORY\"><a href=\"##INFOLINK\"> ##AUTHOR - <span class=\"gbooksTitle\">##TITLE</span>. [##DATE]    </a></li></ul>";
 
    data = eval('(' + data + ')');
    if(data.volumeInfo.industryIdentifiers[1] !== undefined){
        content = content.replace("##ISBN", data.volumeInfo.industryIdentifiers[1].identifier);
    }else{
        if(content.volumeInfo.industryIdentifiers[0]!== undefined){
            content = content.replace("##ISBN", data.volumeInfo.industryIdentifiers[0].identifier);    
        }else{
            content = content.replace("##ISBN", "-1");    
        }
    }
    content = content.replace("##ID", data.id);
    content = content.replace("##INFOLINK", data.volumeInfo.infoLink);
    content = content.replace("##TITLE", data.volumeInfo.title);
    content = content.replace("##DATE", data.volumeInfo.publishedDate);
           
    var temp="";
    for (var i = 0; i < data.volumeInfo.categories.length; i++)
        temp +=data.volumeInfo.categories[i]+",";
           
    temp = temp.substr(0, temp.length-1);
    content = content.replace("##CATEGORY", temp);

    temp="";
    for (var i = 0; i < data.volumeInfo.authors.length; i++)
        temp +=data.volumeInfo.authors[i]+",";
           
    temp = temp.substr(0, temp.length-1);
    content = content.replace("##AUTHOR", temp);
            
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    }); 
    res.write(content);
    res.end();  
}


function generateGbooksBigThumbnail(data, req, res){
    // better ugly variable than IO operation... 
    //    var content = "<h4><a href=\"##INFOLINK\">##TITLE</a></h4><div class=\"gbooksColumns2\"><div class=\"gbooksImgLeft\"><img class=\"gbooksImgLarge\" src=\"##IMG\"/></div><div class=\"gbooksRight\" data-gbooks-isbn=\"##ISBN\" data-gbooks-id=\"##ID\" data-gbooks-category=\"##CATEGORY\"><ul class=\"gbooksListSecret\"><li>##AUTHOR </li><li> ##PUBLISHER, ##DATE</li><br/><li class=\"gbooksDesc\">##DESC</li></ul></div></div>";
    var content = "<div class=\"gbooksBig\"><span><a href=\"##INFOLINK\">##TITLE</a></span><div class=\"gbooksColumns2\"><table><tbody><tr><td><img class=\"gbooksImgLarge\" src=\"##IMG\"/></td><td><div class=\"gbooksRight\" data-gbooks-isbn=\"##ISBN\" data-gbooks-id=\"##ID\" data-gbooks-category=\"##CATEGORY\"><ul class=\"gbooksListSecret\"><li>##AUTHOR </li><li> ##PUBLISHER, ##DATE</li><br/><li class=\"gbooksDesc\">##DESC</li></ul></div></td></tr></tbody></table></div></div>";
 
    data = eval('(' + data + ')');
    if(data.volumeInfo.industryIdentifiers[1] !== undefined){
        content = content.replace("##ISBN", data.volumeInfo.industryIdentifiers[1].identifier);
    }else{
        if(content.volumeInfo.industryIdentifiers[0]!== undefined){
            content = content.replace("##ISBN", data.volumeInfo.industryIdentifiers[0].identifier);    
        }else{
            content = content.replace("##ISBN", "-1");    
        }
    }
    content = content.replace("##ID", data.id);
    content = content.replace("##INFOLINK", data.volumeInfo.infoLink);
    content = content.replace("##TITLE", data.volumeInfo.title);
    content = content.replace("##IMG", data.volumeInfo.imageLinks.thumbnail);
    content = content.replace("##PUBLISHER", data.volumeInfo.publisher);
    if(data.volumeInfo.description.length > 200){
        content = content.replace("##DESC", data.volumeInfo.description.substring(0,200)+"...");    
    }else{
        content = content.replace("##DESC", data.volumeInfo.description);    
    }
    
    content = content.replace("##DATE", data.volumeInfo.publishedDate);
           
    var temp="";
    for (var i = 0; i < data.volumeInfo.categories.length; i++)
        temp +=data.volumeInfo.categories[i]+",";
           
    temp = temp.substr(0, temp.length-1);
    content = content.replace("##CATEGORY", temp);

    temp="";
    for (var i = 0; i < data.volumeInfo.authors.length; i++)
        temp +=data.volumeInfo.authors[i]+",";
           
    temp = temp.substr(0, temp.length-1);
    content = content.replace("##AUTHOR", temp);
            
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    }); 
    res.write(content);
    res.end();  
}