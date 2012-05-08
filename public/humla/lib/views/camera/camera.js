/**
 * An experimental view that show a camera stream and slides next to each other.  
 * @author Vojtech Smrcek
 */
var view_camera = {
    /**
     * A function that creates the video element on entering the view. 
     * It sets its basic attributes and inserts it in the body.
     * It uses the function getUserMedia which is supported only by Chromium browser and latest Opera 12
     */
    enterView : function() {
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
                    console.log("The video stream has ended");
                };
                console.log(localMediaStream, localMediaStream.tracks);
                video.src = window.URL.createObjectURL(localMediaStream);
                video.onerror = function(e) {
                    localMediaStream.stop();
                };
            };
            var errorCallback = function(e) {
                console.log(e);
            };
            navigator.getUserMedia('video,audio', successCallback, errorCallback);
        }
        
        
    },            
    /**
     * Function that resizes slides and video stream to match the browsers width while preserving their width/height ratio (4:3)
     * This function uses the CSS3 zoom to resize elements.
     * @param slide to be resized
     */
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
    /**
     * Function that is triggered on windows resize, resizes slides and video
     * @param event
     */    
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
    /**
     * Function that removes style from the current slide.
     * @param slide leaved
     */
    leaveSlide : function(slide) {
        //window.onresize = "";
        var inx = slide.number - 1;
        
        humla.slides[inx].removeClass("current");
    }          
};