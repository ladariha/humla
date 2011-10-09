
function sendData(){

    var data = editor.getValue();
    var url = "/api/"+document.getElementById("course").innerHTML+"/"+document.getElementById("lecture").innerHTML+"/slide"+document.getElementById("slide").innerHTML+"/editor";
    var params = "slide="+data;
    var request = new XMLHttpRequest;
    request.open("PUT", url, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.setRequestHeader("Content-length", params.length*2);
    request.setRequestHeader("Connection", "close");
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            
            document.getElementById("msg").innerHTML=request.responseText;
            loadSlide();
            
        }else{
            
    }
        
    };
    request.send(params);

}
            
function getParameterByName(name){
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}
            
window.onload = loadSlide();
    
    
function loadSlide(){ 
    // http://127.0.0.1:1338/pages/editor/?course=mdw&lecture=lecture1&slide=2
    var course = getParameterByName('course');
    var lecture = getParameterByName('lecture');
    var slide = getParameterByName('slide');
    if(course.length > 0 && lecture.length>0 && slide.length>0){
        var url = "/api/"+course+"/"+lecture+"/"+"slide"+slide+"/editor"; 
        var request = new XMLHttpRequest;
        request.open("GET", url, true);
        request.onreadystatechange = function(){
            if (request.readyState==4) {
                var object = eval('(' + request.responseText + ')');
                            
                var textarray = object.html.split("\n");
                var finalString = '';
                for(var k in textarray){
                    finalString = finalString+"\n"+textarray[k].replace(/^\s\s{6}/, ' ') ;
                }
                finalString = finalString.replace(/\&amp;/g,'&');
                editor.setValue(finalString);
                document.getElementById("slide").innerHTML = slide;
                document.getElementById("lecture").innerHTML = lecture;
                document.getElementById("course").innerHTML = course;
                var v = getParameterByName('v');
                if(v.length>0){
                    document.getElementById("cancelLink").href="http://"+object.url+"/"+v;    
                }else{
                    document.getElementById("cancelLink").href="http://"+object.url+"/v1";    
                }
            }
        };
        request.send(null);
    }
}