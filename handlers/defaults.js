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
    res.redirect("/pages/index.html");
});

app.get('/pages/newcourse', function(req,res) {
    res.redirect("/pages/newcourse.html");
});

app.get('/pages/editor/', function(req,res) {
    res.redirect("/pages/editor/index.html");    
});

// Unauthorized
app.get('/401', function(req, res){
     throw new Error("Unauthorized access");
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
    body += "\nManifest not ready yet" //TODO: odebrat
    //TODO: automaticky generovat při spuštění serveru ze všech potřebných souborů
    res.writeHead(200, {
        "Content-Type": "text/cache-manifest"
    });
    res.write(body);
    res.end();
});

 
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

exports.objectToXML = function(object,root, url){
    if(typeof root!="undefined"){
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<"+root+" url=\""+url+" \">"+parseObjectToXML(object, 0)+"</"+root+">";
    }else{
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<data>"+parseObjectToXML(object, 0)+"</data>";    
    }
}

function parseObjectToXML(object, ind){
    var indentation = "";
    var toReturn = '';
    for (var i = 0;  i < ind*3;  i++) {
        indentation = indentation+" ";
    }
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            toReturn = toReturn + indentation+'<'+escapeToXML(key)+'>'+"\n";
            if(typeof(object[key])=='object'){
                var t_ind = ind+1;
                if(object[key].length){
                    toReturn = toReturn+parseArrayToXML(object[key], t_ind ,key);
                }else{
                    toReturn = toReturn+parseObjectToXML(object[key], t_ind);    
                }
                
            }else{
                toReturn = toReturn+indentation+escapeToXML(object[key])+"\n";
            }
            toReturn = toReturn + indentation+'</'+escapeToXML(key)+'>'+"\n";
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
        toReturn = toReturn+indentation+'<'+escapeToXML(string)+'_'+object+'>'+"\n";
        if(typeof(array[object])=='object'){
            if(array[object].length){
                toReturn = toReturn+parseArrayToXML(array[object], t_ind, string);
            }else{
                toReturn = toReturn+parseObjectToXML(array[object], t_ind);
            }
        }else{
            toReturn = toReturn+indentation+escapeToXML(array[object])+"\n";
        }
        toReturn = toReturn + indentation+'</'+escapeToXML(string)+'_'+object+'>'+"\n";
    }
    return toReturn;
}


function escapeToXML(string){
    string = encodeURIComponent(string);
    return string;
}


NotFound.prototype.__proto__ = Error.prototype;