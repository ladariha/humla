/**
 * Page Script
 * ~~~~~~~
 * Frontend scripts for controlling Humla main page (index.html)
 * - PageHandler
 * - DataAccess
 */


// Variables
var pageHandler = new PageHandler();
var dataAccess = new DataAccess();

// INIT: After loading document
$(document).ready(function() {
    pageHandler.init();
});
    
// Cached elements
var course_ul;
var lectures_ul;
var infotext_elm;
var debug_elm;

//TODO: stáhnout lectures a courses data v jednom jsonu najednou
var lectures = [];

///////////////////////////////
// Handler of data access 
///////////////////////////////
function DataAccess() {
    //save reference (for next generations)
    var that = this; 
    
    // Send GET request for courses JSON
    this.loadCourses = function() {
        var $jqXHR = $.getJSON("/api/facet/courses", function(courses) {                   
            course_ul.innerHTML = "" ;//lectures_ul.innerHTML = "";

            for(var i in courses) {
                var c = courses[i];
                if (c.courseID) {
                    var new_element = document.createElement('li');
                    new_element.innerHTML = c.courseID +": "+c.longName;
                    new_element.setAttribute('data-link', c.courseID);                    
                    new_element.setAttribute('title', c.courseID); //Kvuli IE
                    course_ul.insertBefore(new_element, course_ul.firstChild);
                }
            }
        });
        $jqXHR.error(function(e) {
            debug_elm.innerHTML=e.status+": "+e.statusText+"<br/>"+e.responseText;            
        });
        
    }
    // send GET request for lectures based on course id
    this.loadLectures = function (id) {
        var $jqXHR = $.getJSON("/api/facet/"+id+"/lectures", function(lectures) {            
            lectures_ul.innerHTML="";
            for(var lec in lectures) {
                var c = lectures[lec];
                var new_element = document.createElement('li');
                new_element.innerHTML = c.title.slice(0, -5);
                new_element.setAttribute('data-link', c.presentationURL);                
                new_element.setAttribute('title', c.presentationURL); // kvulit IE
                lectures_ul.insertBefore(new_element, lectures_ul.firstChild);
            }

        });
        $jqXHR.error(function(e) {
            debug_elm.innerHTML=e.status+": "+e.statusText+"<br/>-  "+e.responseText;            
        });
        
    }
    
    
    // First fill all available info about slide and then send request to index API
    this.loadInfo = function (url) { //(course_id,lect_id) {  
        var a = '<h2 id="lecturename">MI-MDW: Data se propsala</h2>';
        a+= '<div id="buttons"><a href="http://'+url+'" target="_blank" class="button" tabindex="3">Open</a>';
        a+= '<a href="">Edit</a>';
        a+= '<a href="">Info</a></div><br/>';
        a+= '<h3>Abstrakt</h3>';
        a+= '<p id="abstract">Obsah této přednášky</p> ';
        a+= '<h3>Index</h3>';
        a+= '<ul id="index" class="slideindex-ul" >';
        a+= '<li>Nedddco</li>';
        a+= '<li>Neco</li>';
        a+= '</ul>';
        infotext_elm.innerHTML = a;
                
        // Parse info
        var fields = url.split("/");            
        var course = fields[3];//presentationUrl.substr(0, presentationUrl.indexOf("/"));

        //TODO: smazat: only for testing purposes
        //course = "mdw";
        
        var lecture= fields[4].substr(0, fields[4].indexOf("."));
        
        var $jqXHR = $.getJSON("/api/"+course+"/"+lecture+"/index", function(index) {       
            var index_ul = document.getElementById("index");
            var ul = [];
            
            for(var item in index.structure.index){
                var t = index.structure.index[item]; 
                ul.push('<li class="slideindex-li"><a class="slideindex-structure-top" href="http://'+t.url+'">'+t.title+'</a>');            
                if(t.chapters && t.chapters.length>0){
                    ul.push("<img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"pageHandler.dropdown(this, 'slideindex-structure-secondLevel"+item+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-structure-secondLevel"+item+"\" class=\"slideindex-hidden\" >");
                    for(var chapter in t.chapters){
                        var ch = t.chapters[chapter];
                        ul.push("<li class=\"slideindex-li\"><a class=\"slideindex-structure-chapter\" href=\"http://"+ch.url+"\">"+ch.title+"</a>");
                        if(ch.slides && ch.slides.length>0){
                            ul.push("<img src=\"../../../humla/lib/ext/slideindex-left.png\" onClick=\"pageHandler.dropdown(this, 'slideindex-structure-thirdLevel"+chapter+"');\" title=\"Show content\" alt=\"Show content\"/><ul id=\"slideindex-structure-thirdLevel"+chapter+"\" class=\"slideindex-hidden\" >");
                            for(var s in ch.slides){
                                var simpleSlide = ch.slides[s];
                                ul.push("<li class=\"slideindex-li\"><a class=\"slideindex-structure-slide\" href=\"http://"+simpleSlide.url+"\">"+simpleSlide.title+"</a>");
                     
                            }
                            ul.push("</ul>");
                        }
                    }
                    ul.push("</ul>");
                }
                ul.push( "</li>");
            }            
            index_ul.innerHTML = ul.join("\n");

        });
        $jqXHR.error(function(e) {
            debug_elm.innerHTML=e.status+": "+e.statusText+"<br/>-  "+e.responseText;            
        });            
        

    /*
        <div id="info-text">
            <h2 id="lecturename">MI-MDW: APIs</h2>
            <div id="buttons"><a href="" target="_blank"  class="button" tabindex="3">Open</a>
                <a href="">Edit</a>
            </div>
            <br/>
            <h3>Abstrakt</h3>                        
            <p id="abstract">Obsah této přednášky</p>
            <h3>Index</h3>
            <ol id="index">
                <li>Neco</li>
                <li>Neco</li>
            </ol>

        </div>        
        **/

    }
   
    
}



///////////////////////////////
// Handler of page operations
///////////////////////////////
function PageHandler(){
    //save reference (for next generations)
    var that = this; 
    
    // initialize page control
    this.init = function() {
        this.initHandlers();
        lectures_ul = document.getElementById("lecture-items");
        course_ul = document.getElementById('course-items');
        infotext_elm = document.getElementById("info-text")
        debug_elm = document.getElementById("msg")
        
        dataAccess.loadCourses();
    };
    
    // initialize handlers and event listeners
    this.initHandlers =  function() {
        // filter items in lists
        $('#lectures-field').bind("click keyup", function(event) {
            //if esc is pressed or nothing is entered
            if(event.keyCode==27||$(this).val()==''){
                //if esc is pressed we want to clear the value of search box
                $(this).val('');
                //we want each row to be visible because if nothing is entered then all rows are matched.                                
                $('#lecture-items li').show();
            } else {
                //if there is text, lets filter                
                that.filter('#lecture-items li', $(this).val());                
            }

        });
        $("#courses-field").bind("click keyup", function(event) {            
            if(event.keyCode==27||$(this).val()==''){                
                $(this).val('');                
                $('#course-items li').show();
            } else {                                
                that.filter('#course-items li', $(this).val());
            }

        }).click();
        
        /* Tohle může být zakomentované -- tlačítka nejsou ani potřeba, ale vypadaj pěkně
        $("#courses-button").click(function() {
            $("#courses-field").click();
        });
        $("#lectures-button").click(function() {
            $("#lectures-field").click();
        });*/
        
        $("#course-items").on("click", "li", function(e){            
            $("#course-items>li").removeClass("selected"); // TODO: tohle optimalizovat, abych dvakrát neselektoroval
            $(this).addClass("selected");
            dataAccess.loadLectures(e.srcElement.dataset ? e.srcElement.dataset.link : e.srcElement.title); //hack kvuli IE
        });  
        $("#lecture-items").on("click", "li", function(e){
            $("#lecture-items>li").removeClass("selected");
            $(this).addClass("selected");
            dataAccess.loadInfo(e.srcElement.dataset ? e.srcElement.dataset.link : e.srcElement.title ); //hack kvuli IE
        //TODO that.fillInfo(dataAccess.loadInfo());
        //that.fillInfo(e.srcElement.dataset.link);
        });  
    };
    
    ///////////////////////////////////////////////////////////////////////// well commented line

    // Filter selector items
    this.filter = function filter(selector, query) { // by http://net.tutsplus.com/tutorials/javascript-ajax/using-jquery-to-manipulate-and-filter-data/
        query = $.trim(query); //trim white space
        query = query.replace(/ /gi, '|'); //add OR for regex query ‪‬
        $(selector).each(function() {
            if ($(this).text().search(new RegExp(query, "i")) < 0)
                $(this).hide();//.removeClass('visible');
            else
                $(this).show();//.addClass('visible');
        });

    };
    
    
    // Fill info tab
    this.fillInfo = function (data) {
        lectureClick(data); // TODO: vytvořit parsování dat
    }
    
    this.dropdown = function (img,idOflist) {        
        if(img.src.indexOf("left")>0){
            img.src="../../../humla/lib/ext/slideindex-down.png";
            img.title = "Hide content";
            img.alt="Hide content";
            document.getElementById(idOflist).setAttribute("class", 'slideindex-visible');
        }else{
            img.src="../../../humla/lib/ext/slideindex-left.png";  
            document.getElementById(idOflist).setAttribute("class", 'slideindex-hidden');
            img.title = "Show content";
            img.alt="Show content";
        }
        
    }
    

}



