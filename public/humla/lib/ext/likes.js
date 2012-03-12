/**
 * Likes Extension
 * ~~~~~~~~~~~~~~~
 * adds like / unlike button under each slide
 *
 */

var addLike;
var addLikeCallback;


var ex_likes = {    
    
    processMenu: function(menu) {                
        
        menu.addTab("likes",{
            name:"Likes",
            html:"<h1>Likes</h1>"
            +' <div id="fb-root"></div><script>(function(d, s, id) {var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id;  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";  fjs.parentNode.insertBefore(js, fjs);}(document, \'script\', \'facebook-jssdk\'));</script>'
        +"<div id='likes-block' >"
        +'<div id="likes-hate" class="button" ><div >-</div></div>'
        +'<div id="likes-score">2</div>'
        +'<div id="likes-like" class="button"><div >+</div></div></div>'
        +"<div id='likes-stats'><h2>Statistics</h2><p>"
        +"<span id='likes-like-count' class='green'>2</span> people like this slide</p>"
        +"<p><span id='likes-hate-count' class='red'>1</span> people hate this slide</p>"
        +"<div id='likes-fb'></div>"
        +"</div>"        
        });
        
       
        
    // TODO: přidat lajkování a sharování z facebooku 
    // TODO: stáhnout celej set lajků a pak jenom občas kontrolovat změny
        
    },
    
    
    enterSlide : function(slide) {
        console.log(slide);
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
        var showLikes = function(slideNum) {
            var xhr = new XMLHttpRequest();
            var url = origin+"/api/"+course+"/"+lecture+"/"+(slideNum ? slideNum: slideNumber)+"/likes";
            xhr.open("GET", url , true);                
            xhr.onreadystatechange = loadLikes;
            xhr.send();
        };
        
        var loadLikes = function () {            
            if (this.readyState == 4) {         
                var num = 0;
                if ( this.status == 200) {
                    var data = JSON.parse(this.responseText)[0];                    
                    if(data) {
                        num = data.likesCount - data.dislikesCount;
                        document.getElementById("likes-like-count").innerHTML = data.likesCount;
                        document.getElementById("likes-hate-count").innerHTML = data.dislikesCount;
                    }
                    
                    
                } else {
                    document.getElementById("likes-like-count").innerHTML = 0
                    document.getElementById("likes-hate-count").innerHTML = 0
                
                }
                document.getElementById("likes-score").innerHTML = num;
                var link = origin+"/api/"+course+"/"+lecture+"/"+slideNumber+"/likes";
                /* 
                var et = '<div id="likes-toolbar">';        
                et+= '<div class="likes-link"><a class="red" href="javascript:addLike(\''+link+'\',\''+slideNumber+'\',false);" title="Dislike">-</a></div>';        
                et+= '<div id = "likes-'+slideNumber+'" class="likes-number">'+num+'</div>';        
                et+= '<div class="likes-link"><a class="green" href="javascript:addLike(\''+link+'\',\''+slideNumber+'\',true);" title="Like">+</a></div>';        
                et += "</div>";*/
        
                /*slide.element.innerHTML = slide.element.innerHTML+et;      */
                document.getElementById("likes-like").onclick = function() {
                    addLike(link,slideNumber,true)
                    };
                document.getElementById("likes-hate").onclick = function() {
                    addLike(link,slideNumber,false)
                    };
                    
                document.getElementById("likes-fb").innerHTML = '<div class="fb-like" data-href="https://www.facebook.com/plugins/like.php?href='+link+'" data-send="false" data-layout="button_count" data-width="60" data-show-faces="false" data-colorscheme="dark" data-font="arial"></div>';
                
           
            } 
            
        };
        
        addLike = function (address, slideNumber, like) {
            var xhr = new XMLHttpRequest();        
            xhr.open("POST", address+"/"+(like?"like":"dislike"), true);                            
            xhr._slide = slideNumber;            
            xhr._like = like;
            xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
            xhr.onreadystatechange = addLikeCallback;
            xhr.send();
            
        };
        
        addLikeCallback = function () {
            if (this.readyState == 4) {                      
                var d = document.getElementById("likes-score");
                d.innerHTML = this._like?  parseInt(d.innerHTML)+1 :  parseInt(d.innerHTML)-1;                
            //TODO: udelat request a az tim to vypsat
            }            
        };
        
        
        
        showLikes();
       
        
        
    }
    
}