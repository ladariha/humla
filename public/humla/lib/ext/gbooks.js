var ex_gbooks = {
    
    processSlide : function(slide) {
        var ext = this;
        var processBooks = function(div, i) {
            slide.async_cntr[ext.config.id]++;
            //slide.element.innerHTML = slide.element.innerHTML+'Loading book...';
            div.innerHTML = 'Loading book...';
            var xhr = new XMLHttpRequest();
            xhr.open("GET",  "/api/gbooks/"+div.id+"/"+div.getAttribute("data-gbooks-mode"), true);
            xhr.onreadystatechange = generateOutput(xhr, i);
            xhr.send(null);  
            
            function generateOutput(xhr,i) { 
                // not pretty, but simple div.innerHTML doesn't work (what user sees remains untouched but source code is changed :/ )
                return function() {
                    if (xhr.readyState==4) {     
                        var divs = slide.element.getElementsByClassName('h-gbooks');
                        for (var j = 0; j < divs.length; j++){
                            if(i===j)
                                divs[j].innerHTML =  xhr.responseText;
                        }
                        slide.async_cntr[ext.config.id]--;  
                    }
                };
            }
        };
        
        slide.async_cntr[this.config.id] = 0;
        var divs = slide.element.getElementsByClassName('h-gbooks');
        for (var i = 0; i < divs.length; i++)
            processBooks(divs[i], i);    
    
    }
};

