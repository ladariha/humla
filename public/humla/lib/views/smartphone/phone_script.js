var view_smartphone = {
    slide_width : 0,
    slide_height : 0,
    landscape : true,
    slide : null,
    enterView : function(view) {
        for (var i = 0; i < humla.slides.length; i++)
            humla.slides[i].process();
        // Orientation Change
        // When orientation changes event is triggered
        // exposing an orientation property of either
        // landscape or portrait
        var phone_resize = function (){
            //            console.log("Volam phone-resize2");
            // Remove all classes separated by spaces
            var fluidEl = document.body;
            var body_width = 0;
            var body_height = 0;
            var ratio = SLIDE_WIDTH/SLIDE_HEIGHT;
            var body_ratio = window.innerWidth/window.innerHeight;
            var width = 0;
            var height = 0;
            //var landscape = true;
            //          console.log("---: "+window.innerWidth+" a "+window.innerHeight);
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
            
            //body_width = (width+20) * humla.slides.length;
            //body_height = (height+20) * humla.slides.length;
            if (!view_smartphone.landscape){
                //document.body.style.height = body_height;      
                document.body.style.width = width;
            } else {
                //document.body.style.width = body_width;
                document.body.style.height = height;
                    
            }
            
            var scale_height = height/SLIDE_HEIGHT;                
            var scale_width = width/SLIDE_WIDTH;
            console.log("Menim: "+scale_height+" a "+scale_width);
            view_smartphone.slide_height = (height);
            view_smartphone.slide_width = (width);
            //humla.slides[i].element.style.webkitTransform = "scale("+scale+")";   
            //document.body.style.webkitTransformOrigin = "0% 0%";
            //document.body.style.webkitTransform = "scale("+scale+")";   
            var offset = 0;
            for (var i = 0; i < humla.slides.length; i++) {   
                if (view_smartphone.slide == humla.slides[i]){
                    offset = i;
                }
                //humla.slides[i].element.style.width = width;
                //humla.slides[i].element.style.height = height; 
                humla.slides[i].element.style.webkitTransformOrigin = "0% 0%"; 
                humla.slides[i].element.style.webkitTransform = "scale("+scale_width+", "+scale_height+")"; 
                if (!view_smartphone.landscape){
                    humla.slides[i].element.style.left = 0;
                    humla.slides[i].element.style.top = (i*(height+5));
                } else {
                    humla.slides[i].element.style.top = 0;
                    humla.slides[i].element.style.left = (i*(5+width));
                }
            /**
                console.log("Zakladni: "+humla.slides[i].element.offsetWidth);
                //console.log("Vypis "+i+": "+humla.slides[i].element.childNodes.length);
                for(var j=0; j < humla.slides[i].element.childNodes.length; j++){
                    //console.log("Typ: "+humla.slides[i].element.childNodes[j].tagName);
                    if (humla.slides[i].element.childNodes[j].tagName && humla.slides[i].element.childNodes[j].offsetWidth != 0 && humla.slides[i].element.childNodes[j].offsetHeight != 0){
                        //humla.slides[i].element.childNodes[j].style.webkitTransformOrigin = "0% 0%"; 
                        //humla.slides[i].element.childNodes[j].style.webkitTransform = "scale("+scale_width+", "+scale_height+")"; 
                        //console.log("Sirka elementu: "+humla.slides[i].element.childNodes[j].offsetWidth);
                        //if (humla.slides[i].element.childNodes[j].style.width && humla.slides[i].element.childNodes[j].style.width != 0){
                            //humla.slides[i].element.childNodes[j].style.width = scale_width+"%";
                        
                            //humla.slides[i].element.childNodes[j].style.height = scale_height+"%";
                        //} else {
                            //humla.slides[i].element.childNodes[j].style.width = (humla.slides[i].element.childNodes[j].offsetWidth * scale_width);
                        
                            //humla.slides[i].element.childNodes[j].style.height = (humla.slides[i].element.childNodes[j].offsetHeight * scale_height);
                        }
                    //console.log("Sirka elementu v css: "+humla.slides[i].element.childNodes[j].style.width);
                    }
                //alert(humla.slides[i].element.childNodes[i].id);
                }
                **/
            //var scale = (height*width)/(SLIDE_WIDTH*SLIDE_HEIGHT);
            //humla.slides[i].element.style.webkitTransform = "scale("+scale+")";   
            //
            //humla.slides[i].element.style.webkitTransformOrigin = "0% 0%";
            //humla.slides[i].element.style.MozTransform = "scale("+scale+")"; 
                
            }
            
            if (view_smartphone.slide != null && view_smartphone.landscape == true){
                window.scrollTo(width*view_smartphone.slide.number, 0);
            //console.log("Posouvam o: "+(width*offset)+", sirka je : "+width+" a offset: "+offset);
            } else if (view_smartphone.slide != null ){
                window.scrollTo(0, height*view_smartphone.slide.number);
            }
        };
        phone_resize();
        window.onresize = phone_resize;
        document.addEventListener("orientationChanged", phone_resize); 
    //humla.controler.currentView.currentSlide.element.scrollIntoView();
        

                               
    },
    scaleElement : function(slide){
        //vypis.appendChild(text);
        var vParray = ("-webkit-", "-moz-", "-o-", "-msie-");
    //var vP1 = "-webkit-";
    //var vP2 = "-moz-";
    //var vP3 = "-o-";
    //var vP4 = "-msie-";
           
        
    },
    enterSlide2 : function(slide) {
    /**
        var offset = 0;        
        for (var i = 0; i < humla.slides.length; i++){
            if (humla.slides[i] != slide){
                if (this.landscape){
                    offset += this.slide_width
                } else {
                    offset += this.slide_height
                }
            }
        }
        if (this.landscape){
            window.scrollTo(offset, 0);
        } else {
            window.scrollTo(0, offset);
        }
        **/
    },
    leaveView : function() {
        window.onresize = "";
    },
    
    enterSlide : function(slide) {
        console.log("Vstupuju do slidu");
        view_smartphone.slide = slide;
        if (view_smartphone.landscape == true){
            window.scrollTo(view_smartphone.slide_width*view_smartphone.slide.number, 0);
        //console.log("Posouvam o: "+(width*offset)+", sirka je : "+width+" a offset: "+offset);
        } else {
            window.scrollTo(0, view_smartphone.slide_height*view_smartphone.slide.number);
        }
        
    //slide.element.scrollIntoView();
    }
};