
/**
 * MaintenanceMan is a function ("class") designed to perform maintein operations on/with given object.
 * Every function which name starts with "maintenance_" will be called when method run is invoked over 
 * the MaintenanceMan. The run method can be called with or without arguments. If any arguments are 
 * passed to run method, then these arguments will be available to all "maintenance_" methods as well.
 * You can create your own "maintenance_" methods that should be called.
 * @param object object that is available to all methods (access via this.object)
 */
function MaintenanceMan(object, name){
    this.object  = object;
    this.limit = 0;
    this.name = name;
    this.counter = 0;

    this.notify = function(){
        this.counter++;
        if(this.counter === this.limit)
        {
            this.object.remove(function(err) { // once its finished remove record from queue
                if (err) {
                    console.error("refreshIndexFiles: "+err);
                }else
                    console.log("REMOVED");
            });    
        }
    }
    
//    this.maintenance_FOO = function(){
//        var _ref = this;
//        slideindex_ext.index(this.object.courseID, this.object.lectureID, "json", undefined, function(err, data){
//            if(err){
//                console.error("refreshIndexFiles: "+err);
//            }else{
//                _ref.notify();                          
//            }
//        }); 
//    }

    
    this.run = function(args){
        
        for(var key in this){ // to set number of called methods
            if(this.hasOwnProperty(key) && typeof this[key]=="function" && key.indexOf("maintenance_") >-1){
                this.limit++;
            }
        }
        
        for(var key in this){
            if(this.hasOwnProperty(key) && typeof this[key]=="function" && key.indexOf("maintenance_") >-1){
                this[key].apply(this, args); // call all maintenance_ preffixed functions
            }
        }
    }
}

exports.maintenanceMan = function(object, name){
    return new MaintenanceMan(object, name);
};