/*
    Humla - HTML5 presentation environment
    Tomas Vitvar, tomas@vitvar.com
    
    core humla classes

    Slide, Section, View, Extension
*/

/**
 * Slide Class
 * @constructor
 */
Slide = function(element, footer, section, number) {

    // html element of the slide
    this.element = element;
    
    // section to which the slide belongs
    this.section = section;
    
    // sequential number of this slide
    this.number = number;
    
    // save the original class name for later restore
    this.classNameOriginal = this.element.className;
    
    // the footer if exist, it may be null if not exist
    this.footer = footer;    
    
    // true if the slide was processed
    this.processed = false;  
    
    // initialize the counter for asynchronous objects on this slides
    // loaded through extensions
    this.async_cntr = {};
    for (var i = 0; i < humla.controler.extensions.list.length; i++)
        this.async_cntr[humla.controler.extensions.list[i].config.id] = 0;
    
    // title of this slide; in section/hgroup
    try {
        //this.name = humla.utils.xpath('header/@text', this.element).stringValue;
        this.title = this.element.getElementsByTagName("hgroup")[0].
        getElementsByTagName("h1")[0].innerText;
    } catch(e) {
        this.title = "n/a";
    }

    // adds a new class name to the list of slide's classes
    this.addClass = function(classStr) {
        classStr = humla.utils.str2array(classStr);
        var cls = " " + this.element.className + " ";
        for (var i = 0, len = classStr.length, c; i < len; ++i) {
            c = classStr[i];
            if (c && cls.indexOf(" " + c + " ") < 0) {
                cls += c + " ";
            }
        }
        this.element.className = humla.utils.trim(cls);
        
        // we assume that visibility of slide can change so we process the slide here
        this.process();
    };
    
    // removes a class from the list of slide's classes
    this.removeClass = function(classStr) {
        var cls;
        if (classStr !== undefined) {
            classStr = humla.utils.str2array(classStr);
            cls = " " + this.element.className + " ";
            for (var i = 0, len = classStr.length; i < len; ++i) {
                cls = cls.replace(" " + classStr[i] + " ", " ");
            }
            cls = humla.utils.trim(cls);
        } else {
            cls = "";
        }
        if (this.element.className != cls) {
            this.element.className = cls;
        }
    };
            
    this.updateFooter = function() {
        if (this.footer)
            this.element.appendChild(this.footer.cloneNode(true));
    };
    
    // reset the slide to its original definition
    this.reset = function() {
        this.element.className = this.classNameOriginal;
        this._yOffset = null;
        this.element.removeAttribute("style");
    };
         
    this.process = function() {
        var obj = this;
        if (!this.processed) {
            humla.controler.callExtensionsInterface("processSlide", this,
                function() { // on success
                    obj.processed = true;
                },
                function(e) { // on error
                    humla.reportError(obj.formatError(e));
                });
        }
    };
    
    this.formatError = function(message) {
        return "<a href=\"" + this.url + "\">Slide " + 
        this.number + "</a>: " + message;
    };
    
    this.error = function(message) {
        throw this.formatError(message);
    };
    
    // set footer for this slide
    this.updateFooter();
    
    // get the url of the slide (hash)
    this.__defineGetter__('url', function() {
        return "#!/" + (this.element.id ? this.element.id : this.number);
    });    

};

/**
 * Section Class
 * @constructor
 */
Section = function(element, parent) {
    // html element of the section
    // check if the element is the section element
    if (element.nodeName.toLowerCase() !== "section" && element.nodeName.toLowerCase() !== "body")
        throw "The element must be a section or body element!";
    this.element = element;
    
    // title of this section; titles in section/header
    try {
        //this.name = humla.utils.xpath('header/@text', this.element).stringValue;
        if (element.nodeName.toLowerCase() == "section")
            this.name = this.element.getElementsByTagName("header")[0].innerText;
        else
            this.name = null;
    } catch(e) {
        this.name = "n/a";
    }
    
    // parent section of this section
    this.parent = parent;
    
    // array of slides that belong to this section
    this.slides = [];
    
    // array of sub-sections that balong to this section
    this.sections = [];
    
};

/**
 * View Class
 * @constructor
 */
var View = function(config, keys, baseDir) {

    // config of this view
    this.config = config;
    
    // keys that can be used in this view
    this.keys = keys;
    
    // base directory of this view to load view scripts
    this.baseDir = baseDir;
    
    // the view controler
    // set external from the controler
    this.controler = null;
    
    this._objref = null;
    // get the current slide of the view
    this.__defineGetter__('objref', function() {
        if (this._objref === null && window[this.config.object]) {
            this._objref = window[this.config.object];
            this._objref.__proto__ = this;
        } 
        return this._objref;
    });

    this.executeViewInterface = function(method, params) {
        var toContinue = true;
        var returned = true;
        if (this.objref && this.objref[method]){
            returned = this.objref[method].call(this.objref, params);
            if (returned != null && returned == false) toContinue = false;
        }
                
        // try to execute the same method on extensions
        returned = humla.controler.callExtensionsInterface(method, params, null, null); 
        if (returned != null && returned == false) toContinue = false;
        return toContinue;
    };
    
    // current slide
    this._currentSlide = null;

    // get the current slide of the view
    this.__defineGetter__('currentSlide', function() {
        if (this._currentSlide === null) {
            var state = this.controler.parseState();
            this._currentSlide = state.slideNum;            
        } 
        return this._currentSlide;
    });

    // set the current slide of the view
    this.__defineSetter__('currentSlide', function(value) {
        this._currentSlide = value;
        this.controler.setState();
    });
    
    this.activateCurrentSlide = function() {
        this.executeViewInterface('enterSlide', humla.slides[this.currentSlide - 1]);
        humla.slides[this.currentSlide - 1].process();
    };

    /* view activation/deactivation */
    
    this.enter = function(slideNo) {
        if (this.controler !== null) {
            humla.reset();
            if (slideNo)
                this.currentSlide = slideNo;
            else
                this.currentSlide = 1;
            humla.utils.activateStyle(this.baseDir + config.style.src, config.style.media);
            this.controler.fullscreen = false;
            this.executeViewInterface('enterView', this);            
            
            // Call enterMenu on all extensions
            humla.controler.callExtensionsInterface("processMenu", humla.menu, function(){
                humla.menu.show();
            }, null);        
            
            this.activateCurrentSlide();        
        } else
            throw "Unexpected Error: controler has not been set on the presentation view!";
    };
    
    this.leave = function() {
        this.executeViewInterface('leaveSlide', humla.slides[this.currentSlide - 1]);    
        humla.utils.deactivateStyle(this.baseDir + config.style.src);
        this.executeViewInterface('leaveView', this);
    };

    /* handling key input */
    
    this.keydown = function(event) {
        // disable key handling for textarea and input field
        var element;
        if(event.target) element=event.target;
        else if(event.srcElement) element=event.srcElement;
        if(element.nodeType==3) element=element.parentNode;
        if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
        
        // function to check a key is in the array of keys
        var containsKey = function(key, keys) {
            if (keys)
                for (var i = 0; i < keys.length; i++)
                    if (keys[i] == key)
                        return true;
            return false;
        };
        
        
        
        // switching view
        for (var i = 0; i < humla.controler.views.length; i++) {
            var m = humla.controler.views[i];
            if (containsKey(event.keyCode, this.keys["view" + m.config.id])) {
                humla.controler.activateView(i);
                return;
            }
        }

        // toggle debug information on/off
        if (containsKey(event.keyCode, this.keys.tdebug))
            humla.controler.debugInfo = !humla.controler.debugInfo;

        // press "spare" key - testing purposes
        if (containsKey(event.keyCode, this.keys.spare))
            humla.showMessage(window.status, false, true);

        // toggle error messages on/off
        else if (containsKey(event.keyCode, this.keys.terrs))
            humla.toggleErrors();

        // navigation within this view
        else if (containsKey(event.keyCode, this.keys.next))
            this.gotoNext();
            
        else if (containsKey(event.keyCode, this.keys.prev))
            this.gotoPrevious();
        
        else if (containsKey(event.keyCode, this.keys.menu))
            humla.menu.toggle();
        
        else if (containsKey(event.keyCode, this.keys.index))
            humla.controler.getExtensionById("slideindex").callExtensionInterface("showIndex",humla.slides[this.currentSlide - 1]);
    };
    
    /* navigation */

    this.goto = function(slideNo) {
        if (slideNo - 1 < humla.slides.length && slideNo > 0) {
            this.executeViewInterface('leaveSlide', humla.slides[this.currentSlide - 1]);
            this.currentSlide = slideNo;
            this.activateCurrentSlide();       
        }
    };

    this.gotoNext = function() {
        if (this.currentSlide - 1 < humla.slides.length - 1) {
            var leave = this.executeViewInterface('leaveSlide', humla.slides[this.currentSlide - 1]);   
            if (leave) this.currentSlide = this.currentSlide + 1;
            this.activateCurrentSlide();        
        }
    };

    this.gotoPrevious = function() {
        if (this.currentSlide - 1 >= 1) {
            this.executeViewInterface('leaveSlide', humla.slides[this.currentSlide - 1]);
            this.currentSlide = this.currentSlide - 1;
            this.activateCurrentSlide();        
        }
    };

};

/**
 * Extension Class
 * @constructor
 */
var Extension = function(config, baseDir) {
    // constants
    this.LOADING_FINISHED = "Loading finished";
    this.LOADING_INPROGRESS = "Loading";
    this.LOADING_ERROR = "Loading error";    
    
    // configuration of extension
    this.config = config;
    
    // base directory of this extension to load view scripts
    this.baseDir = baseDir;    
    
    this.id = config.id;
    
    this._status = null;
    
    if (config.styles)
        for (var i = 0; i < config.styles.length; i++)
            humla.utils.activateStyle(this.baseDir + config.styles[i].src, config.styles[i].media); 
    
    this._objref = null;
    // get the reference to this object
    this.__defineGetter__('objref', function() {
        if (this._objref === null && window[this.config.object]) {
            // this will link this extension object with extension object defined in config.object
            // that is, this extension object will become a parent of config.object
            // config.object must exist (must be declared in extension javascript)
            this._objref = window[this.config.object];
            this._objref.__proto__ = this;
        } 
        return this._objref;
    });
    
    this.getParam = function(element, name, defvalue) {
        var v = element.getAttribute(name);
        if (!v)
            v = defvalue;
        element.removeAttribute(name);
        return v;
    };
    
    this.callExtensionInterface = function(method, params) {
        if (this.objref && this.objref[method])
            var returned = this.objref[method].call(this.objref, params);
        if (returned != null && returned == false) return false;
        else return true;
    };
    
    
};


/**
 * Menu Class
 * @constructor
 */
var Menu = function(config) {
    
    this.hidden = true;
    this.active_layer = "";
    
    // Cached elements
    this.nav = null;    
    this.layer = null;
    this.nav_close = null;
    this.nav_menu = null;
    
    // Default tabs
    this.tabs = {
        "views":{  // there's only one default tab - Views
            name:"Views",
            show_layer:true,
            html:"<h1>Views</h1>"
        +"<div class='button' onclick='humla.controler.activateView(0);humla.menu.showLayer(\"menu-views\",true);'>Slideshow</div>"
        +"<div class='button' onclick='humla.controler.activateView(1);humla.menu.showLayer(\"menu-views\",true);'>Presentation</div>"
        +"<div class='button' onclick='humla.controler.activateView(2);humla.menu.showLayer(\"menu-views\",true);'>Overview</div>"
        +"<div class='button' onclick='humla.controler.activateView(3);humla.menu.showLayer(\"menu-views\",true);'>Print</div></div>"
        }        
    };

    
    
    // Class initialization   
    this.init = function() {
        this.nav = humla.utils.document.createElement("nav");           
        this.layer = humla.utils.document.createElement("div");                                      
        
        this.nav.innerHTML = "<div class='toggle' onclick='humla.menu.toggle()'>Menu"
        //this.nav.innerHTML = "<div style='width:100%;text-align:center; color:white;' class='toggle'>Menu"
        +"<span id='menu-close' class='menu-close-button' style='display:none'>X</span></div>"
        +"<ul id='menu' style='display:none; height:0px'></ul>";    
        this.nav.className = "lower";
        humla.utils.documentBody.insertBefore(this.nav, humla.utils.documentBody.childNodes[0]);
        humla.utils.documentBody.insertBefore(this.layer, humla.utils.documentBody.childNodes[0]);        
                
        this.nav_close = humla.utils.document.getElementById("menu-close");
        this.nav_menu = humla.utils.document.getElementById("menu");
        
    }
    
    // Toggle menu 
    this.toggle = function() {
        this.hidden = !this.hidden;
        if(this.hidden) {
            this.nav_menu.style.display = "none";
            this.nav_close.style.display = "none";
            this.nav.className = "lower";
        //this.showMenu(true);
        } else {
            this.nav_menu.style.display = "block";
            this.nav_close.style.display = "block";
            this.nav.className = "";
        //this.hideMenu();
        }
    }
    
    // Add new tab to tabs object
    this.addTab = function(id, tab) {
        this.tabs[id]=tab;        
    }    
    
    
    // Called after all extensions loaded and their processMenu called
    this.show = function() {        
        var menu_items="",layer_items="";
        for(var tab in this.tabs) {
            if(this.tabs.hasOwnProperty(tab)) {
                if (this.tabs[tab].show_layer) {
                    menu_items+="<li id='menu-item-"+tab+"' title='"+this.tabs[tab].name+"' onclick='humla.menu.showLayer(\"menu-"+tab+"\");'>"+this.tabs[tab].name+"</li>";
                    layer_items+="<div id='menu-"+tab+"' class='menu-layer' style='display:none;'>"
                    +"<span class='menu-close-button' onclick='humla.menu.showLayer(\"\",true);'>X</span>"
                    +this.tabs[tab].html+"</div>";
                } else{
                    menu_items+="<li id='menu-item-"+tab+"' title='"+this.tabs[tab].name+"' onclick='humla.menu.callCallback(\""+tab+"\");'>"+this.tabs[tab].name+"</li>";
                }
            }
        }
        this.nav_menu.innerHTML = menu_items;
        this.layer.innerHTML = layer_items;        
    }
     
    // Hide all layers and show one with id
    this.showLayer= function(id, hide) {        
        var layers = this.layer.childNodes;            
        for(var i = 0;i<layers.length;i++) {            
            layers[i].style.display = !hide && id == layers[i].id ? "block" : "none";                           
            
        }                
    }   
    
    // call callback function of one tab (without showing menu layer)
    this.callCallback = function(id) {
        this.tabs[id].cb();        
    }
    
    // run menu init
    this.init();
    
//this.hideMenu();
};



/**
 * User Class
 * @constructor
 */
var User = function(check) {
    this.username = null;
    this.email = null;
    this.logged = false;
    
    // if true, then do user lookup
    this.init = function(check) {
        if (check) this.isLogged(null);        
    }
    
    // Check if user is logged, calls cb(err,data)
    // If no callback is provided return last checked
    this.isLogged = function (cb) {        
        if(!cb) return this.logged;
        // TODO: tu adresu vybrat dynamicky
        humla.utils.readJSONData(humla.endpoint+"/auth/user", function(data,status,err){
            if(!err && status == 200) {                
                this.email = data.email;
                this.username = data.username;
                this.logged = true;
                if(cb) cb(null, data);
            } else { //status == 401 or fail
                this.email = null;
                this.username = null;
                this.logged = true;
                if(cb) cb(err ? err : true);
            }            
        });
    }       
    
    this.init(check);
}
    
    