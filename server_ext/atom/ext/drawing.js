exports.createFeedList = function(index){
    var ul = "<p>Google Drawings </p><ul >";
    for(var i in index.drawings){
        var d = index.drawings[i];
        ul+="<li>";
        if(d.alt.length>0){
            ul+="<a href=\""+d.slide+"\">"+d.alt+"</a>";
        }else{
            ul+="<a href=\""+d.slide+"\">"+d.filename+"</a>";
        }
        ul+="</li>"
    }
        
    ul+="</ul>"
    return ul;          
};