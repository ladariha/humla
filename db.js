/**
 * DB connector and helper
 * from nodejsdb.org
 * 
 */
var mysql = require("db-mysql");


new mysql.Database({
     "hostname": "localhost",
     "user": "user",
     "password": "password",
     "database": "test"
}).connect(function(error) {
     if (error) {
         return console.log("CONNECTION error: " + error);
     }
     this.query()
         .select(["id", "user", "email"])
         .from("users")
         .where("role IN ?", [ ["administrator", "user"] ])
         .and("created > ?", [ new Date(2011, 1, 1) ])
         .execute(function(error, rows, columns){
             if (error) {
                 console.log('ERROR: ' + error);
                 return;
             }
             // Do something with rows & columns
         });
     return ""; //TODO: check, jestli je to tu opravdu třeba!
});