var ex_items = {    
    processSlide : function(slide){    
        
        var allElements = document.getElementsByClassName("to-build");
        //var foo = document.getElementsByClassName('foo'); 
        for (var i = 0; i < allElements.length; i++) {
            for (var j = 0; j < allElements[i].childNodes.length; j++){
                addClass(allElements[i].childNodes[j], "hide");
            }    
            addClass(allElements[i], "built");
            removeClass(allElements[i], "to-build");
        }
        
        //console.log("hiduju");
        
        
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


