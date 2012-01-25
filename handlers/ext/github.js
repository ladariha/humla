//exports.parse =function parse($,slideIndex,response, _pathToCourse, _filename){
exports.parse =function parse($,slideIndex){
    var slide=1; 
    slideIndex.content.github = [];
    $('body').find('.slide').each(function(){
        $(this).find('.h-github').each(function(){
            var code = {};
            code.owner = $(this).attr('user-repo');
            code.file = $(this).attr('name');
            if(code.owner!==null && code.owner.length>0){
                var githubInfo = (code.owner).split("/");
                code.owner = githubInfo[0];
                if(githubInfo.length===2){
                    code.project = githubInfo[1];
                }
            }
            code.title= slideIndex.content.slides.titles[slide-1];
            code.slide = slideIndex.baseURL+'#!/'+slide; // this corresponds to number in slide's URL, so first slide has number 1
            slideIndex.content.github.push(code);
        });
        slide++;
    });
 
    slideIndex.sendResponse(); 

};

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
