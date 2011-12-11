
var view_example = {
    enterView : function() {
        humla.controler.fullscreen = false;
    },    
    enterSlide : function(slide) {
        var inx = slide.number - 1;
        
        if (inx - 3 >= 0) humla.slides[inx - 3].addClass("far-far-previous");
        if (inx - 2 >= 0) humla.slides[inx - 2].addClass("far-previous");
        if (inx - 1 >= 0) humla.slides[inx - 1].addClass("previous");
        humla.slides[inx].addClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].addClass("next");
        if (inx + 2 < humla.slides.length) humla.slides[inx + 2].addClass("far-next");
        if (inx + 3 < humla.slides.length) humla.slides[inx + 3].addClass("far-far-next");
    },        

    leaveSlide : function(slide) {
        var inx = slide.number - 1;
        
        if (inx - 3 >= 0) humla.slides[inx - 3].removeClass("far-far-previous");
        if (inx - 2 >= 0) humla.slides[inx - 2].removeClass("far-previous");
        if (inx - 1 >= 0) humla.slides[inx - 1].removeClass("previous");
        humla.slides[inx].removeClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].removeClass("next");
        if (inx + 2 < humla.slides.length) humla.slides[inx + 2].removeClass("far-next");
        if (inx + 3 < humla.slides.length) humla.slides[inx + 3].removeClass("far-far-next");
    }          
};
