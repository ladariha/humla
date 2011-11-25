/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var protect = "";
window.onload = function(){
    
    var request = new XMLHttpRequest();
    request.open("GET", "/api/"+getParameterByName('course')+"/"+getParameterByName('lecture')+"/lecture", true);
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                var object = eval('(' + request.responseText + ')');
                document.getElementById('course').value=object.courseID;
                document.getElementById('title').value=object.title;
                document.getElementById('author').value=object.author;
                document.getElementById('order').value=object.lectureID.replace(/\D/g,'');
                var k ='';
                object.keywords.forEach(function (e){
                    k+=e+', ';
                });
                document.getElementById('keywords').value=k;
                document.getElementById('_id').value=object._id;
                document.getElementById('visible').value=object.isActive;
                
            }else{
                document.getElementById('msg').innerHTML='Cannot load '+getParameterByName('course') + ' & '+getParameterByName('lecture');
            }  
        }
    }
    request.send(null);  
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


function submitEditLectureForm(){
    
    if(formIsValid()){
        var courseID = encodeURIComponent(document.getElementById('course').value);
        var title = encodeURIComponent(document.getElementById('title').value); 
        var author = encodeURIComponent(document.getElementById('author').value); 
        var keywords  =encodeURIComponent(document.getElementById('keywords').value); 
        var order  =encodeURIComponent(document.getElementById('order').value); 
        var id = encodeURIComponent(document.getElementById('_id').value);
        var isActive = encodeURIComponent(document.getElementById('visible').value); 
        var url = '/api/'+courseID+"/lecture"+order+"/lecture";
        var params = "id="+id+"&courseID="+courseID+'&title='+title+'&author='+author+'&isActive='+isActive+'&keywords='+keywords+'&order='+order;
    
        var request = new XMLHttpRequest();
        request.open("PUT", url, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.setRequestHeader("Content-length", params.length);
        request.setRequestHeader("Connection", "close");
        request.onreadystatechange = function(){
            if (request.readyState==4) {
                if(request.status==200){
                    var object = eval('(' + request.responseText + ')');
                    document.getElementById('msg').innerHTML='Lecture'+object.title+' updated';
                    document.getElementById('e_course').innerHTML='';
                    document.getElementById('e_title').innerHTML='';
                    document.getElementById('e_author').innerHTML='';
                    document.getElementById('e_order').innerHTML='';
                }else{
                    document.getElementById('msg').innerHTML=request.status+": "+request.statusText + ' - '+request.responseText;    
                }
            
            }
        };
        request.send(params);
    }
}

function formIsValid(){
    var courseID = document.getElementById('course').value;
    var title = document.getElementById('title').value;
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