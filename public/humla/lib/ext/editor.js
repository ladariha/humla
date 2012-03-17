var menu_link;

var ex_editor = {
    processMenu: function(menu) {        
        menu_link = menu;        
        menu.addTab("editor",{            
            name:"Editor",
            show_layer:true,
            html:""
        });
    },
    
    
    
    enterSlide: function(slide){
        //    processSlide : function(slide) {
        var mode = humla.controler.currentView.config.object+"";
        if(humla.online===1 && (mode==="view_slideshow" || mode==="view_browser")){ ///&& (humla.controler.currentView.config.id==1 || humla.controler.currentView.config.id==2)
            var presentationUrl = window.location.href;
            var fields = presentationUrl.split("/");
            var firstIndex = presentationUrl.indexOf("slides", 0)+7;
            presentationUrl = presentationUrl.substr(firstIndex, presentationUrl.length);
            var course = fields[5];//presentationUrl.substr(0, presentationUrl.indexOf("/"));
            var lecture= fields[6].substr(0, fields[6].indexOf("."));
            var slideNumber = slide.number;
            var baseLink = "../../../pages/editor/index.html"; 
            //            var et = "<div class=\"editor-toolbar\">";
            var link = baseLink+"?lecture="+lecture+"&course="+course+"&slide="+slideNumber;
            //            et += "<a class=\"editor-link\" href=\""+link+"\" title=\"Edit slide\"><img src=\"../../../humla/lib/ext/editor-edit.png\" alt=\"Edit\"/></a>";
            //            et += "<a class=\"editor-link\" href=\"javascript:removeSlide('"+course+"','"+lecture+"','"+slideNumber+"');\" title=\"Delete slide\"><img src=\"../../../humla/lib/ext/editor-delete.png\" alt=\"Delete\"/></a>";
            //            
            //            et += "<a class=\"editor-link\" href=\""+link+"\" title=\"Append new slide after this\"><img src=\"../../../humla/lib/ext/editor-add.png\" alt=\"Append\"/></a>";
            //            et += "</div>";
            
            var menuT  ="<ul style=\"list-style: none;\">";
            menuT+="<li><a href=\""+link+"\" title=\"Edit slide\"><img src=\"../../../humla/lib/ext/editor-edit.png\" alt=\"Edit\"/>Edit slide</a></li>";
            menuT+="<li><a href=\"javascript:removeSlide('"+course+"','"+lecture+"','"+slideNumber+"');\" title=\"Delete slide\"><img src=\"../../../humla/lib/ext/editor-delete.png\" alt=\"Delete\"/>Delete slide</a></li>";
            link = baseLink+"?lecture="+lecture+"&course="+course+"&append=true&slide="+slideNumber;
            menuT+="<li><a  href=\""+link+"\" title=\"Append new slide after this\"><img src=\"../../../humla/lib/ext/editor-add.png\" alt=\"Append\"/>Append new slide</a></li>";
            menuT+="</ul>";
            document.getElementById('menu-editor').innerHTML = "<span class='menu-close-button' onclick='humla.menu.showLayer(\"\",true);'>X</span><h1>Edit slide "+slide.number+"</h1>"+menuT;            
        }                   
    }
};

function removeSlide(course, lecture, slideNumber){
    var request = new XMLHttpRequest();
    var url = "/api/"+course+"/"+lecture+"/slide"+slideNumber+"/editor";
    request.open("DELETE", url, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                window.location.reload();
            }else{
                alert(request.status+": "+request.statusText);
            }
        }else{
            alert(request.responseText);
        }
        
    };
    request.send(null);

}