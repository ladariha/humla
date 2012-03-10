//exports.parse =function parse($,slideIndex,response, _pathToCourse, _filename){
exports.parse =function parse($,slideIndex){
    try{
        var slide=1; 
    
        var _arr = {};
        for(var a=0;a<slideIndex.content.slides.titles.length;a++){
            _arr[slideIndex.content.slides.titles[a].order] = slideIndex.content.slides.titles[a];
        }
    
        slideIndex.content.github = [];
        $('body').find('.slide').each(function(index, element){
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
                code.slide_title= _arr[index+1].title;
                code.slide = slideIndex.baseURL+'#!/'+_arr[index+1].order; // this corresponds to number in slide's URL, so first slide has number 1
                code.slideid = _arr[index+1].slideid;
                slideIndex.content.github.push(code);
            });
            slide++;
        });
 
        slideIndex.sendResponse(); 
    }catch(e){
        slideIndex.sendResponse(); 
    }
};

