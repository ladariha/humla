var jsdom = require('jsdom');
/**
 * Finds all microdata items (or only type restricted by <code>type</code> parameter) and after
 * finding them calls function specified by callback parameter
* @param presentationURL URL address of explored presentation
* @param html html source code of the presentation
* @param type (optional) of which itemtype items should be returned
* @param callback callback function that is called after all items are found
 */
exports.items = function(presentationURL, html, type, callback){
    var    window = jsdom.jsdom().createWindow();
    jsdom.jQueryify(window, "../../public/lib/jquery-1.7.min.js", function() {
        window.jQuery('html').append(html);
        var  $ = window.jQuery;
        var baseUrl='';
        $('html').find('base').each(function(){
            if($(this).attr('href').length)
                baseUrl=($(this).attr('href'));
        });
        var microdataParser = microdata($, baseUrl);
        
        if(typeof type!="undefined"){
            var microdataTyped = {};
            microdataTyped.items = [];
        
            for(var i=0;i<microdataParser.items.length;i++){
                finalize(microdataParser.items[i]);
            }
                
            function finalize(microitem){
                if(microitem.properties){ // if item contains other items
                    for(var key in microitem.properties){
                        for(var j=0; j< microitem.properties[key].length; j++){
                            finalize(microitem.properties[key][j]);        
                        }
                    }
                }

                if(microitem.type){
                    for(var j=0; j<microitem.type.length;j++){ // iterate all itemtypes
                        if(microitem.type[j] && microitem.type[j].toLowerCase() === type.toLowerCase()){
                            microdataTyped.items.push(microitem);
                            j = microitem.type.length+1;
                        }
                    }
                }
            }
            callback(microdataTyped);
        }else{
            callback(microdataParser);    
        }
        
        
        
    });   
}


/**
 * Finds all microdata items of type <code>http://microformats.org/profile/hcard</code> parameter) and after
 * finding them call function specified by callback parameter
* @param presentationURL URL address of explored presentation
* @param html html source code of the presentation
* @param type (optional) of which itemtype items should be returned
* @param callback callback function that is called after all items are found
 */
exports.vcards = function(presentationURL, html, type,callback){
    var    window = jsdom.jsdom().createWindow();
    jsdom.jQueryify(window, "../../public/lib/jquery-1.7.min.js", function() {
        window.jQuery('html').append(html);
        var  $ = window.jQuery;
        var baseUrl='';
        $('html').find('base').each(function(){
            if($(this).attr('href').length)
                baseUrl=($(this).attr('href'));
            
        });
        var microdataParser = microdata( $, baseUrl, true);
        var microdataTyped = {};
        microdataTyped.items = [];
        
        for(var i=0;i<microdataParser.items.length;i++){
            finalize(microdataParser.items[i]);
        }
                
        function finalize(microitem){
            if(microitem.type){
                for(var j=0; j<microitem.type.length;j++){ // iterate all itemtypes
                    if(microitem.type[j] && microitem.type[j].toLowerCase() === "http://microformats.org/profile/hcard"){
                        microdataTyped.items.push(microitem);
                        j = microitem.type.length+1;
                    }
                }
            }
        }
        var toReturn = "";
        
        for(var i=0;i<microdataTyped.items.length;i++) // each item
            toReturn+=(vcard(microdataTyped.items[i], $, presentationURL));
        
        callback(toReturn);
    });   
}

/**
 * Returns all itemscope items in given presentation (or slide if slideNumber is given). Be aware that it could return one item several times.
 * That is because it have to returned items both itemscope and itemprop attribute and also items with only itemscope. The point is that a itemscope can
 * start in different slide and have some property (itemprop) on another slide. And to enable proper faceted browsing you want to be able to navigate to the slide
 * that actually contains the property, not to slide where some itemscope begins.
 * @param html html source code of the presentation
* @param type (optional) of which itemtype items should be returned
* @param callback callback function that is called after all items are found
* @param slideNumber (optional) number of slide that should be searched
 *
 */
exports.itemsFaceted = function(html, type, callback, slideNumber){
    
    var    window = jsdom.jsdom().createWindow();
    jsdom.jQueryify(window, "../../public/lib/jquery-1.7.min.js", function() {
        window.jQuery('html').append(html);
        var  $ = window.jQuery;
        var baseUrl='';
        $('html').find('base').each(function(){
            if($(this).attr('href').length)
                baseUrl=($(this).attr('href'));
        });
        var microdataParser = microdataFaceted($, baseUrl, slideNumber);
        if(typeof type!="undefined"){
            var microdataTyped = {};
            microdataTyped.items = [];
        
            for(var i=0;i<microdataParser.items.length;i++){
                finalize(microdataParser.items[i]);
            }
                
            function finalize(microitem){
                if(microitem.properties){ // if item contains other items
                    for(var key in microitem.properties){
                        for(var j=0; j< microitem.properties[key].length; j++){
                            finalize(microitem.properties[key][j]);        
                        }
                    }
                }

                if(microitem.type){
                    for(var j=0; j<microitem.type.length;j++){ // iterate all itemtypes
                        if(microitem.type[j] && microitem.type[j].toLowerCase() === type.toLowerCase()){
                            microdataTyped.items.push(microitem);
                            j = microitem.type.length+1;
                        }
                    }
                }
            }
            callback(microdataTyped);
        }else{
            callback(microdataParser);    
        }
    });   
}

/*
 * FOLLOWING CODE IS MODIFIED VERSION OF MicrodataJS (more information here: https://gitorious.org/microdatajs).
 * The code was modified to be working with jsdom module on node.js
 */



//Permission is hereby granted, free of charge, to any person obtaining
//a copy of this software and associated documentation files (the
//"Software"), to deal in the Software without restriction, including
//without limitation the rights to use, copy, modify, merge, publish,
//distribute, sublicense, and/or sell copies of the Software, and to
//permit persons to whom the Software is furnished to do so, subject to
//the following conditions:
//
//The above copyright notice and this permission notice shall be
//included in all copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
//LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
//OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
//WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


  
// http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-time-string
function validTimeStringLength(s) {
    var m = /^(\d\d):(\d\d)(:(\d\d)(\.\d+)?)?/.exec(s);
    if (m && m[1]<=23 && m[2]<=59 && (!m[4] || m[4]<=59))
        return m[0].length;
    return 0;
}

function isValidTimeString(s) {
    return s && validTimeStringLength(s) == s.length;
}

// http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#number-of-days-in-month-month-of-year-year
function daysInMonth(year, month) {
    if (month==1 || month==3 || month==5 || month==7 ||
        month==8 || month==10 || month==12) {
        return 31;
    } else if (month==4 || month==6 || month==9 || month==11) {
        return 30;
    } else if (month == 2 && (year%400==0 || (year%4==0 && year%100!=0))) {
        return 29;
    } else {
        return 28;
    }
}

// http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-date-string
function validDateStringLength(s) {
    var m = /^(\d{4,})-(\d\d)-(\d\d)/.exec(s);
    if (m && m[1]>=1 && m[2]>=1 && m[2]<=12 && m[3]>=1 && m[3]<=daysInMonth(m[1],m[2]))
        return m[0].length;
    return 0;
}

function isValidDateString(s) {
    return s && validDateStringLength(s) == s.length;
}

// http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#valid-global-date-and-time-string
function isValidGlobalDateAndTimeString(s) {
    var skip = validDateStringLength(s);
    if (skip && s[skip] == 'T') {
        s = s.substr(skip+1);
        skip = validTimeStringLength(s);
        if (skip) {
            s = s.substr(skip);
            if (s == 'Z')
                return true;
            var m = /^[+-](\d\d):(\d\d)$/.exec(s);
            if (m && m[1]<=23 && m[2]<=59)
                return true;
        }
    }
    return false;
}



function splitTokens(s) {
    if (s && /\S/.test(s))
        return s.replace(/^\s+|\s+$/g,'').split(/\s+/);
    return [];
}

/**
 *
 * Returns all top items inside slide div. Note that it does not return the slide item itself. In opposite of simple getItems() 
 * the top items are all itemsThis is intended because if it should return slide item 
 * then all items like code/image/etc would have to be properties of the slide item. But it would be limitation because one would have to use item of type
 * Slide and also add all images/code blocks/tables etc. to the slide item as properties. This is not part of the Slide schema because it is too restrictive.
 */
function getItemsFaceted($, slideNumber){
    var items = [];
    var iterator = 0;
    $('html').find('.slide').each(function(){
        if(typeof slideNumber=="undefined" || iterator === slideNumber)
        {
            var slideid = $(this).attr('data-slideid');
            
            if($(this).attr('itemscope').length){ //  the entire div with class attribute "slide" is itemscope => it is the only top level item 
                
                var item = {};
                item.type = $(this).attr('itemtype')+"/dsdsdsd";
                item.container = this;
                item.properties = [];
                if($(this).attr('itemref').length)
                    item.refs = $(this).attr('itemref').split(" ");   
                var a  = {};
                a.item = $(this);
                a.slideid = slideid;
                items.push(a);
                
            }else{ // any itemscope (note that it causes duplications - one nested itemscope (aka itemprop with itemscope) is returned as property of some item and also as a single item

                $(this).find('*[itemscope]').each(function(){ // because this returns EVERYTHING in jsdom :(
                    if($(this).attr('itemscope').length) //&& (!$(this).attr('itemprop').length || $(this).parent().attr('data-slideid')=== slideid) 
                    {        
                        var item = {};
                        item.type = $(this).attr('itemtype')+"/dsdsdsd";
                        item.container = this;
                        item.properties = [];
                        if($(this).attr('itemref').length)
                            item.refs = $(this).attr('itemref').split(" ");   
                        var a  = {};
                        a.item = $(this);
                        a.slideid = slideid;
                        items.push(a);
                    }
                });
            }     
        }
        iterator++;
    });
    return items;
}


function getItems($) {
    var items = [];
    $('*[itemscope]').each(function(){ // because this returns EVERYTHING in jsdom :(
        // FIXME if element has itemscope="" then it is not found!!! There is no workaround right now
        // because $(this).attr('itemscope') returns string of length 0 in both situations:
        // - if element has attr itemscope=""
        // - and if element doesn't have attr itemscope
        // => no way to find difference...'
        if($(this).attr('itemscope').length && !$(this).attr('itemprop').length) 
        {        
            var item = {};
            item.type = $(this).attr('itemtype');
            item.container = this;
            item.properties = [];
            if($(this).attr('itemref').length)
                item.refs = $(this).attr('itemref').split(" ");   
            items.push($(this));
        }
    });
    return items;
}

function ancestor(node) {
    while (node.parentNode)
        node = node.parentNode;
    return node;
}

/*
 * It only reflects BASE element not relative URL addresses
 */
function resolve(elm, attr,baseUrl) {
    if(elm && elm.attr(attr).length){
        var url = baseUrl+elm.attr(attr);
        if (!url.length)
            return '';
        return url;
    }
    return "";
}

function tokenList(attr, $, selector) {
    var list = splitTokens($(selector).attr(attr));
    list.contains = function(token) {
        return $.inArray(token, $(selector)) != -1;
    };
    return list;
    
}

function itemValue($, selector, baseUrl) {
    var elm = $(selector);
    
    if (!elm.attr('itemprop').length)
        return null;
    if (itemScope($, selector)) {
        return elm; // or a new jQuery object?
    }
    switch (elm.prop('tagName').toUpperCase()) {
        case 'META':
            return $(selector).attr('content') || '';
        case 'AUDIO':
        case 'EMBED':
        case 'IFRAME':
        case 'IMG':
        case 'SOURCE':
        case 'TRACK':
        case 'VIDEO':
            return baseUrl+($(selector).attr('src') || '');
        case 'A':
        case 'AREA':
        case 'LINK':
            return baseUrl+ ($(selector).attr('href') || '');
        case 'OBJECT':
            return baseUrl+($(selector).attr('data') || '');
        case 'DATA':
            return $(selector).attr('value') || '';
        default:
            return $(selector).text();
    }
}

function properties($, selector,name) {
    var props = [];

    function crawl(root) {
        
        var toTraverse = [root];

        function traverse(node) {
            
            for (var i = 0; i < toTraverse.length; i++) {
                if (toTraverse[i] == node){
                    toTraverse.splice(i--, 1);
                }
            }
            var $node = $(node);
            if (node != root) {
                var names = tokenList('itemprop', $, node);
                if (names.length) {
                    if (!name || names.contains(name))
                        props.push(node);
                }
                if (itemScope($, node))
                    return;
            }
            var rr =$node.children();
            for(var gt = 0; gt < rr.length;gt++){
                traverse($(rr[gt]));    
            };
        }

        //var context = ancestor(root);
        var tokens = tokenList('itemref',$, root);
        for(var tk =0; tk< tokens.length;tk++){
            var $ref = $('#'+tokens[tk]);
            if ($ref)
                toTraverse.push($ref);
        }

        $.unique(toTraverse);
        var cc= 0;
        while (toTraverse.length) {
            traverse(toTraverse[0]);
            cc++;
        }
    }

    if (itemScope($, selector))
        crawl($(selector));

    return $(props);
}


function findItems($){ 
    return getItems($);
}

function findItemsFaceted($, slideNumber){
    return getItemsFaceted($, slideNumber);
}

function itemScope($, selector){
    return $(selector).attr('itemscope').length;
}

function itemType($, selector){
    return tokenList('itemtype', $, selector);
}

function itemId($, selector, baseUrl){
    return resolve(selector, 'itemid',baseUrl);
}

function itemProp($, selector){
    return   tokenList('itemprop', $, selector);
}

function itemRef($, selector){
    return  tokenList('itemref', $, selector);
}

// http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#json
function microdata($, baseUrl, extraTagName) {


    function getObject(item, memory) {
        
        var result = {};  
        
        var types = tokenList('itemtype',$, item);
        if (types.length)
            result.type = $(types).toArray();
        if (itemId($, item, baseUrl))
            result.id = itemId($, item, baseUrl);
        result.properties = {};
        if(typeof extraTagName!="undefined")
            result.propertiesTagNames = {};
        properties($, item).each(function(i, elem) {
            
            var value;
            if (itemScope($, elem)) {
                if ($.inArray(elem, memory) != -1) {
                    value = 'ERROR';
                } else {
                    memory.push(item);
                    value = getObject(elem, memory);
                    memory.pop();
                }
            } else {
                value = itemValue($, elem, baseUrl);
            }
            $.each(tokenList('itemprop',$, elem), function(i, prop) {
                if (!result.properties[prop])
                    result.properties[prop] = [];
                result.properties[prop].push(value);
                if(typeof extraTagName!="undefined"){
                    if(!result.propertiesTagNames[prop]){
                        result.propertiesTagNames[prop] = [];
                    }
                    result.propertiesTagNames[prop].push($(elem).prop('tagName'));
                }
            });
        });
        return result;
    }

    var result = {};
    result.items = [];
    var $items =  findItems($);
    for(var i = 0;i <$items.length;i++){
        if (itemScope($, $items[i])){
            result.items.push(getObject($items[i], []));
        }
    }

    return result;
};

/**
 * For faceted purposes. It doesn't return standard microdata items
 */
function microdataFaceted($, baseUrl, slideNumber) {

    function getObject(objecta, memory) {
        
        var result = {};
        result.slideid = objecta.slideid;
        var item = objecta.item;
        var types = tokenList('itemtype',$, item);
        if (types.length)
            result.type = $(types).toArray();
        if (itemId($, item, baseUrl))
            result.id = itemId($, item, baseUrl);
        result.properties = {};
        if(typeof extraTagName!="undefined")
            result.propertiesTagNames = {};
        properties($, item).each(function(i, elem) {
            
            var value;
            if (itemScope($, elem)) {
                if ($.inArray(elem, memory) != -1) {
                    value = 'ERROR';
                } else {
                    memory.push(item);
                    var a = {};
                    a.slideid = result.slideid;
                    a.item = elem;
                    value = getObject(a, memory);
                    memory.pop();
                }
            } else {
                value = itemValue($, elem, baseUrl);
            }
            $.each(tokenList('itemprop',$, elem), function(i, prop) {
                if (!result.properties[prop])
                    result.properties[prop] = [];
                result.properties[prop].push(value);
                if(typeof extraTagName!="undefined"){
                    if(!result.propertiesTagNames[prop]){
                        result.propertiesTagNames[prop] = [];
                    }
                    result.propertiesTagNames[prop].push($(elem).prop('tagName'));
                }
            });
        });
        return result;
    }

    var result = {};
    result.items = [];
    var $items =  findItemsFaceted( $,  slideNumber);
    for(var i = 0;i <$items.length;i++){
        if (itemScope($, $items[i].item)){
            result.items.push(getObject($items[i], []));
        }
    }

    return result;
};


// http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#conversion-to-vcard
function vcard(vcardItem, $, baseUrl) {
    
    function extract($vcard, memory) {
        
        var output = '';
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#add-a-vcard-line
        function addLine(type, params, value) {
            var line = '';
            line += type.toUpperCase();
            for (var i=0; i<params.length; i++) {
                line += ';';
                line += params[i].name;
                line += '=';
                line += params[i].value;
            }
            line += ':';
            line += value;
            var maxLen = 75;
            while (line.length > maxLen) {
                output += line.substr(0, maxLen);
                line = line.substr(maxLen);
                output += '\r\n ';
                maxLen = 74;
            }
            output += line;
            output += '\r\n';
        }
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#escaping-the-vcard-text-string
        function escapeString(value, chars) {
            var re = new RegExp('(['+(chars||'\\\\,;')+'])', 'g');
            return value.replace(re, '\\$1').replace(/\r\n|\r|\n/g, '\\n');
        }
        addLine('BEGIN', [], 'VCARD');
        addLine('PROFILE', [], 'VCARD');
        addLine('VERSION', [], '3.0');
        addLine('SOURCE', [], baseUrl);
        //        addLine('NAME', [], escapeString(baseUrl));
        
        if ($vcard.id)
            addLine('UID', [], escapeString($vcard.id));

        for (var key in $vcard.properties) { // all properties for given microdata item
            if ($vcard.properties.hasOwnProperty(key)) {
                var $prop = $vcard.properties[key];

                for (var key2 in $prop) {
                    // key2 = 0 $prop[key2]=Jack Bauer, key is fn
                    var name = key;
                    var params = [];
                    var value;
                    
                    function addParam(n, v) {
                        params.push({
                            name:n,
                            value:v
                        });
                    }
                    function addTypeParam(val) {
                        if(typeof val!="undefined" && typeof val!="object" 
                            && /^[0-9A-Za-z]*$/.test(val)){
                            addParam('TYPE',val);
                        }
                    }
                    
                    function escapeProps(values) {
                        if(typeof values!="undefined"){
                            var a =[];
                            for(var b=0;b<values.length;b++){
                                if(typeof values[b]!="object"){
                                    a.push(escapeString(values[b]));
                                }
                            }
                            return a.join(',');
                        }
                        return "";
                    }
                    
                    function escapeFirstProp(value) {
                        return (typeof value!="undefined" && value.length > 0 && typeof value!="object") ? escapeString(value) : '';
                    }

                    if (typeof $prop[key2]=="object") {
                        if (name == 'n') {
                            value = escapeFirstProp($prop[key2].properties['family-name'][0])+';'+
                            escapeFirstProp($prop[key2].properties['given-name'][0])+';'+
                            escapeFirstProp($prop[key2].properties['additional-name'][0])+';'+
                            escapeFirstProp($prop[key2].properties['honorific-prefix'][0])+';'+
                            escapeFirstProp($prop[key2].properties['honorific-suffix'][0]);
                        } else if (name == 'adr') {
                            
                            value = escapeProps($prop[key2].properties['post-office-box'])+';'+
                            escapeProps($prop[key2].properties['extended-address'])+';'+
                            escapeProps($prop[key2].properties['street-address'])+';'+
                            escapeFirstProp($prop[key2].properties['locality'][0])+';'+
                            escapeFirstProp($prop[key2].properties['region'][0])+';'+
                            escapeFirstProp($prop[key2].properties['postal-code'][0])+';'+
                            escapeFirstProp($prop[key2].properties['country-name'][0]);
                        
                            if(typeof $prop[key2].properties['type']!="undefined" && $prop[key2].properties['type'].length>0)
                                addTypeParam($prop[key2].properties['type'][0]);
                            
                        } else if (name == 'org') {
                            value = escapeFirstProp($prop[key2].properties['organization-name'][0]);
                            for(var unit in $prop[key2].properties) {
                                var val = $prop[key2].properties[unit];
                                if(unit === "organization-unit"){
                                    for(var k=0;k<val.length;k++){
                                        if(typeof val[k]!="object")
                                            value+=';'+escapeString(val[k]);
                                    }       
                                }
                            }   
               
                        } else if (name == 'agent' && $prop[key2].type.length && $prop[key2].type.indexOf('http://microformats.org/profile/hcard')>-1 ) {// && $subitem.itemType().contains(vcardURI)
                            if(memory.indexOf($prop[key2])!=-1){
                                value = 'ERROR';
                            }else{
                                memory.push($vcard);
                                value = escapeString(extract($prop[key2], memory));
                                memory.pop();
                                
                            }
                            addParam('VALUE', 'VCARD');
                        } else {
                            // the property's value is an item and name is none of the above
                            value = escapeFirstProp($prop[key2].properties['value'][0]);
                            if(typeof $prop[key2].properties['type']!="undefined" && $prop[key2].properties['type'].length>0)
                                addTypeParam($prop[key2].properties['type'][0]);
                        }
                    } else {
                        // the property's value is not an item
                        value = $prop[key2];
                        var tag =$vcard.propertiesTagNames[key][0];// $prop.get(0).tagName.toUpperCase();
                        // http://www.whatwg.org/specs/web-apps/current-work/multipage/microdata.html#url-property-elements
                        if (/^A|AREA|AUDIO|EMBED|IFRAME|IMG|LINK|OBJECT|SOURCE|TRACK|VIDEO$/.test(tag)) {
                            addParam('VALUE', 'URI');
                        } else if (tag == 'TIME') {
                            if (isValidDateString(value)) {
                                addParam('VALUE', 'DATE');
                            } else if (isValidGlobalDateAndTimeString(value)) {
                                addParam('VALUE', 'DATE-TIME');
                            }   
                        }
                        value = escapeString(value, name=='geo'?'\\\\,':'\\\\,;');
                    }
                    addLine(key, params, value);
                }
            }
        }
  
        addLine('END', [], 'VCARD');
        return output;
    }

    return extract(vcardItem, []);
}
