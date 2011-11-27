var ex_ga = {
    enterSlide : function(slide) {
        // GA code here
        var mode = humla.controler.currentView.config.object+"";
        if(mode==="view_slideshow" || mode==="view_browser"){
            var presentationUrl = window.location.href;
            var fields = presentationUrl.split("/");
            var firstIndex = presentationUrl.indexOf("slides", 0)+7;
            presentationUrl = presentationUrl.substr(firstIndex, presentationUrl.length);
            var course = fields[5];//presentationUrl.substr(0, presentationUrl.indexOf("/"));
            var lecture= fields[6].substr(0, fields[6].indexOf("."));
            lecture = lecture.replace(/[A-Za-z$-]/g, "");
            console.log("lecture "+lecture);
            var slideNumber = slide.number;
            this.callGA(course, lecture, slide.number, humla.controler.currentView.config.object);
        }
    },
    
    callGA: function(course, lecture, slide, viewMode){
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', this.config.params['account']]);
    _gaq.push(['_setLocalGifPath',this.config.params['gifPath']]);
    //_gaq.push(['_setLocalRemoteServerMode']);
    _gaq.push(['_setLocalServerMode']);
    _gaq.push(['_trackEvent', course+' - lecture '+lecture, viewMode, slide]);
    _gaq.push(['_trackPageview']);

    (function() {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
    })();
}

}


