

var mongoose = require("mongoose"); 
var User = mongoose.model("User"); // Model toho commentu, můžu instanciovat


var openid = require('./openid');
var url = require('url');
var querystring = require('querystring');

var extensions = [new openid.UserInterface(), 
                  new openid.SimpleRegistration(
                      {
                        "nickname" : true, 
                        "email" : true, 
                        "fullname" : true,
                        "dob" : true, 
                        "gender" : true, 
                        "postcode" : true,
                        "country" : true, 
                        "language" : true, 
                        "timezone" : true
                      }),
                  new openid.AttributeExchange(
                      {
                        "http://axschema.org/contact/email": "required",
                        "http://axschema.org/namePerson/friendly": "required",
                        "http://axschema.org/namePerson": "required"
                      })];

var relyingParty = new openid.RelyingParty(
    'http://localhost:1338/verify', // Verification URL (yours)
    null, // Realm (optional, specifies realm for OpenID authentication)
    false, // Use stateless verification
    false, // Strict mode
    extensions); // List of extensions to enable and include

app.get('/authenticate', function(req, res) {   
}
    var parsedUrl = url.parse(req.url);
        if(parsedUrl.pathname == '/authenticate')
        { 
          // User supplied identifier
          var query = querystring.parse(parsedUrl.query);
          var identifier = query.openid_identifier;

          // Resolve identifier, associate, and build authentication URL
          relyingParty.authenticate(identifier, false, function(error, authUrl)
          {
            if(error)
            {
              res.writeHead(200, { 'Content-Type' : 'text/plain; charset=utf-8' });
              res.end('Authentication failed: ' + error.message);
            }
            else if (!authUrl)
            {
              res.writeHead(200, { 'Content-Type' : 'text/plain; charset=utf-8' });
              res.end('Authentication failed');
            }
            else
            {
              res.writeHead(302, { Location: authUrl });
              res.end();
            }
          });
        }
        else if(parsedUrl.pathname == '/verify')
        {
          // Verify identity assertion
          // NOTE: Passing just the URL is also possible
          relyingParty.verifyAssertion(req, function(error, result)
          {
            res.writeHead(200, { 'Content-Type' : 'text/plain; charset=utf-8' });

            if(error)
            {
              res.end('Authentication failed: ' + error.message);
            }
            else
            {
              // Result contains properties:
              // - authenticated (true/false)
              // - answers from any extensions (e.g. 
              //   "http://axschema.org/contact/email" if requested 
              //   and present at provider)
              res.end((result.authenticated ? 'Success :)' : 'Failure :(') +
                '\n\n' + JSON.stringify(result));
            }
          });
        }
        else
        {
            // Deliver an OpenID form on all other URLs
            res.writeHead(200, { 'Content-Type' : 'text/html; charset=utf-8' });
            res.end('<!DOCTYPE html><html><body>'
                + '<form method="get" action="/authenticate">'
                + '<p>Login using OpenID</p>'
                + '<input name="openid_identifier" />'
                + '<input type="submit" value="Login" />'
                + '</form></body></html>');
        }


/*




app.post('/auth/register', function(req, res){
    var data = req.body;

    // Check if username is in use
    db.get(data.username, function(err, doc) {
        if(doc) {
            res.render('index', {
                flash: 'Username is in use'
            });

        // Check if confirm password does not match
        } else if(data.password != data.confirm_password) {
            res.render('index', {
                flash: 'Password does not match'
            });

        // Create user in database
        } else {
            delete data.confirm_password;
            db.save(data.username, data,
                function(db_err, db_res) {
                    res.render('index', {
                        flash: 'User created'
                    });
                });
        }
    });
});


app.post('/login', function(req, res){
    var data = req.body;

    // Check if there is a corresponding user in db
    db.get(data.username, function(err, doc){
        if(!doc) {
            res.render('index', {
                flash: 'No user found'
            });

        // Check if passwords match
        } else if(doc.password != data.password) {
            res.render('index', {
                flash: 'Wrong password'
            });

        // User is logged in
        } else {
            res.render('index', {
                flash: 'Logged in!'
            });
        }
    });
});


module.exports.authenticate = function(login,password,callback) {
    db.get('users/'+login,function(err,doc){
        if(err) {
            log(err.message);
            callback(null);
            return;
        }
        if(doc == null) {
            callback(null);
            return;
        }
        if(doc.password == password) {
            callback(doc);
            return;
        }
        log('retrieved: ' + doc);
        callback(null);
    });
}

*/