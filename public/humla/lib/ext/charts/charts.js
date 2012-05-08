/**
* Singleton object that locates tables with chart data given bz user and converts them into charts.
*/
var charts = {
    /**
     * True if the script has been already added to the header
     */
    script : false,
    /**
     * An array containing all charts in the presentation
     */
    charts : [],    
    /**
     * Server to be used to load the graph
     */
    server : 0,
    /**
     * Loads all charts in the slide on processing 
     */
    
    processSlide : function(slide){ 
        this.loadElements(slide);   
    },
    /**
     * Adds script to the header
     */
    addScript : function(){
        this.script = true;
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google.com/jsapi';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);

    },
    //enterSlide : function(slide){
    //this.drawChart();
    //},
    /**
     * Locates all appropriate data tables and converts them into charts. Then displays these charts.
     * @param slide that is entered
     */
    loadElements : function(slide){
        try {
            var lists = slide.element.getElementsByTagName("table");
            for (var i = 0; i < lists.length; i++){
                if (lists[i].getAttribute("data-chart")!= null){
                    var img = this.loadGraph(lists[i]);
                    slide.element.replaceChild(img, lists[i]);
                }
            }
        } catch (err){
            console.log("Load error: "+err);
        }
    },
    /**
     * Loads graph from the fiven table element
     * @param element
     */
    loadGraph : function(element){
        /**
        * Class representing a chart.
        * @param element
        */
        function Chart(element){
            this.title = "";
            this.width = "400";
            this.height = "500";
            this.textColor = "101010";
            this.foregroundColor = "121212";
            this.backgroundColor = "EEEEEE";
            this.id = "";
            this.element = element;
            this.type = element.getAttribute("data-chart");
            this.columns = new Array();
            this.rows = new Array();
            this.encodedData = "";
            this.label = "";
            this.showLabels = "true";
            this.min = "0";
            this.max = "10";
            this.colors = new Array();
            this.oriented = "true";
            this.orientation = "horizontal";
            this.stacked="false";
            /**
            * Initializes the chart from attributes of the element.
            */
            this.initialize = function(){
                try{
                    if (this.element.getAttribute("data-title") != null){
                        this.title = this.element.getAttribute("data-title");
                    } 
                    if (this.element.getAttribute("data-vAxis") != null){
                        this.vAxis = this.element.getAttribute("data-vAxis");
                    } 
                    if (this.element.getAttribute("data-hAxis") != null){
                        this.hAxis = this.element.getAttribute("data-hAxis");
                    } 
                    if (this.element.getAttribute("data-width") != null){
                        this.width = this.element.getAttribute("data-width");
                    } 
                    if (this.element.getAttribute("data-height") != null){
                        this.height = this.element.getAttribute("data-height");
                    } 
                    if (this.element.getAttribute("data-max") != null){
                        this.max = this.element.getAttribute("data-max");
                    } 
                    if (this.element.getAttribute("data-min") != null){
                        this.min = this.element.getAttribute("data-min");
                    } 
                    if (this.element.getAttribute("data-foregroundColor") != null){
                        this.foregroundColor = this.element.getAttribute("data-foregroundColor");
                    } 
                    if (this.element.getAttribute("data-backgroundColor") != null){
                        this.backgroundColor = this.element.getAttribute("data-backgroundColor");
                    } 
                    if (this.element.getAttribute("data-textColor") != null){
                        this.textColor = this.element.getAttribute("data-textColor");
                    } 
                    if (this.element.getAttribute("data-showLabels") != null){
                        this.showLabels = this.element.getAttribute("data-showLabels");
                    } 
                    if (this.element.getAttribute("data-oriented") != null){
                        this.oriented = this.element.getAttribute("data-oriented");
                    }
                    if (this.element.getAttribute("data-orientation") != null){
                        this.orientation = this.element.getAttribute("data-orientation");
                    }
                    if (this.element.getAttribute("data-stacked") != null){
                        this.stacked = this.element.getAttribute("data-stacked");
                    }
                    if (this.element.getAttribute("id") != null){
                        this.id = this.element.getAttribute("id");
                    } else {
                        this.id = "chart"+charts.charts.length;
                    }
                } catch(err){
                    console.log("Attribute error: "+err);
                }
                try {
                    for (var i = 0, row; row = this.element.rows[i]; i++) {
                        var firstRow = false;
                        for (var j = 0, col; col = row.cells[j]; j++) {
                            if (col.tagName.toLowerCase() == "th"){
                                firstRow = true;
                            }
                            
                        }
                        if (firstRow){
                            this.addHeader(row);
                        } else {
                            this.addRow(row);
                        }
                        console.log("\n");
                    }
                    this.encode();
                } catch(err){
                    console.log("Data error: "+err);
                }         
            }
            /**
            * Takes a table header and processes it as a set of columns
            * @param row
            */
            this.addHeader = function(row){
                for (var j = 0, col; col = row.cells[j]; j++) {
                    if (col.getAttribute("data-column") != null){
                        this.addColumn(col);
                    }
                }
            }
            /**
            * Takes a table column and stores it into an array
            * @param element
            */
            this.addColumn = function(element){
                try{
                    var column = new Array();
                    column.push(element.getAttribute("data-column"));
                    column.push(element.innerHTML);
                    this.columns.push(column);
                } catch(err){
                    console.log("Error when adding a column: "+err);
                }
            }
            /**
            * Takes a row and stores it into an array
            * @param row
            */
            this.addRow = function(row){
                var header = new Array();
                for (var j = 0, col; col = row.cells[j]; j++) {
                    header.push(col.innerHTML);
                    if (col.getAttribute("data-row") != "label"){                         
                    } else {
                        if (col.getAttribute("data-color")!= null)
                            this.colors.push(col.getAttribute("data-color"));
                        else {                                                     
                            this.colors.push(this.foregroundColor);
                        }
                            
                    }
                }
                this.rows.push(header);
                
            }
            /**
            * Transfroms the data into desired format and returns in encoded form
            */
            this.encode = function(){
                var toEncode = new Array();
                this.label = "";
                var max = 0;
                for (var i = 0; i < this.rows.length; i++){
                    if (this.rows[i][1] > max) max = this.rows[i][1];
                    if (i > 0) this.label += "|";
                    this.label += this.rows[i][0];
                    toEncode.push(this.rows[i][1]);
                }
                this.encodedData = extendedEncode(toEncode, max);
            }
            /**
            * Returns a row in encoded form
            * @param row
            * @return encoded data
            */
            this.encodeLine = function(row){
                var toEncode = new Array();
                for (var i = 1; i < row.length; i++){                  
                    toEncode.push(row[i]);
                }
                return extEncode(toEncode, this.max);
            }
            /**
            * Converts labels into the right form
            * @return labels
            */
            this.getLabels = function(){
                var labels = "&chdl=";
                for (var i = 0; i < this.rows.length; i++){
                    if (i > 0) labels += "|";
                    labels += this.rows[i][0];
                }
                if (this.rows.length > 0)
                    return labels;
                else return "";
            }
            /**
            * Converts data into the right form
            * @return labels
            */
            this.getData = function(){
                
                var data = "&chd=e:";
                for (var i = 0; i < this.rows.length; i++){
                    data += this.encodeLine(this.rows[i]);
                    if (i < (this.rows.length-1)) data+= ",";
                }    
                if (this.rows.length > 0)
                    return data;
                else return "";
            }
            /**
            * Returns data in the bar chart in the right form depending on the attribute orientation being vertical or horizontal
            * @return data
            */
            this.getColumns = function(){
                var data = "";
                if (this.type == "bar" && this.orientation == "vertical") 
                    data = "0:";
                else  data = "1:";
                try {
                    for (var i = 0; i < this.columns.length; i++){
                        if (this.columns[i][0] == "data"){
                            data+="|";
                            data += this.columns[i][1];
                        }
                    }    
                } catch (err){
                    console.log("Sloupce: "+err);
                }
                return data;
            }
            /**
            * Converts given data into an oriented graph format
            * @return data
            */
            this.getOrientedGraph = function(){
                var data = "";
                for (var i = 0; i < this.rows.length; i++){
                    for (var j = 1; j < this.rows[i].length; j++){
                        data += this.rows[i][0];
                        data += "-%3E";
                        data += this.rows[i][j];
                        data += ";";
                    }                        
                }
                return data;
            }
            /**
            * Converts given data into graph format
            * @return data
            */
            this.getGraph = function(){
                var data = "";
                for (var i = 0; i < this.rows.length; i++){
                    for (var j = 1; j < this.rows[i].length; j++){
                        data += this.rows[i][0];
                        data += "--";
                        data += this.rows[i][j];
                        data += ";";
                    }                        
                }
                return data;
            }
            /**
            * Created a bar type from the given data
            * @return type
            */
            this.getBarType = function(){
                var type = "b";
                if (this.orientation == "horizontal"){
                    type += "h";
                } else {
                    type +="v";
                }
                if (this.stacked == "true") {
                    type += "s";
                } else {
                    type += "g";
                }
                console.log(this.stacked+" a " +this.orientation);
                return type;
            }
            /**
            * Created a graph chart img from the given data, it is either directed or undirected
            * @return img
            */
            this.createGraphChart = function(){
                var img = document.createElement('img');
                img.setAttribute("class", "graphChart");
                if (this.oriented == "true")
                    img.src = "https://chart.googleapis.com/chart?cht=gv&chl=digraph{"+this.getOrientedGraph()+"}&chs="+this.width+"x"+this.height;
                else 
                    img.src = "https://chart.googleapis.com/chart?cht=gv&chl=graph{"+this.getGraph()+"}&chs="+this.width+"x"+this.height;
                return img;
            }
            /**
            * Created a pie chart img from the given data
            * @return img
            */
            this.createPieChart = function(){
                var img = document.createElement('img');
                img.setAttribute("class", "pieChart");
                var dimension = "p";
                if (this.type == "pie3d") dimension="p3";
                img.src = "http://"+charts.server+".chart.apis.google.com/chart\n";
                img.src += "?chf=a,s,000000|bg,s,FFFFFF\n";
                img.src += "&chxs=0,000000,11.5\n";
                img.src += "&chxt=x&chs="+this.width+"x"+this.height+"\n";
                img.src += "&cht="+dimension+"\n";
                if (this.colors.length > 0)
                    img.src +="&chco=";
                for (var i = 0; i < this.colors.length; i++){
                    if (i > 0) img.src += ",";
                    img.src+= this.colors[i];
                }
                img.src += "&chd="+this.encodedData+"\n";
                if (this.showLabels == "true") img.src += "&chdl="+this.label+"\n";
                img.src += "&chdlp=r\n";
                img.src += "&chl="+this.label+"\n";
                img.src += "&chma=75,15,15,15|150,150\n";
                img.src += "&chtt="+this.title+"\n";
                img.src += "&chts="+this.textColor+",11.5";
                return img;
            }
            /**
            * Created a line chart img from the given data
            * @return img
            */
            this.createLineChart = function(){
                var img = document.createElement('img');
                img.setAttribute("class", "lineChart");
                
                
                img.src = "http://"+charts.server+".chart.apis.google.com/chart\n";
                img.src += "?chf=bg,s,FFFFFF\n";
                img.src += "&chxl="+this.getColumns();
                
                img.src += "&chxp=1,1,2,3\n";
                img.src += "&chxr=0,"+(this.min)+","+(this.max)+"|1,1,"+(this.columns.length-1)+"\n";
                img.src += "&chxs=1,676767,11.5,0,lt,676767\n";
                img.src += "&chxt=y,x&chs="+this.width+"x"+this.height+"\n";
                img.src += "&cht=lc\n";
                img.src += this.getData();   
                
                if (this.colors.length > 0)
                    img.src +="&chco=";
                for (var i = 0; i < this.colors.length; i++){
                    if (i > 0) img.src += ",";
                    img.src+= this.colors[i];
                }
                
                if (this.showLabels == "true") img.src += this.getLabels();
                img.src += "&chls=1|1\n";
                img.src += "&chma=10,10,10,10|0,5\n";
                img.src += "&chtt="+this.title;
                
                return img;
            }
            /**
            * Created a bar chart img from the given data
            * @return img
            */
            this.createBarChart = function(){
                var img = document.createElement('img');
                img.setAttribute("class", "lineChart");
                
                
                img.src = "http://"+charts.server+".chart.apis.google.com/chart\n";
                img.src += "?chf=bg,s,FFFFFF\n";
                img.src += "&chxl="+this.getColumns();
                
                
                img.src += "&chxr=0,"+(this.min)+","+(this.max)+"|1,1,"+(this.max)+"\n";
                img.src += "&chxs=1,676767,14,0,lt,676767\n";
                img.src += "&chxt=x,y&chs="+this.width+"x"+this.height+"\n";
                img.src += "&cht="+this.getBarType()+"\n";
                img.src += this.getData(); 
                
                if (this.colors.length > 0)
                    img.src +="&chco=";
                for (var i = 0; i < this.colors.length; i++){
                    if (i > 0) img.src += ",";
                    img.src+= this.colors[i];
                }
                
                
                if (this.showLabels == "true") img.src += this.getLabels();
                img.src += "&chls=1|1\n";
                img.src += "&chma=10,10,10,10|0,5\n";
                img.src += "&chtt="+this.title;
                
                return img;
            }
        }
        var chart = new Chart(element);
        
        chart.initialize();
        //Decides which chart to draw according to the "type" parameter
        this.charts.push(chart);
        charts.server++;
        console.log("Vypis: "+charts.server);
        if (charts.server > 9) charts.server = 0;
        console.log("Vypis: "+charts.server);
        if (chart.type == "pie" || chart.type == "pie3d") {
            return chart.createPieChart();
        } else if (chart.type == "line"){
            return chart.createLineChart();
        } else if(chart.type == "graph"){
            return chart.createGraphChart();
        } else if(chart.type == "bar"){
            return chart.createBarChart();
        }
        
        return chart.createPieChart();
    }
}
var simpleEncoding =
'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// This function scales the submitted values so that
// maxVal becomes the highest value.
function simpleEncode(valueArray,maxValue) {
    var chartData = ['s:'];
    for (var i = 0; i < valueArray.length; i++) {
        var currentValue = valueArray[i];
        if (!isNaN(currentValue) && currentValue >= 0) {
            chartData.push(simpleEncoding.charAt(Math.round((simpleEncoding.length-1) *
                currentValue / maxValue)));
        }
        else {
            chartData.push('_');
        }
    }
    return chartData.join('');
}

// Same as simple encoding, but for extended encoding.
var EXTENDED_MAP=
'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.';
var EXTENDED_MAP_LENGTH = EXTENDED_MAP.length;
function extendedEncode(arrVals, maxVal) {
    var chartData = 'e:';

    for(i = 0, len = arrVals.length; i < len; i++) {
        // In case the array vals were translated to strings.
        var numericVal = new Number(arrVals[i]);
        // Scale the value to maxVal.
        var scaledVal = Math.floor(EXTENDED_MAP_LENGTH *
            EXTENDED_MAP_LENGTH * numericVal / maxVal);

        if(scaledVal > (EXTENDED_MAP_LENGTH * EXTENDED_MAP_LENGTH) - 1) {
            chartData += "..";
        } else if (scaledVal < 0) {
            chartData += '__';
        } else {
            // Calculate first and second digits and add them to the output.
            var quotient = Math.floor(scaledVal / EXTENDED_MAP_LENGTH);
            var remainder = scaledVal - EXTENDED_MAP_LENGTH * quotient;
            chartData += EXTENDED_MAP.charAt(quotient) + EXTENDED_MAP.charAt(remainder);
        }
    }

    return chartData;
}
/**
* Encodes gived data to be shown in the graph according to the max value given by the user
* @param arrVals chart data
* @param maxVal max value
* @return chartData
*/
function extEncode(arrVals, maxVal){
    var chartData = '';
    for(i = 0, len = arrVals.length; i < len; i++) {
        var numericVal = new Number(arrVals[i]);
        var scaledVal = Math.floor(EXTENDED_MAP_LENGTH *
            EXTENDED_MAP_LENGTH * numericVal / maxVal);

        if(scaledVal > (EXTENDED_MAP_LENGTH * EXTENDED_MAP_LENGTH) - 1) {
            chartData += "..";
        } else if (scaledVal < 0) {
            chartData += '__';
        } else {
            var quotient = Math.floor(scaledVal / EXTENDED_MAP_LENGTH);
            var remainder = scaledVal - EXTENDED_MAP_LENGTH * quotient;
            chartData += EXTENDED_MAP.charAt(quotient) + EXTENDED_MAP.charAt(remainder);
        }
    }
    return chartData;
}