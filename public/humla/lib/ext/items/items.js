/**
 * Extension to load elements on page
 * @author Vojtech Smrcek
 */

var items = {    
    //Current slide number
    current    : -1,
    //Last processed slide
    lastSlide : -1,
    //Elements to be loaded on the current slide
    elements   : [],
    /**
     * Function called on processing a slide, changes all elements with to-build class and their children to hide class
     * @param slide
     */
    processSlide : function(slide){ 
        var allElements = document.getElementsByClassName("to-build");
        for (var i = 0; i < allElements.length; i++) {
            for (var j = 0; j < allElements[i].childNodes.length; j++){
                addClass(allElements[i].childNodes[j], "hide");
            }    
            removeClass(allElements[i], "to-build");
        }      
    },
    /**
     * On entering slide find all hidden subelements and shows the first one
     * @param slide
     */
    enterSlide : function(slide){
        if (humla.controler.toBuild == true){
            this.findSubelements();
            this.lastSlide = this.current;
            this.current = slide.number;
            if (this.elements.length > 0 && this.lastSlide == this.current){
                var remove = -1;
                for (var i = 0; i < this.elements.length; i++){
                    if (this.elements[i].className == "hide"){
                        addClass(this.elements[i], "display");
                        removeClass(this.elements[i], "hide");
                        this.elements[i].setAttribute("style","opacity: 1");
                        remove = i;
                        i += this.elements.length;
                        cont = false;
                    }
                }
                this.findSubelements();
            }
        }
    },
    /**
     * On leaving slide decides whether we should continue to next slide or load next element
     * @return flag true if continue
     */
    leaveSlide : function(slide){
        if (humla.controler.toBuild == true){
            if (this.elements.length > 0) {
                return false
            }
            else return true;
        }
    },       
    /**
     * Finds all subelements of a current slide and puts them into elements array
     */
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
            if (this.elements[j].tabIndex && this.elements[j].tabIndex != -1){
                containsTabIndices = true;
                if (this.elements[j].tabIndex > maxTI) maxTI = this.elements[j].tabIndex;
                numberOfTI++ ;
            }
        }
        if (containsTabIndices){
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
        }
            
    },
    /**
     * Recursively searches document for elements with hide class and stores them in an array
     */
    recursiveSearch : function(element){
        if (element.className == "hide"){
            this.elements.push(element);
        }
        for (var j = 0; j < element.childNodes.length; j++){            
            if (element.childNodes[j].childNodes.length > 0) this.recursiveSearch(element.childNodes[j]);
        }
        
    }
    
};
/**
 * Adds a class to an element
 * @param element
 * @param class
 */
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
/**
 * Removes a class from an element
 * @param element
 * @param classStr
 */
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
/**
 * Splits a string into an array
 * @param s string
 * @return s array
 */
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
humla.controler.toBuild = true;

