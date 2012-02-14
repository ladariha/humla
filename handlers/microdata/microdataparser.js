var jsdom = require('jsdom');

exports.items = function(html, callback){
    var    window = jsdom.jsdom().createWindow();
    jsdom.jQueryify(window, "../../public/lib/jquery-1.7.min.js", function() {
        window.jQuery('html').append(html);
        var  $ = window.jQuery;
        var baseUrl='';
        $('html').find('base').each(function(){
            if($(this).attr('href').length)
                baseUrl=($(this).attr('href'));
            
        });
        var microdataParser = microdata('html',  $, baseUrl);
        callback(microdataParser);
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

function getItems(types, $, _selector) {
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


function findItems(types, $){
    return getItems(types, $, types);
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
function microdata(selector, $, baseUrl) {


    function getObject(item, memory) {

        var result = {};
        var types = tokenList('itemtype',$, item);
        if (types.length)
            result.type = $(types).toArray();
        if (itemId($, item, baseUrl))
            result.id = itemId($, item, baseUrl);
        result.properties = {};
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
            });
        });
        return result;
    }

    var result = {};
    result.items = [];
    var $items =  findItems(selector, $, selector);
    for(var i = 0;i <$items.length;i++){
        if (itemScope($, $items[i])){
            result.items.push(getObject($items[i], []));
        }
    }

    return result;
};