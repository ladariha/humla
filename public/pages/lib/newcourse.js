/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var alreadyCheckedCourses = {};

function checkCourseExist(element, id){
    
    var tmp =element.value;
    //    handle["/"] = requestHandlers.start;
    if(alreadyCheckedCourses[tmp]===1){
        document.getElementById(id).setAttribute('style', 'background:#fb9898;');
        document.getElementById('exist').textContent='This course already exists';
    }else if(alreadyCheckedCourses[tmp]===0){
        document.getElementById(id).removeAttribute('style');
        document.getElementById('exist').textContent='';
    }else{
        var request = new XMLHttpRequest();
        console.log(tmp);
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


function submitNewCourseForm(){
    
    if(formIsValid()){
        var courseID = encodeURIComponent(document.getElementById('course').value);
        var fullName = encodeURIComponent(document.getElementById('fullName').value); 
        var owner = encodeURIComponent(document.getElementById('owner').value); 
        var isActive = encodeURIComponent(document.getElementById('visible').value); 
        var url = '/api/'+courseID+'/course';
        var params = "courseID="+courseID+'&longName='+fullName+'&owner='+owner+'&isActive='+isActive;
    
        var request = new XMLHttpRequest();
        request.open("POST", url, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        //request.setRequestHeader("Content-length", params.length);
        //request.setRequestHeader("Connection", "close");
        request.onreadystatechange = function(){
            if (request.readyState==4) {
                if(request.status==200){
                    var object = eval('(' + request.responseText + ')');
                    document.getElementById('msg').innerHTML='Course'+object.longName+' created';
                    console.log('Course'+object.longName+' created');
                    document.getElementById('exist').innerHTML='';
                    document.getElementById('e_fullName').innerHTML='';
                    document.getElementById('e_owner').innerHTML='';
                    alreadyCheckedCourses = {};
                    alreadyCheckedCourses[courseID]=1;
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
    console.log(courseID);
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