
var view_slideshow = {
    enterView : function() {
        humla.controler.fullscreen = true;
        humla.controler.toBuild = true;
    },            
    leaveView : function(){
        humla.controler.toBuild = false;  
        document.webkitCancelFullScreen();
    },
    goFullscreen : function(){      
        document.body.webkitRequestFullScreen();  
    },
    cancelFullscreen : function(){
        document.webkitCancelFullScreen();
    },
    enterSlide : function(slide) {
        var inx = slide.number - 1;        
        if (inx - 1 >= 0) humla.slides[inx - 1].addClass("previous");
        humla.slides[inx].addClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].addClass("next");
        humla.slides[inx].element.onwebkitfullscreenchange = function(e) {
            console.log("Entered fullscreen!");
            //document.getElementById("exit").style.display="inline";
            //humla.slides[inx].onwebkitfullscreenchange = onFullscreenExit;
        };
        //humla.slides[inx].element.webkitRequestFullScreen();
        
    },
    
    leaveSlide : function(slide) {
        var inx = slide.number - 1;        
        if (inx - 1 >= 0) humla.slides[inx - 1].removeClass("previous");
        humla.slides[inx].removeClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].removeClass("next");
    }
  
};