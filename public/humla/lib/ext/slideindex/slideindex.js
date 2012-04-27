/**
 * @author Vladimir Riha <rihavla1> URL: https://github.com/ladariha
 */

var ex_slideindex = {
    
    processSlide : function(slide) {},


    showIndex : function(slide){
        var presentationUrl = window.location.href; 
        //        if(humla.controler.currentView.config.id==1 || humla.controler.currentView.config.id==2){
            
        var fields = presentationUrl.split("/");
        var course = fields[5];//presentationUrl.substr(0, presentationUrl.indexOf("/"));
        var lecture= fields[6].substr(0, fields[6].indexOf("."));
        var slideIndexKey = "slideindex_"+course+"_"+lecture;
        if (humla.utils.window.localStorage && humla.utils.window.localStorage.getItem(slideIndexKey)){
            alert(humla.utils.window.localStorage.getItem(slideIndexKey), 20000, "Content <img src=\"../../../humla/lib/ext/slideindex/refresh.png\" class=\"slideindex-clearImg\" onClick=\"clearIndexFromLocalStorage('"+presentationUrl+"');\" title=\"Clear index from cache\" alt=\"Clear index from cache\"/>");
        }else{
            
            var ext = this;
            var firstIndex = presentationUrl.indexOf("slides", 0)+7;
            presentationUrl = presentationUrl.substr(firstIndex, presentationUrl.length);
            var request = new XMLHttpRequest();
            var url = "/api/"+course+"/"+lecture+"/index";
            request.open("GET", url, true);
            request.setRequestHeader("Accept", "application/json");
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
            
    //        }
    },
    designIndex : function(slide, index){
        var presentationUrl = window.location.href;
        var fields = presentationUrl.split("/");
        var course = fields[5];//presentationUrl.substr(0, presentationUrl.indexOf("/"));
        var lecture= fields[6].substr(0, fields[6].indexOf("."));
        var drawings = this.drawingsToHtml(index);
        var github = this.githubToHtml(index);
        var images = this.imagesToHtml(index);
        var codeBlocks = this.codeBlocksToHtml(index);
        var structure = this.structureToHtml(index);
        var gbooks = this.gbooksToHtml(index);
        var slideIndexKey = "slideindex_"+course+"_"+lecture;
        var finalContent = structure+images+drawings+codeBlocks+github+gbooks;
        
        if (humla.utils.window.localStorage){
            humla.utils.window.localStorage.removeItem(slideIndexKey);
            humla.utils.window.localStorage.setItem(slideIndexKey,finalContent);
        }
        alert(finalContent, 20000, "Content <img src=\"../../../humla/lib/ext/slideindex/refresh.png\" class=\"slideindex-clearImg\" onClick=\"clearIndexFromLocalStorage('"+presentationUrl+"');\" title=\"Clear index from cache\" alt=\"Clear index from cache\"/>");
    },
    
    gbooksToHtml : function(index){
        var ul = "<p>Google Books:   <img src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\"  class=\"slideindex-img-pointer\" onClick=\"dropdown(this, 'slideindex-gbooks-top');\" title=\"Show content\" alt=\"Show content\"/></p><ul id=\"slideindex-gbooks-top"+"\" class=\"slideindex-hidden\" >";
        for(var i in index.gbooks){
            try{
                var d = index.gbooks[i];
                ul+="<li class=\"slideindex-li\">"+d.title;
                ul+="<img src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\" class=\"slideindex-img-pointer\" onClick=\"dropdown(this, 'slideindex-gbooks"+i+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-gbooks"+i+"\" class=\"slideindex-hidden\" >\n";
                ul+="<li class=\"slideindex-li\">Slide: <a href=\"http://"+d.slide+"\">"+d.slide+"</a> </li>"
                var t = "";
                for(var j in d.author){
                    t +=d.author[j]+",";
                }
               
                ul+="<li class=\"slideindex-li\">Author: "+t.substr(0, t.length-1)+"</li>"
                t = "";
                for(var j in d.category){
                    t +=d.category[j]+", ";
                }
               
                ul+="<li class=\"slideindex-li\">Category: "+t.substr(0, t.length-1)+"</li>"
                ul+="<li class=\"slideindex-li\">ID: "+d.id+"</li>";
                ul+="<li class=\"slideindex-li\">URL: <a href=\""+d.url+"\">Google Books</a></li>";
                ul+="</ul></li>"; 
            }catch(e){}
            
        }
        
        ul+="</ul>"
        return ul;  
    },
    
    
    imagesToHtml : function(index){
        var ul = "<p>Images:   <img class=\"slideindex-img-pointer\" src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-images-top');\" title=\"Show content\" alt=\"Show content\"/></p><ul id=\"slideindex-images-top"+"\" class=\"slideindex-hidden\" >";
        for(var i in index.images){
            try{
                var d = index.images[i];
                ul+="<li class=\"slideindex-li\">";
            
                if(typeof d.alt!="undefined" && d.alt.length>0){
                    ul+=d.alt;
                }else{
                    ul+=d.filename;
                }
                ul+="<img src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\" class=\"slideindex-img-pointer\" onClick=\"dropdown(this, 'slideindex-images"+i+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-images"+i+"\" class=\"slideindex-hidden\" >\n";
                ul+="<li class=\"slideindex-li\">Slide: <a href=\"http://"+d.slideURL+"\">"+d.slideURL+"</a> </li>"
                ul+="<li class=\"slideindex-li\">Filename: "+d.filename+"</li>"
                ul+="</ul></li>"; 
            }catch(e){   
            }
        }
        
        ul+="</ul>"
        return ul;   
    },
    
    drawingsToHtml : function(index){
        var ul = "<p>Google Drawings:   <img class=\"slideindex-img-pointer\" src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-drawings-top');\" title=\"Show content\" alt=\"Show content\"/></p><ul id=\"slideindex-drawings-top"+"\" class=\"slideindex-hidden\" >";
        for(var i in index.drawings){
            try{
                var d = index.drawings[i];
                ul+="<li class=\"slideindex-li\">";
            
                if(typeof d.alt!="undefined" && d.alt.length>0){
                    ul+=d.alt;
                }else{
                    ul+=d.filename;
                }
                ul+="<img src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\" class=\"slideindex-img-pointer\" onClick=\"dropdown(this, 'slideindex-drawings"+i+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-drawings"+i+"\" class=\"slideindex-hidden\" >\n";
                ul+="<li class=\"slideindex-li\">Slide: <a href=\"http://"+d.slide+"\">"+d.slide+"</a> </li>"
                ul+="<li class=\"slideindex-li\">Filename: "+d.filename+"</li>"
                ul+="<li class=\"slideindex-li\">ID: "+d.id+"</li>"
                ul+="<li class=\"slideindex-li\">Export URL: <a href=\""+d.exportURL+"\">Google Drawings</a> </li>";
                ul+="</ul></li>"; 
            }catch(e){
                
            }
           
        }
        
        ul+="</ul>"
        return ul;        
    },
    
    githubToHtml : function(index){
        var ul = "<p>Github code blocks:   <img class=\"slideindex-img-pointer\" src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-github-top');\" title=\"Show content\" alt=\"Show content\"/></p><ul id=\"slideindex-github-top"+"\" class=\"slideindex-hidden\" >";
        for(var i in index.github){
            try{
                var d = index.github[i];
                ul+="<li class=\"slideindex-li\">";
            
                if(typeof d.title!="undefined" && d.title.length>0){
                    ul+=d.slide_title;
                }else{
                    ul+=d.file;
                }
                ul+="<img src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\" class=\"slideindex-img-pointer\" onClick=\"dropdown(this, 'slideindex-github"+i+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-github"+i+"\" class=\"slideindex-hidden\" >\n";
                ul+="<li class=\"slideindex-li\">Slide: <a href=\"http://"+d.slide+"\">"+d.slide+"</a> </li>"
                ul+="<li class=\"slideindex-li\">Filename: "+d.file+"</li>"
                if(d.owner.length>0){
                    ul+="<li class=\"slideindex-li\">Owner: "+d.owner+"</li>"
                }
                ul+="</ul></li>"; 
            }catch(e){
                
            }
           
        }
        
        ul+="</ul>"
        return ul; 
    },
    
    codeBlocksToHtml : function(index){
        var ul = "<p>Code blocks:   <img class=\"slideindex-img-pointer\" src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\" onClick=\"dropdown(this, 'slideindex-codes-top');\" title=\"Show content\" alt=\"Show content\"/></p><ul id=\"slideindex-codes-top"+"\" class=\"slideindex-hidden\" >";
        for(var i in index.codeBlocks){
            try{
                var d = index.codeBlocks[i];
                ul+="<li class=\"slideindex-li\">";
                ul+=d.title;
            
                ul+="<img src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\" class=\"slideindex-img-pointer\" onClick=\"dropdown(this, 'slideindex-codes"+i+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-codes"+i+"\" class=\"slideindex-hidden\" >\n";
                ul+="<li class=\"slideindex-li\">Slide: <a href=\"http://"+d.slideURL+"\">"+d.slideURL+"</a> </li>"
                ul+="<li class=\"slideindex-li\">Language: "+d.language+"</li>"
                ul+="</ul></li>"; 
            }catch(e){
                
            }
           
        }
        
        ul+="</ul>"
        return ul; 
    },
    
    structureToHtml : function(index){
        var ul = "<p>Slides:</p><ul class=\"slideindex-ul\">\n";
        for(var item in index.structure.index){
            
            try{
                var t = index.structure.index[item]; 
                ul +="<li class=\"slideindex-li\"><a class=\"slideindex-structure-top\" href=\"http://"+t.url+"\">"+t.title+"</a>\n"
            
                if(t.chapters && t.chapters.length>0){
                    ul+="<img src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\" class=\"slideindex-img-pointer\" onClick=\"dropdown(this, 'slideindex-structure-secondLevel"+item+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-structure-secondLevel"+item+"\" class=\"slideindex-hidden\" >\n";
                    for(var chapter in t.chapters){
                        var ch = t.chapters[chapter];
                        ul +="<li class=\"slideindex-li\"><a class=\"slideindex-structure-chapter\" href=\"http://"+ch.url+"\">"+ch.title+"</a>\n"
                        if(ch.slides && ch.slides.length>0){
                            ul+="<img src=\"../../../humla/lib/ext/slideindex/slideindex-left.png\" class=\"slideindex-img-pointer\" onClick=\"dropdown(this, 'slideindex-structure-thirdLevel"+chapter+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-structure-thirdLevel"+chapter+"\" class=\"slideindex-hidden\" >\n";
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
            }catch(e){
                
            }
            
        }
        ul+="</ul>"
        return ul;
    }

};

function dropdown(img, idOflist){
    if(img.src.indexOf("left")>0){
        img.src="../../../humla/lib/ext/slideindex/slideindex-down.png";
        img.title = "Hide content";
        img.alt="Hide content";
        document.getElementById(idOflist).setAttribute("class", 'slideindex-visible');
    }else{
        img.src="../../../humla/lib/ext/slideindex/slideindex-left.png";  
        document.getElementById(idOflist).setAttribute("class", 'slideindex-hidden');
        img.title = "Show content";
        img.alt="Show content";
    }
}

function clearIndexFromLocalStorage(presentationUrl){
    var presentationUrl = window.location.href; 
    var fields = presentationUrl.split("/");
    var course = fields[5];
    var lecture= fields[6].substr(0, fields[6].indexOf("."));
    var slideIndexKey = "slideindex_"+course+"_"+lecture;
    if (humla.utils.window.localStorage){
        humla.utils.window.localStorage.removeItem(slideIndexKey);
    }
    alert("Cleared, close content window and reload it by pressing \"i\" to view changes",1,""); // not really visible, just to hide original window
}
