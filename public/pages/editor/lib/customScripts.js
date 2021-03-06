
function sendData(){
    var url = "/api/"+document.getElementById("course").innerHTML+"/"+document.getElementById("lecture").innerHTML+"/slide"+document.getElementById("slide").innerHTML+"/editor";
    var append = getParameterByName('append');
    var params={
        slide: editor.getValue()
    };
    
       try{
        localStorage.setItem("editor-original-content-present",editor.getValue());
    }catch(e){
        
    }
    
    if(append.length > 0 && append==="true"){   
        params.append="true";
    }else{
        params.append="false";
    }
    var request = new XMLHttpRequest();
    request.open("PUT", url, true);
    request.setRequestHeader("Content-type", "application/json");
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                var object = eval('(' + request.responseText + ')');
                document.getElementById("msg").innerHTML=object.html;
                localStorage.removeItem("editor-original-content-present");
                 loadSlide();
            }else{
                document.getElementById("msg").innerHTML=request.responseText;
                 try{
                    // try to restore previous content
                  editor.setValue(localStorage.getItem("editor-original-content-present"));
                }catch(e){
                    
                }    
            }
           
        }else{
            editor.setValue(request.responseText);
        }
        
    };
    request.send(JSON.stringify(params));

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
        try{
    localStorage.removeItem("editor-original-content-present");    
    }catch(e){
        
    }
    // http://127.0.0.1:1338/pages/editor/?course=mdw&lecture=lecture1&slide=2
    var course = getParameterByName('course');
    var lecture = getParameterByName('lecture');
    var slide = getParameterByName('slide');
    var append = getParameterByName('append');
    if(course.length > 0 && lecture.length>0 && slide.length>0){
        if(append.length > 0){
            
            var url = "/api/template/0/editor"; 
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.onreadystatechange = function(){
                if (request.readyState==4) {
                    if(request.status==200){
                        
                        var object = eval('(' + request.responseText + ')');
                            
                        var textarray = object.html.split("\n");
                        var finalString = '';
                        for(var k in textarray){
                            if(textarray[k].length>0){
                                finalString = finalString+"\n"+textarray[k].replace(/^\s\s{6}/, ' ') ;
                            }
                        }
                        finalString = finalString.replace(/\&amp;/g,'&');
                        editor.setValue(finalString);
                        localStorage.setItem("editor-original-content", finalString);
                        document.getElementById("append").innerHTML = "Append after";
                        document.getElementById("slide").innerHTML = slide;
                        document.getElementById("lecture").innerHTML = lecture;
                        document.getElementById("course").innerHTML = course;
                        var v = getParameterByName('v');
                        if(v.length>0){
                            document.getElementById("cancelLink").href="http://"+object.url+"/"+v;    
                        }else{
                            document.getElementById("cancelLink").href="http://"+object.url+"/v1";    
                        }
                    }else{
                        document.getElementById("msg").innerHTML=request.status+": "+request.statusText;    
                    }  
                }
            };
            request.send(null);  
            
            
        }else{
            
            var url = "/api/"+course+"/"+lecture+"/"+"slide"+slide+"/editor"; 
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.onreadystatechange = function(){
                if (request.readyState==4) {
                    if(request.status==200){
                        var object = eval('(' + request.responseText + ')');
                            
                        var textarray = object.html.split("\n");
                        var finalString = '';
                        for(var k in textarray){
                            if(textarray[k].length>0){
                                finalString = finalString+"\n"+textarray[k].replace(/^\s\s{6}/, ' ') ;
                            }
                        }
                        finalString = finalString.replace(/\&amp;/g,'&');
                        localStorage.setItem("editor-original-content", finalString);
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
                    }else{
                        document.getElementById("msg").innerHTML=request.status+": "+request.statusText;    
                    }
                 
                }else{
                    editor.setValue(request.responseText);
                }
            };
            request.send(null);     
            
        }
     
    }
}


function restoreContent(){
    editor.setValue(localStorage.getItem("editor-original-content"));
}

function loadLayout(version){
    
    var course = getParameterByName('course');
    var lecture = getParameterByName('lecture');
    var slide = getParameterByName('slide');
    var url = "/api/template/"+version+"/editor";
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                        
                var object = eval('(' + request.responseText + ')');
                            
                var textarray = object.html.split("\n");
                var finalString = '';
                for(var k in textarray){
                    if(textarray[k].length>0){
                        finalString = finalString+"\n"+textarray[k].replace(/^\s\s{6}/, ' ') ;
                    }
                }
                finalString = finalString.replace(/\&amp;/g,'&');
                editor.replaceRange(finalString,editor.getCursor());
                document.getElementById("append").innerHTML = "Append after";
                document.getElementById("slide").innerHTML = slide;
                document.getElementById("lecture").innerHTML = lecture;
                document.getElementById("course").innerHTML = course;
                var v = getParameterByName('v');
                if(v.length>0){
                    document.getElementById("cancelLink").href="http://"+object.url+"/"+v;    
                }else{
                    document.getElementById("cancelLink").href="http://"+object.url+"/v1";    
                }
            }else{
                document.getElementById("msg").innerHTML=request.status+": "+request.statusText;    
            }  
        }
    };
    request.send(null);  
}