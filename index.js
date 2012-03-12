/**
 *  Humla-Server Main index file
 *  - load JSON config file
 *  - setup server webroot 
 *  - run server 
 *  - run cron jobs
 */

var path = require('path');
var server = require("./server");
var fs = require("fs");
var cronJob = require('cron').CronJob;

//load JSON config file
var config=loadConfig('./server-config.json') || {};

//initialize server environment
server.init(config);

//server.run(handlers, PORT, WEBROOT);
server.run();


// cron patterns http://help.sap.com/saphelp_xmii120/helpdata/en/44/89a17188cc6fb5e10000000a155369/content.htm

// ATOM UPDATE EVERY 2 HOURS
cronJob('0 0 */2 * * *',  function(){ 
    var atom = require((path.join(path.dirname(__filename), './server_ext/atom')).toString()+"/atom_module_ext.js");    
    atom.updateAllFeed(config.server.domain+":"+config.server.port); // TODO 
});

// REFRESHING INDEX FILES AND FACET RECORDS
cronJob('0 * * * * *',function(){
    var maintenance = require((path.join(path.dirname(__filename), './server_ext/maintenance')).toString()+"/maintenance_lecture_ext.js");    
    maintenance.refreshLectures();
});


/**
 * Load and parse JSON config file
 * @param filename Relative path to JSON config file
 */
function loadConfig(filename) {
    try {    
        var data = fs.readFileSync(filename).toString();    
        config = JSON.parse(data);
        return config;
    //console.dir(config);   
    } catch (err) {
        /*console.log('There has been an error parsing your JSON Configuration (server-config.json)');
        console.log(err);*/
        throw 'There has been an error parsing your JSON Configuration (server-config.json)\n'+err;
    }    
}