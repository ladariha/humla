/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var alreadyCheckedCourses = {};
var protect = "";
window.onload = function(){
    
    var course = getParameterByName('course');
    protect = course;
    
    var request = new XMLHttpRequest();
    request.open("GET", "/api/"+course+"/course", true);
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                var object = eval('(' + request.responseText + ')');
                document.getElementById('course').value=object.courseID;
                document.getElementById('fullName').value=object.longName;
                document.getElementById('owner').value=object.owner;
                document.getElementById('_id').value=object._id;
                document.getElementById('visible').value=object.isActive;
            }else{
                document.getElementById('msg').innerHTML='Cannot load '+course;
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


function checkCourseExist(element, id){
    
    var tmp =element.value;
    if(tmp!== protect){
        if(alreadyCheckedCourses[tmp]===1){
            document.getElementById(id).setAttribute('style', 'background:#fb9898;');
            document.getElementById('exist').textContent='This course already exists';
        }else if(alreadyCheckedCourses[tmp]===0){
            document.getElementById(id).removeAttribute('style');
            document.getElementById('exist').textContent='';
        }else{
            var request = new XMLHttpRequest();
            
            request.open("GET", "/api/"+tmp+"/course", true);
            request.onreadystatechange = function(){
                if (request.readyState==4) {
                    if(request.status==200){
                        // exist
                        alreadyCheckedCourses[tmp]=1;
                        document.getElementById(id).setAttribute('style', 'background:#fb9898;');
                        document.getElementById('exist').textContent='This course already exists';
                    }else if(request.status==404){
                        alreadyCheckedCourses[tmp]=0;
                        document.getElementById(id).removeAttribute('style');
                        document.getElementById('exist').textContent='';
                    }  
                }
            }
            request.send(null); 
        }
    }
}


function submitEditCourseForm(){
    
    if(formIsValid()){
        var courseID = encodeURIComponent(document.getElementById('course').value);
        var course={
            courseID: courseID,
            longName: encodeURIComponent(document.getElementById('fullName').value),
            owner: encodeURIComponent(document.getElementById('owner').value),
            isActive: encodeURIComponent(document.getElementById('visible').value),
            id: encodeURIComponent(document.getElementById('_id').value)
        };
        
        var url = '/api/'+courseID+'/course';
    
        var request = new XMLHttpRequest();
        request.open("PUT", url, true);
        request.setRequestHeader("Content-type", "application/json");
        request.onreadystatechange = function(){
            if (request.readyState==4) {
                if(request.status==200){
                    var object = eval('(' + request.responseText + ')');
                    document.getElementById('msg').innerHTML='Course '+object.longName+' updated';
                    document.getElementById('exist').innerHTML='';
                    document.getElementById('e_fullName').innerHTML='';
                    document.getElementById('e_owner').innerHTML='';
                    alreadyCheckedCourses = {};
                }else{
                    document.getElementById('msg').innerHTML=request.status+": "+request.statusText;    
                }
            }
        };
        request.send(JSON.stringify(course));
    }
}

function formIsValid(){
    var courseID = document.getElementById('course').value;
    var fullName = document.getElementById('fullName').value; 
    var owner = document.getElementById('owner').value;
    var err = 0;
    if(alreadyCheckedCourses[courseID]===1){
        err++;
    }
    if(courseID.length<1){
        err++;
        document.getElementById('exist').innerHTML='Specify course ID';
    }
    if(fullName.length<1){
        err++;
        document.getElementById('e_fullName').innerHTML='Specify full name';
    }
    if(owner.length<1){
        err++;
        document.getElementById('e_owner').innerHTML='Specify owner';
    }
    
    if(err>0)
        return false;
    return true;
}