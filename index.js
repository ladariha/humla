/**
 *  Humla-Server Main index file
 *  - setup server
 *  - run server * 
 */

var path = require('path');
var server = require("./server");
var cronJob = require('cron').CronJob;
//var handlers = require("./handlers.js");

// root for static delivery
var WEBROOT = path.join(path.dirname(__filename), 'public');
var PORT = 1338; //TODO: musím předávat?
var DOMAIN = "127.0.0.1";
//server.run(handlers, PORT, WEBROOT);
server.run(PORT, WEBROOT);

// cron patterns http://help.sap.com/saphelp_xmii120/helpdata/en/44/89a17188cc6fb5e10000000a155369/content.htm

// ATOM UPDATE EVERY 2 HOURS
cronJob('0 0 */2 * * *',  function(){ 
    var atom = require((path.join(path.dirname(__filename), './server_ext/atom')).toString()+"/atom_module_ext.js");    
    atom.updateAllFeed(DOMAIN+":"+PORT); // TODO 
});

// REFRESHING INDEX FILES AND FACET RECORDS
cronJob('0 * * * * *',function(){
    var maintenance = require((path.join(path.dirname(__filename), './server_ext/maintenance')).toString()+"/maintenance_lecture_ext.js");    
    maintenance.refreshLectures();
});