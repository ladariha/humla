
var ga = document.createElement('script');
ga.type = 'text/javascript';
ga.async = true;
ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
var s = document.getElementsByTagName('script')[0];
s.parentNode.insertBefore(ga, s);
var ex_ga = {
    script : false,
    firstSlide : true,
    previousSlide : -1,
    actualMode : "",    
    enterSlide : function(slide) {
        // GA code here
        //slide.error="enter ";  
        //console.log("Enter slide");
        var mode = humla.controler.currentView.config.object+"";
        if(mode==="view_slideshow" || mode==="view_browser"){
            var presentationUrl = window.location.href;
            var fields = presentationUrl.split("/");
            var firstIndex = presentationUrl.indexOf("slides", 0)+7;
            presentationUrl = presentationUrl.substr(firstIndex, presentationUrl.length);
            var course = fields[5];//presentationUrl.substr(0, presentationUrl.indexOf("/"));
            var lecture= fields[6].substr(0, fields[6].indexOf("."));
            lecture = lecture.replace(/[A-Za-z$-]/g, "");
            this.callGA(course, lecture, slide.number, humla.controler.currentView.config.object);
        }
    },
    processSlide : function(slide){
        if (false){
            (function() {
                //console.log("Pridavam skript");

                this.script = true;
                var ga = document.createElement('script');
                ga.type = 'text/javascript';
                ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(ga, s);

            })();
        }
    },
    callGA: function(course, lecture, slide, viewMode){
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', this.config.params['account']]);
        _gaq.push(['_setLocalGifPath',this.config.params['gifPath']]);
        //_gaq.push(['_setLocalRemoteServerMode']);
        _gaq.push(['_setLocalServerMode']);
        if (this.firstSlide){
            this.actualMode = viewMode;
            this.previousSlide = slide;
            _gaq.push(['_trackEvent', course+' - lecture '+lecture, viewMode, slide]);
            //console.log("Posilam: "+course+' - lecture '+lecture+" - "+ viewMode+" - "+slide);
            _gaq.push(['_trackEvent', course+' - lecture '+lecture, 'presentation start', slide]);
            //console.log("Posilam: "+course+' - lecture '+lecture+" - presentation start - "+slide);
            //_gaq.push(['_trackEvent', 'MI-MDW ', 'lecture 1', 'slide left', 2]);
            //_gaq.push(['_trackEvent', 'MI-MDW ', 'lecture 1', 'mode change', 1]);
            this.firstSlide = false;
        } else {
            if (viewMode != this.actualMode) {
                _gaq.push(['_trackEvent', course+' - lecture '+lecture, viewMode, slide]);
                //console.log("Posilam: "+course+' - lecture '+lecture+" - "+ viewMode+" - "+slide);
                this.actualMode = viewMode;
            }
            if (slide > this.previousSlide){
                _gaq.push(['_trackEvent', course+' - lecture '+lecture, "slide right", slide]);
                //console.log("Posilam: "+course+' - lecture '+lecture+" - slide right - "+slide);
                this.previousSlide = slide;
            } else if (slide < this.previousSlide){
                _gaq.push(['_trackEvent', course+' - lecture '+lecture, "slide left", slide]);
                //console.log("Posilam: "+course+' - lecture '+lecture+" - slide left - "+slide);
                this.previousSlide = slide;
            } 
        }
        //_gaq.push(['_trackEvent', course+' - lecture '+lecture, viewMode, slide]);
        _gaq.push(['_trackPageview']);
    //console.log("Odesilam: "+course+' - lecture '+lecture+'. ViewMode: '+viewMode+' a slide: '+slide);
    }
}



