var ex_slideindex = {
    
    processSlide : function(slide) {},


    showIndex : function(slide){
        var presentationUrl = window.location.href; 
        if(humla.controler.currentView.config.id==1 || humla.controler.currentView.config.id==2){
            
            var slideIndexKey = "slideindex_"+presentationUrl;
            if (humla.utils.window.localStorage && humla.utils.window.localStorage.getItem(slideIndexKey)){
                alert(humla.utils.window.localStorage.getItem(slideIndexKey), 20000, "Content <img src=\"../../../humla/lib/ext/refresh.png\" class=\"slideindex-clearImg\" onClick=\"clearIndexFromLocalStorage('"+presentationUrl+"');\" title=\"Clear index from cache\" alt=\"Clear index from cache\"/>");
            }else{
            
                var ext = this;
        
                var fields = presentationUrl.split("/");
                var firstIndex = presentationUrl.indexOf("slides", 0)+7;
                presentationUrl = presentationUrl.substr(firstIndex, presentationUrl.length);
                var course = fields[5];//presentationUrl.substr(0, presentationUrl.indexOf("/"));
                var lecture= fields[6].substr(0, fields[6].indexOf("."));
        
                var request = new XMLHttpRequest;
                var url = "/api/"+course+"/"+lecture+"/index";
                request.open("GET", url, true);
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.setRequestHeader("Content-length", 200);
                request.setRequestHeader("Connection", "close");
                request.onreadystatechange = function(){
                    if (request.readyState==4) {
                        if (request.status == 200){
                            var index = eval('(' + request.responseText + ')');
                            ext.designIndex(slide, index);
                        }else{
                            alert(request.status+": "+request.statusText);
                        }
            
                    }else{
                        alert(request.responseText);
                    }
        
                };
                request.send(null); 
            }
            
        }
    },
    designIndex : function(slide, index){
        var presentationUrl = window.location.href;
        var drawings = this.drawingsToHtml(index);
        var github = this.githubToHtml(index);
        var images = this.imagesToHtml(index);
        var codeBlocks = this.codeBlocksToHtml(index);
        var structure = this.structureToHtml(index);
        var slideIndexKey = "slideindex_"+presentationUrl;
        if (humla.utils.window.localStorage){
            humla.utils.window.localStorage.removeItem(slideIndexKey);
            humla.utils.window.localStorage.setItem(slideIndexKey,structure+images+drawings+codeBlocks+github);
        }
        alert(structure+images+drawings+codeBlocks+github, 20000, "Content <img src=\"../../../humla/lib/ext/refresh.png\" class=\"slideindex-clearImg\" onClick=\"clearIndexFromLocalStorage('"+presentationUrl+"');\" title=\"Clear index from cache\" alt=\"Clear index from cache\"/>");
    },
    
    imagesToHtml : function(index){
        var ul = "<p>Images:   <img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-images-top');\" title=\"Show content\" alt=\"Show content\"/></p><ul id=\"slideindex-images-top"+"\" class=\"slideindex-hidden\" >";
        for(var i in index.images){
            var d = index.images[i];
            ul+="<li class=\"slideindex-li\">";
            
            if(d.alt.length>0){
                ul+=d.alt;
            }else{
                ul+=d.filename;
            }
            ul+="<img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-images"+i+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-images"+i+"\" class=\"slideindex-hidden\" >\n";
            ul+="<li class=\"slideindex-li\">Slide: <a href=\"http://"+d.slideURL+"\">"+d.slideURL+"</a> </li>"
            ul+="<li class=\"slideindex-li\">Filename: "+d.filename+"</li>"
            ul+="</ul></li>";
        }
        
        ul+="</ul>"
        return ul;   
    },
    
    drawingsToHtml : function(index){
        var ul = "<p>Google Drawings:   <img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-drawings-top');\" title=\"Show content\" alt=\"Show content\"/></p><ul id=\"slideindex-drawings-top"+"\" class=\"slideindex-hidden\" >";
        for(var i in index.drawings){
            var d = index.drawings[i];
            ul+="<li class=\"slideindex-li\">";
            
            if(d.alt.length>0){
                ul+=d.alt;
            }else{
                ul+=d.filename;
            }
            ul+="<img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-drawings"+i+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-drawings"+i+"\" class=\"slideindex-hidden\" >\n";
            ul+="<li class=\"slideindex-li\">Slide: <a href=\"http://"+d.slide+"\">"+d.slide+"</a> </li>"
            ul+="<li class=\"slideindex-li\">Filename: "+d.filename+"</li>"
            ul+="<li class=\"slideindex-li\">ID: "+d.id+"</li>"
            ul+="<li class=\"slideindex-li\">Export URL: <a href=\""+d.exportURL+"\">Google Drawings</a> </li>";
            ul+="</ul></li>";
        }
        
        ul+="</ul>"
        return ul;        
    },
    
    githubToHtml : function(index){
        var ul = "<p>Github code blocks:   <img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-github-top');\" title=\"Show content\" alt=\"Show content\"/></p><ul id=\"slideindex-github-top"+"\" class=\"slideindex-hidden\" >";
        for(var i in index.github){
            var d = index.github[i];
            ul+="<li class=\"slideindex-li\">";
            
            if(d.title.length>0){
                ul+=d.title;
            }else{
                ul+=d.file;
            }
            ul+="<img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-github"+i+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-github"+i+"\" class=\"slideindex-hidden\" >\n";
            ul+="<li class=\"slideindex-li\">Slide: <a href=\"http://"+d.slide+"\">"+d.slide+"</a> </li>"
            ul+="<li class=\"slideindex-li\">Filename: "+d.file+"</li>"
            if(d.owner.length>0){
                ul+="<li class=\"slideindex-li\">Owner: "+d.owner+"</li>"
            }
            ul+="</ul></li>";
        }
        
        ul+="</ul>"
        return ul; 
    },
    
    codeBlocksToHtml : function(index){
        var ul = "<p>Code blocks:   <img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-codes-top');\" title=\"Show content\" alt=\"Show content\"/></p><ul id=\"slideindex-codes-top"+"\" class=\"slideindex-hidden\" >";
        for(var i in index.codeBlocks){
            var d = index.codeBlocks[i];
            ul+="<li class=\"slideindex-li\">";
            
            ul+=d.title;
            
            ul+="<img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-codes"+i+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-codes"+i+"\" class=\"slideindex-hidden\" >\n";
            ul+="<li class=\"slideindex-li\">Slide: <a href=\"http://"+d.slideURL+"\">"+d.slideURL+"</a> </li>"
            ul+="<li class=\"slideindex-li\">Language: "+d.language+"</li>"
            ul+="</ul></li>";
        }
        
        ul+="</ul>"
        return ul; 
    },
    
    structureToHtml : function(index){
        var ul = "<p>Slides:</p><ul class=\"slideindex-ul\">\n";
        for(var item in index.structure.index){
            var t = index.structure.index[item]; 
            ul +="<li class=\"slideindex-li\"><a class=\"slideindex-structure-top\" href=\"http://"+t.url+"\">"+t.title+"</a>\n"
            
            if(t.chapters && t.chapters.length>0){
                ul+="<img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-structure-secondLevel"+item+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-structure-secondLevel"+item+"\" class=\"slideindex-hidden\" >\n";
                for(var chapter in t.chapters){
                    var ch = t.chapters[chapter];
                    ul +="<li class=\"slideindex-li\"><a class=\"slideindex-structure-chapter\" href=\"http://"+ch.url+"\">"+ch.title+"</a>\n"
                    if(ch.slides && ch.slides.length>0){
                        ul+="<img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-structure-thirdLevel"+chapter+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-structure-thirdLevel"+chapter+"\" class=\"slideindex-hidden\" >\n";
                        for(var s in ch.slides){
                            var simpleSlide = ch.slides[s];
                            ul +="<li class=\"slideindex-li\"><a class=\"slideindex-structure-slide\" href=\"http://"+simpleSlide.url+"\">"+simpleSlide.title+"</a>\n"
                     
                        }
                        ul +="</ul>\n"
                    }
                }
                ul +="</ul>\n"
            }
            ul += "</li>";
        }
        ul+="</ul>"
        return ul;
    }

};

function dropdown(img, idOflist){
    if(img.src.indexOf("left")>0){
        img.src="../../../humla/lib/ext/slideindex-down.png";
        img.title = "Hide content";
        img.alt="Hide content";
        document.getElementById(idOflist).setAttribute("class", 'slideindex-visible');
    }else{
        img.src="../../../humla/lib/ext/slideindex-left.png";  
        document.getElementById(idOflist).setAttribute("class", 'slideindex-hidden');
        img.title = "Show content";
        img.alt="Show content";
    }
}

function clearIndexFromLocalStorage(presentationUrl){
    var slideIndexKey = "slideindex_"+presentationUrl;
    if (humla.utils.window.localStorage){
        humla.utils.window.localStorage.removeItem(slideIndexKey);
    }
    alert("Cleared, close content window and reload it by pressing \"i\" to view changes",1,""); // not really visible, just to hide original window
}