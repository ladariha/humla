exports.createFeedList = function(index){
    
    var ul = "<p>Google Books</p><ul >";
    for(var i in index.gbooks){
        var d = index.gbooks[i];
        var t = "";
        for(var j in d.author){
            t +=d.author[j]+",";
        }
        ul+="<li><a href=\""+d.slide+"\">"+t+":"+d.title+"</a></li>";
    }
        
    ul+="</ul>"
    return ul;  
    
};