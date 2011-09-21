/**
* Comments Extension
* ~~~~~~~~~~~~~~~~~~
* add comments to each slide
*
*/
var ex_menu = {

    // TODO: TODO! Now it's only placeholder from rssfeed

    // event handler for slideprocess event
    processSlide : function(slide) {
        
        
        //display menu bar
        


        var data = JSON.parse(this.responseText);
        var s = "";
        for (var i = 0; data.value.items && i < data.value.items.length; i++) {
            s += "<li class=\"extref\"><a target=\"humla_reference\" class=\"ext-link\" href=\"" + data.value.items[i].link + 
                "\">" + data.value.items[i].title + "</a>";
        }
        this._ul.innerHTML = s;
    
        
    }
    
};
