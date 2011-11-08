
window.onload = load();


var course_ul;
var lectures_ul;

function loadData() {
    
    var panel = document.getElementById('panel'+course);
    if ($('#panel'+course+' ul').length === 0) {
        var request = new XMLHttpRequest();
        request.open("GET", "/api/facet/"+course+"/lectures", true);
        request.onreadystatechange = function(){
            if (request.readyState==4) {
                if(request.status==200){
                    var lectures = eval('(' + request.responseText + ')');
                    
                    var p = document.createElement('p');
                    p.innerHTML = '<a href=\"editcourse.html?course='+course+'\">Edit course<a/>'
                    panel.insertBefore(p, panel.firstChild);
                    var container = document.createElement('ul');
                    lectures.forEach(function(c){
                        var new_element = document.createElement('li');
                        new_element.innerHTML = '<a href=\"http://'+c.url+'\">'+c.title+'</a>';
                        container.insertBefore(new_element, container.firstChild);                    
                    })
                    panel.insertBefore(container, panel.firstChild);
                
                }else{
                    document.getElementById("msg").innerHTML=request.status+": "+request.statusText;    
                }  
            }
        }
        request.send(null); 
    }
}

function load(){
    var request = new XMLHttpRequest();
    request.open("GET", "/api/facet/courses", true);
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                
                var courses = eval('(' + request.responseText + ')');
                
                course_ul = document.getElementById('course-items');
                lectures_ul = document.getElementById("lecture-items");
                course_ul.innerHTML="";
                lectures_ul.innerHTML="";
                
                for(var i in courses) {
                    var c = courses[i];
                    if (c.courseID) {
                        var new_element = document.createElement('li');                    
                        new_element.innerHTML = c.courseID +": "+c.longName;
                        new_element.setAttribute('title', c.courseID);
                        new_element.addEventListener("click",function(e){
                            courseClick(e.srcElement.title);
                        },false);
                        course_ul.insertBefore(new_element, course_ul.firstChild);
                    }
                }                           
                
                
            }else{
                document.getElementById("msg").innerHTML=request.status+": "+request.statusText;    
            }  
        }
    }
    request.send(null);     
}

function courseClick(id) {    
    var request = new XMLHttpRequest();
    request.open("GET", "/api/facet/"+id+"/lectures", true);
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                
                var lectures = eval('(' + request.responseText + ')');
                
                lectures_ul = document.getElementById("lecture-items");                
                lectures_ul.innerHTML="";
                
                
                for(var i in lectures) {
                    var c = lectures[i];
                    var new_element = document.createElement('li');                    
                    new_element.innerHTML = c.title.slice(0, -5);
                    new_element.setAttribute('title', c.url);
                    new_element.addEventListener("click",function(e){
                        lectureClick(e.srcElement.title);
                    },false);
                    lectures_ul.insertBefore(new_element, lectures_ul.firstChild);                    
                }                
                
            }else{
                document.getElementById("msg").innerHTML=request.status+": "+request.statusText;    
            }  
        }
    }
    request.send(null);     
   
}
function lectureClick(url) {
    
    var info = document.getElementById("info-text");    
    
    var a = '<h2 id="lecturename">MI-MDW: APIs</h2>';
    a+= '<div id="buttons"><a href="http://'+url+'" target="_blank"  class="button">Open</a>';
    a+= '<a href="">Edit</a>';
    a+= '<a href="">Info</a></div><br/>';
    a+= '<h3>Abstrakt</h3>';
    a+= '<p id="abstract">Obsah této přednášky</p> ';
    a+= '<h3>Index</h3>';
    a+= '<ol id="index">';
    a+= '<li>Neco</li>';
    a+= '<li>Neco</li>';
    a+= '</ol>';
    
    info.innerHTML = a;
}