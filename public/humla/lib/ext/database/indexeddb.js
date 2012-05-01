//var ext_indexeddb = {};
var indexedDB = window.indexedDB || window.webkitIndexedDB ||
window.mozIndexedDB;

if ('webkitIndexedDB' in window) {
    window.IDBTransaction = window.webkitIDBTransaction;
    window.IDBKeyRange = window.webkitIDBKeyRange;
}
var ext_indexeddb = {
    dbName : "database",
    dbVersion : "6.0",
    dbObjects :
    [
    {
        name: "CANVAS", 
        keyPath: "id", 
        autoIncrement: true,
        index : {
            name : "htmlID",
            unique : true
        }
    }
    ],
    addObject : function(object){
        
    },
    indexedDB : {
        db : null,
        onerror : function(e){
            console.log(e);
        },
        open : function(callback){
            if(!indexedDB) return; // Opera doesn't have indexedDB a fails on this one, TODO: edit
            var request = indexedDB.open(ext_indexeddb.dbName);

            request.onsuccess = function(e) {
                var v = ext_indexeddb.version;
                ext_indexeddb.indexedDB.db = e.target.result;
                var db = ext_indexeddb.indexedDB.db;
                // We can only create Object stores in a setVersion transaction;
                if (v!= db.version) {
                    var setVrequest = db.setVersion(v);

                    // onsuccess is the only place we can create Object Stores
                    setVrequest.onerror = ext_indexeddb.indexedDB.onerror;
                    setVrequest.onsuccess = function(e) {
                        
                        for (var x = 0; x < db.objectStoreNames.length; x += 1) {
                            db.deleteObjectStore(db.objectStoreNames[x]);
                        }
                        //if(db.objectStoreNames.contains("CANVAS")) {
                        //    db.deleteObjectStore("CANVAS");
                        //}
                        /*
                        for (var i = 0; i < ext_indexeddb.dbObjects.length; i++) {
                            var params = ext_indexeddb.dbObjects[i];
                            console.log("Vypis: "+params.name);
                            var store = db.createObjectStore(params.name,
                                params.keyPath, params.autoIncrement);
                        }
                        */
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
                        
                        //store.createIndex("htmlID", "htmlID", { unique: true });  
                        //ext_indexeddb.indexedDB.getAllItems();
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
        add : function(object, table, callback, error, result) {
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
        deleteItem : function(id, table, callback, error) {
            var db = ext_indexeddb.indexedDB.db;
            var trans = db.transaction([table], IDBTransaction.READ_WRITE);
            var store = trans.objectStore(table);

            var request = store.delete(id);

            request.onsuccess = callback;

            request.onerror = error;
        },
        getItem : function(table, indexName, key, callback, error){
            //var objName = "KIDSTORE";
            //var indexName = "ckids";
            // var key = "Anna";
            
            var db = ext_indexeddb.indexedDB.db;
            
                
            var trans = db.transaction([table], IDBTransaction.READ_WRITE);
            /*
            txn.oncomplete = function () {
                output_trace("transaction completed.");
                db.close();
            }
            txn.onabort = function () {
                output_trace("transaction aborted.");
                db.close();
            }
            txn.ontimeout = function () {
                output_trace("transaction timeout.");
                db.close();
            }
    */
            var store = trans.objectStore(table);
    
            var index = store.index(indexName);
            console.log("Index opened. name:" + index.name + ", storeName: " + index.storeName + ", keyPath: " + index.keyPath);
    
            var getReq = index.get(key);
            getReq.onsuccess = callback;
            getReq.onerror = error;
    
                
         
        },
        get : function(table, callback, error){
            var db = ext_indexeddb.indexedDB.db;
            var trans = db.transaction([table], IDBTransaction.READ_WRITE);
            var store = trans.objectStore(table);

            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);

            cursorRequest.onsuccess = callback;

            cursorRequest.onerror = error;
        },
        getAllItems : function() {
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

                ext_indexeddb.renderTodo(result.value);
                result.continue();
            };

            cursorRequest.onerror = ext_indexeddb.indexedDB.onerror;
        }
    },
    renderTodo : function(row) {
        var todos = document.getElementById("todoItems");
        var li = document.createElement("li");
        var a = document.createElement("a");
        var t = document.createTextNode(row.text);

        a.addEventListener("click", function() {
            ext_indexeddb.indexedDB.deleteItem(row.id, "CANVAS");
        }, false);

        a.textContent = " [Delete]";
        li.appendChild(t);
        li.appendChild(a);
        todos.appendChild(li)
    },

    add : function() {
        var todo = document.getElementById("todo");
        ext_indexeddb.indexedDB.add(todo.value, "CANVAS");
        todo.value = "";
    },

    init : function() {
        ext_indexeddb.indexedDB.open(function(){
            console.log("Database successfuly loaded");
        });
    }
    
}

//window.addEventListener("DOMContentLoaded", ext_indexeddb.init, false);​
ext_indexeddb.init();
console.log("Vasja");