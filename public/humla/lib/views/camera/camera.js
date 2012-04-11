


var view_camera = {
    enterView : function() {
        //    <video autoplay controls></video>

        var video = document.createElement("video");
        video.setAttribute("autoplay");
        video.setAttribute("controls");
        var child = document.body.childNodes[0];
        document.body.insertBefore(video, child);
        
        window.URL = window.URL || window.webkitURL;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

        var video = document.querySelector('video');
        var localMediaStream;

        if (navigator.getUserMedia) {
            var successCallback = function(stream) {
                localMediaStream = stream;
                localMediaStream.onended = function(e) {
                //stopButton.disabled = true;
                //startButton.disabled = false;
                };
                console.log(localMediaStream, localMediaStream.tracks);
                //startButton.disabled = true;
                video.src = window.URL.createObjectURL(localMediaStream);
                video.onerror = function(e) {
                    localMediaStream.stop();
                };
            };
            var errorCallback = function(e) {
                console.log(e);
            };
            navigator.getUserMedia('video,audio', successCallback, errorCallback);
        //navigator.webkitGetUserMedia({audio: false, video: true}, successCallback, errorCallback);
        }
        
        
    },            
    enterSlide : function(slide) {
        
        var inx = slide.number - 1;
        
        humla.slides[inx].addClass("current");
        this.zoom = slide.element.style.zoom;
        var resizeVideo = function(){
            console.log("resize");
            var widthZoom = this.window.innerWidth / (2*SLIDE_WIDTH);
            var heightZoom = this.window.innerHeight / SLIDE_HEIGHT;
            var video = document.querySelector('video');
            
            var zoom = 1;
            if (widthZoom > heightZoom) {
                zoom = heightZoom;
                var leftOffset = (this.window.innerWidth - 2*(SLIDE_WIDTH)*zoom)/(2*zoom);
                
            video.setAttribute('style', "zoom: "+zoom+"; left: "+leftOffset);
            }
            else {
                zoom = widthZoom;
            video.setAttribute('style', "zoom: "+zoom);
            }
            slide.element.setAttribute('style', "zoom: "+zoom);
        }
        resizeVideo();
        
    },        
    resizeVideo : function(event){
        console.log("resize");
        var widthZoom = this.window.innerWidth / (2*SLIDE_WIDTH);
        var heightZoom = this.window.innerHeight / SLIDE_HEIGHT;
        var video = document.querySelector('video');
            
        var zoom = 1;
        if (widthZoom > heightZoom) zoom = heightZoom;
        else zoom = widthZoom;
        video.setAttribute('style', "zoom: "+zoom);
        slide.element.setAttribute('style', "zoom: "+zoom);
    },
    leaveSlide : function(slide) {
        //window.onresize = "";
        var inx = slide.number - 1;
        
        humla.slides[inx].removeClass("current");
    }          
};