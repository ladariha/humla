window.onload = loadPresentation();


function loadPresentation(){
    var course = getParameterByName('course');
    var lecture = getParameterByName('lecture');
    try{
    localStorage.removeItem("editor-original-content-present");    
    }catch(e){
        
    }
    
    if(course.length > 0 && lecture.length>0){
      
      
        var url = "/api/"+course+"/"+lecture+"/editor"; 
            
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onreadystatechange = function(){
            if (request.readyState==4) {
                if(request.status==200){
                        
                    var finalString = request.responseText;
                    finalString = finalString.replace(/\&amp;/g,'&');
                    editor.setValue(finalString);
                    localStorage.setItem("editor-original-content", finalString);
                    document.getElementById("lecture").innerHTML = lecture;
                    document.getElementById("course").innerHTML = course;
                   
                }else{
                    document.getElementById("msg").innerHTML=request.status+": "+request.statusText+" - "+request.responseText;    
                }  
            }
        };
        request.send(null);  
    }
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

function restoreContent(){
    editor.setValue(localStorage.getItem("editor-original-content"));
}

function loadLayout(version){

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
            }else{
                document.getElementById("msg").innerHTML=request.status+": "+request.statusText+" - "+request.responseText;    
            }  
        }
    };
    request.send(null);  
}


function sendData(){

    var url = "/api/"+document.getElementById("course").innerHTML+"/"+document.getElementById("lecture").innerHTML+"/raw/editor";
    var c = {
        content:editor.getValue()
    }
    try{
        localStorage.setItem("editor-original-content-present",editor.getValue());
    }catch(e){
        
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
                loadPresentation();
            }else{
                document.getElementById("msg").innerHTML=request.responseText;    
                  try{
                    // try to restore previous content
                  editor.setValue(localStorage.getItem("editor-original-content-present"));
                }catch(e){
                    
                }
            }
            
        }
    };
    request.send(JSON.stringify(c));

}