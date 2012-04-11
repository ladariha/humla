/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var view_pretty = {
    slides : [],
    current : null,
    //shadowprop : view_pretty.getsupportedprop(['boxShadow', 'MozBoxShadow', 'WebkitBoxShadow']),
    //roundborderprop : view_pretty.getsupportedprop(['borderRadius', 'MozBorderRadius', 'WebkitBorderRadius']),
    csstransform : ['transform', 'MozTransform', 'WebkitTransform', 'msTransform', 'OTransform'],
    prettyStylesheet : null,
    addedStyles : false,
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
    enterView : function(){   
        function Slide (slide, X, Y, rotation, scale){
            this.slide = slide;
            this.X = X;
            this.Y = Y;
            this.rotation = rotation;
            this.scale = scale;
            this.construct = function(slide, X, Y, rotation, scale){
                this.slide = slide;
                this.X = X;
                this.Y = Y;
                this.rotation = rotation;
                this.scale = scale;                
            }
            this.initialize = function(){
                if (view_pretty.prettyStylesheet == null){
                    view_pretty.prettyStylesheet = view_pretty.getStyleSheet("pretty.css");
                }
                if (view_pretty.prettyStylesheet != null){
                    view_pretty.prettyStylesheet.deleteRule(4);
                    view_pretty.prettyStylesheet.insertRule('.current { -webkit-transform: rotate('+this.rotation+'deg) scale('+this.scale+') translateX('+this.X+') translateY('+this.Y+'); }', 4);
                }
                
            //this.slide.element.style
            //this.slide.element.style.WebkitTransform =  'rotate('+this.rotation+'deg) scale('+this.scale+') translateX('+this.X+') translateY('+this.Y+') ';
            //this.slide.element.style['WebkitTransform']=  'rotate('+this.rotation+'deg) scale('+this.scale+') translateX('+this.X+') translateY('+this.Y+'); ';
            //console.log(this.slide.element.style['WebkitTransform']);
            //this.slide.element.style.WebkitTransform = 'rotate('+this.rotation+'deg)';
            //this.slide.element.style.WebkitTransform = 'scale('+this.scale+')';
            }
            this.basic = function(){
                var string = ' rotate(0deg) scale(1) translate(0px, 0px)';
                //console.log("Vypis: "+string);
                return string;
            }
            this.transformation = function(){
                var string = ' rotate('+this.rotation+'deg) scale('+this.scale+') translate('+this.X+'px, '+this.Y+'px)';
                //console.log("Vypis: "+string);
                return string;
            }
            this.forwardTransformation = function(rotation, scale, X, Y){
                var string = ' rotate('+(this.rotation-rotation)+'deg) scale('+(this.scale/scale)+') translate('+(this.X-X)+'px, '+(this.Y-Y)+'px)';
                //console.log("Vypis: "+string);
                return string;
            }
            this.backToOrigin = function(){
                view_pretty.changecssproperty(this.slide.element, 'rotate(-'+this.rotation+'deg) scale(1/'+this.scale+') translateX(-'+this.X+') translateY(-'+this.Y+') ');
            }
            this.translate = function(rotation, scale, X, Y){
                view_pretty.changecssproperty(this.slide.element, 'rotate('+rotation+'deg) scale('+scale+') translateX('+X+') translateY('+Y+') ');
            }
            this.reverseTranslate = function(rotation, scale, X, Y){
                view_pretty.changecssproperty(this.slide.element, 'rotate('+(this.rotation-rotation)+'deg) scale('+(this.scale/scale)+') translateX('+(this.X-X)+') translateY('+(this.Y-Y)+') ');
            }
        }
        for (var i = 0; i < humla.slides.length; i++){
            var slide = new Slide(humla.slides[i], this.generateX(i), this.generateY(i), this.generateRotation(i), this.generateScale(i) );
            //slide.initialize();
            //humla.slides[i].element.style.webkitTransform = slide.initialValue();
            this.slides.push(slide);
        }
    },
    generateX : function(i){
        if (humla.slides[i].element.getAttribute("data-x") != null){
            console.log("Nacteno X: "+humla.slides[i].element.getAttribute("data-x"));
            return humla.slides[i].element.getAttribute("data-x");
        } else {
            return i*800;
        }
        
    },
    generateY : function(i){
        if (humla.slides[i].element.getAttribute("data-y") != null){
            return humla.slides[i].element.getAttribute("data-y");
        } else {
            return i*600;
        }
    },
    generateRotation : function(i){
        if (humla.slides[i].element.getAttribute("data-rotation") != null){
            return humla.slides[i].element.getAttribute("data-rotation");
        } else {
            return i*30;
        }
    },
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
            //var scale = number;
            console.log(scale);
            return scale;
        }
    },
    setStyles : function(currentValue, nextValue, farnextValue, previousValue, farpreviousValue){
        if (view_pretty.prettyStylesheet == null){
            view_pretty.prettyStylesheet = view_pretty.getStyleSheet("pretty.css");
        }
        if (view_pretty.prettyStylesheet != null){  
            try{
                
            
                view_pretty.prettyStylesheet.insertRule(".slide.current { "+currentValue+"; }", 3);            
                view_pretty.prettyStylesheet.insertRule(".slide.next { "+nextValue+"; }", 4);
                view_pretty.prettyStylesheet.insertRule(".slide.far-next { "+farnextValue+"; }", 5);
                view_pretty.prettyStylesheet.insertRule(".slide.previous { "+previousValue+"; }", 6);
                view_pretty.prettyStylesheet.insertRule(".slide.far-previous { "+farpreviousValue+"; }", 7);
            } catch (err){
                console.log("Chyba pridavani");
            }
        }
    },
    removeStyles : function(){
        if (view_pretty.prettyStylesheet == null){
            view_pretty.prettyStylesheet = view_pretty.getStyleSheet("pretty.css");
        }
        if (view_pretty.prettyStylesheet != null){    
            try {
                
            
                view_pretty.prettyStylesheet.deleteRule(3);
                view_pretty.prettyStylesheet.deleteRule(4);
                view_pretty.prettyStylesheet.deleteRule(5);
                view_pretty.prettyStylesheet.deleteRule(6);
                view_pretty.prettyStylesheet.deleteRule(7);
            } catch (err){
                console.log("Chyba mazani: "+err);
            }
        }    
    },
    changecssproperty : function(target, value, action){
        //for (var i = 0; i < this.csstransform.length; i++){
        target.style.WebkitTransform = value;
        console.log(value);
    //}            
    },

    getsupportedprop : function(proparray){
        var root=document.documentElement //reference root element of document
        for (var i=0; i<proparray.length; i++){ //loop through possible properties
            if (typeof root.style[proparray[i]]=="string"){ //if the property value is a string (versus undefined)
                return proparray[i] //return that string
            }
        }
        return proparray[0];
    },

    addCanvas : function (){
        var element = document.body;
           
        var newCanvas = document.createElement("canvas");           
        newCanvas.setAttribute('class',"backgroundCanvas");
        newCanvas.setAttribute('height',"100%");
        newCanvas.setAttribute('width',"100%");
        newCanvas.setAttribute('id',"backgroundCanvas");            
        element.appendChild(newCanvas);     
        
    },
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
            //console.log("krok1");
            farpreviousStyle = this.slides[index-2].forwardTransformation(rotation, scale, X, Y);
        } 
        if (index - 1 >= 0) {
            //console.log("krok2");
            previousStyle = this.slides[index-1].forwardTransformation(rotation, scale, X, Y);
        } 
        currentStyle = this.slides[index].basic();
        if (index +1 < this.slides.length) {
            ///console.log("krok3");
            nextStyle = this.slides[index+1].forwardTransformation(rotation, scale, X, Y);
        } 
        if (index +2 < this.slides.length) {
            //console.log("krok4");
            farnextStyle = this.slides[index+2].forwardTransformation(rotation, scale, X, Y);
        } 
        //this.setStyles(currentStyle, nextStyle, farnextStyle, previousStyle, farpreviousStyle);
        if (inx - 2 >= 0) {
            humla.slides[inx - 2].addClass("visible");
            humla.slides[inx-2].element.style.webkitTransform = farpreviousStyle;
        }
        if (inx - 1 >= 0) {
            humla.slides[inx - 1].addClass("visible");
            humla.slides[inx-1].element.style.webkitTransform = previousStyle;
        }
        humla.slides[inx ].addClass("main");
        humla.slides[inx].element.style.webkitTransform = currentStyle;
        if (inx + 1 < humla.slides.length) {
            humla.slides[inx +1].addClass("visible");
            humla.slides[inx+1].element.style.webkitTransform = nextStyle;
        }
        if (inx + 2 < humla.slides.length) {
            humla.slides[inx + 2].addClass("visible");
            humla.slides[inx+2].element.style.webkitTransform = farnextStyle;
        }
    },        
    addAnimation : function(element, keyframeprefix, animationstring){
        element.style[ animationstring ] = 'all 2s linear infinite';
 
        var keyframes = '@' + keyframeprefix + 'keyframes rotate { '+
        'from {' + keyframeprefix + 'transform:rotate( 0deg ) }'+
        'to {' + keyframeprefix + 'transform:rotate( 360deg ) }'+
        '}';
 
        if( document.styleSheets && document.styleSheets.length ) {
 
            document.styleSheets[0].insertRule( keyframes, 0 );
 
        } else {
 
            var s = document.createElement( 'style' );
            s.innerHTML = keyframes;
            document.getElementsByTagName( 'head' )[ 0 ].appendChild( s );
        }
    },

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
    endsWith : function(string, suffix) {        
        //console.log("Porovnavam: "+string+" a "+suffix);
        return string.indexOf(suffix, string.length - suffix.length) !== -1;
    }
}

