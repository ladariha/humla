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

// Cached current lectures (only 1 course)
var currentLectures = [];

///////////////////////////////
// Handler of data access 
///////////////////////////////
function DataAccess() {
    //save reference (for next generations)
    var that = this; 
    
    
    // TODO: Load info from localStorage - if not available return false
    this.loadLocal = function () {
        localStorage.get();        
        return false;
    }
    
    
    this.displayLogin = function(user) {
        var login = document.getElementById("login");
        console.log(JSON.stringify(user));
        if (user && user.email){
            login.innerHTML = '<span>'+user.email+' </span><a id="login-logout" href="#login">(logout)</a>';
        }else {
            login.innerHTML = '<a id="login-login" href="#login">login</a>';                
        }        
    }
    
    this.loadUser = function() {
        var $jqXHR = $.getJSON("/auth/user", function(user) { 
            dataAccess.displayLogin(user);
        });               
        $jqXHR.error(function(e) {
            debug_elm.innerHTML=e.status+": "+e.statusText+"<br/>"+e.responseText;            
        });
    }
    
    // Send GET request for courses JSON
    this.loadCourses = function() {
        var $jqXHR = $.getJSON("/api/info/courses", function(courses) {                   
            course_ul.innerHTML = "" ;//lectures_ul.innerHTML = "";
            $("#course-hint").hide();
            for(var i in courses) {
                var c = courses[i];
                if (c.courseID) {
                    var new_element = document.createElement('li');
                    new_element.innerHTML = c.courseID +": "+c.longName;
                    new_element.setAttribute('data-link', c.courseID);    
                    new_element.setAttribute('id', c.courseID);    
                    new_element.setAttribute('title', c.courseID); //Kvuli IE
                    course_ul.insertBefore(new_element, course_ul.firstChild);
                }
            }
            
            $("#course-items li").contextMenu({
                menu: 'courseMenu'
            }, function(action, el, pos) {
                switch(action){
                    case 'editCourse':
                        window.location = 'editcourse.html?course='+$(el).attr('id');
                        break;
                }
            });
            
        });
        $jqXHR.error(function(e) {
            debug_elm.innerHTML=e.status+": "+e.statusText+"<br/>"+e.responseText;            
        });
        
    }
    // send GET request for lectures based on course id
    this.loadLectures = function (id) {
        var $jqXHR = $.getJSON("/api/info/"+id+"/lectures", function(lectures) {            
            currentLectures = lectures;
            console.log(id);
            lectures_ul.innerHTML="";
            $("#lecture-hint").hide();
            for(var lec in lectures) {
                
                var c = lectures[lec];
                var new_element = document.createElement('li');
                
                new_element.innerHTML = c.title;
                if(c.title.length>5){
                    new_element.innerHTML = c.title.slice(0, -5);
                }
                console.log("_"+c.presentationURL);
                new_element.setAttribute('data-link', c.presentationURL);        
                new_element.setAttribute('data-id', c._id);        
                new_element.setAttribute('id', c.courseID+';'+c.lectureID);  
                new_element.setAttribute('title', c.presentationURL); // kvulit IE
                lectures_ul.insertBefore(new_element, lectures_ul.firstChild);
            }

            $("#lecture-items li").contextMenu({
                menu: 'lectureMenu'
            }, function(action, el, pos) {
                var t = ($(el).attr('id')).split(';');       
                switch(action){
                    case 'editLecture':
                        window.location = 'editlecture.html?course='+t[0]+'&lecture='+t[1];
                        break;
                    case 'editLectureHtml':
                        window.location = 'editor/raw_editor.html?&course='+t[0]+'&lecture='+t[1]; 
                        break;
                }
            });
        });
        $jqXHR.error(function(e) {
            debug_elm.innerHTML=e.status+": "+e.statusText+"<br/>-  "+e.responseText;            
        });
        
    }
    
    this.findLecture = function(id) {
        for(var i=0, n=currentLectures.length; i<n; i++) {            
            if (currentLectures[i]._id == id) return currentLectures[i];            
        }        
        return null;
    }
    
    // First fill all available info about slide and then send request to index API
    this.loadInfo = function (elm) { //(course_id,lect_id) {          
        var url = elm.dataset ? elm.dataset.link : elm.title;
        var lecture = this.findLecture(elm.dataset ? elm.dataset.id : -1);           
        var t = ($(elm).attr('id')).split(';');       

        var a = '<h2 id="lecturename">'+lecture.title+'</h2>';
        a+= '<div id="buttons"><a href="http://'+url+'" target="_blank" class="button" tabindex="3">Open</a>';
        a+= '<a href="editlecture.html?course='+t[0]+'&lecture='+t[1]+'">Edit</a>';
        a+= '</div><br/>';
        if (lecture.lectureAbstract != "undefined") {
            a+= '<h3>Abstrakt</h3>';
            a+= '<p id="abstract">'+lecture.lectureAbstract+'</p> ';
        }
        a+= '<h3>Index</h3>';        
        a+= '<ul id="index" class="slideindex-ul" ><li>Loading...</li><ul>' 
        infotext_elm.innerHTML = a;        

        
        this.loadIndex(url);
        
    }
    this.loadIndex = function(url) {
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
                if(t.chapters && t.chapters.length>0){ // TODO: zarovnat všechny podle šipky
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
        
        dataAccess.loadUser();
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
        // almost same as above - filter courses // TODO: udělat jako jednu funkci se dvouma parametrama?
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
            $(this).toggleClass("selected",true).siblings().removeClass("selected"); 
            var targ = (e.srcElement) ? e.srcElement : e.target; // hack kvuli FF
            dataAccess.loadLectures(targ.dataset ? targ.dataset.link : targ.title); //hack kvuli IE (no HTML5 data attr)
        });  
        $("#lecture-items").on("click", "li", function(e){
            $(this).toggleClass("selected",true).siblings().removeClass("selected");            
            var targ = (e.srcElement) ? e.srcElement : e.target; // hack kvuli FF
            dataAccess.loadInfo(targ); //targ.dataset ? targ.dataset.link : targ.title, targ.dataset ? targ.dataset.id : targ.title); //hack kvuli IE        
        });  
        
        // login/registration button // TODO: odprasit... moc selektorů
        $('#login').on("click","a",function(){
            if(this.id==="login-logout") {
                $.get("/logout", function() { 
                    dataAccess.displayLogin(null);
                });               
            } else {
                $("#login-button").show();
                $('div#login-form-overlay').toggle('fast');
            }
        });        
        
        $('#login > a#login-register,  a#form-close-btn').click(function(){
            $(".register-field").show();            
            $("#login-button").hide();
            $('div#login-form-overlay').toggle('fast');
        })
    /*
        $("#reg-switch").click(function() {            
            $(".register-field").toggle("fast");
            if(this.innerHTML == "Registration") {
                $("#login-button").show();
                this.innerHTML = "Login";
            } else {
                $("#login-button").hide();
                this.innerHTML = "Registration";
            }            
        })*/
    };
    
    ///////////////////////////////////////////////////////////////////////// well commented line

    // Filter selector items
    this.filter = function filter(selector, query) { // by http://net.tutsplus.com/tutorials/javascript-ajax/using-jquery-to-manipulate-and-filter-data/
        query = $.trim(query); //trim white space
        query = query.replace(/ /gi, '|'); //add OR for regex query ‪‬
        var regx = new RegExp(query, "i");
        var cnt = 0;
        var $elm = null;
        $(selector).each(function() {
            if ($(this).text().search(regx) < 0)
                $(this).hide();//.removeClass('visible');
            else {
                $elm = $(this).show();//.addClass('visible');
                cnt++;
            }
        });        
        if(cnt==1) $elm.click(); // if theres only one element left - click on it
        
    };
    
    
    // Fill info tab
    this.fillInfo = function (data) {
        lectureClick(data); // TODO: vytvořit parsování dat
    }
    
    // Make dropdown clicks
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



