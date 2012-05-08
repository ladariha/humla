//decides whether to use default, webkit or mozilla indexed database
var indexedDB = window.indexedDB || window.webkitIndexedDB ||
window.mozIndexedDB;
//setups webkit params
if ('webkitIndexedDB' in window) {
    window.IDBTransaction = window.webkitIDBTransaction;
    window.IDBKeyRange = window.webkitIDBKeyRange;
}
/**
* A singleton object used to communicate with the database
*/
var ext_indexeddb = {
    /**
    * Database name
    */
    dbName : "database",
    /**
    * Database version (change clears the database)
    */
    dbVersion : "6.0",
    /**
    * Array of objects to be stored in the database, needs to be changed to store anything else into database
    */
    dbObjects :
    [
    {
        /**
        * Unique object name (table name)
        */
        name: "CANVAS", 
        /**
        * Key name
        */
        keyPath: "id", 
        /**
        * If the id is autoincremented
        */
        autoIncrement: true,
        /**
        * Other indices, name and uniqueness
        */
        index : {
            name : "htmlID",
            unique : true
        }
    }
    ],
    /**
    * Database object
    */
    indexedDB : {
        /**
        * Database
        */
        db : null,
        /**
        * Triggered on error
        */  
        onerror : function(e){
            console.log(e);
        },
        /**
        * Asynchronously opens the database connection and performs the callback function on success.
        * Created all database objects in the database if the version is newer than the previous version.
        */
        open : function(callback){
            if(!indexedDB) return; // Opera doesn't have indexedDB a fails on this one, TODO: edit
            var request = indexedDB.open(ext_indexeddb.dbName);

            request.onsuccess = function(e) {
                var v = ext_indexeddb.version;
                ext_indexeddb.indexedDB.db = e.target.result;
                var db = ext_indexeddb.indexedDB.db;
                if (v!= db.version) {
                    var setVrequest = db.setVersion(v);

                    setVrequest.onerror = ext_indexeddb.indexedDB.onerror;
                    setVrequest.onsuccess = function(e) {
                        
                        for (var x = 0; x < db.objectStoreNames.length; x += 1) {
                            db.deleteObjectStore(db.objectStoreNames[x]);
                        }
                        for (var i = 0; i < ext_indexeddb.dbObjects.length; i++){
                            var object = ext_indexeddb.dbObjects[i];
                            var store = db.createObjectStore(object.name,
                            {
                                keyPath: object.keyPath,
                                autoIncrement : object.autoIncrement
                            });
                            if (object.index != null && object.index.name != ""){
                                store.createIndex(object.index.name, object.index.name, {
                                    unique: object.index.unique
                                });  
                            }
                        }
                        
                        callback();
                    };
                }
                else {
                    //ext_indexeddb.indexedDB.getAllItems();
                    callback();
                }
            };

            request.onerror = ext_indexeddb.indexedDB.onerror;
        }, 
        /**
        * Adds an object into given table. 
        * @param object to be inserted into database
        * @param table represents the object table in the database
        * @param callback function called on successful adding
        * @param error function called on error
        */
        add : function(object, table, callback, error) {
            var db = ext_indexeddb.indexedDB.db;
            var trans = db.transaction([table], IDBTransaction.READ_WRITE);
            var store = trans.objectStore(table);
            
            try {
                var request = store.add(object);
            
                request.onsuccess = callback;

                request.onerror = error;
            } catch (exc) {
                console.log("CHYBA_insert: "+exc);
            }
        }, 
        /**
        * Updated an object in the database. 
        * @param object to be updated in database
        * @param table represents the object table in the database
        * @param callback function called on success
        * @param error function called on error
        */
        update : function(object, table, callback, error){
            var db = ext_indexeddb.indexedDB.db;
            var trans = db.transaction([table], IDBTransaction.READ_WRITE);
            var store = trans.objectStore(table);
            
            try {
                var request = store.put(object);
            
                request.onsuccess = callback;

                request.onerror = error;
            } catch (exc) {
                console.log("CHYBA_update: "+exc);
            }
        },
        /**
        * Deletes an object in the database
        * @param id of object to be deleted
        * @param table represents the object table in the database
        * @param callback function called on success
        * @param error function called on error
        */
        deleteItem : function(id, table, callback, error) {
            var db = ext_indexeddb.indexedDB.db;
            var trans = db.transaction([table], IDBTransaction.READ_WRITE);
            var store = trans.objectStore(table);

            var request = store.delete(id);

            request.onsuccess = callback;

            request.onerror = error;
        },
        /**
        * Gets object from db
        * @param table represents the object table in the database
        * @param indexName name of index by which the object is recognized
        * @param key index value
        * @param callback function called on success
        * @param error function called on error
        */
        getItem : function(table, indexName, key, callback, error){
            
            var db = ext_indexeddb.indexedDB.db;
            
                
            var trans = db.transaction([table], IDBTransaction.READ_WRITE);
          
            var store = trans.objectStore(table);
    
            var index = store.index(indexName);
            console.log("Index opened. name:" + index.name + ", storeName: " + index.storeName + ", keyPath: " + index.keyPath);
    
            var getReq = index.get(key);
            getReq.onsuccess = callback;
            getReq.onerror = error;
    
                
         
        },
        /**
        * Gets all object of the given type from the db
        * @param table represents the object table in the database
        * @param callback function called on success
        * @param error function called on error
        */
        get : function(table, callback, error){
            console.log("Volam get");
            var db = ext_indexeddb.indexedDB.db;
            var trans = db.transaction([table], IDBTransaction.READ_WRITE);
            var store = trans.objectStore(table);

            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);
            
            cursorRequest.onsuccess = callback;

            cursorRequest.onerror = error;
        },
        /**
        * Test function to get all canvas from the database and printing them out into console
        * @param callback function called on result
        */
        getAllItems : function(callback) {
            var todos = document.getElementById("todoItems");
            todos.innerHTML = "";

            var db = ext_indexeddb.indexedDB.db;
            var trans = db.transaction(["CANVAS"], IDBTransaction.READ_WRITE);
            var store = trans.objectStore("CANVAS");

            // Get everything in the store;
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);

            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if(!!result == false)
                    return;
                console.log(result.value);
                callback(result.value);
                result.continue();
            };

            cursorRequest.onerror = ext_indexeddb.indexedDB.onerror;
        }
    },

    init : function() {
        ext_indexeddb.indexedDB.open(function(){
            console.log("Database successfuly loaded");
        });
    }
    
}

//Database initialization
ext_indexeddb.init();
