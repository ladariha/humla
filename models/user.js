/**
 * User
 * ~~~~
 * MongoDB Entity
 * 
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var passport = require('passport');
var crypto = require('crypto');

var shasum = crypto.createHash('sha1'); // SHA1 password hash (sha1 from OpenSSL)

var UserSchema = new Schema({
    userID: ObjectId,
    username: String,
    name: String,
    email: {
        type: String
        //validate: /b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/,
        //unique: true
    },
    hash: {         // Password hash
        type: String         
    },  
    openid: String, // google OpenID
    dateLogged  : { type: Date }
    
});


// following is for local strategy


UserSchema.virtual('password')
    .get(function () {
        return this._password;
    })
    .set(function (password) {
        this._password = password;
        //var salt = this.salt = bcrypt.genSaltSync(10);
        this.hash = shasum.update(password).digest("hex");
    });

/** Verify user Password
 *  @callbacks with one boolean 
 */
UserSchema.method('verifyPassword', function(password, callback) {  
    callback( shasum.update(password).digest("hex") === this.hash);
});

UserSchema.static('authenticate', function(email, password, callback) {
    this.findOne({
        email: email
    }, function(err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(null, false);
        }
        user.verifyPassword(password, function(passwordCorrect) {        
            if (!passwordCorrect) {
                return callback(null, false);
            }
            return callback(null, user);
        });
    });
});






mongoose.model('User', UserSchema);  

