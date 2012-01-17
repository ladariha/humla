
var view_editor = {
    Container : function(){
        this.content = [];
        this.originalSlideContent='';
    },
    
    
    
    enterSlide : function(slide) {
        var inx = slide.number - 1;
        if (inx - 2 >= 0) humla.slides[inx - 2].addClass("far-previous");
        if (inx - 1 >= 0) humla.slides[inx - 1].addClass("previous");
        humla.slides[inx].addClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].addClass("next");
        if (inx + 2 < humla.slides.length) humla.slides[inx + 2].addClass("far-next");
        if(humla.utils.window.localStorage){
        
            // get slide info
            var finalString;
            finalString = this.loadSlide(slide); // in case of going to slide that was already opened in editor view in current session
            if(!finalString){
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
                            for(var k in textarray){
                                if(textarray[k].length>0){
                                    finalString = finalString+"\n"+textarray[k].replace(/^ +/gm, '') ;
                                }
                            }
                            finalString = finalString.replace(/\&amp;/g,'&');
                            var t = JSON.parse(humla.utils.window.localStorage.getItem('editorview_container'));
                            t.originalSlideContent = finalString;
                            humla.utils.window.localStorage.setItem('editorview_container',JSON.stringify(t));
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
                            document.getElementById('tmp_editor_container').innerHTML ='';
                            document.getElementById('tmp_editor_container').innerHTML =    '<iframe id=\"editor_frame\"src=\"../../../humla/lib/views/editor/_editor.html" width=\"100%\" height=\"100%\"></iframe>'
                            el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
                        }
                    }
                };
                request.send(null);               
            }else{
                
                var el;
                if(!document.getElementById("tmp_editor_container")){
                    el = document.createElement('div');
                    el.setAttribute('id', 'tmp_editor_container');
                    document.body.appendChild(el);
                }else{
                    el = document.getElementById("tmp_editor_container");
                }
                
                slideEditorContent  =finalString;
                var co = this.loadContainer();
                co.originalSlideContent=finalString;
                this.saveContainer(co);
                document.getElementById('tmp_editor_container').innerHTML ='';
                document.getElementById('tmp_editor_container').innerHTML =    '<iframe id=\"editor_frame\"src=\"../../../humla/lib/views/editor/_editor.html" width=\"100%\" height=\"100%\"></iframe>'
                el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
            }
        }
    },        

    leaveSlide : function(slide) {
        this.storeSlide(slide);
        var inx = slide.number - 1;
        if (inx - 2 >= 0) humla.slides[inx - 2].removeClass("far-previous");
        if (inx - 1 >= 0) humla.slides[inx - 1].removeClass("previous");
        humla.slides[inx].removeClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].removeClass("next");
        if (inx + 2 < humla.slides.length) humla.slides[inx + 2].removeClass("far-next");       
        this.resetDialog();
    },          
    
    enterView: function(view){
        if(!humla.utils.window.localStorage)
            alert("Local storage is not available, editor view is not available")  
        else{
            var cache = new this.Container();
            cache.content[this.initContentArray()-1]=null;
            this.saveContainer(cache);
        }
    },
    
    initContentArray: function(){
        var slides = document.getElementsByTagName("div");
        var count = 0;
        for (var i=0;i<slides.length; ++i) {
            if(/slide/i.test(slides[i].className)){
                ++count;
            }
        }
        return count;
    },
    areAnyChanges: function(data){
        for(var i=0;i<data.content.length;i++){
            if(data.content[i]!=null)
                return true;
        }
        return false;
    },
    
    leaveView: function(view){
        if(humla.utils.window.localStorage){
            var data = this.loadContainer();
            if(this.areAnyChanges(data)){
                        
                var save=confirm("Save changes?");
                if(save){

                    // if apply changes, send request to save
                    data.originalSlideContent = "";
                    var fields = window.location.href.split("/");
                    var course = fields[5];//presentationUrl.substr(0, presentationUrl.indexOf("/"));
                    var lecture= fields[6].substr(0, fields[6].indexOf("."));
                    var request = new XMLHttpRequest();
                    request.open("PUT", '/api/'+course+'/'+lecture+'/editor', true);
                    request.setRequestHeader("Content-type", "application/json");
                    request.onreadystatechange = function(){
                        if (request.readyState==4) {
                            if(request.status==200){
                                alert("Presentation was succesfully modified, reload page to view changes", 20000, "Info: ");
                                
                                // refesh JSON
                                var request2 = new XMLHttpRequest();
                                request2.open("GET", '/api/'+course+'/'+lecture+'/index?refresh=true', true);
                                request2.setRequestHeader("Connection", "close");            
                                request2.onreadystatechange = function(){};
                                request2.send(null); 
    
                                // refresh XML
                                var request3 = new XMLHttpRequest();
                                request3.open("GET", '/api/'+course+'/'+lecture+'/index?refresh=true&alt=xml', true);
                                request3.setRequestHeader("Connection", "close");            
                                request3.onreadystatechange = function(){};
                                request3.send(null); 
                                
                                
                            }else{
                                alert("Problem while saving presentaion: "+request.status+": "+request.responseText, 20000, "Error: ");
                            }
                        }
                    };
                    request.send((JSON.stringify(data))); 
                }
            // clear local storage
            }
            this.removeContainer();
        }
    },
    
    loadSlide : function(slide){
        var container = this.loadContainer();
        if(container)
            return container.content[slide.number-1];
        return null;
    },
    
    loadContainer: function(){   
        return JSON.parse(humla.utils.window.localStorage.getItem('editorview_container'));
    },
    
    saveContainer: function(o){
        humla.utils.window.localStorage.setItem('editorview_container',JSON.stringify(o));
    },
    
    removeContainer: function(){
        humla.utils.window.localStorage.removeItem('editorview_container');
    },
    
    storeSlide : function(slide){
        var contentFromLeavingSlide = humla.controler.window.frames[0].window.codemirror_editor.getValue();
        if(humla.utils.window.localStorage){
            var cache = this.loadContainer();
            if(contentFromLeavingSlide !== cache.originalSlideContent){
                cache.content[slide.number-1] = contentFromLeavingSlide+" "; // extra whitespace so when you delete whole content it won't appear as NULL in enterSlide() variable finalString'
                this.saveContainer(cache);
            }
        }
    },
    
    resetDialog: function(){
        var el = document.getElementById("tmp_editor_container");
        if(el){
            document.getElementById('tmp_editor_container').innerHTML =    '';
            el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
        }
    }
    
    
};
