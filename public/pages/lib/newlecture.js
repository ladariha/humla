/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */




function submitNewLectureForm(){
    
    if(formIsValid()){
        var lecture = {};
        lecture.courseID = encodeURIComponent(document.getElementById('course').value);
        lecture.title = encodeURIComponent(document.getElementById('title').value); 
        lecture.author = encodeURIComponent(document.getElementById('author').value); 
        lecture.keywords  =encodeURIComponent(document.getElementById('keywords').value); 
        lecture.order  =encodeURIComponent(document.getElementById('order').value); 
        lecture.isActive = encodeURIComponent(document.getElementById('visible').value); 
        var url = '/api/'+lecture.courseID+"/lecture"+lecture.order+"/lecture";
        lecture.semester=encodeURIComponent(document.getElementById('semester').value);
        lecture.authorEmail=encodeURIComponent(document.getElementById('authorEmail').value);
        lecture.authorTwitter=encodeURIComponent(document.getElementById('authorTwitter').value);
        lecture.authorWeb=encodeURIComponent(document.getElementById('authorWeb').value);
        lecture.org=encodeURIComponent(document.getElementById('org').value);
        lecture.orgfac=encodeURIComponent(document.getElementById('orgfac').value);
        lecture.spec=encodeURIComponent(document.getElementById('spec').value);
        lecture.abs=encodeURIComponent(document.getElementById('abs').value);
        lecture.web=encodeURIComponent(document.getElementById('web').value);
        var request = new XMLHttpRequest();
        request.open("POST", url, true);
        request.setRequestHeader("Content-type", "application/json");
        request.onreadystatechange = function(){
            if (request.readyState==4) {
                if(request.status==200){
                    var object = eval('(' + request.responseText + ')');
                    document.getElementById('msg').innerHTML='Lecture '+object.title+' created';
                }else{
                    document.getElementById('msg').innerHTML=request.status+": "+request.statusText;    
                }
            }
        };
        request.send(JSON.stringify(lecture));
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