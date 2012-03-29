/**
 * Authentication & Login
 * 
 * @author Petr Mikota <bubersson> URL: https://github.com/bubersson
 */

var mongoose = require("mongoose"); 
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var User = mongoose.model("User"); 

// SETUP GOOGLE OpenID strategy
passport.use(new GoogleStrategy({
    returnURL: config.server.domain+":"+config.server.port+'/auth/google/return', ///return', 
    realm: config.server.domain+":"+config.server.port+'/',
    profile: true
},
function(identifier, profile, done) {
    //console.log("RECEIVED GOOGLE RESPONSE");      
    findOrCreate(identifier,profile, function (err, user) {        
        done(err, user);
    });
}
));

// Redirect the user to Google for authentication.  When complete, Google
// will redirect the user back to the application at
// /auth/google/return
app.get('/auth/google', passport.authenticate('google'));




// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
//app.get('/auth/google/return', function(req,res,next) {
app.get('/auth/google/return', function(req,res,next) {
    //console.log("X");
    passport.authenticate('google', function(err, user, info) {                
        //console.log("X1");
        if (err || !user) { 
            return res.redirect("back"); // TODO: tohle se nepovede, pokud nejsem přihlášen
        }
        req.logIn(user, function(err) {                       
            return res.redirect("back");            
        });
    })(req, res, next);
});

//Get User email //TODO: je to teď dost pitomé, udělat portál dynamicky
app.get('/auth/user', function(req,res) {  
    //console.log("A1");
    if (req.isAuthenticated()) { 
        //console.log("A");
        var user = {
            'email': req.user && req.user.email
        };        
        res.writeHead(200);
        res.write(JSON.stringify(user));
        res.end();
        console.log(JSON.stringify(user));
    } else {
        res.writeHead(401);        
        res.end("User is not authenticated!");
        console.log("User not logged");        
    }    
});

// Delete user session entry
app.all('/logout', function(req, res){
    req.logOut();  
    console.log("Logged out");
    res.writeHead(200);    
    res.end("Logged out");
});
    



// Find or Create user field in db
function findOrCreate(openid, profile, callback) {
    //TEST ... pak smazat
    //console.log(JSON.stringify(profile));
    
    User.findOne({
        openid: openid
    }, function(err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {            
            var nu = new User();
            nu.openid = openid;
            nu.name = profile.displayName;
            nu.email = profile.emails[0].value;            
            nu.dateLogged = new Date();
            
            nu.save(function(err) {
                if(err) {
                    console.log("ERR");                    
                    return callback(err);
                }
                console.log("New User Saved to DB: "+openid);
                return callback(null, nu);
            });            
        } else {      
            return callback(null, user);
        }
      
    });
}

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


/*

// SETUP PASSPORT LOCALSTRATEGY
passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Unknown user' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Invalid password' });
      }
      return done(null, user);
    });
  }
));



app.post('/login', passport.authenticate('local'), function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` property contains the authenticated user.
    console.log("LOGGED");
  });
  
  */