
var rssLoader = new RSSLoader();

$(document).ready(function() {
   rssLoader.loadCourses();
});


function RSSLoader(){
   this.loadCourses = function() {
        var $jqXHR = $.getJSON("/api/facet/courses", function(courses) {                   
            var list = document.getElementById("rsscourses");
            $("#course-hint").hide();
            for(var i in courses) {
                var c = courses[i];
                if (c.courseID) {
                    var new_element = document.createElement('li');
                    new_element.innerHTML = "<a href=\"/data/slides/"+c.courseID+"/rss.xml\">"+c.courseID +": "+c.longName+"</a>";
                    list.insertBefore(new_element, list.firstChild);
                }
            }
            
        });
        $jqXHR.error(function(e) {
            document.getElementById("msg").innerHTML=e.status+": "+e.statusText+"<br/>"+e.responseText;            
        });
   }
}