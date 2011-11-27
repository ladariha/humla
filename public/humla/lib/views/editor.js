
var view_editor = {
    content : "",
    enterSlide : function(slide) {
        var inx = slide.number - 1;
        console.log(slide);  
        if (inx - 2 >= 0) humla.slides[inx - 2].addClass("far-previous");
        if (inx - 1 >= 0) humla.slides[inx - 1].addClass("previous");
        humla.slides[inx].addClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].addClass("next");
        if (inx + 2 < humla.slides.length) humla.slides[inx + 2].addClass("far-next");
        
        
        // get slide info
        var presentationUrl = window.location.href;
        var fields = presentationUrl.split("/");
        var firstIndex = presentationUrl.indexOf("slides", 0)+7;
        presentationUrl = presentationUrl.substr(firstIndex, presentationUrl.length);
        var course = fields[5];//presentationUrl.substr(0, presentationUrl.indexOf("/"));
        var lecture= fields[6].substr(0, fields[6].indexOf("."));
        var slideNumber = slide.number;
        // get slide source code from server
        var url = "/api/"+course+"/"+lecture+"/"+"slide"+slideNumber+"/editor"; 
        var request = new XMLHttpRequest();
        request.open("GET", url, false);
        request.onreadystatechange = function(){
            if (request.readyState==4) {
                if(request.status==200){
                    var object = eval('(' + request.responseText + ')');
                    var textarray = object.html.split("\n");
                    var finalString = '';
                    console.log('1');
                    for(var k in textarray){
                        if(textarray[k].length>0){
                            finalString = finalString+"\n"+textarray[k].replace(/^ +/gm, '') ;
                        }
                    }
                    finalString = finalString.replace(/\&amp;/g,'&');
                    
                    var el;
                    if(!document.getElementById("tmp_editor_container")){
                        el = document.createElement('div');
                        el.setAttribute('id', 'tmp_editor_container');
                        document.body.appendChild(el);
                    }else{
                        el = document.getElementById("tmp_editor_container");
                    }
                    // TODO remove element on view change   
                    slideEditorContent  =finalString;
                    document.getElementById('tmp_editor_container').innerHTML =    '<iframe id=\"editor_frame\"src=\"../../../humla/lib/views/editor/_editor.html" width=\"100%\" height=\"100%\"></iframe>'
                    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
                }
            }
        };
        request.send(null);  
        
        
    },        

    leaveSlide : function(slide) {
        var inx = slide.number - 1;
        var contentFromLeavingSlide = humla.controler.window.frames[0].window.codemirror_editor.getValue();
        if (inx - 2 >= 0) humla.slides[inx - 2].removeClass("far-previous");
        if (inx - 1 >= 0) humla.slides[inx - 1].removeClass("previous");
        humla.slides[inx].removeClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].removeClass("next");
        if (inx + 2 < humla.slides.length) humla.slides[inx + 2].removeClass("far-next");
        
        var el = document.getElementById("tmp_editor_container");
        if(el){
            document.getElementById('tmp_editor_container').innerHTML =    '';
            el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
        }
    }          
};
