
var multitouch = {
    script : false,
    isGesture : false,
    numOfTouches : 0,
    touches1 : [],
    touches2 : [],
    touches3 : [],
    mode : 0,
    X : -1,
    Y : -1,
    Xprevious : -1,
    Yprevious : -1,
    isLongTouch : false,
    gestureStart : 0,
    processSlide : function(slide){
        if (!this.script){
            this.script = true;
            multitouch.makeTouchable(document.body);
        }
    },
    startTouch : function(){                    
        multitouch.Xprevious = multitouch.X;
        multitouch.Xprevious = multitouch.Y;
        //stehovak.lastMoved = touchable.gestureStart;
        setTimeout("multitouch.afterTimeout()", 1000);                        
    },
    endTouch : function(){
        multitouch.Xprevious = -1;
        multitouch.Yprevious = -1;
    },
    afterTimeout : function (){
        var Xnew = multitouch.X;
        var Ynew = multitouch.Y;
        if (multitouch.isGesture && multitouch.mode == 1 && Math.abs(multitouch.Xprevious - Xnew) < 10 && Math.abs(multitouch.Yprevious - Ynew < 10)){
            humla.menubar.toggle();
            multitouch.Xprevious = -1;
            multitouch.Yprevious = -1;
        } 
    },
    touchStartFunction : function(event) {
        try {
            multitouch.mode = 0;
            //var vypis = document.getElementById("info");
            multitouch.gestureStart = new Date();
            multitouch.isGesture = true;
            var num = 0;
            for ( var i = 0; i < 3 && i < event.touches.length; i++) {					
                num++;
                try {
                    var touch = event.touches[i];
                    //multitouch.touches1.push(touch);
                    if (i == 0){
                        //stehovak.start(touch.pageX, touch.pageY);
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
                    alert("Chyba: " + err.description);
                }

            }
                    
            multitouch.mode += num;
        } catch (err) {
            alert("Chyba start: " + err.description);
        }
    //var newT = document.createTextNode("Mod: " + multitouch.mode);
    //vypis.appendChild(newT);

    },
    touchEndFunction : function(event) {
        //var vypis = document.getElementById("info");
        //var newT = document.createTextNode("");
        var num = 0;
        for ( var i = 0; i < 3; i++) {
            var touch = event.touches[i];
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
        //newT = document.createTextNode("Hledam gesta, mod: "+multitouch.mode);
        //vypis.appendChild(newT);
                    
        multitouch.findGestures();
        if (multitouch.mode == 0){
            multitouch.isGesture = false;
            multitouch.X = -1;
            multitouch.Y = -1;
            multitouch.isLongTouch = false;
            multitouch.gestureStart = 0;
        }
    },
    touchMoveFunction : function(event) {

        //var vypis = document.getElementById("info");
        if (!multitouch.isGesture)
            return;

        //var newT = document.createTextNode("");
        for ( var i = 0; i < 3; i++){
            var touch = event.touches[i];
            if (touch != null) {
                if (i == 0){
                    //stehovak.move(touch.pageX, touch.pageY);
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
    makeTouchable : function(obj) {
                  
        obj.addEventListener('touchstart', multitouch.touchStartFunction);
        obj.addEventListener('touchend', multitouch.touchEndFunction);
        obj.addEventListener('touchmove', multitouch.touchMoveFunction);
    },

    findGestures : function() {
        //var vypis = document.getElementById("info");
        //var newT = document.createTextNode("");
        if (multitouch.mode == 1) {
            //var j = "Steps: ";
            var prubehXright = 0;
            var prubehXleft = 0;
            var prubehYright = 0;
            var prubehYleft = 0;
            //var lengthX = 0;
            //var lengthY = 0;
            var stepX = -1;
            //var firstStepX = -1;
            var stepY = -1;
            //var firstStepY = -1;
            try{
                for ( var i = 0; i < multitouch.touches1.length; i++) {
                    if (stepX == -1) {
                        stepX = multitouch.touches1[i].pageX;
                        stepY = multitouch.touches1[i].pageY;
                    }
                    else {
                        //lengthX += stepX - multitouch.touches1[i].pageX;  
                        if (stepX < multitouch.touches1[i].pageX) prubehXright++;
                        else if (stepX > multitouch.touches1[i].pageX) prubehXleft++;	
                        stepX = multitouch.touches1[i].pageX;
							
                        //lengthY += stepY - multitouch.touches1[i].pageY;  
                        if (stepY < multitouch.touches1[i].pageY) prubehYright++;
                        else if (stepY > multitouch.touches1[i].pageY) prubehYleft++;	
                        stepY = multitouch.touches1[i].pageY;
							
                    //j+= stepX;
                    //j += ", ";
                    }
                }
            } catch(err){
                alert("Chyba: "+err.description);
            }
            //var delka = multitouch.touches1.length;
            //var normalizedX = (prubehXright-prubehXleft)/delka;
            //var normalizedY = (prubehYright-prubehYleft)/delka;
            //var changeX = firstStepX - stepX;
            //if (changeX < 0) changeX*=-1;
            //var changeY = firstStepY - stepY;
            //if (changeY < 0) changeY*=-1;
            //var length = Math.sqrt(changeX*changeX + changeY*changeY);
            //newT = document.createTextNode("Vypis: X-n: "+normalizedX+", Y-n: "+normalizedY+", X-ch: "+changeX+", Y-ch: "+changeY+", delka: "+length);
            var right = false;
            var left = false;
            var up = false;
            var down = false;
            //var smer = "";
            if (prubehXright > 10*prubehXleft) {
                right = true;
            // smer += "right, ";
            }
            if (prubehXleft > 10*prubehXright) {
                left = true;
            // smer += "left, ";
            }
            if (prubehYright > 10*prubehYleft) {
                down = true;
            // smer += "down, ";
            }
            if (prubehYleft > 10*prubehYright) {
                up = true;
            //smer += "up, ";
            }
                                        
            //newT = document.createTextNode("Gesto: Xr: "+prubehXright+", Xl: "+prubehXleft+", Yr: "+prubehYright+", Yl: "+prubehYleft);	
            if (right || left || down || up) {
                if (right || down) humla.controler.currentView.gotoNext();
                else if (left || up) humla.controler.currentView.gotoPrevious();
            }
            
            //newT = document.createTextNode("Gesto: "+smer);
            multitouch.touches1.length = 0;
            multitouch.mode = 0;
        //vypis.appendChild(newT);
        } else if (multitouch.mode == 2) {
            multitouch.touches1.length = 0;
            multitouch.touches2.length = 0;
            multitouch.mode = 0;
        //vypis.appendChild(newT);
        } else if (multitouch.mode == 3) {
            multitouch.touches1.length = 0;
            multitouch.touches2.length = 0;
            multitouch.touches3.length = 0;
            multitouch.mode = 0;
        //vypis.appendChild(newT);
        }
    }
}

