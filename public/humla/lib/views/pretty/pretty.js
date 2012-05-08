/**
 * A view that allows user to create various transformations between slides.
 * @author Vojtech Smrcek
 */
var view_pretty = {
    /**
     * An array of transformed slides
     */
    slides : [],
    /**
     * Current slide
     */
    current : null,
    /**
     * CSS3 transforms for various browsers
     */
    csstransform : ['transform', 'MozTransform', 'WebkitTransform', 'msTransform', 'OTransform'],
    prettyStylesheet : null,
    addedStyles : false,
    /**
     * Function to get the pretty CSS stylesheet from the document.
     */
    getStyleSheet : function(unique_title) {
        for(var i=0; i<document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i];
            if(view_pretty.endsWith(sheet.href, unique_title)) {                
                console.log(sheet.href);
                return sheet;
            }
        }
        return null;
    },
    /**
     * Function called on entering the slide, load slides and their transformations.
     */
    enterView : function(){   
        /**
        * A class representing a slide with all attributes (translation, rotation and scale)
        * @param slide
        * @param X
        * @param Y
        * @param rotation
        * @param scale
         */
        function Slide (slide, X, Y, rotation, scale){
            this.slide = slide;
            this.X = X;
            this.Y = Y;
            this.rotation = rotation;
            this.scale = scale;
            /**
             * Constructor function
             * @param slide
             * @param X
             * @param Y
             * @param rotation
             * @param scale
             */
            this.construct = function(slide, X, Y, rotation, scale){
                this.slide = slide;
                this.X = X;
                this.Y = Y;
                this.rotation = rotation;
                this.scale = scale;                
            }
            /**
             * Initializes the view.
             */
            this.initialize = function(){
                if (view_pretty.prettyStylesheet == null){
                    view_pretty.prettyStylesheet = view_pretty.getStyleSheet("pretty.css");
                }
                if (view_pretty.prettyStylesheet != null){
                    view_pretty.prettyStylesheet.deleteRule(4);
                    view_pretty.prettyStylesheet.insertRule('.current { -webkit-transform: rotate('+this.rotation+'deg) scale('+this.scale+') translateX('+this.X+') translateY('+this.Y+'); }', 4);
                }
         
            }
            /**
             * Returns default transformation.
             * @return string
             */
            this.basic = function(){
                var string = ' rotate(0deg) scale(1) translate(0px, 0px)';
                return string;
            }
            /**
             * Returns current transformation.
             * @return string
             */
            this.transformation = function(){
                var string = ' rotate('+this.rotation+'deg) scale('+this.scale+') translate('+this.X+'px, '+this.Y+'px)';
                return string;
            }
            /**
             * Returns inverse transformation (when the current slide is translated right, it means that the other slides are translated left and so on).
             * @return string
             */
            this.forwardTransformation = function(rotation, scale, X, Y){
                var string = ' rotate('+(this.rotation-rotation)+'deg) scale('+(this.scale/scale)+') translate('+(this.X-X)+'px, '+(this.Y-Y)+'px)';
                return string;
            }
            /**
             * Returns the css style to the origin
             */
            this.backToOrigin = function(){
                view_pretty.changecssproperty(this.slide.element, 'rotate(-'+this.rotation+'deg) scale(1/'+this.scale+') translateX(-'+this.X+') translateY(-'+this.Y+') ');
            }
            /**
             * Transforms the css style
             */
            this.translate = function(rotation, scale, X, Y){
                view_pretty.changecssproperty(this.slide.element, 'rotate('+rotation+'deg) scale('+scale+') translateX('+X+') translateY('+Y+') ');
            }
            /**
             * Reverse the CSS transformation
             */
            this.reverseTranslate = function(rotation, scale, X, Y){
                view_pretty.changecssproperty(this.slide.element, 'rotate('+(this.rotation-rotation)+'deg) scale('+(this.scale/scale)+') translateX('+(this.X-X)+') translateY('+(this.Y-Y)+') ');
            }
        }
        for (var i = 0; i < humla.slides.length; i++){
            var slide = new Slide(humla.slides[i], this.generateX(i), this.generateY(i), this.generateRotation(i), this.generateScale(i) );
            this.slides.push(slide);
        }
    },
    /**
    * Generates the translation on X axis according to the given attribute (or generates it from the given pattern).
    * @param i
    */
    generateX : function(i){
        if (humla.slides[i].element.getAttribute("data-x") != null){
            console.log("Nacteno X: "+humla.slides[i].element.getAttribute("data-x"));
            return humla.slides[i].element.getAttribute("data-x");
        } else {
            return i*800;
        }
        
    },
    /**
    * Generates the translation on Y axis according to the given attribute (or generates it from the given pattern).
    * @param i
    */
    generateY : function(i){
        if (humla.slides[i].element.getAttribute("data-y") != null){
            return humla.slides[i].element.getAttribute("data-y");
        } else {
            return i*600;
        }
    },
    /**
    * Generates the rotation according to the given attribute (or generates it from the given pattern).
    * @param i
    */
    generateRotation : function(i){
        if (humla.slides[i].element.getAttribute("data-rotation") != null){
            return humla.slides[i].element.getAttribute("data-rotation");
        } else {
            return i*30;
        }
    },
    /**
    * Generates the scale according to the given attribute (or generates it from the given pattern).
    * @param i
    */
    generateScale : function(i){
        if (humla.slides[i].element.getAttribute("data-scale") != null){
            return humla.slides[i].element.getAttribute("data-scale");
        } else {
            var scale = 1;
            if (i%2 == 0){
                scale = 5;
            } else {
                scale = 1;
            }
            return scale;
        }
    },
    /**
     * Changes the css property of a target slide to the given value.
     * @target slide
     * @value of CSS
     */
    changecssproperty : function(target, value){
        target.style.WebkitTransform = value;
        console.log(value);
    },

    /**
     * Function called on entering the slide, sets transformation of the current slide, 2 previous and 2 next neighbours. This transformation is computed from user given values.
     */
    enterSlide : function(slide) {
        
        var inx = slide.number - 1;
        var index = -1;
        var slideElement = null;
        for (var i = 0; i < this.slides.length; i++){            
            if (this.slides[i].slide.number == slide.number){
                slideElement = this.slides[i];
                index = i;
                i = this.slides.length;
            }
        }
        var currentStyle;
        var previousStyle;
        var farpreviousStyle;
        var nextStyle;
        var farnextStyle;
        var rotation = slideElement.rotation;
        var scale = slideElement.scale;
        var X = slideElement.X;
        var Y = slideElement.Y;
        console.log("Index: "+index);
        if (index - 2 >= 0) {
            farpreviousStyle = this.slides[index-2].forwardTransformation(rotation, scale, X, Y);
        } 
        if (index - 1 >= 0) {
            previousStyle = this.slides[index-1].forwardTransformation(rotation, scale, X, Y);
        } 
        currentStyle = this.slides[index].basic();
        if (index +1 < this.slides.length) {
            nextStyle = this.slides[index+1].forwardTransformation(rotation, scale, X, Y);
        } 
        if (index +2 < this.slides.length) {
            farnextStyle = this.slides[index+2].forwardTransformation(rotation, scale, X, Y);
        } 
        if (inx - 2 >= 0) {
            humla.slides[inx - 2].addClass("visible");
            if (browser.browser == "Chrome")
                humla.slides[inx-2].element.style.webkitTransform = farpreviousStyle;
            else if (browser.browser == "Firefox")
                humla.slides[inx-2].element.style.MozTransform = farpreviousStyle;
        }
        if (inx - 1 >= 0) {
            humla.slides[inx - 1].addClass("visible");
            if (browser.browser == "Chrome")
            humla.slides[inx-1].element.style.webkitTransform = previousStyle;
        else if (browser.browser == "Firefox")
            humla.slides[inx-1].element.style.MozTransform = previousStyle;
        }
        humla.slides[inx ].addClass("main");
        if (browser.browser == "Chrome")
            humla.slides[inx].element.style.webkitTransform = currentStyle;
        else if (browser.browser == "Firefox")
            humla.slides[inx].element.style.MozTransform = currentStyle;
        if (inx + 1 < humla.slides.length) {
            
            humla.slides[inx +1].addClass("visible");
            if (browser.browser == "Chrome")
            humla.slides[inx+1].element.style.webkitTransform = nextStyle;
            else if (browser.browser == "Firefox")
                humla.slides[inx+1].element.style.MozTransform = nextStyle;
        }
        if (inx + 2 < humla.slides.length) {
            humla.slides[inx + 2].addClass("visible");
            if (browser.browser == "Chrome")
            humla.slides[inx+2].element.style.webkitTransform = farnextStyle;
            else if (browser.browser == "Firefox")
            humla.slides[inx+2].element.style.MozTransform = farnextStyle;    
        }
    },        
  
  /**
   * Removes styles from the slide and its neighbout on leaving the current slide. 
   * @param slide
   */
    leaveSlide : function(slide) {
        var inx = slide.number - 1;
        //this.removeStyles();
        
        if (inx - 2 >= 0) {
            humla.slides[inx - 2].removeClass("visible");
            humla.slides[inx-2].element.removeAttribute("style");
        }
        if (inx - 1 >= 0) humla.slides[inx - 1].removeClass("visible");
        humla.slides[inx].removeClass("main");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].removeClass("visible");
        if (inx + 2 < humla.slides.length) {
            humla.slides[inx + 2].removeClass("visible");
            humla.slides[inx+2].element.removeAttribute("style");
        }
    },
    /**
     * Finds out whether a given string ends with given suffix
     * @param string
     * @param suffig
     * @return flag is the equal
     */
    endsWith : function(string, suffix) {        
        return string.indexOf(suffix, string.length - suffix.length) !== -1;
    }
}

