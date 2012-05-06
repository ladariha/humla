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
            show_layer:true, // pro callback bez menu-layeru se dá false
            html:"<h1>Share on Social Networks</h1>"
        +'<div>Share this presentation:'
        +'<div id="fb-root"></div><script>(function(d, s, id) {var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id;  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";  fjs.parentNode.insertBefore(js, fjs);}(document, \'script\', \'facebook-jssdk\'));</script>'
        +"<div>Facebook:<script>function fbs_click() {u=location.href;t=document.title;window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(u)+'&t='+encodeURIComponent(t),'sharer','toolbar=0,status=0,width=626,height=436');return false;}</script><a href='http://www.facebook.com/share.php?u=<url>' onclick='return fbs_click()' target='_blank'><img src='ADD_IMAGE_URL_HERE' alt='Share on Facebook' /></a></div>"
    
        +'<div>Facebook: <a name="fb_share" type="button_count" href="http://www.facebook.com/sharer.php"><img src="http://www.siamcomm.com/wp-content/uploads/2011/05/facebook.png"  /></a><script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script></div>'
        +"<div>Google+</div>"
        +"<div>Twitter: <a href='http://twitter.com/home?status=Check this slides: ' title='Click to share this post on Twitter'><img src='ADD_IMAGE_URL_HERE” alt=”Share on Twitter'></a></div>"
        +'<div>Twitter: <a href="http://twitter.com/share" class="twitter-share-button" data-count="horizontal" data-via="humla">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>'
        +"</div>"        
        });        
    
    }
}