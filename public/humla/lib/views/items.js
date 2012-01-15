
var view_items = {
    current    : -1,
    lastSlide : -1,
    elements   : [],
    stuck  : false,
    rewrite : false,
    stuckSlide : -1,
    enterSlide : function(slide) {
        //console.log("Prislo: "+slide.number+", soucasny: "+this.current+", last: "+this.lastSlide+", delka: "+this.elements.length );
        if (slide.number < this.current) {
            this.rewrite = false;
            this.elements.length = 0;
            this.removeSlide(this.lastSlide);
            console.log("NULUJU");
        }
        if (!this.rewrite){
        
            var inx = slide.number - 1;
            this.lastSlide = this.current;
            this.current = inx;
            console.log("menim current");
        }
        console.log("Vstupuju do slidu: "+slide.number+", soucasny: "+this.current+", last: "+this.lastSlide);
        //console.log("Soucasny"+this.current+", last: "+this.lastSlide+", delka: "+this.elements.length );
        //console.log("Stav: "+this.rewrite);
        
        
        if (this.elements.length == 0){
            console.log("prazdny pole");
            this.printSlide(this.current);
            this.findSubelements();
        } else {       
            var cont = true;
            for (var i = 0; i < this.elements.length; i++){
                if (this.elements[i].className == "hide"){
                    this.rewrite = true;
                    addClass(this.elements[i], "display");
                    removeClass(this.elements[i], "hide");
                    this.elements[i].setAttribute("style","opacity: 1");
                    i += this.elements.length;
                    this.stuck = true;
                    cont = false;
                }
            }
            this.findSubelements();
            if (cont){
                this.rewrite = false;
            }
            //this.printSlide(this.current);
            if (this.rewrite){
                humla.controler.currentView.currentSlide = this.current;                    
                humla.slides[this.current].process();
                //console.log("Prepisuju: "+this.current);
                //humla.controler.currentView.activateCurrentSlide();             
                //this.rewrite = true;
                this.stuckSlide = this.current;
            }
        }
        
    },        
    findSubelements : function(){
        var allElements = document.getElementsByClassName("current");
        this.elements.length = 0;
        for (var i = 0; i < allElements.length; i++) {
            this.recursiveSearch(allElements[i]);   
        }
        var containsTabIndices = false;
        var tabindices = [];
        var withoutTabindices = [];
        var numberOfTI = 0;
        var maxTI = 0;
        for (var j = 0; j < this.elements.length; j++){
            //console.log(this.elements[j].tabIndex);
            if (this.elements[j].tabIndex && this.elements[j].tabIndex != -1){
                containsTabIndices = true;
                if (this.elements[j].tabIndex > maxTI) maxTI = this.elements[j].tabIndex;
                numberOfTI++ ;
            }
        }
        if (containsTabIndices){
            //console.log("Obsahuje indexy");
            for (var i = 0; i <= maxTI; i++){
                for (var j = 0; j < this.elements.length; j++){
                    if (this.elements[j].tabIndex && this.elements[j].tabIndex == i){
                        tabindices.push(this.elements[j]);
                    } else if (!this.elements[j].tabIndex || this.elements[j].tabIndex == -1){
                        withoutTabindices.push(this.elements[j]);
                    }
                }
            }
            this.elements.length = 0;
            for (var i = 0; i < tabindices.length; i++)
                this.elements.push(tabindices[i]);
            
            for (var i = 0; i < withoutTabindices.length; i++)
                this.elements.push(withoutTabindices[i]);
            //console.log("Delka dvou poli: "+tabindices.length+" a "+withoutTabindices.length);
        }
            
        
    },
    recursiveSearch : function(element){
        if (element.className == "hide"){
            this.elements.push(element);
        }
        for (var j = 0; j < element.childNodes.length; j++){            
            if (element.childNodes[j].childNodes.length > 0) this.recursiveSearch(element.childNodes[j]);
        }
        
    },
    printSlide : function(inx){
        //console.log("tisknu: "+inx);
        if (inx - 2 >= 0) humla.slides[inx - 2].addClass("far-previous");
        if (inx - 1 >= 0) humla.slides[inx - 1].addClass("previous");
        humla.slides[inx].addClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].addClass("next");
        if (inx + 2 < humla.slides.length) humla.slides[inx + 2].addClass("far-next");
        this.findSubelements();  
    },
    removeSlide : function (inx){
        
        if (inx - 2 >= 0) humla.slides[inx - 2].removeClass("far-previous");
        if (inx - 1 >= 0) humla.slides[inx - 1].removeClass("previous");
        humla.slides[inx].removeClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].removeClass("next");
        if (inx + 2 < humla.slides.length) humla.slides[inx + 2].removeClass("far-next");
    },
    leaveSlide : function(slide) {   
        console.log("Vystupuju: "+slide.number+" a mam: "+this.current+", minule: "+this.lastSlide);
        //if (slide.number <= this.current) {
        //    this.elements.length = 0;
        //}
        if (this.elements.length == 0){
            this.rewrite = false;
            //console.log("Opoustim slide: "+slide.number-1);
            this.removeSlide(slide.number-1);
            
        }
    }
    
};
function addClass(element, value) {
    if(!element.className) {
        element.className = value;
    } else {
        newClassName = element.className;
        newClassName+= " ";
        newClassName+= value;
        element.className = newClassName;
    }
}
function removeClass(element, classStr) {
    var cls;
    if(element.className) {        
        classStr = str2array(classStr);
        cls = " " + element.className + " ";
        for (var i = 0, len = classStr.length; i < len; ++i) {
            cls = cls.replace(" " + classStr[i] + " ", " ");
        }
        cls = humla.utils.trim(cls);
        element.className = cls;
    } else {
        element.className = " ";
    }
}
function str2array (s) {
    var spaces = /\s+/, a1 = [""];
    
    if (typeof s == "string" || s instanceof String) {
        if (s.indexOf(" ") < 0) {
            a1[0] = s;
            return a1;
        } else {
            return s.split(spaces);
        }
    }
    return s;
}