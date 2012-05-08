/**
 * A singleton object handling the multitouch interface
 */
var multitouch = {
    /**
     * True if the body has been already processed
     */
    script : false,
    /**
     * True if the touch is a gesture
     */
    isGesture : false,
    
    numOfTouches : 0,
    /**
     * An array containing touches of the first finger
     */
    touches1 : [],
    /**
     * An array containing touches of the second finger
     */
    touches2 : [],
    /**
     * An array containing touches of the third finger
     */
    touches3 : [],
    /**
     * Number of fingers touching the screen. The system handles 3 fingers, only 2 are used for a gesture.
     * The third finger may be used in the future
     */
    mode : 0,
    /**
     * Coordinates used to handle long pressed touches.
     */
    X : -1,
    Y : -1,
    Xprevious : -1,
    Yprevious : -1,
    /**
     * True if long touch is currently active.
     */
    isLongTouch : false,
    //gestureStart : 0,
    /**
     * A function to process a slide, makes the body of slide touchable (by adding listeners)
     * @param slide
     */
    processSlide : function(slide){
        //console.log("View id: "+humla.controler.currentView.config.id);
        if (!this.script){
            this.script = true;
            multitouch.makeTouchable(document.body);
        }
    },
    /**
     * Switches to the next view (if available)
     */
    nextView : function(){
        if (humla.controler.currentView.config.id < (humla.controler.views.length-1)){
            alert("Vypis: "+humla.controler.currentView.config.id+" a "+humla.controler.views.length);
            humla.controler.activateView(parseInt(humla.controler.currentView.config.id));
        }
    },
    /**
     * Switches to the previous view (if available)
     */
    previousView : function(){
        if (humla.controler.currentView.config.id > 0){            
            humla.controler.activateView(parseInt(humla.controler.currentView.config.id) -2 );
        }
    },
    /**
     * Called when the touch starts, calls a function to find out, whether the finger has moved after a timeout
     */
    startTouch : function(){                    
        multitouch.Xprevious = multitouch.X;
        multitouch.Xprevious = multitouch.Y;
        //stehovak.lastMoved = touchable.gestureStart;
        setTimeout("multitouch.afterTimeout()", 1000);                        
    },
    /**
     * Function that end the current touch
     */
    endTouch : function(){
        multitouch.Xprevious = -1;
        multitouch.Yprevious = -1;
    },
    /**
     * Finds out whether the finger has moved on the screen or the touch is a long press
     */
    afterTimeout : function (){
        var Xnew = multitouch.X;
        var Ynew = multitouch.Y;
        if (multitouch.isGesture && multitouch.mode == 1 && Math.abs(multitouch.Xprevious - Xnew) < 30 && Math.abs(multitouch.Yprevious - Ynew < 30)){
            humla.menu.toggle();
            multitouch.Xprevious = -1;
            multitouch.Yprevious = -1;
        } 
    },
    /**
     * Function to start touch, has to call the preventDefault on Android phones
     * @param event touch
     */
    touchStartFunction : function(event) {
        if( navigator.userAgent.match(/Android/i) ) {
            event.preventDefault();
        }
        try {
            multitouch.mode = 0;
            multitouch.gestureStart = new Date();
            multitouch.isGesture = true;
            var num = 0;
            for ( var i = 0; i < 3 && i < event.touches.length; i++) {					
                num++;
                try {
                    var touch = event.touches[i];
                    if (i == 0){
                        multitouch.touches1.push(touch);
                        multitouch.X = touch.pageX;
                        multitouch.Y = touch.pageY;
                        multitouch.startTouch();
                    }
                    else if (i == 1)
                        multitouch.touches2.push(touch);
                    else if (i == 2)
                        multitouch.touches3.push(touch);
                } catch (err) {
                    console.log("Error when starting a touch: " + err.description);
                }

            }
                    
            multitouch.mode += num;
        } catch (err) {
            console.log("Error when starting a touch: " + err.description);
        }

    },
    /**
     * Function to end touch, calls a function to find gestures on touch end and clears all touch arrays
     * @param event touch
     */
    touchEndFunction : function(event) {
        var num = 0;
        for ( var i = 0; i < 3; i++) {
            var touch = event.changedTouches[i];
            if (touch != null) {
                num++;
                if (i == 0) {
                    multitouch.touches1.push(touch);                                
                    multitouch.X = touch.pageX;
                    multitouch.Y = touch.pageY;
                    multitouch.endTouch();
                } else if (i == 1)
                    multitouch.touches2.push(touch);
                else if (i == 2)
                    multitouch.touches3.push(touch);
            }
        }
                    
        multitouch.findGestures();
        if (multitouch.mode == 0){
            multitouch.isGesture = false;
            multitouch.X = -1;
            multitouch.Y = -1;
            multitouch.isLongTouch = false;
        }
    },
    /**
     * Function to process a touch move, stores touches in arrays
     * @param event touch
     */
    touchMoveFunction : function(event) {
        if (!multitouch.isGesture)
            return;

        for ( var i = 0; i < 3; i++){
            var touch = event.touches[i];
            if (touch != null) {
                if (i == 0){
                    multitouch.touches1.push(touch);
                    multitouch.X = touch.pageX;
                    multitouch.Y = touch.pageY;
                }
                else if (i == 1)
                    multitouch.touches2.push(touch);
                else if (i == 2)
                    multitouch.touches3.push(touch);
            }
        }
    },
    /**
     * Adds touch listeners to the document
     * @param obj
     */
    makeTouchable : function(obj) {
                  
        obj.addEventListener('touchstart', multitouch.touchStartFunction);
        obj.addEventListener('touchend', multitouch.touchEndFunction);
        obj.addEventListener('touchmove', multitouch.touchMoveFunction);
        obj.addEventListener('touchleave', multitouch.touchEndFunction);
        obj.addEventListener('touchcancel', multitouch.touchEndFunction);
    },
    /**
     * Function to find gestures in touch arrays. Calls a function to evaluate touch arrays and than calls appropriate function to handle the gesture.
     */
    findGestures : function() {
        
        if (multitouch.mode == 1) {
            
            var evaluatedTouch = multitouch.evaluateArray(multitouch.touches1);
            var right = evaluatedTouch[0];
            var left = evaluatedTouch[1];
            var up = evaluatedTouch[2];
            var down = evaluatedTouch[3];
            if (right || left || down || up) {
                if (left || up) humla.controler.currentView.gotoNext();
                else if (right || down) humla.controler.currentView.gotoPrevious();
            }
            
            multitouch.touches1.length = 0;
            multitouch.mode = 0;
        } else if (multitouch.mode == 2) {
            var evaluatedTouch1 = multitouch.evaluateArray(multitouch.touches1);
            var evaluatedTouch2 = multitouch.evaluateArray(multitouch.touches2);
            var vypis = "";
            for (var i = 0; i < evaluatedTouch1.length; i++){
                vypis += "Smer: ";
                vypis += evaluatedTouch1[i];
                vypis+=" - ";
                vypis += evaluatedTouch2[i];
                vypis+=" x ";
            }
            alert("Vypis: "+vypis);
            if ((evaluatedTouch1[0] || evaluatedTouch1[3]) && (evaluatedTouch2[0] || evaluatedTouch2[3])){
                multitouch.previousView();
            }
            if ((evaluatedTouch1[1] || evaluatedTouch1[2]) && (evaluatedTouch2[1] || evaluatedTouch2[2])){
                multitouch.nextView();
            }
            multitouch.touches1.length = 0;
            multitouch.touches2.length = 0;
            multitouch.mode = 0;
        } else if (multitouch.mode == 3) {
            multitouch.touches1.length = 0;
            multitouch.touches2.length = 0;
            multitouch.touches3.length = 0;
            multitouch.mode = 0;
        }
    },
    /**
     * Function to evaluate a given array, returns an array of direction of the gesture.
     * @param touches
     * @return ret
     */
    evaluateArray : function(touches){
        var ret = new Array();
        var prubehXright = 0;
            var prubehXleft = 0;
            var prubehYright = 0;
            var prubehYleft = 0;
            var stepX = -1;
            var stepY = -1;
            try{
                for ( var i = 0; i < touches.length; i++) {
                    if (stepX == -1) {
                        stepX = touches[i].pageX;
                        stepY = touches[i].pageY;
                    }
                    else {  
                        if (stepX < touches[i].pageX) prubehXright++;
                        else if (stepX > touches[i].pageX) prubehXleft++;	
                        stepX = touches[i].pageX;
							  
                        if (stepY < touches[i].pageY) prubehYright++;
                        else if (stepY > touches[i].pageY) prubehYleft++;	
                        stepY = touches[i].pageY;
					
                    }
                }
            } catch(err){
                alert("Chyba: "+err.description);
            }
            var right = false;
            var left = false;            
            var up = false;   
            var down = false; 
            if (prubehXright > (10+ 10*prubehXleft)) {
                right = true;
            }
            if (prubehXleft > (10+10*prubehXright)) {
                left = true;
            }
            if (prubehYright > (10+10*prubehYleft)) {
                down = true;
            }
            if (prubehYleft > (10+10*prubehYright)) {
                up = true;
            }
            ret[0] = right;
            ret[1] = left;
            ret[2] = up;
            ret[3] = down;
            return ret;
    }
}

