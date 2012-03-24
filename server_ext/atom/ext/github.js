/**
 * @author Vladimir Riha <rihavla1> URL: https://github.com/ladariha
 */

/**
 * Adds information about all github blocks to the feed
 * @param index slideindex container
 */
exports.createFeedList = function(index){
    var ul = "<p>Github code blocks</p><ul>";
    for(var i in index.github){
        var d = index.github[i];
        ul+="<li>";
            
        if(d.title.length>0){
            ul+=d.title;
            ul+="<a href=\""+d.slide+"\">"+d.title+"</a>";
        }else{
            ul+="<a href=\""+d.slide+"\">"+d.file+"</a>";
        }
        ul+="</li>";
    }
        
    ul+="</ul>"
    return ul;  
};
