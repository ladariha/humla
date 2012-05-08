/**
 * @author Vojtech Smrcek <smrcevoj> URL: https://github.com/planarvoid
 */

/**
 *  Class representing canvas to be saved into database
 */

function CanvasDBStructure (){
    this.id = 0;
    this.htmlID = "";
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.clickColor = [];
    this.clickWidth = [];
    /**
     * Initializes database object from drawn canvas
     * @param canvas
     */
    this.initializeFromCanvas = function(canvas){
        this.id = canvas.dbID; 
        this.htmlID = canvas.element.id; 
        this.clickX = canvas.clickX.slice(0); 
        this.clickY = canvas.clickY.slice(0); 
        this.clickDrag = canvas.clickDrag.slice(0); 
        this.clickColor = canvas.clickColor.slice(0); 
        this.clickWidth = canvas.clickWidth.slice(0);
        if (canvas.clickX.length > 0 || canvas.clickY.length > 0 || canvas.clickDrag.length > 0 || canvas.clickColor.length > 0 || canvas.clickWidth.length > 0 ){
            return true;
        } else {
            return false;
        }
    };
    /**
     * Returns true if the database object is empty
     */
    this.isClear = function(){
        if (this.clickX.length > 0 || this.clickY.length > 0 || this.clickDrag.length > 0 || this.clickColor.length > 0 || this.clickWidth.length > 0 ){
            return false;
        } else {
            return true;
        }

    };
    /**
     * Converts canvas into JSON object to be stored into database as a new item (database insert function)
     * @return json
     */
    this.getAddJSON = function(){
        var json = {
            htmlID : this.htmlID,
            clickX : this.clickX,
            clickY : this.clickY,
            clickDrag : this.clickDrag,
            clickColor : this.clickColor,
            clickWidth : this.clickWidth
        }
        return json;
    };
    /**
     * Converts canvas into JSON object to update item in database
     * @return json
     */
    this.getUpdateJSON = function(){
        var json = {
            id : this.id,
            htmlID : this.htmlID,
            clickX : this.clickX,
            clickY : this.clickY,
            clickDrag : this.clickDrag,
            clickColor : this.clickColor,
            clickWidth : this.clickWidth
        }
        return json;
    };
    /**
     * Initializes database object from given parameters
     * @param id in database
     * @param htmlID id of html element
     * @param arrayX array of X coords of touches
     * @param arrayY array of Y coords of touches
     * @param arrayDrag array with values if the gesture was dragged between points
     * @param arrayColor array with colors of lines
     * @param arrayWidth array with width of the painting brush
     */
    this.initialize = function(id, htmlID, arrayX, arrayY, arrayDrag, arrayColor, arrayWidth){
        if(id > 0) this.id = id;
        this.htmlID = htmlID;
        this.clickX = arrayX;
        this.clickY = arrayY;
        this.clickColor = arrayColor;
        this.clickDrag = arrayDrag;
        this.clickWidth = arrayWidth;
    };
}

/**
 *  Singleton object representing the drawing canvas extension
 */

var ex_canvas = {
    loaded : false,
    canvasArray : [],
    currentSlide : null,
    strokeColor : "#000000",
    table : "CANVAS",
    strokeWidth : 5,
    zoom : 1,
    /**
     * Function called when the menu is loaded fills it with buttons to save and load canvas from database and buttons to add canvas to the current slide
     * @param menu to be altered
     */
    processMenu: function(menu) {                        
        menu.addTab("draw",{
            name:"Draw",
            cb: function() {
                ex_canvas.addCanvas();
            }, // callback function, třeba provolá humla.neco.neco();
            show_layer:false
        });
       
    
        menu.addTab("saveDB",{
            name:"Save drawings",
            cb: function() {
                ex_canvas.saveStateToDB();
            //ex_canvas.loadStateFromDB();
            }, // callback function, třeba provolá humla.neco.neco();
            show_layer:false
        });
        menu.addTab("loadDB",{
            name:"Load drawings",
            cb: function() {
                //ex_canvas.saveStateToDB();
                ex_canvas.loadStateFromDB();
            }, // callback function, třeba provolá humla.neco.neco();
            show_layer:false
        });
        
    },
    /**
     * Function that calls database function to load canvases from the database. 
     */
    loadStateFromDB : function(){
        
        ext_indexeddb.indexedDB.get("CANVAS", function(e){
            var result = e.target.result;
            console.log("Loading from the DB");
            if(!!result == false){
                console.log(result);
                return;
            } 

            ex_canvas.addFromDB(result.value);
            result.continue();
        }, function(){
            console.log("Loading from the DB was not successful");
        });
            
        
    },
    /**
     * Function that loads a canvas with given key from  the database. 
     */
    getFromDB : function(key){
        ext_indexeddb.indexedDB.getItem("CANVAS", "htmlID", key, function(e){
            var result = e.target.result;
        }, function(){
            console.log("Loading from the DB was not successful");
        });
    },
    /**
     * Function that finds the canvas with given html id and sets its database id
     */
    setID : function(htmlID, id){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            if (htmlID == ex_canvas.canvasArray[i].element.id){
                ex_canvas.canvasArray[i].dbID = id;
            }
        }
    },
    /**
     * Function that saves all modified canvases to the database
     */ 
    saveStateToDB : function(){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            var canvas = new CanvasDBStructure();
            if (canvas.initializeFromCanvas(ex_canvas.canvasArray[i])){  
                //console.log("Vypis: "+canvas.id);
                var data = {
                    "htmlID" : "canvasID"                    
                }
                if (canvas.id == 0){
                    ext_indexeddb.indexedDB.add(canvas.getAddJSON(), "CANVAS", function(event){
                        console.log("Canvas succesfully saved into DB");
                        console.log(event);
                        ex_canvas.getFromDB(canvas.htmlID);
                    }, function(){
                        console.log("Saving canvas to DB was not successful");
                    });
                } else {
                    ext_indexeddb.indexedDB.update(canvas.getUpdateJSON(), "CANVAS", function(){
                        console.log("Canvas succesfully saved into DB");
                    }, function(){
                        console.log("Updating canvas in DB was not successful");
                    });
                } 
            } else if (canvas.id != 0){
                ext_indexeddb.indexedDB.deleteItem(canvas.id, ex_canvas.table, function(){
                    console.log("Canvas succesfully removed from DB");
                }, function(){
                    console.log("Delete was not successful");
                });
            }
        }
    },
    /**
     * Function used to process loaded objects from the database. Loads canvas content if the target canvas is empty, otherwise sets the canvas's id.
     */
    addFromDB : function(item){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            if (item.htmlID == ex_canvas.canvasArray[i].element.id){
                var canvas = ex_canvas.canvasArray[i];
                console.log("Loading from DB: "+item.id);
                if (canvas.clickX.length > 0 || canvas.clickY.length > 0 || canvas.clickDrag.length > 0 || canvas.clickColor.length > 0 || canvas.clickWidth.length > 0 ){
                    canvas.dbID = item.id;
                    
                } else {
                    canvas.dbID = item.id;
                    canvas.clickX = item.clickX;
                    canvas.clickY = item.clickY;
                    canvas.clickDrag = item.clickDrag;
                    canvas.clickColor = item.clickColor;
                    canvas.clickWidth = item.clickWidth;
                    canvas.redraw();
                }
            }
        }
    },
    /**
     * Sets color of the stroke
     * @param color of the stroke
     */
    setColor : function(color){
        this.strokeColor = color;
    },
    /**
     * Listener function that changes the stroke color
     * @param e triggered event
     */
    colorListener : function(e){        
        ex_canvas.strokeColor = "#"+this.id;
    },
    /**
     * Listener function that changes the stroke size
     * @param e triggered event
     */
    sizeListener : function(e){
        ex_canvas.strokeWidth = this.id;
    },
    /**
     * Listener function to clear current canvas
     * @param e triggered event
     */
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
    /**
     * Sets the stroke width
     * @param width of the stroke
     */
    setWidth : function(width){
        this.strokeWidth = width;
    },
    /**
     * Function processed on entering slide, locates canvas and resizes it according to the zoom of the slide.
     * @param slide to be entered
     */
    enterSlide : function(slide){
        this.currentSlide = slide;
        this.loaded = true;
        this.zoom = slide.element.style.zoom;
        var resizeCanvas = function(){
            var zoom = ex_canvas.currentSlide.element.style.zoom;
            var array = ex_canvas.currentSlide.element.getElementsByClassName("paintingCanvas");
            if (zoom != null && zoom != 0)
                for (var i = 0; i < array.length; i++){
                
                    array[i].width = SLIDE_WIDTH * zoom;
                    array[i].height = SLIDE_HEIGHT * zoom;
                }
        }
        resizeCanvas();
        
        this.findCanvases(slide);
        window.onresize = resizeCanvas;
        
        
    },
    /**
     * Function processed on leaving slide, removes the control panel and listeners
     * @param slide to be leaved
     */
    leaveSlide : function(slide){
        
        var array = slide.element.getElementsByClassName("paintingCanvas");
        for (var i = 0; i < array.length; i++){
            this.removeListeners(array[i]);
        }        
        this.removeControlPanel();
        
    },
    /**
     * Function that loads all child canvases of the current slide and creates appropriate objects in the array.
     */
    findCanvases : function (){
        
        var array = this.currentSlide.element.getElementsByClassName("paintingCanvas");
        /**
        * Class representing the canvas HTML object and all drawings it contains.
        * @param element 
        * @param arrayX array of X coords of touches
        * @param arrayY array of Y coords of touches
        * @param arrayDrag array with values if the gesture was dragged between points
        * @param arrayColor array with colors of lines
        * @param arrayWidth array with width of the painting brush
        */
        function Canvas(element, arrayX, arrayY, arrayDrag, arrayColor, arrayWidth){
        {
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
            this.dbID = 0;
            /**
             * Function to initialize 2D context
             */
            this.initialize = function(){
                this.context = this.element.getContext("2d");
            };
            /**
             * Function to count the canvas offset according to the current position and zoom of the slide.
             */
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
                
                
                if (ex_canvas.zoom != null && ex_canvas.zoom != 0 && ex_canvas.zoom != 1){
                    this.offsetLeft = curleft * ex_canvas.zoom;
                    this.offsetTop = curtop * ex_canvas.zoom;
                } else {
                    this.offsetLeft = curleft;
                    this.offsetTop = curtop;
                }
                
            }
            /**
             * Function triggered when the mouse is clicked
             * param e triggered event
             */
            this.mouseDown = function(e){
                
                this.countOffset();
                var mouseX = e.pageX - this.offsetLeft;
                var mouseY = e.pageY - this.offsetTop;		
                this.paint = true;
                this.addClick(mouseX, mouseY, false);
                this.redraw();
            };
            /**
             * Function triggered when the mouse is moved
             * param e triggered event
             */
            this.mouseMove = function(e){
                if(this.paint){
                    this.countOffset();
                    this.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
                    this.redraw();
                }   
            };
            /**
             * Function triggered when the mouse button is stopped being pressed (or the finger leaves the screen or the canvas)
             * param e triggered event
             */
            this.mouseUp = function(){
                    
                this.paint = false;
            };     
            /**
             * Function triggered when the finger touches the screen
             * param e triggered event
             */            
            this.touchStart = function(e){                
                var touch = e.touches[0];
                if (touch != null) this.mouseDown(touch);
            };  
            /**
             * Function triggered when the finger moves when touching the screen
             * param e triggered event
             */
            this.touchMove = function(e){                
                var touch = e.touches[0];
                if (touch != null) this.mouseMove(touch);
            };  
            /**
             * Function triggered when the finger stops touching the screen or leaves the canvas
             * param e triggered event
             */
            this.touchEnd = function(e){         
                this.mouseUp();
            };  
            /**
             * Function called to add click to the right array (its X and Y coords are added to appropriate arrays)
             * param x coord
             * param y coord
             * param dragging boolean true if the movement is continual
             */
            this.addClick =  function(x, y, dragging)
            {
                this.clickX.push(x);
                this.clickY.push(y);
                
                this.clickDrag.push(dragging);
                this.clickColor.push(ex_canvas.strokeColor);
                this.clickWidth.push(ex_canvas.strokeWidth);
            };
            /**
             * Function that clears the canvas;
             */
            this.clear = function(){
                this.context.fillStyle = '#252525'; // Work around for Chrome
                //this.context.fillRect(0, 0, 750, 500); // Fill in the canvas with white
                this.element.width = this.element.width; // clears the canvas   
            };
            /**
             * Function that clears the history of moves (and allows the canvas to be loaded from the database
             */
            this.clearHistory = function(){                
                this.clickColor = new Array();
                this.clickDrag = new Array();
                this.clickWidth = new Array();
                this.clickX = new Array();
                this.clickY = new Array();
            };
            /**
             * Function called to redraw the canvas with the new click
             */
            this.redraw = function(){
                this.clear();
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
                    this.context.strokeStyle = this.clickColor[i];
                    this.context.lineWidth = this.clickWidth[i];
                    this.context.stroke();
                }
            };
        };
        }
        var prvek = 0
        for (var i = 0; i < array.length; i++){
            var newCanvas = true;
            for (var j=0; j<this.canvasArray.length; j++){
                if (array[i].id == this.canvasArray[j].element.id){
                    newCanvas = false;
                    try {
                        var active = this.canvasArray[j].active;
                        this.canvasArray[j] = new Canvas(array[i], this.canvasArray[j].clickX, this.canvasArray[j].clickY, this.canvasArray[j].clickDrag, this.canvasArray[j].clickColor, this.canvasArray[j].clickWidth);
                        this.canvasArray[j].active = active;
                        this.canvasArray[j].redraw();
                        if (active) {
                            this.addListeners(array[i]);
                            this.addControlPanel(array[i]);
                        }
                    } catch (e){
                        console.log("Error: "+e);
                    }
                }
            }
            if (newCanvas){
                this.canvasArray.push(new Canvas(array[i], new Array(), new Array(), new Array(), new Array(), new Array()));
                this.addListeners(array[i]);
                this.addControlPanel(array[i]);
            }
            prvek++;
                
        }
    },
    /**
     * Function that creates a control panel on the given slide
     * @param element current slide 
     */
    addControlPanel : function (element){
        if (this.currentSlide != null && document.getElementById("controlCanvasPanel") == null){
            
            var controlPanel = document.createElement("span");           
            controlPanel.setAttribute('class',"controlPanel");
            controlPanel.setAttribute('id',"controlCanvasPanel");
            var list = document.createElement("ul");
            list.appendChild(this.createColorController("FF0000", "R"));
            list.appendChild(this.createColorController("000000", "K"));
            list.appendChild(this.createColorController("00FF00", "G"));
            list.appendChild(this.createColorController("0000FF", "B"));
            list.appendChild(this.createSizeController(1));
            list.appendChild(this.createSizeController(3));
            list.appendChild(this.createSizeController(5));
            list.appendChild(this.createClearController("Cl"));
            controlPanel.appendChild(list);
            this.currentSlide.element.insertBefore(controlPanel, element);
        }
    },
    /**
     * Function to create a button to change stroke color
     * @param color of the stroke
     * @param text to be displayed in the button
     */
    createColorController : function (color, text){
        var item = document.createElement("li");
        item.setAttribute("id", color);
        item.setAttribute("style", "color: #"+color+";")
        item.textContent=text;
        item.addEventListener("click", ex_canvas.colorListener, false)
        return item;
    },
    /**
     * Function to create a button to change stroke size
     * @param size of the stroke
     */
    createSizeController : function (size){
        var item = document.createElement("li");
        item.setAttribute("id", size);
        item.textContent=size+"pt";
        item.addEventListener("click", ex_canvas.sizeListener, false)
        return item;
    },
    /**
     * Function to create a button to clear the canvas
     * @param name of the button
     */
    createClearController : function(name){
        var item = document.createElement("li");
        item.setAttribute("id", name);
        item.textContent=name;
        item.addEventListener("click", ex_canvas.clearListener, false)
        return item;
    },
    /**
     * Function to remove the control panel
     */
    removeControlPanel : function (){
        if (this.currentSlide != null){            
            var controlPanel = document.getElementById("controlCanvasPanel");     
            this.currentSlide.element.removeChild(controlPanel);
        }
    },
    /**
     * Function to add listeners to mouse and touch events
     * @param element to which the listeners are added
     */
    addListeners : function (element){
        
        element.addEventListener ("mousedown", ex_canvas.mouseDown, false);
        element.addEventListener ("mousemove", ex_canvas.mouseMove, false);
        element.addEventListener ("mouseup", ex_canvas.mouseUp, false);
        element.addEventListener ("mouseleave", ex_canvas.mouseUp, false);
        
        
        element.addEventListener ("touchstart", ex_canvas.touchStart, false);
        element.addEventListener ("touchmove", ex_canvas.touchMove, false);
        element.addEventListener ("touchend", ex_canvas.touchEnd, false);
        element.addEventListener ("touchleave", ex_canvas.touchEnd, false);
        element.addEventListener ("touchcancel", ex_canvas.touchEnd, false);
    },
    /**
     * Function to remove listeners to mouse and touch events
     * @param element from which the listeners are removed
     */
    removeListeners : function (element){
        try {
            element.removeEventListener("mousedown", ex_canvas.mouseDown, false);
            element.removeEventListener("mousemove", ex_canvas.mouseMove, false);
            element.removeEventListener("mouseup", ex_canvas.mouseUp, false);
            element.removeEventListener("mouseleave", ex_canvas.mouseUp, false);
            
            
            element.removeEventListener ("touchstart", ex_canvas.touchStart, false);
            element.removeEventListener ("touchmove", ex_canvas.touchMove, false);
            element.removeEventListener ("touchend", ex_canvas.touchEnd, false);
            element.removeEventListener ("touchleave", ex_canvas.touchEnd, false);
            element.removeEventListener ("touchcancel", ex_canvas.touchEnd, false);
        } catch (e){
            console.log("Error while removing listeners: "+e);
        }
    },
    /**
     * Handles the mouse click
     * @param event
     */
    mouseDown : function (event){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            if (this.id == ex_canvas.canvasArray[i].element.id){
                ex_canvas.canvasArray[i].mouseDown(event);
            }
        }
    },
    /**
     * Handles the mouse move
     * @param event
     */
    mouseMove : function (event){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            if (this.id == ex_canvas.canvasArray[i].element.id){
                ex_canvas.canvasArray[i].mouseMove(event);
            }
        }
    },
    /**
     * Handles the mouse button release
     */
    mouseUp : function (){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            if (this.id == ex_canvas.canvasArray[i].element.id){
                ex_canvas.canvasArray[i].mouseUp();
            }
        }
    },
    /**
     * Handles the touch
     * @param event
     */
    touchStart : function (event){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            if (this.id == ex_canvas.canvasArray[i].element.id){
                ex_canvas.canvasArray[i].touchStart(event);
            }
        }
    },
    /**
     * Handles the touch move
     * @param event
     */
    touchMove : function (event){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            if (this.id == ex_canvas.canvasArray[i].element.id){
                ex_canvas.canvasArray[i].touchMove(event);
            }
        }
    },
    /**
     * Handles the touch
     * @param event
     */
    touchEnd : function (){
        for (var i = 0; i < ex_canvas.canvasArray.length; i++){
            if (this.id == ex_canvas.canvasArray[i].element.id){
                ex_canvas.canvasArray[i].touchEnd();
            }
        }
    },
    /**
     * Called on click to add painting canvas to the current element or to toggle the current painting canvas visible (or invisible)
     */
    addCanvas : function (){
        if (this.currentSlide != null){
            var create = true;
            var array = this.currentSlide.element.getElementsByClassName("paintingCanvas");
            var element;
            if (array.length > 0) create = false;
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
        
    }
};
