/**
 * Tools Script
 * ~~~~~~~
 * Switching tabs
 */



// INIT: After loading document
$(document).ready(function() {
    
    $("#menu>div").on("click",function(e){        
        $(this).toggleClass("active",true).siblings().removeClass("active");
        $("#page-"+this.id).toggle(true).siblings().toggle(false);
    });
    
    
});
    
