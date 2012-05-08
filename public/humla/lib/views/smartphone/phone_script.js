/**
 * A view that is used for studying slides on cell phones and mobile devices
 * @author Vojtech Smrcek
 */

var view_smartphone = {
    /**
     * Calculated new width of a slide
     */
    slide_width : 0,
    /**
     * Calculated new height of a slide
     */
    slide_height : 0,
    /**
     * Orientation of the device (landscape or portrait)
     */
    landscape : true,
    /**
     * Current slide
     */
    slide : null,
    /**
     * Function that processes the presentation on entering the view.
     */
    enterView : function(view) {
        for (var i = 0; i < humla.slides.length; i++)
            humla.slides[i].process();
        /** 
         *Function handling orientation change. When the orientation change event is triggered, it displays the view either in landscape or portrait mode.
         */
        var phone_resize = function (){
            
            var fluidEl = document.body;
            var body_width = 0;
            var body_height = 0;
            var ratio = SLIDE_WIDTH/SLIDE_HEIGHT;
            var body_ratio = window.innerWidth/window.innerHeight;
            var width = 0;
            var height = 0;
            if (window.orientation == 0 || window.orientation == 180 || body_ratio < ratio){
                width = window.innerWidth-20;
                height = (width/ ratio);
                //alert("Portrait");
                view_smartphone.landscape = false;
                document.body.removeAttribute("class");
                document.body.setAttribute("class", "portrait");
            } else if (window.orientation == 90 || window.orientation == -90 || body_ratio >= ratio){
                height = window.innerHeight-20;
                width = (height*ratio);
                view_smartphone.landscape = true;
                document.body.removeAttribute("class");
                document.body.setAttribute("class", "landscape");
            } 
            if (!view_smartphone.landscape){
                document.body.style.width = width;
            } else {
                document.body.style.height = height;
                    
            }
            
            var scale_height = height/SLIDE_HEIGHT;                
            var scale_width = width/SLIDE_WIDTH;
            view_smartphone.slide_height = (height);
            view_smartphone.slide_width = (width);  
            var offset = 0;
            for (var i = 0; i < humla.slides.length; i++) {   
                if (view_smartphone.slide == humla.slides[i]){
                    offset = i;
                }
                humla.slides[i].element.style.webkitTransformOrigin = "0% 0%"; 
                humla.slides[i].element.style.webkitTransform = "scale("+scale_width+", "+scale_height+")"; 
                if (!view_smartphone.landscape){
                    humla.slides[i].element.style.left = 0;
                    humla.slides[i].element.style.top = (i*(height+5));
                } else {
                    humla.slides[i].element.style.top = 0;
                    humla.slides[i].element.style.left = (i*(5+width));
                }                
            }
            
            if (view_smartphone.slide != null && view_smartphone.landscape == true){
                window.scrollTo((5+width)*view_smartphone.slide.number, 0);
            } else if (view_smartphone.slide != null ){
                window.scrollTo(0, (5+height)*view_smartphone.slide.number);
            }
        };
        phone_resize();
        //Sets listener function to onresize event
        window.onresize = phone_resize;
        //Sets listener function orientationChanged event
        document.addEventListener("orientationChanged", phone_resize); 
                               
    },
   
    /**
     * Functions, that removes listeners on leaving view
     */
    leaveView : function() {
        window.onresize = "";
    },
    /**
     * Functions, that scrolls to the correct slide on entering the slide. It moves the view over the slide.
     * @param slide
     */
    enterSlide : function(slide) {
        console.log("Vstupuju do slidu");
        view_smartphone.slide = slide;
        if (view_smartphone.landscape == true){
            window.scrollTo((view_smartphone.slide_width+5)*view_smartphone.slide.number, 0);
        } else {
            window.scrollTo(0, (5+view_smartphone.slide_height)*view_smartphone.slide.number);
        }
        
    }
};