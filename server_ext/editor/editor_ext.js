/**
 * @author Vladimir Riha <rihavla1> URL: https://github.com/ladariha
 */

var parseURL = require('url').parse;
var path = require('path');
var querystring = require('querystring');
var fs = require('fs');
var jsdom = require('jsdom');
var http = require('http');
var jquery = fs.readFileSync(config.server.jquery_relative_path).toString();
var RAW_SLIDES_DIRECTORY = config.server.slides_raw_path;
var SLIDES_DIRECTORY = config.server.slides_relative_path;
var SLIDE_TEMPLATE = config.server.templates_relative_path;
var mongoose = require("mongoose");
var Slideid = mongoose.model("Slideid");
var Lecture = mongoose.model("Lecture");
var EventEmitter = require("events").EventEmitter;
var editor_emitter = new EventEmitter();
exports.emitter = editor_emitter;

/**
 * Returns HTML source code of given slide. 
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param course course ID
 * @param lecture lecture ID (lecture1...)
 * @param slide slide number
 * @param host hostname
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.getSlide = function(course, lecture, slide, host, res, callback) {
    try {
        var htmlfile = SLIDES_DIRECTORY + course + '/' + lecture + ".html";
        var resourceURL = host + RAW_SLIDES_DIRECTORY + course + "/" + lecture + ".html#!/" + slide;
        getDocumentFromFileSystem(res, htmlfile, slide, resourceURL, callback);
    } catch (error) {
        returnThrowError(500, error, res, callback);
    }
}

/**
 *Removes given slide from presentation
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
* @param user user ID
 * @param course course ID
 * @param lecture lecture ID (lecture1...)
 * @param slide slide number
 * @param host hostname
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.removeSlide = function(user, course, lecture, slide, host, res, callback) {
    Lecture.find({
        courseID: course,
        lectureID: lecture
    }, function(err, crs) {
        if (!err) {
            if (crs.length > 0) {
                var c = crs[0];
                if (user !== c.authorID && !isCoAuthor(c.coauthors, user)) {
                    returnThrowError(401, "Unauthorized - you have no permission  to edit this lecture", res, callback);
                } else {
                    try {
                        var htmlfile = SLIDES_DIRECTORY + course + '/' + lecture + ".html";
                        var resourceURL = host + RAW_SLIDES_DIRECTORY + course + "/" + lecture + ".html#!/" + slide;
                        deleteSlide(res, htmlfile, slide, resourceURL, course, lecture, callback);
                    } catch (error) {
                        returnThrowError(500, error, res, callback);
                    }
                }
            } else {
                returnThrowError(404, "Lecture not found", res, callback);
            }
        } else {
            returnThrowError(500, error, res, callback);
        }
    });
}

/**
 * Replaces content of slide with data given by parameter content
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param course course ID
 * @param lecture lecture ID (lecture1...)
 * @param slide slide number
 * @param host hostname
 * @param res HTTP response (undefined if called internally)
 * @param content new slide content (html text)
 * @param callback callback function (undefined if called via REST)
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.editSlide = function(user, course, lecture, slide, host, res, content, callback) {

    Lecture.find({
        courseID: course,
        lectureID: lecture
    }, function(err, crs) {
        if (!err) {
            if (crs.length > 0) {
                var c = crs[0];
                if (user !== c.authorID && !isCoAuthor(c.coauthors, user)) {
                    returnThrowError(401, "Unauthorized - you have no permission  to edit this lecture", res, callback);
                } else {
                    try {
                        editSlideContent(course, lecture, slide, content, res, host, callback);
                    } catch (error) {
                        returnThrowError(500, error, res, callback);
                    }
                }
            } else {
                returnThrowError(404, "Lecture not found", res, callback);
            }
        } else {
            returnThrowError(500, error, res, callback);
        }
    });


}

/**
 * Appends new slide after slide given by parameters
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param course course ID
 * @param lecture lecture ID (lecture1...)
 * @param slide slide number
 * @param host hostname
 * @param res HTTP response (undefined if called internally)
 * @param content new slide content to be appended (html text)
 * @param callback callback function (undefined if called via REST)
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.appendSlide = function(course, lecture, slide, host, res, content, callback) {
    try {
        editSlideContentAppend(course, lecture, slide, content, res, host, callback);
    } catch (error) {
        returnThrowError(500, error, res, callback);
    }
}

/**
 * Returns slide template
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param templateNumber number of template
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.getTemplate = function(templateNumber, res, callback) {
    try {
        fs.readFile(SLIDE_TEMPLATE + templateNumber + '.html', function(err, data) {
            if (err) {
                returnThrowError(500, err.message, res, callback);
            } else {
                var r = new HTMLContent('', data.toString());
                r.html = data.toString();
                returnData(res, callback, r);
            }
        });
    } catch (error) {
        returnThrowError(500, error, res, callback);
    }
}

/**
 * Returns HTML source code of entire presentation
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
 * @param course course ID
 * @param lecture lecture ID
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.getLecture = function(course, lecture, res, callback) {
    try {
        var htmlfile = SLIDES_DIRECTORY + course + '/' + lecture + ".html";
        if (endsWith(lecture, ".html")) {
            htmlfile = SLIDES_DIRECTORY + course + '/' + lecture;
        }
        fs.readFile(htmlfile, function(err, data) {
            if (err) {
                returnThrowError(500, err.message, res, callback);
            } else {
                returnDataHTML(res, callback, data);
            }
        });
    } catch (error) {
        returnThrowError(500, error, res, callback);
    }
}

/**
 * Replaces presentation source code with given content parameter
 * If used via REST, parameter res has to be HTTP response object. If called internally
 * then callback function is called when the operation is over and 2 parameters are given to the callback: first one is null if no error
 * occured (otherwise it contains error msg) and the second one is retrieved object. 
* @param user user ID
 * @param course course ID
 * @param lecture lecture ID (lecture1...)
 * @param host hostname
 * @param res HTTP response (if called internally set to undefined!)
 * @param content new presentation content
 * @param callback callback function (if called via REST set to undefined)
 * @return if used via REST then JSON format of HTMLCode otherwise instance of HTMLCode
 */
exports.editLecture = function(user, course, lecture, host, res, content, callback) {
    Lecture.find({
        courseID: course,
        lectureID: lecture
    }, function(err, crs) {
        if (!err) {
            if (crs.length > 0) {
                var c = crs[0];
                if (user !== c.authorID && !isCoAuthor(c.coauthors, user)) {
                    returnThrowError(401, "Unauthorized - you have no permission  to edit this lecture", res, callback);
                } else {
                    try {
                        var htmlfile = SLIDES_DIRECTORY + course + '/' + lecture + ".html";
                        var resourceURL = host + RAW_SLIDES_DIRECTORY + course + "/" + lecture + ".html";
                        addIDsToSlidesAndWriteToFile(content, course, lecture, res, resourceURL, htmlfile, callback);
                    } catch (error) {
                        returnThrowError(500, error, res, callback);
                    }
                }
            } else {
                returnThrowError(404, "Lecture not found", res, callback);
            }
        } else {
            returnThrowError(500, error, res, callback);
        }
    });
}

exports.editLectureViewMode = function(user, course, lecture, host, res, data_slide, callback) {

    Lecture.find({
        courseID: course,
        lectureID: lecture
    }, function(err, crs) {
        if (!err) {
            if (crs.length > 0) {
                var c = crs[0];
                if (user !== c.authorID && !isCoAuthor(c.coauthors, user)) {
                    returnThrowError(401, "Unauthorized - you have no permission  to edit this lecture", res, callback);
                } else {
                    try {
                        var htmlfile = SLIDES_DIRECTORY + course + '/' + lecture + ".html";
                        fs.readFile(htmlfile, function(err, data) {
                            if (err) {
                                returnThrowError(500, err.message, res, callback);
                            } else {
                                jsdom.env({
                                    html: htmlfile,
                                    src: [
                                            jquery
                                            ],
                                    done: function(errors, window) {
                                        if (errors) {
                                            returnThrowError(500,'Error while parsing document by jsdom ' + err.message, res, callback);
                                        } else {
                                            try {
                                                var $ = window.$;
                                                var resourceURL = host + RAW_SLIDES_DIRECTORY + course + "/" + lecture + ".html";
                                                var slideCounter = 0;

                                                $('body').find('.slide').each(function() {
                                                    if (data_slide.content[slideCounter] != null) {
                                                        $(this).replaceWith(data_slide.content[slideCounter]);
                                                    }
                                                    slideCounter++;
                                                });
                                                var newcontent = $("html").html();
                                                addIDsToSlidesAndWriteToFile(newcontent, course, lecture, res, resourceURL, htmlfile);
                                            }
                                            catch (err) {
                                                returnThrowErrorr(500, 'Error while parsing document: ' + err.message, res, callback);
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    } catch (error) {
                        returnThrowError(500, error, res, callback);
                    }
                }
            } else {
                returnThrowError(404, "Lecture not found", res, callback);
            }
        } else {
            returnThrowError(500, error, res, callback);
        }
    }
    );
}
/**
 * Performs the actual appending
 * @param course course ID (like "mdw")
 * @param lecture lecture ID (like "lecture1")
 * @param slide number of slide after which new content will be appended
 * @param content content to be appended
 * @param res HTTP response object
 * @param host hostname (domain)
 * @param callback callback function to be called
 */
function editSlideContentAppend(course, lecture, slide, content, res, host, callback) {
    var pathToCourse = course + '/';
    var htmlfile = SLIDES_DIRECTORY + pathToCourse + lecture + ".html";
    fs.readFile(htmlfile, function(err, data) {
        if (err) {
            returnThrowError(500, err.message, res, callback);
        } else {
            slide = parseInt(slide);
            var slideSend = 0;
            jsdom.env({
                html: htmlfile,
                src: [
                        jquery
                        ],
                done: function(errors, window) {
                    if (errors) {
                        returnThrowError(500, 'Error while parsing document by jsdom ', res, callback);
                    } else {
                        try {
                            var $ = window.$;
                            var resourceURL = host + RAW_SLIDES_DIRECTORY + course + "/" + lecture + ".html#!/" + (slide + 1);
                            var slideCounter = 1;
                            $('body').find('.slide').each(function() {
                                if (slideCounter === slide) {
                                    $(this).after(content);
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });
                            var newcontent = $("html").html();
                            if (slideSend === 0) {
                                returnThrowError(404, "Slide " + slide + " not found", res, callback);
                            } else {
                                addIDsToSlidesAndWriteToFile(newcontent, course, lecture, res, resourceURL, htmlfile, callback);
                            }
                        }
                        catch (err) {
                            returnThrowError(500, 'Problem while parsing document: ' + err.message, res, callback);
                        }
                    }
                }
            });
        }
    });
}

/**
 * Performs the actual editing
 * @param course course ID (like "mdw")
 * @param lecture lecture ID (like "lecture1")
 * @param slide number of slide to be edited
 * @param content new content of the edited slide
 * @param res HTTP response object
 * @param host hostname (domain)
 * @param callback callback function to be called
 */
function editSlideContent(course, lecture, slide, content, res, host, callback) {
    var pathToCourse = course + '/';
    var htmlfile = SLIDES_DIRECTORY + pathToCourse + lecture + ".html";
    fs.readFile(htmlfile, function(err, data) {
        if (err) {
            returnThrowError(500, err.message, res, callback);
        } else {

            slide = parseInt(slide);
            var slideSend = 0;
            jsdom.env({
                html: htmlfile,
                src: [
                        jquery
                        ],
                done: function(errors, window) {
                    if (errors) {
                        returnThrowError(500, 'Problem while parsing document by jsdom ', res, callback);
                    } else {
                        try {
                            var $ = window.$;
                            var resourceURL = host + RAW_SLIDES_DIRECTORY + course + "/" + lecture + ".html#!/" + slide;
                            var slideCounter = 1;
                            $('body').find('.slide').each(function() {
                                if (slideCounter === slide) {
                                    $(this).replaceWith(content);
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });

                            var newcontent = $("html").html();
                            if (slideSend === 0) {
                                returnThrowError(404, "Slide " + slide + " not found", res, callback);
                            } else {
                                addIDsToSlidesAndWriteToFile(newcontent, course, lecture, res, resourceURL, htmlfile);
                            }
                        }
                        catch (err) {
                            returnThrowError(500, 'Problem while parsing document ', res, callback);
                        }
                    }
                }
            });
        }
    });
}

/**
 * Removes given slide from presentation and update slide ids
 */
function deleteSlide(res, htmlfile, slide, resourceURL, course, lecture, callback) {

    fs.readFile(htmlfile, function(err, data) {
        if (err) {
            returnThrowError(500, err.message, res, callback);
        } else {
            slide = parseInt(slide);
            var slideSend = 0;
            jsdom.env({
                html: htmlfile,
                src: [
                        jquery
                        ],
                done: function(errors, window) {
                    if (errors) {
                        returnThrowError(500, "Error while parsing document by jsdom", res, callback);
                    } else {
                        try {
                            var $ = window.$;
                            var slideCounter = 1;
                            $('body').find('.slide').each(function() {
                                if (slideCounter === slide) {
                                    $(this).remove();
                                    slideSend = 1;
                                }
                                slideCounter++;
                            });

                            var newcontent = $("html").html();
                            if (slideSend === 0) {
                                returnThrowError(404, "Slide " + slide + " not found", res, callback);
                            } else {
                                addIDsToSlidesAndWriteToFile(newcontent, course, lecture, res, resourceURL, htmlfile, callback);
                            }
                        }
                        catch (err) {
                            returnThrowError(500, 'Error while parsing document: ' + err.message, res, callback);
                        }
                    }
                }
            });
        }
    });


}

/**
 * Adds, updates and removes IDs of slides. First of all, all slideids are loaded from db,  then ids for new 
 * slides are created, existing ids altered (i.e. after inserting/removing slides) and all deleted ids from 
 * HTML source are deleted from db as well.
 * @param content HTML source code of presentation
 * @param courseID course ID ("mdw")
 * @param lecture lecture ID ("lecture1")
 * @param res HTTP response
 * @param lectureURL URL address of presentation
 * @param file file where the presentation should be stored in
 * @param callback
 * @param emitEvents if true or undefined emitter wil emit notifications about updated file and removed IDs
 */
function addIDsToSlidesAndWriteToFile(content, courseID, lecture, res, lectureURL, file, callback, emitEvents) {
    var prefix = new RegExp("^" + courseID + "_" + lecture + "_");
    Slideid.find({
        slideid: prefix
    }, function(err, crs) {
        if (!err) {
            var slidesToDelete = {};
            for (var i = 0; i < crs.length; i++) {
                slidesToDelete[crs[i].slideid] = 1;
            }

            jsdom.env({
                html:content,
                src: [
                        jquery
                        ],
                done : function(errors, window) {
                    if (!errors) {
                        var $ = window.$;
                        var d = new Date().getTime();
                        var updatedid = {};
                        var newids = new Array();
                        var it = 0;
                        var counter = 0;

                        $('body').find('.slide').each(function() {
                            counter++;
                            if (!$(this).attr('data-slideid')) { // slide doesn't have ID => all following slideids have to be update
                                var n = {};
                                n.id = courseID + "_" + lecture + "_" + counter + "_" + (d + it);
                                n.title = $(this).find("h1").eq(0).text();
                                $(this).attr('data-slideid', n.id);
                                newids.push(n);
                                it++;
                            } else {
                                var sec = $(this).attr('data-slideid');
                                if ($(this).attr('data-slideid').indexOf(courseID + "_" + lecture + "_" + counter + "_", 0) < 0
                                        || typeof crs[slidesToDelete[$(this).attr('data-slideid')]] == "undefined" || $(this).find("h1").eq(0).text() !== crs[slidesToDelete[$(this).attr('data-slideid')]].title
                                        ) { // slide number is changed => update slideid
                                    var parts = ($(this).attr('data-slideid')).split("_");
                                    var n = {};
                                    n.id = parts[0] + "_" + parts[1] + "_" + counter + "_" + parts[3];
                                    n.title = $(this).find("h1").eq(0).text();
                                    updatedid[$(this).attr('data-slideid')] = n; // counter is a new slide number
                                    $(this).attr('data-slideid', parts[0] + "_" + parts[1] + "_" + counter + "_" + parts[3]);
                                }
                                delete slidesToDelete[sec]; // this slideid is used, no need to delete it from db    
                            }
                        });
                        var newcontent = $("html").html();
                        newcontent = "<!DOCTYPE html><html>" + newcontent + "</html>";
                        // delete slidesToDelete
                        for (var key in slidesToDelete) {
                            for (var k = 0; k < crs.length; k++) {
                                if (typeof crs[k] != "undefined" && crs[k].slideid === key) {
                                    var _id = crs[k]._id;
                                    crs[k].remove(function(err) {
                                        if (err) {
                                            returnThrowError(500, "Error removing slideid", res, callback);
                                        }

                                        if (typeof emitEvents == "undefined" || emitEvents === true)
                                            editor_emitter.emit("removedID", _id);
                                    });
                                }
                            }
                        }

                        // update existingids (slideid is unique!)
                        for (var key2 in updatedid) {
                            for (var h = 0; h < crs.length; h++) {
                                if (crs[h].slideid === key2) {
                                    crs[h].slideid = updatedid[key2].id;
                                    crs[h].title = updatedid[key2].title;
                                    crs[h].save(function(err) {
                                        if (err) {
                                            returnThrowError(500, "Error updating slideid", res, callback);
                                        }
                                    });
                                }
                            }
                        }
                        // insert new ids
                        for (var key3 in newids) {
                            var sid = new Slideid();
                            sid.slideid = newids[key3].id;
                            sid.title = newids[key3].title;
                            sid.save(function(err) {
                                if (err) {
                                    returnThrowError(500, "Error saving new slideid", res, callback);
                                }
                            });
                        }
                        //write to file
                        writeToFile(courseID, lecture, res, file, lectureURL, newcontent, callback, emitEvents);
                    } else {
                        returnThrowError(500, errors, res, callback);
                    }
                }
            });
        } else {
            returnThrowError(500, "Problems with database", res, callback);
        }
    });
}


/**
 * This method is very similar to addIDsToSlidesAndWriteToFile() but it is uses complex callbacks. It is called only from facetparser_ext when 
 * the parsing file is missing data-slideid attributes. This function fixes this problem, waits (not in synchronized way - it all rely on callbacks) until 
 * each DB and File operations are done and then call the original method in facetparser_ext which it was called from. So at the end it sort of restarts the process
 * started in facetparser_ext
 *
 * Adds, updates and removes IDs of slides. First of all, all slideids are loaded from db,  then ids for new 
 * slides are created, existing ids altered (i.e. after inserting/removing slides) and all deleted ids from 
 * HTML source are deleted from db as well.
 * @param courseID course ID ("mdw")
 * @param res HTTP response
 * @param lecture lecture ID ("lecture1")
 * @param callback callback function
 * @param originalCallback function that the callback function was called with
 */
exports. _addIDsToSlidesAndWriteToFileForFacets = function(courseID, res, lecture, callback, originalCallback) {
    try {
        fs.readFile(SLIDES_DIRECTORY + courseID + '/' + lecture + ".html", function(err, data) {
            if (err) {
                console.log("_addIDsToSlidesAndWriteToFileForFacets " + err.toString());
            } else {

                var prefix = new RegExp("^" + courseID + "_" + lecture + "_");
                Slideid.find({
                    slideid: prefix
                }, function(err, crs) {
                    if (!err) {
                        var slidesToDelete = {};
                        for (var i = 0; i < crs.length; i++) {
                            slidesToDelete[crs[i].slideid] = 1;
                        }

                        jsdom.env({
                            html:data.toString(),
                            src: [
                                    jquery
                                    ],
                            done : function(errors, window) {
                                if (!errors) {
                                    var $ = window.$;
                                    var d = new Date().getTime();
                                    var updatedid = {};
                                    var newids = new Array();
                                    var it = 0;
                                    var counter = 0;

                                    $('body').find('.slide').each(function() {
                                        counter++;
                                        if (!$(this).attr('data-slideid')) { // slide doesn't have ID => all following slideids have to be update
                                            var n = {};
                                            n.id = courseID + "_" + lecture + "_" + counter + "_" + (d + it);
                                            n.title = $(this).find("h1").eq(0).text();
                                            $(this).attr('data-slideid', n.id);
                                            newids.push(n);
                                            it++;
                                        } else {
                                            var sec = $(this).attr('data-slideid');
                                            if ($(this).attr('data-slideid').indexOf(courseID + "_" + lecture + "_" + counter + "_", 0) < 0
                                                    || $(this).find("h1").eq(0).text() !== crs[slidesToDelete[$(this).attr('data-slideid')]].title
                                                    ) { // slide number is changed => update slideid
                                                var parts = ($(this).attr('data-slideid')).split("_");
                                                var n = {};
                                                n.id = parts[0] + "_" + parts[1] + "_" + counter + "_" + parts[3];
                                                n.title = $(this).find("h1").eq(0).text();
                                                updatedid[$(this).attr('data-slideid')] = n; // counter is a new slide number
                                                $(this).attr('data-slideid', parts[0] + "_" + parts[1] + "_" + counter + "_" + parts[3]);
                                            }
                                            delete slidesToDelete[sec]; // this slideid is used, no need to delete it from db    
                                        }
                                    });
                                    var _count = 0;
                                    for (var r in slidesToDelete) {
                                        _count++;
                                    }
                                    var _count2 = 0;
                                    for (var s in updatedid) {
                                        _count2++;
                                    }
                                    var lock = new IDSyncLock(_count, _count2, newids.length, callback, lecture, courseID, originalCallback, res);
                                    var newcontent = $("html").html();
                                    newcontent = "<!DOCTYPE html><html>" + newcontent + "</html>";
                                    fs.writeFile(SLIDES_DIRECTORY + courseID + '/' + lecture + ".html", newcontent, function(err) {
                                        if (err) {
                                            throw "_addIDsToSlidesAndWriteToFileForFacets " + err.toString();
                                        } else {
                                            // editor_emitter.emit("fileUpdated",courseID, lecture); // again endless loop, look few lines below
                                            for (var key in slidesToDelete) {
                                                for (var k = 0; k < crs.length; k++) {
                                                    if (crs[k].slideid === key) {
                                                        var _id = crs[k]._id;
                                                        crs[k].remove(function(err) {
                                                            if (err)
                                                                console.log("_addIDsToSlidesAndWriteToFileForFacets " + err.toString());
                                                            //    editor_emitter.emit("removedID", _id); // no need to cause recursion - this is called using MMan but another emit causes endless loop (maintenance_ext catch it again and again save info about update for MMan...)
                                                            lock.notifyDeleted();
                                                        });
                                                    }
                                                }
                                            }

                                            // update existingids (slideid is unique!)
                                            for (var key2 in updatedid) {
                                                for (var h = 0; h < crs.length; h++) {
                                                    if (crs[h].slideid === key2) {
                                                        crs[h].slideid = updatedid[key2].id;
                                                        crs[h].title = updatedid[key2].title;
                                                        crs[h].save(function(err) {

                                                            if (err) {
                                                                throw "_addIDsToSlidesAndWriteToFileForFacets " + err.toString();
                                                            }
                                                            lock.notifyUpdated();
                                                        });
                                                    }
                                                }
                                            }
                                            // insert new ids
                                            for (var key3 in newids) {
                                                var sid = new Slideid();
                                                sid.slideid = newids[key3].id;
                                                sid.title = newids[key3].title;
                                                sid.save(function(err) {
                                                    if (err) {
                                                        throw "_addIDsToSlidesAndWriteToFileForFacets " + err.toString();
                                                    }
                                                    lock.notifyInserted();
                                                });
                                            }
                                        }
                                    });
                                } else {
                                    throw "_addIDsToSlidesAndWriteToFileForFacets " + errors.toString();
                                }
                            }
                        });
                    } else {
                        throw "_addIDsToSlidesAndWriteToFileForFacets " + err.toString();
                    }
                });
            }
        });
    } catch (error) {
        throw "_addIDsToSlidesAndWriteToFileForFacets " + error.toString();
    }
}


function writeToFile(course, lecture, res, file, lectureUrl, content, callback, emitEvents) {
    fs.writeFile(file, content, function(err) {
        if (err) {
            returnThrowError(500, 'Problem with saving document: ' + err.message, res, callback);
        } else {
            if (typeof emitEvents == "undefined" || emitEvents === true)
                editor_emitter.emit("fileUpdated", course, lecture);
            var t = new HTMLContent("http://" + lectureUrl, "Document updated, <a href=\"http://" + lectureUrl + "\">back to presentation</a>");
            returnData(res, callback, t);

        }
    });
}

/**
 * Reads presentation file if possible
 * @param res HTTP response
 * @param htmlfile actual presentation file to be read from
 * @param slide number of slide to be find
 * @param resourceURL URL of the presentation
 * @param callback
 */
function getDocumentFromFileSystem(res, htmlfile, slide, resourceURL, callback) {
    fs.readFile(htmlfile, function(err, data) {
        if (err) {
            returnThrowError(500, err.message, res, callback);
        } else {
            parseDocument(res, data, slide, resourceURL, callback);
        }
    });
}

/**
 * Returns concrete slide given by slide parameter
 * @param res HTTP response
 * @param html HTML source code of the presentation
 * @param slide number of slide to be processed
 * @param resourceURL URL of the presentation
 * @param callback
 */
function parseDocument(res, html, slide, resourceURL, callback) {
    slide = parseInt(slide);
    var slideSend = 0;
    jsdom.env({
        html: html,
        src: [
                jquery
                ],
        done: function(errors, window) {
            if (errors) {
                returnThrowError(500, 'Error while parsing document by jsdom ', res, callback);
            } else {
                try {
                    var $ = window.$;
                    var slideCounter = 1;

                    $('body').find('.slide').each(function() {
                        if (slideCounter === slide) {
                            var r = new HTMLContent(resourceURL, $("<div />").append($(this).clone()).html());
                            returnData(res, callback, r);
                            slideSend = 1;
                        }
                        slideCounter++;
                    });
                    if (slideSend === 0)
                        returnThrowError(404, "Slide " + slide + " not found", res, callback);
                }
                catch (err) {
                    returnThrowError(500, 'Error while parsing document: ' + err, res, callback);
                }
            }
        }
    });
}

/**
 * Returns data in json format (if it's called via REST) or  calls  callback with javascript object as parameter
 * @param res HTTP response (if called via REST)
 * @param callback callback function (if called via internal API)
 * @param data data to be retuned
 */
function returnData(res, callback, data) {
    if (typeof res != "undefined") {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.write(JSON.stringify(data, null, 4));
        res.end();
    } else {
        if (typeof callback != "undefined")
            callback(null, data);
        else
            console.error("Nor HTTP Response or callback function defined!");
        //            throw "Nor HTTP Response or callback function defined!";
    }
}

/**
 * Returns data in plain html format (if it's called via REST) or  calls  callback with javascript object as parameter
 * @param res HTTP response (if called via REST)
 * @param callback callback function (if called via internal API)
 * @param data data to be retuned
 */
function returnDataHTML(res, callback, data) {
    if (typeof res != "undefined") {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.write(data);
        res.end();
    } else {
        if (typeof callback != "undefined") {
            var o = {};
            o.html = data;
            callback(null, o);
        } else
            console.error("Nor HTTP Response or callback function defined!");
        //            throw "Nor HTTP Response or callback function defined!";
    }
}

/**
 * Indicates error. If it's called via REST, reponse with error code and msg is returned. If it is called 
 * internally then callback function is called (with parameter is error msg, second null)
 * @param code HTTP status code
 * @param msg error message
 * @param res HTTP response
 * @param callback callback function
 */
function returnThrowError(code, msg, res, callback) {
    if (typeof res != "undefined")
    {    res.writeHead(code, {
            'Content-Type': 'text/plain'
        });
        res.write(msg);
        res.end(); }
    else {
        if (typeof callback != "undefined") {
            callback(msg, null);
        } else {
            console.error(msg);
        }
    }
}

function endsWith(string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}

/**
 * Instance of this function is always returned by this extension. If editor_ext is called via REST
 * then it returns JSON.stringify(instance, undefined, 4) of this function. If it's called internally then
 * the object itself is returned
 * @param url URL address of given slide/lecture
 * @param htmlCode html source code of given item (or status message in HTML form)
 */
function HTMLContent(url, htmlCode) {
    this.url = url;
    this.html = htmlCode;
}


/**
 * Function to synchronize methods in _addIDsToSlidesAndWriteToFileForFacets.
 * @param toDelete number of ID to be removed
 * @param toUpdate number of ID to be updated
 * @param toInsert number of ID to be inserted
 * @param callback function in facetparser_ext
 * @param lecture lecture ID
 * @param course course ID
 * @param originalCallback original callback that the original function in facetparser_ext (specified by the callback param) was called with
 * @param originalResponse original reponse that the original function in facetparser_ext (specified by the callback param) was called with
 */
function IDSyncLock(toDelete, toUpdate, toInsert, callback, lecture, course, originalCallback, originalResponse) {

    this.toDelete = toDelete;
    this.toUpdate = toUpdate;
    this.toInsert = toInsert;
    this.deleted = 0;
    this.updated = 0;
    this.inserted = 0;
    this.content = '';
    this.lecture = lecture;
    this.course = course;
    this.response = originalResponse;
    this.originalCallback = originalCallback;

    this.notifyDeleted = function() {
        this.deleted++;
        if (this.deleted === this.toDelete)
            this.globalNotify();
    };

    this.notifyUpdated = function() {
        this.updated++;
        if (this.updated === this.toUpdate)
            this.globalNotify();
    };

    this.notifyInserted = function() {
        this.inserted++;
        if (this.inserted === this.toInsert)
            this.globalNotify();
    };

    this.globalNotify = function() {
        if (this.inserted === this.toInsert && this.updated === this.toUpdate && this.deleted === this.toDelete) {
            callback(this.response, this.course, this.lecture, false, this.originalCallback);
        }
    };
}


/**
 * Add id to presentation without using editor
 * @param courseID course ID ("mdw")
 * @param lectureID lecture ID ("lecture1")
 * @param host hostname (domain)
 * @param res HTTP response (if called via HTTP)
 * @param callback callback function (internally)
 * @param emitEvents if true emiiter emits events about removed IDs and updated file
 */
exports.makeindices = function(courseID, lectureID, host, res, callback, emitEvents) {
    var htmlfile = SLIDES_DIRECTORY + courseID + '/' + lectureID + ".html";
    fs.readFile(htmlfile, function(err, data) {
        if (err) {
            returnThrowError(500, err.message, res, callback);
        } else {
            try {
                var resourceURL = host + RAW_SLIDES_DIRECTORY + courseID + "/" + lectureID + ".html";
                addIDsToSlidesAndWriteToFile(data.toString(), courseID, lectureID, res, resourceURL, htmlfile, callback, emitEvents);
            } catch (error) {
                returnThrowError(500, error, res, callback);
            }
        }
    });
};


function isCoAuthor(coauthors, user) {
    if (typeof coauthors != "undefined" && coauthors.length > 0) {
        for (var i = 0; i < coauthors.length; i++) {
            if (coauthors[i] === user)
                return true;
        }
        return false;
    }
    return false;
}

//var RAW_SLIDES_DIRECTORY = '/data/slides';
//var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../../public/data/slides')).toString();
//var SLIDE_TEMPLATE = (path.join(path.dirname(__filename), '../../public/data/templates')).toString();