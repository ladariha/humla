var items = {    
    current    : -1,
    lastSlide : -1,
    elements   : [],
    stuck  : false,
    rewrite : false,
    stuckSlide : -1,
    processSlide : function(slide){ 
        var allElements = document.getElementsByClassName("to-build");
        for (var i = 0; i < allElements.length; i++) {
            for (var j = 0; j < allElements[i].childNodes.length; j++){
                addClass(allElements[i].childNodes[j], "hide");
            }    
            removeClass(allElements[i], "to-build");
        }      
    },
    enterSlide : function(slide){
        if (humla.controler.toBuild == true){
            this.findSubelements();
            this.lastSlide = this.current;
            this.current = slide.number;
            console.log("Porovnavam: "+this.lastSlide+" s "+this.current);
            if (this.elements.length > 0 && this.lastSlide == this.current){
                var remove = -1;
                for (var i = 0; i < this.elements.length; i++){
                    if (this.elements[i].className == "hide"){
                        addClass(this.elements[i], "display");
                        removeClass(this.elements[i], "hide");
                        this.elements[i].setAttribute("style","opacity: 1");
                        remove = i;
                        i += this.elements.length;
                        this.stuck = true;
                        cont = false;
                    }
                }
                this.findSubelements();
            }
        }
    },
    leaveSlide : function(slide){
        
        if (humla.controler.toBuild == true){
            if (this.elements.length > 0) {
                //console.log("Nepokracuju");
                return false
            }
            else return true;
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
};


