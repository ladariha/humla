var ex_editor = {
    
    processSlide : function(slide) {
 
        if(humla.online===1){
            var presentationUrl = window.location.href;
            var fields = presentationUrl.split("/");
            var firstIndex = presentationUrl.indexOf("slides", 0)+7;
            presentationUrl = presentationUrl.substr(firstIndex, presentationUrl.length);
            var course = fields[5];//presentationUrl.substr(0, presentationUrl.indexOf("/"));
            var lecture= fields[6].substr(0, fields[6].indexOf("."));
            var slideNumber = slide.number;
            var baseLink = "../../../pages/editor/";
            var et = "<div id=\"editor-toolbar\">";
            var link = baseLink+"?lecture="+lecture+"&course="+course+"&slide="+slideNumber;
            et += "<a class=\"editor-link\" href=\""+link+"\" title=\"Edit slide\"><img src=\"../../../humla/lib/ext/editor-edit.png\" alt=\"Edit\"/></a>";
            et += "<a class=\"editor-link\" href=\"javascript:removeSlide('"+course+"','"+lecture+"','"+slideNumber+"');\" title=\"Delete slide\"><img src=\"../../../humla/lib/ext/editor-delete.png\" alt=\"Delete\"/></a>";
            link = baseLink+"?lecture="+lecture+"&course="+course+"&append=true&slide="+slideNumber;
            et += "<a class=\"editor-link\" href=\""+link+"\" title=\"Append new slide after this\"><img src=\"../../../humla/lib/ext/editor-add.png\" alt=\"Append\"/></a>";
            et += "</div>";
            slide.element.innerHTML = slide.element.innerHTML+et;
        }        
       
              
    }
};

function removeSlide(course, lecture, slideNumber){
    var request = new XMLHttpRequest;
    var url = "/api/"+course+"/"+lecture+"/slide"+slideNumber+"/editor";
    var params = "course="+course+"&lecture="+lecture+"&slide="+slideNumber;
    request.open("DELETE", url, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.setRequestHeader("Content-length", params.length);
    request.setRequestHeader("Connection", "close");
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                window.location.reload();
                alert("Slide " +slideNumber+" removed.");
            }else{
                alert(request.status+": "+request.statusText);
            }
        }else{
            alert(request.responseText);
        }
        
    };
    request.send(params);
    
}
