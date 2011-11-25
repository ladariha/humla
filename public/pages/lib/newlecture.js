/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */




function submitNewLectureForm(){
    
    if(formIsValid()){
        var courseID = encodeURIComponent(document.getElementById('course').value);
        var title = encodeURIComponent(document.getElementById('title').value); 
        var author = encodeURIComponent(document.getElementById('author').value); 
        var keywords  =encodeURIComponent(document.getElementById('keywords').value); 
        var order  =encodeURIComponent(document.getElementById('order').value); 
        var isActive = encodeURIComponent(document.getElementById('visible').value); 
        var url = '/api/'+courseID+"/lecture"+order+"/lecture";
        var params = "courseID="+courseID+'&title='+title+'&author='+author+'&isActive='+isActive+'&keywords='+keywords+'&order='+order;
    
        var request = new XMLHttpRequest();
        request.open("POST", url, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.setRequestHeader("Content-length", params.length);
        request.setRequestHeader("Connection", "close");
        request.onreadystatechange = function(){
            if (request.readyState==4) {
                if(request.status==200){
                    var object = eval('(' + request.responseText + ')');
                    document.getElementById('msg').innerHTML='Lecture '+object.title+' created';
                    document.getElementById('e_course').innerHTML='';
                    document.getElementById('e_title').innerHTML='';
                    document.getElementById('e_author').innerHTML='';
                    document.getElementById('e_order').innerHTML='';
                }else{
                    document.getElementById('msg').innerHTML=request.status+": "+request.statusText;    
                }
            
            }
        };
        request.send(params);
    }
}

function formIsValid(){
    var courseID = document.getElementById('course').value;
    var title = document.getElementById('title').value;
    console.log(courseID);
    var author = document.getElementById('author').value; 
    var order = document.getElementById('order').value;
    var err = 0;
  
    if(courseID.length<1){
        err++;
        document.getElementById('e_course').innerHTML='Specify course ID';
    }
    if(title.length<1){
        err++;
        document.getElementById('e_title').innerHTML='Specify title';
    }
    if(author.length<1){
        err++;
        document.getElementById('e_author').innerHTML='Specify author';
    }
    if(order.length<1){
        err++;
        document.getElementById('e_order').innerHTML='Specify order';
    }
    
    if(err>0)
        return false;
    return true;
}


window.onload = function(){
    document.getElementById('course').value = getParameterByName('course');

};


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