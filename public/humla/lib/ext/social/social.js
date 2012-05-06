/**
 * Social Extension
 * ~~~~~~~~~~~~~~~
 * Ability to share slides on facebook
 *
 */


var ex_social = {    
    
    processMenu: function(menu) {                
        
        var link = location.href.split("#")[0] || "";
        
        menu.addTab("social",{
            name:"Share on Facebook",
            show_layer:true, // pro callback bez menu-layeru se dá false
            html:"<h1>Share on Social Networks</h1>"
            +'<div>Share this presentation on:'        
            //+'<div id="fb-root"></div><script>(function(d, s, id) {var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id;  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";  fjs.parentNode.insertBefore(js, fjs);}(document, \'script\', \'facebook-jssdk\'));</script>'
            //+"<div>Facebook:<script>function fbs_click() {u=location.href;t=document.title;window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(u)+'&t='+encodeURIComponent(t),'sharer','toolbar=0,status=0,width=626,height=436');return false;}</script><a href='http://www.facebook.com/share.php?u=<url>' onclick='return fbs_click()' target='_blank'><img src='ADD_IMAGE_URL_HERE' alt='Share on Facebook' /></a></div>"
    
            +"<div><a href='http://www.facebook.com/share.php?u="+link+"' title='Click to share this post on Facebook' onclick='return ex_social.facebookClick()' target='_blank'><div class='icon' id='facebook'></div></a></div>"
            +"<div><a href='https://plusone.google.com/_/+1/confirm?hl=en&url="+link+"' title='Click to share this presentation on Google+' onclick='return ex_social.googleClick()' target='_blank'><div class='icon' id='google'></div></a></div>"
            +"<div><a href='http://twitter.com/home?status=Check this slides: "+link+"' onclick='return ex_social.twitterClick()' target='_blank' title='Click to share this post on Twitter'><div class='icon' id='twitter'></div></a></div>"
    
            //+'<script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script></div>'
            //+'<div>Twitter: <a href="http://twitter.com/share" class="twitter-share-button" data-count="horizontal" data-via="humla">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></div>'
            //+'<div>Twitter: <a href="https://twitter.com/share" class="twitter-share-button" data-via="bubersson" data-size="large">Tweet</a></div>'
            //+'<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script></div>'
            +""        
            +"</div>"        
        });       
    },
    facebookClick: function(){            
        //u=location.href;
        var u=location.href.split("#")[0] || "";    
        //h= location.href.split("#")[1] || ""; //ff fix
        var t=document.title;
        window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(u)+'&t='+encodeURIComponent(t),'sharer','toolbar=0,status=0,width=626,height=436');
        return false;
    },
    googleClick: function(){            
        var u=location.href.split("#")[0] || "";    
        var t=document.title;
        window.open('https://plusone.google.com/_/+1/confirm?hl=en&url='+u+'','gplusshare','toolbar=0,status=0,width=420,height=280');
        return false;
    },
    twitterClick: function() {
        var u=location.href.split("#")[0] || "";    
        var t=document.title;
        window.open('http://twitter.com/home?status=Check this slides: '+u+'','sharer','toolbar=0,status=0,width=420,height=280');
        return false;
        
    }
}