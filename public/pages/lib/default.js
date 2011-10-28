window.onload = loadCourses();

function loadLectures(course){
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

function loadCourses(){
    var request = new XMLHttpRequest();
    request.open("GET", "/api/facet/courses", true);
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                var courses = eval('(' + request.responseText + ')');
                var list = document.getElementById('triggers');
                var lectures = document.getElementById('lectures');
                courses.forEach(function(c){
                    var new_element = document.createElement('li');
                    new_element.setAttribute('id', 'trigger'+c.courseID);
                    new_element.innerHTML = '<a href=\"#\">'+c.courseID+'</a>';
                    list.insertBefore(new_element, list.firstChild);
                    
                    new_element = document.createElement('div');
                    new_element.setAttribute('id', 'panel'+c.courseID);
                    new_element.innerHTML = '';
                    lectures.insertBefore(new_element, lectures.firstChild);
                    
                })
                
                
                $(document).ready(function(){
                    var selected = ""
                    $("#triggers > li").click(function() {
                        var s = this.id.substring("trigger".length);
                        if (s!==selected) {
                            $("#lectures div").hide();
                            loadLectures(s);
                            $("#panel"+s).show("slow"); 
                            selected = s;
                        }
                    });
                });
                
                
            }else{
                document.getElementById("msg").innerHTML=request.status+": "+request.statusText;    
            }  
        }
    }
    request.send(null);     
}
