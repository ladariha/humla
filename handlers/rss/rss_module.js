var fs = require("fs");
var path = require("path");
var RAW_SLIDES_DIRECTORY = '/data/slides';
var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../public/data/slides')).toString();
var mongoose = require("mongoose"); 
var Lecture = mongoose.model("Lecture");

exports.updateAllFeed =function updateAllFeed(domain){

    Lecture.find({
        isActive:true
    }).desc('lastModified').limit(10).execFind(function(err,docs){
        if(!err) {
            var xmlString=startRSSFeed();
            xmlString+= createRSSChannel("Humla RSS Feed", "Feed of all lectures", domain)
            for(var i=0;i<docs.length;i++){
                xmlString +=lectureToRSSItem(docs[i]);
            }
            xmlString=closeRSSChannel(xmlString);
            xmlString=closeRSSFeed(xmlString);
            console.log(xmlString);
        } else {
            // TODO LOG ERROR
            console.log(err);
        }     
    });
}

exports.updateCourseFeed =function updateCourseFeed(domain, courseID){

    Lecture.find({
        isActive:true,
        courseID: courseID
    }).desc('lastModified').limit(10).execFind(function(err,docs){
        if(!err) {
            var xmlString=startRSSFeed();
            xmlString+= createRSSChannel(courseID.toUpperCase()+" RSS Feed", "Feed of all lectures for course "+courseID.toUpperCase(), domain)
            for(var i=0;i<docs.length;i++){
                xmlString +=lectureToRSSItem(docs[i]);
            }
            xmlString=closeRSSChannel(xmlString);
            xmlString=closeRSSFeed(xmlString);
            console.log(xmlString);
        } else {
            // TODO LOG ERROR
            console.log(err);
        }     
    });
}

function lectureToRSSItem(lecture){

    var item = "<item>\n";
    item+= "<title>"+lecture.courseID.toUpperCase()+": "+lecture.title+"</title>\n";
    item+= "<description>"+lecture.lectureAbstract+"</description>\n";
    item+= "<link>"+lecture.presentationURL+"</link>\n";
    item+= "<guid>"+lecture.presentationURL+"@"+lecture.lastModified+"</guid>\n"; // GUID needs to change everytime lecture is updated
    item+= "<dc:creator>"+lecture.author+"</dc:creator>\n";
    item+= "<pubDate>"+lecture.lastModified+"</pubDate>\n";
    item+="</item>\n";
    return item;

}

function createRSSChannel(title, desc, domain){
    var date = new Date();
    var item = "<channel>\n";
    item+= "<title>"+title+"</title>\n";
    item+= "<description>"+desc+"</description>\n";
    item+= "<link>"+domain+"</link>\n";
    item+= "  <lastBuildDate>"+date.toUTCString()+"</lastBuildDate>\n"; 
    item+= "  <pubDate>"+date.toUTCString()+"</pubDate>\n"; 
    item+="<ttl>720</ttl>\n";
    return item;
}

function closeRSSChannel(channel){
    return channel+="\n</channel>";
}

function closeRSSFeed(feed){
    return feed+="\n</rss>";
}

function startRSSFeed(){
    var item = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n";
    item+="<rss version=\"2.0\"  xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n";
    return item;
}