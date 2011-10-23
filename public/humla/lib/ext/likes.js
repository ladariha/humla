/**
 * Likes Extension
 * ~~~~~~~~~~~~~~~
 * adds like / unlike button under each slide
 *
 */

var addLike;
var addLikeCallback;

var ex_likes = {    
    
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
                    if(data) num = data.likesCount - data.dislikesCount;
                } 
                var link = origin+"/api/"+course+"/"+lecture+"/"+slideNumber+"/likes";
                var et = '<div id="likes-toolbar">';        
                et+= '<div class="likes-link"><a class="red" href="javascript:addLike(\''+link+'\',\''+slideNumber+'\',false);" title="Dislike">-</a></div>';        
                et+= '<div id = "likes-'+slideNumber+'" class="likes-number">'+num+'</div>';        
                et+= '<div class="likes-link"><a class="green" href="javascript:addLike(\''+link+'\',\''+slideNumber+'\',true);" title="Like">+</a></div>';        
                et += "</div>";
        
                slide.element.innerHTML = slide.element.innerHTML+et;      
           
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
                var d = document.getElementById("likes-"+this._slide);
                d.innerHTML = this._like?  parseInt(d.innerHTML)+1 :  parseInt(d.innerHTML)-1;                
                //TODO: udelat request a az tim to vypsat
            }            
        };
        
        
        
        showLikes();
       
        
        
    }
    
}