/**
 * Comments Extension
 * ~~~~~~~~~~~~~~~~~~
 * add comments to each slide
 *
 */

// Method Closure
var addComment;
var addCommentCallback;
var clearTextarea;
var logout;

var menu_link;
var comments_login;

var ex_comments = {    
    
    processMenu: function(menu) {        
        menu_link = menu;
        
        menu.addTab("comments",{            
            name:"Comments",
            show_layer:true,
            enable_login:true,
            html:"<h1>Comments</h1>"
        +"<div id='comments-login'><a href='/auth/google'>login with Google</a></div>"
        +"<div id='comments-body'>Loading comments</div>"                
        });
        
        
    },
    
    processSlide : function(slide) {
        
        
    },
    
    enterSlide : function(slide) {
        
        // ---------- init -------------
        var presentationUrl = window.location.href; // TODO: udělat univerzální funkci na parsování dat
        var origin = window.location.origin;
        var fields = presentationUrl.split("/");
        var firstIndex = presentationUrl.indexOf("slides", 0)+7;
        presentationUrl = presentationUrl.substr(firstIndex, presentationUrl.length);
        var course = fields[5];//presentationUrl.substr(0, presentationUrl.indexOf("/"));
        var lecture= fields[6].substr(0, fields[6].indexOf("."));
        var slideNumber = slide.number;
        
        comments_login = comments_login || humla.utils.$("comments-login");
        
        humla.user.isLogged(function(err,data) {
            if(!err) {
                comments_login.innerHTML = data.email+" ( <a href='javascript:logout();'>logout</a> )";                
            } else {
                comments_login.innerHTML = "<a href='/auth/google'>login with Google</a>";
                
            }
        });
        
        
        
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
                var s = '<div class="comments">';
                if ( this.status == 200) {
                    var data = JSON.parse(this.responseText);
                    var date;
                    for(var i = 0; i < data.length; i++) {
                        date = new Date(data[i].date);            
                        s+= '<div class="comment"><span class="date">'
                        s+= date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes();
                        s+=' </span><span class="user">';
                        s+=data[i].author.username;
                        s+=' </span><span class="text">';
                        s+=data[i].body;
                        s+=' </span></div>';
                    }
                } else {
                    s += "<div>No comments yet</div>"                    
                }
                
                var link = origin+"/api/"+course+"/"+lecture+"/"+slideNumber+"/comments";
                s+='</div>';
                s+='<div class="input"><textarea id="comment-body'+slideNumber+'"></textarea>'                
                +'<a href="javascript:clearTextarea('+slideNumber+');" id="comment-clear" class="link">Clear</a>'
                +'<a href="javascript:addComment(\''+link+'\','+slideNumber+');"  id="comment-add" class="button" >Comment</a></div>';
                                
                humla.utils.$("comments-body").innerHTML = s;
                
            }
            
        };

        // Add Comment do DB
        addComment = function (address, slide) {            
            var text= humla.utils.$("comment-body"+slide).value;
            //you have to write at least 1 char
            if (text.length < 1) return;
    
            // send XHR to server REST comments api
            var xhr = new XMLHttpRequest();        
            xhr.open("POST", address, true);                
            xhr._slide = slide;
            xhr.setRequestHeader('Content-type','application/json');            
            xhr.setRequestHeader( "Content-Encoding", "utf-8");                         
            xhr.onreadystatechange = addCommentCallback;
            var data = {
                'author':'118',
                'text':text
            };
            xhr.send(JSON.stringify(data));
            
        };
        
        addCommentCallback = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    // clean textarea                    
                    clearTextarea(this._slide);
                    //TODO: udělat refresh
                    //refresh page comments
                    showComments(this._slide);                
                    alert("Comment added");                
                } else if (this.status == 401) {
                    alert("User unauthorized, please login!");                
                    
                }
            }
            
        };
        
        
        clearTextarea = function(slideNum) {
            humla.utils.$("comment-body"+slideNum).value="";            
        }
        
        logout = function () {
            var xhr = new XMLHttpRequest();
            var url = origin+"/logout";
            xhr.open("GET", url , true);                
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    comments_login.innerHTML = "<a href='/auth/google'>login with Google</a>";
                    alert("Logged off");
                }
            };
            xhr.send();
        }
        
        
        // ---------- execution ----------        
        showComments();
        
    }
    
};
