/*
 * OBSOLETE IN FAVOUR OF ATOM FEED
 */
//
//var fs = require("fs");
//var path = require("path");
//var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../../public/data/slides')).toString();
//var mongoose = require("mongoose"); 
//var Lecture = mongoose.model("Lecture");
//var RSS_ITEM_LIMIT = 10;
//
//exports.updateAllFeed =function updateAllFeed(domain, courseID){
//    if(shouldUpdateRSS()){
//        updateHumlaFeed(domain);
//        updateCourseFeed(domain, courseID);
//    }
//}
//
//function updateHumlaFeed(domain){
//    
//    var rss = new RSSModule();
//    Lecture.find({
//        isActive:true
//    }).desc('lastModified').limit(RSS_ITEM_LIMIT).execFind(function(err,docs){
//        if(!err) {
//            var xmlString=rss.startRSSFeed();
//            xmlString+= rss.createRSSChannel("Humla RSS Feed", "Feed of all lectures", domain)
//            for(var i=0;i<docs.length;i++){
//                xmlString +=rss.lectureToRSSItem(docs[i]);
//            }
//            xmlString=rss.closeRSSChannel(xmlString);
//            xmlString=rss.closeRSSFeed(xmlString);
//            rss.writeRSSFeedToFile(xmlString, '');
//            console.log(xmlString);
//        } else {
//            // TODO LOG ERROR
//            console.log(err);
//        }     
//    });
//}
//
//
//function updateCourseFeed(domain, courseID){
//   
//    var rss = new RSSModule();
//    Lecture.find({
//        isActive:true,
//        courseID: courseID
//    }).desc('lastModified').limit(RSS_ITEM_LIMIT).execFind(function(err,docs){
//        if(!err) {
//            var xmlString=rss.startRSSFeed();
//            xmlString+= rss.createRSSChannel(courseID.toUpperCase()+" RSS Feed", "Feed of all lectures for course "+courseID.toUpperCase(), domain)
//            for(var i=0;i<docs.length;i++){
//                xmlString +=rss.lectureToRSSItem(docs[i]);
//            }
//            xmlString=rss.closeRSSChannel(xmlString);
//            xmlString=rss.closeRSSFeed(xmlString);
//            rss.writeRSSFeedToFile(xmlString, courseID);
//        } else {
//            // TODO LOG ERROR
//            console.log(err);
//        }     
//    });
//}
//
//
//function RSSModule(){
//
//    this.writeRSSFeedToFile=function(feed, folder){
//        fs.writeFile(SLIDES_DIRECTORY+"/"+folder+"/rss.xml",feed, function (err) {
//            if (err) {
//                console.error('Error while saving '+err);
//            }else{
//                console.log('It\'s saved!');
//            }
//        });
//    }
//
//    this.lectureToRSSItem = function(lecture){
//
//        var item = "<item>\n";
//        item+= "<title>"+lecture.courseID.toUpperCase()+": "+lecture.title+"</title>\n";
//        item+= "<description>"+lecture.lectureAbstract+"</description>\n";
//        item+= "<link>"+lecture.presentationURL+"</link>\n";
//        item+= "<guid>"+lecture.presentationURL+"@"+lecture.lastModified+"</guid>\n"; // GUID needs to change everytime lecture is updated
//        item+= "<dc:creator>"+lecture.author+"</dc:creator>\n";
//        try{
//            item+= "<pubDate>"+lecture.lastModified.toUTCString()+"</pubDate>\n";
//        }catch(err){
//            var d = new Date();
//            item+= "<pubDate>"+d.toUTCString()+"</pubDate>\n";
//        }
//        item+="</item>\n";
//        return item;
//
//    }
//
//    this.createRSSChannel=function(title, desc, domain){
//        var date = new Date();
//        var item = "<channel>\n";
//        item+= "<title>"+title+"</title>\n";
//        item+= "<description>"+desc+"</description>\n";
//        item+= "<link>"+domain+"</link>\n";
//        item+= "  <lastBuildDate>"+date.toUTCString()+"</lastBuildDate>\n"; 
//        item+= "  <pubDate>"+date.toUTCString()+"</pubDate>\n"; 
//        item+="<ttl>120</ttl>\n";
//        return item;
//    }
//
//    this.closeRSSChannel=function(channel){
//        return channel+="\n</channel>";
//    }
//
//    this.closeRSSFeed=function(feed){
//        return feed+="\n</rss>";
//    }
//
//    this.startRSSFeed=function(){
//        var item = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n";
//        item+="<rss version=\"2.0\"  xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n";
//        return item;
//    }
//
//}
//
//function shouldUpdateRSS(){
//    return true;
//}
