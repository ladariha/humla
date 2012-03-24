/* tests extension */

var ex_tests =  {
    processSlide : function(slide) {
    
        // create outline slide, if this is the outline slide
        if (slide.element.className.indexOf("test") != -1) {
            var hg = slide.element.getElementsByTagName("hgroup"),
                h = (hg.length === 0 ? 
                    "<hgroup><h1>Test</h1></hgroup>" : hg[0].innerHTML);
            
            // calc the next slide after this slide
            var nextslide = slide.number < humla.slides.length ? 
                humla.slides[slide.number] : null;

            var traverse = function(section, include) {
                if (include && section.slides.length > 0) {
                    var n = section.slides[0].number;
                    if (section.slides[0].number - 1 < humla.slides.length && 
                        humla.slides[section.slides[0].number - 2].element.className.indexOf("test") != - 1)
                        n = section.slides[0].number - 1;
                    
                    var click = "humla.controler.goto('" + n + "');";   
        
                    /*h += "<li" + ((nextslide && section == nextslide.section) ? 
                        " class='outline-nextsec'" : "") + " onclick=\"" + click + "\">" + section.name + "</li>";*/
                    h += "<li>Question</li>";
                }
                
                // check whether next slide's section is in a subtree of the 
                // section to be displayed  
                var renderSubs = false;
                var s = nextslide && nextslide.section;
                while (s !== null) 
                    if (s == section) {
                        renderSubs = true;
                        break;
                    } else
                        s = s.parent;
                
                if (section.sections.length > 0 && renderSubs) {
                    h += "<ul>";
                    for (var j = 0; j < section.sections.length; j++) {
                        traverse(section.sections[j], true);
                    }
                    h += "</ul>";
                }
            };
            
            traverse(humla.root, false);
            slide.element.innerHTML = h;
            slide.updateFooter();
            
        }
    }
};  
