var toLoad =     [
{
    property: "Slide: Importance",
    shortName: "Slide_Importance",
    type: "value",
    url_simple: "/api/facets/Slide_Importance"
},
{
    property: "Slide: Keyword",
    type: "value",
    shortName: "Slide_Keyword",
    url_simple: "/api/facets/Slide_Keyword"
},
{
    property: "Slide: Type",
    type: "value",
    shortName: "Slide_Type",
    url_simple: "/api/facets/Slide_Type"
},
{
    property: "Google Books: Author",
    type: "value",
    shortName: "Slideindex_Gbook_Author",
    url_simple: "/api/facets/Slideindex_Gbook_Author"
},
{
    property: "Google Books: Category",
    type: "value",
    shortName: "Slideindex_Gbook_Category",
    url_simple: "/api/facets/Slideindex_Gbook_Category"
},
{
    property: "Google Drawing",
    type: "boolean",
    shortName: "Slideindex_Gdrawing",
    url_simple: "/api/facets/Slideindex_Gdrawing"
},
{
    property: "Github Code Snippet",
    type: "boolean",
    shortName: "Slideindex_Github",
    url_simple: "/api/facets/Slideindex_Github"
}
];
var container = new FacetedContainer();

window.onload = function(){
    for(var i=0;i<toLoad.length;i++){
        if(toLoad[i].type=="boolean"){
            loadBooleanInit(toLoad[i],i);
        }
            
        else
            loadValueInit(toLoad[i],i);
    }
};

function FacetedContainer(){
    this.criteria = [];
    
    this.addCriteria = function(key, value, type){
        for(var i=0;i<this.criteria.length;i++){
            if(this.criteria[i].schemaproperty == key)
            {
                this.criteria[i].value = value;
                return;
            }
        }
        
        this.criteria.push({
            schemaproperty: key, 
            value: value, 
            type: type
        });
    }
    
    this.removeCriteria = function(key){
        for(var i=0;i<this.criteria.length;i++){
            if(this.criteria[i].key === key)
                delete this.criteria[i];
        }
    }
    
    this.contains =function(shortname){
        for(var i=0;i<this.criteria.length;i++){
            console.log("CR"+this.criteria[i].schemaproperty+" | "+shortname);
            if(this.criteria[i].schemaproperty == shortname)
                return true;
        }
        return false;
    }
    
    
}
function loadBooleanInit(object, index){
   
    var element = document.createElement('div'); 
   
   
    var content = "<span class=\"facet_title\">"+object.property+"</span>";
    content+="<ul><li onClick=\"toggleFilter("+index+", this);\" >Yes</li>";
    content+="<li onClick=\"toggleFilter("+index+", this);\" >No</li></ul>";
    element.innerHTML = content;
    document.getElementById("facet_section").appendChild(element);
}
function loadValueInit(object, index){
    var request = new XMLHttpRequest();
    request.open("GET", "/api/facets/top/"+encodeURIComponent(object.shortName), true);
    request.onreadystatechange = function(){
        if (request.readyState==4) {
            if(request.status==200){
                var resp = eval('(' + request.responseText + ')');
                
                var element = "<div><span class=\"facet_title\">"+object.property+"</span><ul>";
                for(var a in resp){
                 
                    element+="<li onClick=\"toggleFilter("+index+", this);\" >"+resp[a]._id+"</li>";    
                }
                
                element+="</ul></div>";
                $("#facet_section").append(element);
                
            }else{
                document.getElementById('msg').innerHTML='Cannot load '+course;
            }  
        }
    }
    request.send(null);     
}



function toggleFilter(index, element){
    var property = toLoad[index].shortName;
    container.addCriteria(property, $(element).text() ,toLoad[index].type);
    console.log("==");
    console.log(container);
}