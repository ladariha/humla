/**
 * Social Extension
 * ~~~~~~~~~~~~~~~
 * Ability to share slides on facebook
 *
 */


var ex_social = {    
    
    processMenu: function(menu) {                
        
        menu.addTab("social",{
            name:"Share on Facebook",
            cb: function() {
               var presentationUrl = window.location.origin + window.location.pathname + window.location.hash;                
               //var presentationUrl = window.location.href;                
               //https://www.facebook.com/sharer.php?u=<url to share>&t=<title of content>
               var link ="http://www.facebook.com/sharer.php?";
               link += "u="+encodeURIComponent(presentationUrl);
               link += "&t=Lecture";
               //link += "&p[summary]=YOUR_SUMMARY";               
               //link += "&p[images][0]=YOUR_IMAGE_TO_SHARE_OBJECT";
               humla.utils.window.location.href = link;
            }, 
            show_layer:false // pro callback bez menu-layeru se dá false
            
        });  
    }
    
}