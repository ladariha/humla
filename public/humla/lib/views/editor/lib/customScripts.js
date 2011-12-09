function loadLayout(version){

    var url = "/api/template/"+version+"/editor";
    console.log(url);
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
                codemirror_editor.replaceRange(finalString,codemirror_editor.getCursor());
            }else{
                alert(request.status+": "+request.statusText);    
            }  
        }
    };
    request.send(null);  
}
         