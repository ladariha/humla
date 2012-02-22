var fs = require("fs");
var path = require("path");
var richDataGenerator = require("./rich_data_generator");
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../../public/data/slides')).toString();
var SLIDES_DIRECTORY_RAW = "/data/slides/"
var mongoose = require("mongoose"); 
var Lecture = mongoose.model("Lecture");
var Course = mongoose.model("Course");
var ATOM_ITEM_LIMIT = 10;

exports.updateAllFeed =function updateAllFeed(domain){
    updateHumlaFeed(domain);
    updateCoursesFeed(domain);
    
}

function updateHumlaFeed(domain){
    
    var atom = new AtomModule("Humla Atom Feed", "Feed of all lectures", domain, domain+SLIDES_DIRECTORY_RAW+"atom.xml", SLIDES_DIRECTORY+"/atom.xml");
    
    Lecture.find({
        isActive:true
    }).desc('lastModified').limit(ATOM_ITEM_LIMIT).execFind(function(err,docs){
        if(!err) {
            for(var i=0;i<docs.length;i++){ // get slideindex for each lecture
                atom.lectures[i] = docs[i];
            }
            atom.parse(domain);
        } else {
            // TODO LOG ERROR
            console.log(err);
        }     
    });
};


function updateCoursesFeed(domain){
    Course.find({},function(err,crs){  
        if(!err){
            for(var i=0;i<crs.length;i++)
                updateCourseFeed(domain, crs[i].courseID);
        }else{
            console.log(err);
        }
    });
}




function updateCourseFeed(domain, courseID){
   
    var atom = new AtomModule(courseID.toUpperCase()+" Atom Feed", "Feed of all lectures for course "+courseID.toUpperCase(), domain, domain+SLIDES_DIRECTORY_RAW+courseID+"/atom.xml", SLIDES_DIRECTORY+"/"+courseID+"/atom.xml");
    Lecture.find({
        isActive:true,
        courseID: courseID
    }).desc('lastModified').limit(ATOM_ITEM_LIMIT).execFind(function(err,docs){
        if(!err) {
            for(var i=0;i<docs.length;i++){
                atom.lectures[i] = docs[i];
            }
            atom.parse(domain);
        } else {
            // TODO LOG ERROR
            console.log(err);
        }     
    });
}


function AtomModule(title, subtitle, domain, link, folder){
    this.title = title;
    this.folder = folder;
    this.subtitle = subtitle;
    this.domain = domain;
    this.link = link;
    this.counter = 0;
    this.lectures = []; // lectures from DB
    this.lists = []; // one item per lecture (so one item aggregates lists from all extensions)
    
    
    this.parse = function(domain){
        // for each lecture
        for(var i=0;i<this.lectures.length;i++){
            richDataGenerator.create(this, i, domain);
        }
    }
    
    this.notify = function(data, iterator){
        this.lists[iterator] = data;
        this.counter++;
        if(this.isOver()){
            var feed = this.createAtomFeed();
            this.writeAtomFeedToFile(feed);   
        }   
    };
    
    this.isOver = function(){
        if(this.counter=== this.lectures.length)
            return true
        return false
    };

    this.writeAtomFeedToFile=function(feed){
        fs.writeFile(this.folder,feed, function (err) {
            });
        
    };
    
    this.lectureToFeedRich = function(lecture, list){
        
        var item = "<entry>\n";
        // author
        item+="<author>\n";
        item+="<name>"+lecture.author+"</name>\n";
        if(lecture.authorEmail && lecture.authorEmail.length>0)
            item+="<email>"+lecture.authorEmail+"</email>\n";    
        if(lecture.authorWeb && lecture.authorWeb.length>0)
            item+="<uri>"+lecture.authorWeb+"</uri>\n";    
        item+="</author>\n"
        item+= "<id>"+lecture.presentationURL+"@"+lecture.lastModified+"</id>\n"; 
        item+= "<title>"+lecture.courseID.toUpperCase()+": "+lecture.title+"</title>\n";
        
        // content
        item+="<content type=\"html\">\n";
        item+="<div>"+lecture.description+"</div>\n";
        item +=list;
        item+="</content>";
        // link
        item+= "<link>"+lecture.presentationURL+"</link>\n";
        
        try{
            var d = lecture.created;
            item+= "  <published>"+this.getAtomDateFormat(d)+"</published>\n"; 
        }catch(err){
            var d = new Date();
            item+= "  <published>"+this.getAtomDateFormat(d)+"</published>\n"; 
        }
        
        try{
            var d = lecture.lastModified;
            item+= "  <updated>"+this.getAtomDateFormat(d)+"</updated>\n"; 
        }catch(err){
            var d = new Date();
            item+= "  <updated>"+this.getAtomDateFormat(d)+"</updated>\n"; 
        }
        
        item+="</entry>\n";
        return item;
        
    };
   

    this.createAtomFeed=function(){
        var d = new Date();
        var item = this.startAtom();
        item+= "<title>"+this.title+"</title>\n";
        item+= "<link href=\""+this.domain+"\"/>\n";
        item+= "<link rel=\"self\" href=\""+this.link+"\"/>\n";
        item+= "  <updated>"+this.getAtomDateFormat(d)+"</updated>\n"; 
        
        for(var i=0;i<this.lectures.length;i++){
            item+=this.lectureToFeedRich(this.lectures[i], this.lists[i]);
        }
            
        item = this.closeAtomFeed(item);
        return item;
        
    };

    this.getAtomDateFormat = function(date){
        var month = date.getMonth();
        if(month<10)
            month="0"+month;
        var day = date.getDay();
        if(day<10)
            day = "0"+day;
        var hours = date.getHours();
        if(hours<10)
            hours = "0"+hours;
        var minutes = date.getMinutes();
        if(minutes<10)
            minutes = "0"+minutes;
        var seconds = date.getSeconds();
        if(seconds<10)
            seconds = "0"+seconds;
        return date.getFullYear()+"-"+month+"-"+day+"T"+hours+":"+ minutes+":"+seconds+"Z"; 
    }


    this.closeAtomFeed=function(feed){
        return feed+="\n</feed>";
    };

    this.startAtom=function(){
        var item = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n";
        item+="<feed xmlns=\"http://www.w3.org/2005/Atom\">\n";
        return item;
    };

}