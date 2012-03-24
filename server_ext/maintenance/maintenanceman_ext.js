/**
 * @author Vladimir Riha <rihavla1> URL: https://github.com/ladariha
 */

/**
 * MaintenanceMan is a function ("class") designed to perform maintein operations on/with given object.
 * Every function which name starts with "maintenance_" will be called when method run is invoked over 
 * the MaintenanceMan. The run method can be called with or without arguments. If any arguments are 
 * passed to run method, then these arguments will be available to all "maintenance_" methods as well.
 * You can create your own "maintenance_" methods that should be called.
 * @param object object that is available to all methods (access via this.object)
 * @param name name of the instance of MaintenanceMan
 * @param dispose boolean if true then this function will be called having the object as argument
 */
function MaintenanceMan(object, name, dispose){
    this.object  = object;
    this.limit = 0;
    this.name = name;
    this.counter = 0;
    this.dispose = dispose;
    this.callback = dispose;

    this.notify = function(){
        this.counter++;
        if(this.counter === this.limit)
        {
            try{
                if(typeof this.dispose!="undefined"){
                    this.dispose(this.object);   
                }   
            }catch(e){
                console.error(this.name+": Unable to dispose - undefined dispose method");
            }
        }
    }
   
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

exports.maintenanceMan = function(object, name, dispose){
    return new MaintenanceMan(object, name, dispose);
};
