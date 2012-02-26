var https = require('https');
var defaults = require('../../handlers/defaults');

/**
 * Returns information about Google Book specified by bookid in form specified by mode
 * @param bookid Google Book ID
 * @param mode output format (1,2,3 for HTML snippet, 4 for javascript object - if called internally or json - if called via REST
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 */
exports.book = function(bookid, mode, res, callback){
    try{
        var options = {
            host: 'www.googleapis.com',
            port: 443,
            path: "/books/v1/volumes/"+bookid,
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
                    generateGbooksOutput(mode, content, res, callback);
                }else{
                    returnThrowError(res2.statusCode, content, res, callback);
                }   
            }); 
        });
        request.end();
        request.on('error', function(e) {
            returnThrowError(500, e.message, res, callback);
        });
    }catch(err){
        returnThrowError(500,err, res, callback);
    }
    
}

function generateGbooksOutput(mode, content, res, callback){
    
    switch(mode){
        case "0":
            generateGbooksSimpleList(content,  res,callback);
            break;
        case "1":
            generateGbooksBigThumbnail(content, res,callback);
            break;
        case "2":
            generateGbooksSmallThumbnail(content, res,callback);
            break;
        case "4":
            returnData(res, callback, content);
        default:
            res.writeHead(400, {
                'Content-Type': 'text/plain'
            });
            res.write("Not supported mode "+mode);
            res.end();    
    }
}


function generateGbooksSmallThumbnail(data, res, callback){
    // better ugly variable than IO operation... 
    //    var content = "<h4><a href=\"##INFOLINK\">##TITLE</a></h4><div class=\"gbooksColumns2\"><div class=\"gbooksImgLeft\"><img class=\"gbooksImgLarge\" src=\"##IMG\"/></div><div class=\"gbooksRight\" data-gbooks-isbn=\"##ISBN\" data-gbooks-id=\"##ID\" data-gbooks-category=\"##CATEGORY\"><ul class=\"gbooksListSecret\"><li>##AUTHOR </li><li> ##PUBLISHER, ##DATE</li><br/><li class=\"gbooksDesc\">##DESC</li></ul></div></div>";
    var content = "<div class=\"gbooksSmall\"><div class=\"gbooksColumns2\"><table><tbody><tr><td><img class=\"gbooksImgLarge\" src=\"##IMG\"/></td><td><div class=\"gbooksRight\" data-gbooks-isbn=\"##ISBN\" data-gbooks-id=\"##ID\" data-gbooks-category=\"##CATEGORY\"><ul class=\"gbooksListSecret\"><li><span><a href=\"##INFOLINK\">##TITLE</a></span></li><li class=\"gbooksTitle\">##AUTHOR </li><li> ##PUBLISHER, ##DATE</li></ul></div></td></tr></tbody></table></div></div>";
 
    data = eval('(' + data + ')');
    if(typeof data.volumeInfo.industryIdentifiers[1] != "undefined"){
        content = content.replace("##ISBN", data.volumeInfo.industryIdentifiers[1].identifier);
    }else{
        if(typeof content.volumeInfo.industryIdentifiers[0]!= "undefined"){
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
    if(typeof data.volumeInfo.categories !="undefined"){
        for (var i = 0; i < data.volumeInfo.categories.length; i++)
            temp +=data.volumeInfo.categories[i]+",";
        temp = temp.substr(0, temp.length-1);
    }
    content = content.replace("##CATEGORY", temp);   

    temp="";
    if(typeof data.volumeInfo.authors !="undefined"){
        for (var i = 0; i < data.volumeInfo.authors.length; i++)
            temp +=data.volumeInfo.authors[i]+",";
        temp = temp.substr(0, temp.length-1);
    }
    content = content.replace("##AUTHOR", temp);
     
    returnDataHTML(res, callback, content);
}
function generateGbooksSimpleList(data, res, callback){
    // better ugly variable than IO operation... 
    var content = "<ul class=\"gbooksList\"><li title=\"Google Books Link\" data-gbooks-isbn=\"##ISBN\" data-gbooks-id=\"##ID\" data-gbooks-category=\"##CATEGORY\"><a href=\"##INFOLINK\"> ##AUTHOR - <span class=\"gbooksTitle\">##TITLE</span>. [##DATE]    </a></li></ul>";
 
    data = eval('(' + data + ')');
    if(typeof data.volumeInfo.industryIdentifiers[1] != "undefined"){
        content = content.replace("##ISBN", data.volumeInfo.industryIdentifiers[1].identifier);
    }else{
        if(typeof content.volumeInfo.industryIdentifiers[0]!= "undefined"){
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
    if(typeof data.volumeInfo.categories !="undefined"){
        for (var i = 0; i < data.volumeInfo.categories.length; i++)
            temp +=data.volumeInfo.categories[i]+",";
        temp = temp.substr(0, temp.length-1);
    }
    content = content.replace("##CATEGORY", temp);

    temp="";
    if(typeof data.volumeInfo.authors !="undefined"){
        for (var i = 0; i < data.volumeInfo.authors.length; i++)
            temp +=data.volumeInfo.authors[i]+",";
           
        temp = temp.substr(0, temp.length-1);
    }
    content = content.replace("##AUTHOR", temp);
            
    returnDataHTML(res, callback, content);
}


function generateGbooksBigThumbnail(data, res, callback){
    // better ugly variable than IO operation... 
    //    var content = "<h4><a href=\"##INFOLINK\">##TITLE</a></h4><div class=\"gbooksColumns2\"><div class=\"gbooksImgLeft\"><img class=\"gbooksImgLarge\" src=\"##IMG\"/></div><div class=\"gbooksRight\" data-gbooks-isbn=\"##ISBN\" data-gbooks-id=\"##ID\" data-gbooks-category=\"##CATEGORY\"><ul class=\"gbooksListSecret\"><li>##AUTHOR </li><li> ##PUBLISHER, ##DATE</li><br/><li class=\"gbooksDesc\">##DESC</li></ul></div></div>";
    var content = "<div class=\"gbooksBig\"><span><a href=\"##INFOLINK\">##TITLE</a></span><div class=\"gbooksColumns2\"><table><tbody><tr><td><img class=\"gbooksImgLarge\" src=\"##IMG\"/></td><td><div class=\"gbooksRight\" data-gbooks-isbn=\"##ISBN\" data-gbooks-id=\"##ID\" data-gbooks-category=\"##CATEGORY\"><ul class=\"gbooksListSecret\"><li>##AUTHOR </li><li> ##PUBLISHER, ##DATE</li><br/><li class=\"gbooksDesc\">##DESC</li></ul></div></td></tr></tbody></table></div></div>";
 
    data = eval('(' + data + ')');
    if(typeof data.volumeInfo.industryIdentifiers[1] != "undefined"){
        content = content.replace("##ISBN", data.volumeInfo.industryIdentifiers[1].identifier);
    }else{
        if(typeof content.volumeInfo.industryIdentifiers[0]!= "undefined"){
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
    if(typeof data.volumeInfo.categories !="undefined"){
        for (var i = 0; i < data.volumeInfo.categories.length; i++)
            temp +=data.volumeInfo.categories[i]+",";
           
        temp = temp.substr(0, temp.length-1);
    }
    content = content.replace("##CATEGORY", temp);

    temp="";
    if(typeof data.volumeInfo.authors !="undefined"){
        for (var i = 0; i < data.volumeInfo.authors.length; i++)
            temp +=data.volumeInfo.authors[i]+",";
           
        temp = temp.substr(0, temp.length-1);
    }
    content = content.replace("##AUTHOR", temp);
            
    returnDataHTML(res, callback, content);
}

function returnData(res,callback, data){
    if(typeof res!="undefined"){
        res.writeHead(200, {
            'Content-Type':'application/json'
        });
        
        res.write(JSON.stringify(data, undefined, 2));
        res.end();
    }else{
        if(typeof callback!="undefined")
            callback(null, data);
        else
            throw "Nor HTTP Response or callback function defined!";
    }
}

function returnThrowError(code, msg, res, callback){
    if(typeof res!="undefined")
        defaults.returnError(code, msg, res);
    else{
        if(typeof callback!="undefined"){
            callback(msg, null);
        }else{
            throw msg;
        }
    }       
}

/**
 * Returns data in plain html format (if it's called via REST) or  calls  callback with javascript object as parameter
 * @param res HTTP response (if called via REST)
 * @param callback callback function (if called via internal API)
 * @param data data to be retuned (in HTML for via REST and javascript object internally)
 */
function returnDataHTML(res, callback, data){
    if(typeof res!="undefined"){
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.write(data);
        res.end();
    }else{
        if(typeof callback!="undefined"){
            var o = {};
            o.html = data;
            callback(null, o);
        }else
            throw "Nor HTTP Response or callback function defined!";
    }
}