/**
 * Default handlers
 *  - default route
 *  - errors
 *  - sessions
 * 
 */


// default route
app.get('/', function(req,res) {
    res.redirect("/pages/index.html");
});

app.get('/pages/humla', function(req,res) {
    res.redirect("/pages/humla.html");
});

app.get('/pages/newcourse', function(req,res) {
    res.redirect("/pages/newcourse.html");
});

app.get('/pages/editor/', function(req,res) {
    res.redirect("/pages/editor/index.html");    
});


// not found
app.get('/404', function(req, res){
    throw new NotFound;
});

// server error
app.get('/500', function(req, res){
    throw new Error("D'oh!");
});


// redirecting HACK   //: Todo zjistit, která ta routa to začla redirektit a opravit na ní
app.get('/*//', function(req, res){
    res.redirect("/404");
});

// manifest - offline usage
app.get('/cache.manifest',function manifest(req,res) {
    var body = 'CACHE MANIFEST\n#'+(new Date());
    body += "\nError" //TODO: odebrat
    //TODO: automaticky generovat při spuštění serveru ze všech potřebných souborů
    res.writeHead(200, {
        "Content-Type": "text/cache-manifest"
    });
    res.write(body);
    res.end();
});

    
// Sessions
app.get('/sessions/new', function(req, res) {
    res.render('sessions/new.jade', {
        locals: {
            user: new User()
        }
    });
});

app.post('/sessions', function(req, res) {
    User.findOne({
        email: req.body.user.email
    }, function(err, user) {
        if (user && user.authenticate(req.body.user.password)) {
            req.session.user_id = user.id;

            // Remember me
            if (req.body.remember_me) {
                var loginToken = new LoginToken({
                    email: user.email
                });
                loginToken.save(function() {
                    res.cookie('logintoken', loginToken.cookieValue, {
                        expires: new Date(Date.now() + 2 * 604800000), 
                        path: '/'
                    });
                    res.redirect('/documents');
                });
            } else {
                res.redirect('/documents');
            }
        } else {
            req.flash('error', 'Incorrect credentials');
            res.redirect('/sessions/new');
        }
    }); 
});

app.del('/sessions', loadUser, function(req, res) {
    if (req.session) {
        LoginToken.remove({
            email: req.currentUser.email
        }, function() {});
        res.clearCookie('logintoken');
        req.session.destroy(function() {});
    }
    res.redirect('/sessions/new');
});

// default functions

// by https://github.com/alexyoung/nodepad/blob/master/app.js
function authenticateFromLoginToken(req, res, next) {
    var cookie = JSON.parse(req.cookies.logintoken);

    LoginToken.findOne({
        email: cookie.email,
        series: cookie.series,
        token: cookie.token
    }, (function(err, token) {
        if (!token) {
            res.redirect('/sessions/new');
            return;
        }

        User.findOne({
            email: token.email
        }, function(err, user) {
            if (user) {
                req.session.user_id = user.id;
                req.currentUser = user;

                token.token = token.randomToken();
                token.save(function() {
                    res.cookie('logintoken', token.cookieValue, {
                        expires: new Date(Date.now() + 2 * 604800000), 
                        path: '/'
                    });
                    next();
                });
            } else {
                res.redirect('/sessions/new');
            }
        });
    }));
}

function loadUser(req, res, next) {
    if (req.session.user_id) {
        User.findById(req.session.user_id, function(err, user) {
            if (user) {
                req.currentUser = user;
                next();
            } else {
                res.redirect('/sessions/new');
            }
        });
    } else if (req.cookies.logintoken) {
        authenticateFromLoginToken(req, res, next);
    } else {
        res.redirect('/sessions/new');
    }
}

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


exports.returnError = function(code, msg, res){
    res.writeHead(code, {
        'Content-Type': 'text/plain'
    });
    res.write(msg);
    res.end();
}

exports.objectToXML = function(object){
    return parseObjectToXML(object, 0)
}

function parseObjectToXML(object, ind){
    var indentation = "";
    var toReturn = '';
    for (var i = 0;  i < ind*3;  i++) {
        indentation = indentation+" ";
    }
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            toReturn = toReturn + indentation+'<'+encodeURIComponent(key)+'>'+"\n";
            if(typeof(object[key])=='object'){
                var t_ind = ind+1;
                if(object[key].length){
                    toReturn = toReturn+parseArrayToXML(object[key], t_ind ,key);
                }else{
                    toReturn = toReturn+parseObjectToXML(object[key], t_ind);    
                }
                
            }else{
                toReturn = toReturn+indentation+encodeURIComponent(object[key])+"\n";
            }
            toReturn = toReturn + indentation+'</'+encodeURIComponent(key)+'>'+"\n";
        }
    }
    return toReturn;   
}

function parseArrayToXML(array, ind, string){
    var indentation = "";
    var toReturn = '';
    for (var i = 0;  i < ind*3;  i++) {
        indentation = indentation+" ";
    }
    var t_ind = ind+1;
    for(var object in array){
        toReturn = toReturn+indentation+'<'+encodeURIComponent(string)+'_'+object+'>'+"\n";
        if(typeof(array[object])=='object'){
            if(array[object].length){
                toReturn = toReturn+parseArrayToXML(array[object], t_ind, string);
            }else{
                toReturn = toReturn+parseObjectToXML(array[object], t_ind);
            }
        }else{
            toReturn = toReturn+indentation+encodeURIComponent(array[object])+"\n";
        }
        toReturn = toReturn + indentation+'</'+encodeURIComponent(string)+'_'+object+'>'+"\n";
    }
    return toReturn;
}





NotFound.prototype.__proto__ = Error.prototype;