/**
 * @author Vladimir Riha <rihavla1> URL: https://github.com/ladariha
 */


var ctrlDown = false;
var container = new FacetedContainer();
var LIMIT = 5*3600000;
window.onload = function(){
    
    $(document).keydown(function(e)
    {
        e.stopPropagation();
        if (e.keyCode == 17) ctrlDown = true;
    }).keyup(function(e)
    {
        e.stopPropagation();
        if (e.keyCode == 17) ctrlDown = false;
    });
    
    facet_page =1;
    var now = new Date().getTime();
    if(isLocalStorage() && localStorage.getItem("facet-menu")){
        var menu = eval('('+localStorage.getItem("facet-menu")+')');
        if(now-menu.timestamp> LIMIT){
            loadMenu();    
        }else{
            toLoad = menu.items;
            for(var i=0;i<toLoad.length;i++){
                if(toLoad[i].type==="boolean")
                    loadBooleanInit(toLoad[i],i);
                else
                    loadValueInit(toLoad[i],i);
            }    
        }
    }else{
        loadMenu();
    }
};

function loadMenu(){
    var request = new XMLHttpRequest();
    request.open("GET", "/search/facets", true);
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                var resp = eval('(' + request.responseText + ')');
                toLoad = resp.types;
                var o = {};
                o.timestamp  = new Date().getTime();
                o.items = toLoad;
                for(var i=0;i<toLoad.length;i++){
                    if(toLoad[i].type==="boolean")
                        loadBooleanInit(toLoad[i],i);
                    else
                        loadValueInit(toLoad[i],i);
                }
                if(isLocalStorage())
                    localStorage.setItem("facet-menu", JSON.stringify(o));
            }else{
                document.getElementById('msg').innerHTML='Cannot load  menu';
            }
        }
    };
    request.send(null);  
}

function isLocalStorage(){
    try{
        localStorage.getItem('facet-menu');
        return true;
    }catch(e){
        return false;
    }
}

function FacetedContainer(){
    this.criteria = [];
    
    this.addCriteriaReplace = function(key, value, type){
        for(var i=0;i<this.criteria.length;i++){
            if(this.criteria[i].schemaproperty == key)
            {
                if(type==="boolean"){
                    this.criteria[i].value = (value.toLowerCase()==="yes")?true:false;    
                }else{
                    this.criteria[i].value = value;
                }
                return;
            }
        }
        
        
        if(type==="boolean"){
            this.criteria.push({
                schemaproperty: key, 
                value:  (value.toLowerCase()==="yes")?true:false, 
                type: type
            });
            
        }else{
            this.criteria.push({
                schemaproperty: key, 
                value: value, 
                type: type
            });
        }
    };
    
    this.addCriteria= function(key, value, type){      
        if(type==="boolean"){
            this.criteria.push({
                schemaproperty: key, 
                value:  (value.toLowerCase()==="yes")?true:false, 
                type: type
            });
            
        }else{
            this.criteria.push({
                schemaproperty: key, 
                value: value, 
                type: type
            });
        }
    };
    
    this.removeCriteriaAll= function(key, value, type){
        for(var i=0;i<this.criteria.length;i++){
            if(this.criteria[i].schemaproperty === key)
            {
                this.criteria.splice(i,1);
            }
        }
    };
    
    this.removeCriteriaPrecise = function(key, value, type){
        for(var i=0;i<this.criteria.length;i++){
            var bTrue = this.criteria[i].value===true && value=="Yes";
            var bFalse = this.criteria[i].value===false && value=="No";
            if(this.criteria[i].schemaproperty == key && (this.criteria[i].value== value || bTrue || bFalse))
            {
                this.criteria.splice(i,1);
                return;
            }
        }
    };
    
    this.performQuery = function(){
      
        var q = {};
        q.booleanQueries = [];
        q.valueQueries = [];
        
        for(var i=0;i<this.criteria.length;i++){
            if(this.criteria[i].type === "boolean"){
                q.booleanQueries.push({
                    type: this.criteria[i].schemaproperty,
                    value: this.criteria[i].value
                });
            }else{
                q.valueQueries.push({
                    type: this.criteria[i].schemaproperty,
                    value: this.criteria[i].value
                });
            }   
        }

        var request = new XMLHttpRequest();
        request.open("POST", '/search/complexquery?page='+facet_page, true);
        request.setRequestHeader("Content-type", "application/json");
        request.onreadystatechange = function(){
            if (request.readyState==4) {
                if(request.status==200){
                    $("html, body").animate({
                        scrollTop: 0
                    }, "slow");                       
                    var object = eval('(' + request.responseText + ')');
                    $('#facet_results').empty();//= '';
                    if(object.results.length>0){
                        $('#count').text(" | "+object.results.length+" results | ")
                        var content = "<ul>";
                        for(var j=0;j<object.results.length;j++){
                            var _a = object.results[j].slideid.split("_");
                            var link = _a[0]+"/"+_a[1]+".html#/"+_a[2]+"/v1";
                            var title = (typeof object.results[j].title!="undefined" )?object.results[j].title:"";
                            content+="<li><a href=\"http://127.0.0.1:1338/data/slides/"+link+"\">"+_a[0].toUpperCase()+" - "+_a[1].toUpperCase()+": "+title+"</a></li>";    
                        }
                        content+="</ul>"
                        $('#facet_results').append(content);
                    
                        if(object.next){
                            $('#facet_next').show();
                        }else{
                            $('#facet_next').hide();
                        }
                    
                        if(object.previous){
                            $('#facet_prev').show();
                        }else{
                            $('#facet_prev').hide();
                        }
                    }else{
                        $('#count').text(" | "+object.results.length+" results | ")
                    }
                }else{
                    document.getElementById('msg').innerHTML=request.status+": "+request.statusText;    
                }
            }
        };
        request.send(JSON.stringify(q));
    };
    
    this.contains =function(shortname){
        for(var i=0;i<this.criteria.length;i++){
            if(this.criteria[i].schemaproperty == shortname)
                return true;
        }
        return false;
    };
    
    
}

function goBack(){
    facet_page--;
    container.performQuery();
}

function goNext(){
    facet_page++;
    container.performQuery();
}

function loadBooleanInit(object, index){
   
    var element = document.createElement('div'); 
    var content = "<span class=\"facet_title\" onClick=\"expand(this);\">"+object.property+"</span><img class=\"facet_img\" onClick=\"expand(this);\" src=\"./img/left.png\" title=\"Show options\" alt=\"Show options\"/>";
    content+="<ul class=\"facet_menu\"><li class=\"facet_choice\" onClick=\"toggleFilter("+index+", this);\" >Yes</li>";
    content+="<li class=\"facet_choice\" onClick=\"toggleFilter("+index+", this);\" >No</li></ul>";
    element.innerHTML = content;
    document.getElementById("facet_section").appendChild(element);
    $(".facet_menu").hide();
}

function expand(element){
    $(element).parent().find(".facet_menu").each(function(){
        $(this).slideToggle(500);
    });
    if(element.tagName.toLowerCase()=== "img"){
        if($(element).attr('src').indexOf("left")>0){
            $(element).attr('src', './img/down.png');    
            $(element).attr('title', "Hide options");
            $(element).attr('alt', "Hide options");
        }else{
            $(element).attr('src', './img/left.png');   
            $(element).attr('title', "Show options");
            $(element).attr('alt', "Show options");
        }
    }else{
        $(element).next("img").each(function(){
            if($(this).attr('src').indexOf("left")>0){
                $(this).attr('src', './img/down.png');    
                $(this).attr('title', "Hide options");
                $(this).attr('alt', "Hide options");
            }else{
                $(this).attr('src', './img/left.png');   
                $(this).attr('title', "Show options");
                $(this).attr('alt', "Show options");
            }
        });
    }
    

}

function loadValueInit(object, index){
    var now = new Date().getTime();
    if(isLocalStorage() && localStorage.getItem("facet-menu-"+object.shortName)){
        var menu = eval('('+localStorage.getItem("facet-menu-"+object.shortName)+')');
        if(now-menu.timestamp> LIMIT){
            loadValueReq(object, index);
        }else{
            renderData(object, menu.data, index);
        }
    }else{
        loadValueReq(object, index);
    }
}

function renderData(object, data, index){
    var element = "<div><span class=\"facet_title\" onClick=\"expand(this);\">"+object.property+"</span><img class=\"facet_img\" onClick=\"expand(this);\" src=\"./img/left.png\" title=\"Show options\" alt=\"Show options\"/><ul class=\"facet_menu\">";
    for(var a in data){  
        element+="<li class=\"facet_choice\" onClick=\"toggleFilter("+index+", this);\" >"+data[a]._id+"</li>";    
    }
                
    element+="</ul><ul class=\"facet_menu\"><li onClick=\"\" id=\""+index+"\"><span class=\"facet_label\">Value:</span> <input id=\"type_"+index+"\" class=\"facet_smallinput\" type=\"text\" /></li></ul></div>";
    $("#facet_section").append(element);
    var timer;
    var prevVal = '';
    $("#type_"+index).keyup(function(){
        var ref = this;
        clearTimeout(timer);
        timer =setTimeout(function(){
            facet_page = 0;
            var property = toLoad[index].shortName;
            if($(ref).val().length>1){
                $(ref).parent().find(">:first-child").attr('class', 'facet_selected');
                container.removeCriteriaPrecise(property, prevVal);
                prevVal = $(ref).val();
                container.addCriteria(property,$(ref).val() ,toLoad[index].type);
                container.performQuery();  
            }               
            if($(ref).val().length<1){
                container.removeCriteriaPrecise(property, prevVal);
                $(ref).parent().attr('class', '');
                $(ref).parent().find(">:first-child").attr('class', '');
                container.performQuery();
            }
                       
        },500);
    });
    $(".facet_menu").hide();
}

function loadValueReq(object, index){
    var request = new XMLHttpRequest();
    request.open("GET", "/search/top/"+encodeURIComponent(object.shortName), true);
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                var resp = eval('(' + request.responseText + ')');
                renderData(object, resp, index);
                var o = {};
                o.timestamp  = new Date().getTime();
                o.data = resp;
                if(isLocalStorage())
                    localStorage.setItem("facet-menu-"+object.shortName, JSON.stringify(o));
            }else{
                document.getElementById('msg').innerHTML='Cannot load '+course;
            }  
        }
    }
    request.send(null);     
}

function toggleFilter(index, element){
    facet_page = 0;
    var property = toLoad[index].shortName;
    if(!ctrlDown){
        if($(element).attr("class")!== "facet_selected"){// not selcted
            container.removeCriteriaAll(property, $(element).text() ,toLoad[index].type);
            var parent = $(element).parent();
            $(parent).find('li').each(function(index,el){
                if(el!== element && $(el).children().length<1)
                    $(el).attr("class","facet_choice");
            });
            container.addCriteriaReplace(property, $(element).text() ,toLoad[index].type);
            $(element).attr("class", "facet_selected");
        //    $(element).toggleClass("facet_selected");
         
        }else{
            var parent = $(element).parent();
            var choices = 0;
            var selected = 0;
            $(parent).find('li').each(function(index,el){
                choices++;
                if($(this).attr('class')==="facet_selected")
                    selected++;
            });
            
            if(selected===choices && choices>1){
                $(parent).find('li').each(function(index,el){
                    $(el).attr("class","facet_choice");
                });
                $(element).attr("class", "facet_selected");
                container.removeCriteriaAll(property, $(element).text() ,toLoad[index].type);
                container.addCriteriaReplace(property, $(element).text() ,toLoad[index].type);
            }else{
                $(element).attr("class", "facet_choice");
                var parent = $(element).parent();
                $(parent).find('li').each(function(index,el){
                    $(el).attr("class","facet_choice");
                });
                container.removeCriteriaAll(property, $(element).text() ,toLoad[index].type);
            }
        }
    }else{
        if($(element).attr("class")=== "facet_selected"){
            $(element).attr("class", "facet_choice");   
            container.removeCriteriaPrecise(property, $(element).text() ,toLoad[index].type);
        }else{
            $(element).attr("class", "facet_selected");
            container.addCriteria(property, $(element).text() ,toLoad[index].type);
        }
    }
    container.performQuery();
}