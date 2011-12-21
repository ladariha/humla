var ex_gbooks = {
    
    enterSlide : function(slide) {

        var processBooks = function(div) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET",  "/api/gbooks/"+div.id, true);
            xhr.onreadystatechange = function(){
                if (xhr.readyState==4) {
                    if(xhr.status==200){
                        var object = eval('(' + xhr.responseText + ')');
                        console.log(object);
                    }else{
                        console.log(xhr.statusText);
                    }  
                }
            }
            xhr.send(null);  
            
        };

        slide.async_cntr[this.config.id] = 0;
        divs = slide.element.getElementsByClassName('h-gbooks');
        console.log("velikost "+divs.length);
        for (var i = 0; i < divs.length; i++)
            processBooks(divs[i]);    
    
    }
};

