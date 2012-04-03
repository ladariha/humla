/**
 * Tests Extension
 * ~~~~~~~~~~~~~~~~~~
 * get test data from slide and return answers.
 * Format:
 * Inside <div class="slide test"> put:
 *<div class="question">
 *  <h2>Do you like this test?</h2>
 *  <ul class="answers">
 *    <li class="true">I like it</li>
 *    <li class="false">I hate it</li>                   
 *  </ul>
 *</div> 
 *<div class="question">.... </div>
 */

var ex_tests =  {
    // My variables
    results: [],   
    // Functions
    testsClick: null,
    testsConfirm: null,
    
    
    processSlide : function(slide) {
    
        // create test slide from its data
        if (slide.element.className.indexOf("test") != -1) {
                  
                       
            
            console.log("RESULTS: "+this.results);
            
            // Parse Questions and Answers
            var qs = slide.element.getElementsByClassName("question");
            var i,j,k, q, nodes, ans, text, right;
            var question;
            var answers = [];
            for(i=0; i< qs.length;i++) {
                q = qs[i];
                if(q.hasChildNodes()) {
                    nodes = q.children; 
                    for(j=0;j<nodes.length;j++) {
                        if (nodes[j].nodeName === "H2" || nodes[j].nodeName === "H3") {
                            question = humla.utils.trim(nodes[j].innerText);                            
                        } else if (nodes[j].nodeName === "UL" && nodes[j].className.indexOf("answers") != -1) {
                            if(nodes[j].hasChildNodes()) {
                                ans = nodes[j].children;
                                answers = [];
                                for(k=0;k<ans.length;k++) {
                                    if (ans[k].nodeName === "LI") { // tohle by tu ani nemuselo bejt
                                        text = humla.utils.trim(ans[k].innerText);
                                        right = ans[k].className.indexOf("right") != -1 || ans[k].className.indexOf("true") != -1;
                                        answers.push({
                                            "text":text,
                                            "right":right,
                                            "selected":false
                                        });
                                    }
                                }
                            }
                        }
                    }                    
                    this.results.push({
                        "num":i,
                        "question":question,
                        "answers":answers
                    });
                }
            }            
            
            // switch the state of answer
            this.testsClick = function(elm) {
                var checked = elm.className.indexOf("checked") != -1 ;
                var val = elm.title.split(";");
                elm.className = checked ? humla.utils.trim(elm.className.replace("checked","")) : elm.className+" checked";                
                ex_tests.results[val[0]].answers[val[1]].selected = !checked;                  
            }
            
            // listener čeká na zmáčknutí ohodnocení           
            this.testsConfirm = function() {
                var text = "";
                var ans_count = 0;
                var right_count = 0;
                var right = false;
                
                for(i = 0; i<this.results.length;i++) {
                    var res = this.results[i];
                    text+='<div class="question"><h2>';
                    text+= res.question;
                    text+='</h2><ul class="answers">'
                    for(j=0;j<res.answers.length;j++) {
                        right = ex_tests.results[i].answers[j].selected == ex_tests.results[i].answers[j].right;
                        text+='<li class="'+(res.answers[j].selected?'checked':'')+' '+(right?"green":"red") +'"onclick="ex_tests.testsClick(this);" title="'+i+';'+j+'" data-test-question="'+i+'" data-test-answer="'+j+'">'; 
                        text+= res.answers[j].text ;
                        text+='</li>';               
                        right_count += right ? 1 : 0;
                    }
                    ans_count += res.answers.length;
                    text+="</ul></div>";
                
                }                
                
                
                humla.utils.$("tests-questions").innerHTML = text;
                
                var r = 'Your result: <span class="percent">'+Math.round(100*right_count/ans_count)+'%</span> ';
                r+='(<span class="green">'+right_count+'</span> of <span>'+ans_count+'</span> right!)';
                humla.utils.$("tests-result").innerHTML = r
            }
            
            
            // checkne, které odpovědi jsou správně a výsledky pošle na server            
            // vypíše result
            // otázky a správné odpovědi zaškrtne
            // červeně ty co byly špatně a zeleně ty dobrě
            // počet celkových bodů
            
           
            this.showQuestions(slide, false)
        
            
        }
    },
    
    showQuestions: function (slide, showAns) {
        var hg = slide.element.getElementsByTagName("hgroup"),
        h = (hg.length === 0 ? "<hgroup><h1>Test</h1></hgroup>" : "<hgroup>"+hg[0].innerHTML+"</hgroup>");    
        
        h+= "<div id='tests-questions'>";
        // Generate questions html
        for(i = 0; i<this.results.length;i++) {
            var res = this.results[i];
            h+='<div class="question"><h2>';
            h+= res.question;
            h+='</h2><ul class="answers">'
            for(j=0;j<res.answers.length;j++) {
                h+='<li class="'+(res.answers[j].selected?'checked':'')+'"onclick="ex_tests.testsClick(this);" title="'+i+';'+j+'" data-test-question="'+i+'" data-test-answer="'+j+'">'; 
                h+= res.answers[j].text;
                h+='</li>';                        
            }
            h+="</ul></div>";
                
        }
        h+="</div>";
        
        // Add button
        h+='<div class="button" onclick="ex_tests.testsConfirm(this);">Show answers</div>'            
        
        h+="<div id='tests-result'></div>";
        
        var ft = slide.element.getElementsByTagName("footer");
        h+= "<footer>"+ft[0].innerHTML+"</footer>";                      
        //traverse(humla.root, false);
        slide.element.innerHTML = h;
        
    }
    
};  
