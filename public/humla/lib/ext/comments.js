/**
 * Comments Extension
 * ~~~~~~~~~~~~~~~~~~
 * add comments to each slide
 *
 */

// Method Closure
var addComment;
var addCommentCallback;
var toggleComments;
var clearTextarea;

var ex_comments = {    
    
    processSlide : function(slide) {
        
        // ---------- init -------------
        var presentationUrl = window.location.href; // TODO: udělat univerzální funkci na parsování dat
        var origin = window.location.origin;
        var fields = presentationUrl.split("/");
        var firstIndex = presentationUrl.indexOf("slides", 0)+7;
        presentationUrl = presentationUrl.substr(firstIndex, presentationUrl.length);
        var course = fields[5];//presentationUrl.substr(0, presentationUrl.indexOf("/"));
        var lecture= fields[6].substr(0, fields[6].indexOf("."));
        var slideNumber = slide.number;
        
        // ---------- functions ----------
        var showComments = function(slideNum) {
            var xhr = new XMLHttpRequest();
            var url = origin+"/api/"+course+"/"+lecture+"/"+(slideNum? slideNum: slideNumber)+"/comments";
            xhr.open("GET", url , true);    
            xhr._slideNum = slideNum;
            xhr.onreadystatechange = loadComments;
            xhr.send();
        };
        
        var loadComments = function () {            
            if (this.readyState == 4) {
                /*if(this._slideNum) {
                    var tmp = document.getElementById("comments")
                    if(tmp) tmp.outerHTML = "";
                }*/
                var s = '<div class="comments" style="display:none" >';
                if ( this.status == 200) {
                    var data = JSON.parse(this.responseText);
                    var date;
                    for(var i = 0; i < data.length; i++) {
                        date = new Date(data[i].date);                    
                        s+= '<div class="comment"><span class="date">'
                        +date.getDate()+"."+date.getMonth()+". "
                        +' </span><span class="user">'
                        +data[i].author.username
                        +' </span><span class="text">'
                        +data[i].body
                        +' </span></div>';
                    }
                }
                var link = origin+"/api/"+course+"/"+lecture+"/"+slideNumber+"/comments";
                s+='<div class="input"><textarea id="comment-body'+slideNumber+'"></textarea>'                
                +'<a href="javascript:addComment(\''+link+'\','+slideNumber+');"  id="comment-add" class="button" >Comment</a>'
                +'<a href="javascript:clearTextarea('+slideNumber+');" id="comment-clear" class="button">Clear</a></div>';
                s+='</div>';
                
                slide.element.innerHTML = slide.element.innerHTML + s;               
            }
            
        };

        // Add Comment do DB
        addComment = function (address, slide) {            
            var data=  document.getElementById("comment-body"+slide).value;
            //you have to write at least 1 char
            if (data.length < 1) return;
    
            // send XHR to server REST comments api
            var xhr = new XMLHttpRequest();        
            xhr.open("POST", address, true);                
            xhr._slide = slide;
            xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
            xhr.onreadystatechange = addCommentCallback;
            xhr.send(data);
            
        };
        
        addCommentCallback = function () {            
            if (this.readyState == 4 && this.status == 200) {
                // clean textarea
                document.getElementById("comment-body"+this._slide).value="";
                //TODO: udělat refresh
                //refresh page comments
                showComments(this._slide);
                alert("Comment added");                
            }
            
        };
        
        toggleComments = function() {
            var coms = document.getElementsByClassName("comments");                        
            for(var i=0;i<coms.length;i++) {                                
                coms[i].style.cssText = coms[i].style.cssText === "display: block; " ? "display: none; " : "display: block; ";
            }
            
        }
        clearTextarea = function(slideNum) {
            document.getElementById("comment-body"+slideNum).value="";            
        }
        
        
        // ---------- execution ----------        
        showComments();
            
        var et = '<div id="comments-toolbar">';        
        et+= '<a class="comments-link" href="javascript:toggleComments();" title="Comments"><img src="../../../humla/lib/ext/editor-edit.png" alt="Comments"/></a>';        
        et += "</div>";
        slide.element.innerHTML = slide.element.innerHTML+et;       
        
        
    }
    
};
