var ex_canvas = {
    loaded : false,
    canvasArray : [],
    currentSlide : null,
    strokeColor : "#000000",
    strokeWidth : 5,
    setColor : function(color){
        this.strokeColor = color;
    },
    colorListener : function(e){        
        ex_canvas.strokeColor = "#"+this.id;
    },
    sizeListener : function(e){
        ex_canvas.strokeWidth = this.id;
    },
    clearListener : function(e){
        if (ex_canvas.currentSlide != null){
            var array = ex_canvas.currentSlide.element.getElementsByClassName("paintingCanvas");
            for (var i = 0; i < array.length; i++){
                for (var j = 0; j < ex_canvas.canvasArray.length; j++){
                    if (array[i].id == ex_canvas.canvasArray[j].element.id){
                        ex_canvas.canvasArray[j].clear();
                        ex_canvas.canvasArray[j].clearHistory();
                    }
                }
            }
        }
    },
    setWidth : function(width){
        this.strokeWidth = width;
    },
    enterSlide : function(slide){
        this.currentSlide = slide;
        //if (!this.loaded){
        
        this.findCanvases(slide);
        //console.log("delka pole b: "+this.canvasArray.length);
        /*
        console.log("delka pole: "+this.canvasArray.length);
        for (var i = 0; i < this.canvasArray.length; i++){
            //console.log("vypis: "+this.canvasArray[i].parentSlide.number);
            
            console.log("porovnavam: "+this.canvasArray[i].parentSlide.number+ " a "+slide.number);
            if (this.canvasArray[i].parentSlide.number == slide.number){
                this.addListeners(this.canvasArray[i].element);
                console.log("pridavam listener: "+slide.number);
            }
            
        } 
        */
        this.loaded = true;
    //}
    },//
    leaveSlide : function(slide){
        
        var array = slide.element.getElementsByClassName("paintingCanvas");
        for (var i = 0; i < array.length; i++){
            console.log("Odebiram listenery");
            this.removeListeners(array[i]);
        }        
        this.removeControlPanel();
        
    },
    findCanvases : function (){
        
        var array = this.currentSlide.element.getElementsByClassName("paintingCanvas");
        //console.log("Pocet platen: "+array.length);
        //console.log("prochazim");
        function Canvas(element, arrayX, arrayY, arrayDrag, arrayColor, arrayWidth){
        {
            //this.parentSlide = slide;
            this.element = element;
            this.context = element.getContext("2d");
            this.paint = false;
            this.clickX = arrayX;
            this.clickY = arrayY;
            this.clickDrag = arrayDrag;
            this.clickColor = arrayColor;
            this.clickWidth = arrayWidth;
            this.offsetLeft = 0;
            this.offsetTop = 0;
            this.active = true;
            this.initialize = function(){
                this.context = this.element.getContext("2d");
            };
            this.countOffset = function () {
                
                this.offsetLeft = 0;
                this.offsetTop = 0;
                var curleft = 0;
                var curtop = 0;
                var offElement = this.element;
                if (offElement.offsetParent) {
                    do {
                        curleft += offElement.offsetLeft;
                        curtop += offElement.offsetTop;
                    } while (offElement = offElement.offsetParent);
                }
                
                this.offsetLeft = curleft;
                this.offsetTop = curtop;
            }
            this.mouseDown = function(e){
                
                this.countOffset();
                //console.log("X: "+e.pageX+" a "+this.offsetLeft);
                //console.log("X: "+e.pageY+" a "+this.offsetTop);
                var mouseX = e.pageX - this.offsetLeft;
                var mouseY = e.pageY - this.offsetTop;		
                this.paint = true;
                this.addClick(mouseX, mouseY, false);
                this.redraw();
            };
            this.mouseMove = function(e){
                if(this.paint){
                    this.countOffset();
                    this.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                    this.redraw();
                }   
            };
            this.mouseUp = function(){
                    
                this.paint = false;
            };                 
                      
            this.addClick =  function(x, y, dragging)
            {
                //console.log("klik: "+x+" - "+y);
                this.clickX.push(x);
                this.clickY.push(y);
                
                this.clickDrag.push(dragging);
                this.clickColor.push(ex_canvas.strokeColor);
                this.clickWidth.push(ex_canvas.strokeWidth);
            };
            this.clear = function(){
                this.context.fillStyle = '#252525'; // Work around for Chrome
                this.context.fillRect(0, 0, 750, 500); // Fill in the canvas with white
                this.element.width = this.element.width; // clears the canvas   
            };
            this.clearHistory = function(){                
                this.clickColor = new Array();
                this.clickDrag = new Array();
                this.clickWidth = new Array();
                this.clickX = new Array();
                this.clickY = new Array();
            };
            this.redraw = function(){
                //this.element.width = this.element.width; // Clears the canvas
                this.clear();
                this.context.strokeStyle = "#df4b26";
                this.context.lineJoin = "round";
                this.context.lineWidth = 5;
                for(var i=0; i < this.clickX.length; i++)
                {		
                    //console.log("redrawing");
                    //console.log("prekresuluju: "+this.context);
                    this.context.beginPath();
                    if(this.clickDrag[i] && i){
                        this.context.moveTo(this.clickX[i-1], this.clickY[i-1]);
                    }else{
                        this.context.moveTo(this.clickX[i]-1, this.clickY[i]);
                    }
                    this.context.lineTo(this.clickX[i], this.clickY[i]);
                    this.context.closePath();
                    this.context.strokeStyle = this.clickColor[i];
                    this.context.lineWidth = this.clickWidth[i];
                    this.context.stroke();
                }
            };
        };
        }
        var prvek = 0;
        //console.log("Delka pole: "+this.canvasArray.length);
        for (var i = 0; i < array.length; i++){
            //console.log("krok: "+i+" a "+array[i].id);
            //console.log("Pridavam: "+array[i].id);
            var newCanvas = true;
            for (var j=0; j<this.canvasArray.length; j++){
                //console.log("Porovnavam: "+array[i].id+" a "+this.canvasArray[j].element.id);
                if (array[i].id == this.canvasArray[j].element.id){
                    newCanvas = false;
                    //console.log("Inicializace: "+this.canvasArray[j].element.id);
                    try {
                        var active = this.canvasArray[j].active;
                        this.canvasArray[j] = new Canvas(array[i], this.canvasArray[j].clickX, this.canvasArray[j].clickY, this.canvasArray[j].clickDrag, this.canvasArray[j].clickColor, this.canvasArray[j].clickWidth);
                        this.canvasArray[j].active = active;
                        this.canvasArray[j].redraw();
                        if (active) {
                            this.addListeners(array[i]);
                            this.addControlPanel(array[i]);
                        }
                    //console.log("inicializuju");
                    } catch (e){
                        console.log("chyba: "+e);
                    }
                
                //prvek++;
                //this.addListeners(this.canvasArray[j].element);
                }
            }
            if (newCanvas){
                //console.log("pridano");
                //this.addListeners(array[i]);
                this.canvasArray.push(new Canvas(array[i], new Array(), new Array(), new Array(), new Array(), new Array()));
                this.addListeners(array[i]);
                this.addControlPanel(array[i]);
            }
            //console.log("Pridavam event listener: "+array[i].id);
            prvek++;
        //this.canvasArray[i].initialize(array[i]);
                
        }
    },
    addControlPanel : function (element){
        if (this.currentSlide != null && document.getElementById("controlCanvasPanel") == null){
            
            var controlPanel = document.createElement("span");           
            controlPanel.setAttribute('class',"controlPanel");
            controlPanel.setAttribute('id',"controlCanvasPanel");
            var list = document.createElement("ul");
            //var item1 = document.createElement("li");
            //item1.textContent = "R";
            list.appendChild(this.createColorController("FF0000", "R"));
            list.appendChild(this.createColorController("000000", "K"));
            list.appendChild(this.createColorController("00FF00", "G"));
            list.appendChild(this.createColorController("0000FF", "B"));
            list.appendChild(this.createSizeController(1));
            list.appendChild(this.createSizeController(3));
            list.appendChild(this.createSizeController(5));
            list.appendChild(this.createClearController("Cl"));
            controlPanel.appendChild(list);
            //this.currentSlide.element.childNodes[0].insertBefore(controlPanel);
            this.currentSlide.element.insertBefore(controlPanel, element);
        }
    },
    createColorController : function (color, text){
        var item = document.createElement("li");
        item.setAttribute("id", color);
        item.setAttribute("style", "color: #"+color+";")
        item.textContent=text;
        item.addEventListener("click", ex_canvas.colorListener, false)
        return item;
    },
    createSizeController : function (size){
        var item = document.createElement("li");
        item.setAttribute("id", size);
        item.textContent=size+"pt";
        item.addEventListener("click", ex_canvas.sizeListener, false)
        return item;
    },
    createClearController : function(name){
        var item = document.createElement("li");
        item.setAttribute("id", name);
        item.textContent=name;
        item.addEventListener("click", ex_canvas.clearListener, false)
        return item;
    },
    removeControlPanel : function (){
        if (this.currentSlide != null){            
            var controlPanel = document.getElementById("controlCanvasPanel");     
            this.currentSlide.element.removeChild(controlPanel);
        }
    },
    addListeners : function (element){
        
        element.addEventListener ("mousedown", ex_canvas.mouseDown, false);
        element.addEventListener ("mousemove", ex_canvas.mouseMove, false);
        element.addEventListener ("mouseup", ex_canvas.mouseUp, false);
        element.addEventListener ("mouseleave", ex_canvas.mouseUp, false);
    },
    removeListeners : function (element){
        //console.log("Odstranuju event listenery");
        try {
            element.removeEventListener("mousedown", ex_canvas.mouseDown, false);
            element.removeEventListener("mousemove", ex_canvas.mouseMove, false);
            element.removeEventListener("mouseup", ex_canvas.mouseUp, false);
            element.removeEventListener("mouseleave", ex_canvas.mouseUp, false);
        } catch (e){
            console.log("Nepovedlo se kvuli: "+e);
        }
    },
    mouseDown : function (event){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            if (this.id == ex_canvas.canvasArray[i].element.id){
                ex_canvas.canvasArray[i].mouseDown(event);
            }
        }
    },
    mouseMove : function (event){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            if (this.id == ex_canvas.canvasArray[i].element.id){
                ex_canvas.canvasArray[i].mouseMove(event);
            }
        }
    },
    mouseUp : function (){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            if (this.id == ex_canvas.canvasArray[i].element.id){
                ex_canvas.canvasArray[i].mouseUp();
            }
        }
    },
    addCanvas : function (){
        if (this.currentSlide != null){
            console.log("funkce zavolana");
            var create = true;
            var array = this.currentSlide.element.getElementsByClassName("paintingCanvas");
            var element;
            if (array.length > 0) create = false;
            /* for (var i = 0; i < ex_canvas.canvasArray.length; i++){
                if (ex_canvas.canvasArray[i].element.id == "generatedCanvas"+this.currentSlide.number){
                    create = false;
                    element = ex_canvas.canvasArray[i].element;
                }
            }*/
            if (create){
                var newCanvas = document.createElement("canvas");           
                newCanvas.setAttribute('class',"paintingCanvas");
                newCanvas.setAttribute('height',"600px");
                newCanvas.setAttribute('width',"800px");
                newCanvas.setAttribute('id',"generatedCanvas"+this.currentSlide.number);            
                this.currentSlide.element.appendChild(newCanvas);
                this.findCanvases();
                this.addControlPanel(newCanvas);
            } else {
                for (var i = 0; i < array.length; i++){
                    for (var j = 0; j < this.canvasArray.length; j++){
                        if (array[i].id == this.canvasArray[j].element.id){
                            if (this.canvasArray[j].active){
                                this.removeControlPanel();
                                this.removeListeners(array[i]);
                                this.canvasArray[j].active = false;
                            } else {
                                this.addControlPanel(array[i]);
                                this.addListeners(array[i]);
                                this.canvasArray[j].active = true;
                            }
                        }
                    }
                }
            }
        }
        
    },
    clear : function (){
        
    },
    processSlide : function(){
    /**
        var button = document.getElementById("buttonDraw");
        button.addEventListener("click", function(e){
            console.log("clicked");
        }, false)
        **/
    /**
        if (false){
            
            var array = document.getElementsByClassName("paintingCanvas");
            console.log("Pocet platen: "+array.length);
            for (var i = 0; i < array.length; i++){
                console.log("krok: "+i+" a "+array[i].id);
                
                document.getElementById("paintingCanvas1").addEventListener ("mousedown", function () {
                    console.log("mousedown");
                }, true);
                
                this.canvasArray[i] = {
                    element : null,
                    context : null,
                    paint : false,
                    clickX : new Array(),
                    clickY : new Array(),
                    clickDrag : new Array(),
                    initialize : function (element){
                        this.element = element;
                        console.log("vypis: "+this.element.id);
                        //this.context = this.element.getContext("2d");
                        this.element.addEventListener ("mousedown", function (e) {
                            console.log("mousedown");
                        //var mouseX = e.pageX - this.offsetLeft;
                        //var mouseY = e.pageY - this.offsetTop;		
                        //ex_canvas.paint(this, true);
                        //ex_canvas.addClick(this, e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
                        //ex_canvas.redraw(this);
                        }, false);
                        
                    
                        this.element.addEventListener ("mousemove", function (e) {
                            console.log("mousemove");
                            
                            if(ex_canvas.getPaint(this)){
                                ex_canvas.addClick(this, e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                                ex_canvas.redraw(this);
                            }
                            
                        }, false);
                        this.element.addEventListener ("mouseup", function (e) {
                            console.log("mouseup");
                            //ex_canvas.paint(this, false);
                        }, false);
                        this.element.addEventListener ("mouseleave", function (e) {
                            console.log("mouseleave");
                            //ex_canvas.paint(this, false);
                        }, false);
                        
                    },
                    addClick : function(x, y, dragging)
                    {
                        this.clickX.push(x);
                        this.clickY.push(y);
                        this.clickDrag.push(dragging);
                    },
                    redraw : function(){
                        this.element.width = this.element.width; // Clears the canvas
  
                        this.context.strokeStyle = "#df4b26";
                        this.context.lineJoin = "round";
                        this.context.lineWidth = 5;
			
                        for(var i=0; i < this.clickX.length; i++)
                        {		
                            this.context.beginPath();
                            if(this.clickDrag[i] && i){
                                this.context.moveTo(this.clickX[i-1], this.clickY[i-1]);
                            }else{
                                this.context.moveTo(this.clickX[i]-1, this.clickY[i]);
                            }
                            this.context.lineTo(this.clickX[i], this.clickY[i]);
                            this.context.closePath();
                            this.context.stroke();
                        }
                    }
                };
                this.canvasArray[i].initialize(array[i]);
            }
            
        //this.loaded = true;
        }
    **/
    }
};
/*
var canvas = {
    element : null,
    context : null,
    paint : false,
    clickX : new Array(),
    clickY : new Array(),
    clickDrag : new Array(),
    initialize : function (element){
        this.element = element;
        this.context = this.element.getContext("2d");
        this.element.mousedown(function(e){
            var mouseX = e.pageX - this.offsetLeft;
            var mouseY = e.pageY - this.offsetTop;		
            this.paint = true;
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
            redraw();
        });
        this.element.mousemove(function(e){
            if(this.paint){
                addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                redraw();
            }
        });
        this.element.mouseup(function(e){
            this.paint = false;
        });
        this.element.mouseleave(function(e){
            this.paint = false;
        });
    },
    addClick : function(x, y, dragging)
    {
        this.clickX.push(x);
        this.clickY.push(y);
        this.clickDrag.push(dragging);
    },
    redraw : function(){
        this.element.width = this.element.width; // Clears the canvas
  
        this.context.strokeStyle = "#df4b26";
        this.context.lineJoin = "round";
        this.context.lineWidth = 5;
			
        for(var i=0; i < this.clickX.length; i++)
        {		
            this.context.beginPath();
            if(this.clickDrag[i] && i){
                this.context.moveTo(this.clickX[i-1], this.clickY[i-1]);
            }else{
                this.context.moveTo(this.clickX[i]-1, this.clickY[i]);
            }
            this.context.lineTo(this.clickX[i], this.clickY[i]);
            this.context.closePath();
            this.context.stroke();
        }
    }
}
*/