/**
 * User
 * ~~~~
 * MongoDB Entity
 * 
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var UserSchema = new Schema({
    userID: ObjectId,
    email: {
            type: String, 
            validate: /b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/
        },
    username: String,
    password: String,
    facebook_id: String,
    dateLogged  :  {
        type: Date
    }
    
});

mongoose.model('User', UserSchema);  



/*
 Model.define('User',{

   collection : 'test_user', // (optional) if not present uses the model name instead.

   // defines your data structure
   types: {
     _id : Object, // if not defined, Mongoose automatically defines for you.
     username: String,
     first : String,
     last : String,
     bio: {
       age: Number
     }
   },

   indexes : [
     'username',
     'bio.age',
     [['first'],['last']] // compound key indexes
   ],

   static : {}, // adds methods onto the Model.
   methods : {}, // adds methods to Model instances.

   setters: { // custom setters
     first: function(v){
       return v.toUpperCase();
     }
   },

   getters: { // custom getters
     username: function(v){
       return v.toUpperCase();
     },

     legalDrinkingAge : function(){
       return (this.bio.age >= 21) ? true : false;
     },

     first_last : function(){ // custom getter that merges two getters together.
       return this.first + ' ' + this.last;
     }
   }
 });
 
 */