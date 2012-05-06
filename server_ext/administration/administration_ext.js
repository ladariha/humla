/**
 * @author Vladimir Riha <rihavla1> URL: https://github.com/ladariha
 */

var fs = require("fs");
var path = require("path");
var jquery = fs.readFileSync(config.server.jquery_relative_path).toString();
//var jquery = fs.readFileSync('./public/lib/jquery-1.7.min.js').toString();
var jsdom = require('jsdom');
var RAW_SLIDES_DIRECTORY = config.server.slides_raw_path;
var SLIDES_DIRECTORY = config.server.slides_relative_path;
var LECTURE_TEMPLATE = config.server.templates_relative_path;
var facet_use_fs = 1;
var mongoose = require("mongoose");
var Course = mongoose.model("Course");
var Lecture = mongoose.model("Lecture");
var Slideid = mongoose.model("Slideid");

/**
 * Creates new course
 * @param courseID course ID
 * @param authorID author secret identification
 * @param longName course's long name
 * @param isActive string if it's active
 * @param owner public identification of author (name etc.)
 * @param host domain
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 */
exports.createCourse = function(courseID, authorID, longName, isActive, owner, host, res, callback) {
    Course.find({
        courseID: courseID
    }, function(err, crs) {
        if (!err) {
            if (crs.length > 0) {
                returnThrowError(409, "Course already exists", res, callback);
            } else {
                var c = new Course();
                c.longName = decodeURIComponent(longName);
                var e = isActive.toLowerCase()
                if (e == 'true')
                    c.isActive = true;
                else
                    c.isActive = false;
                c.authorID = authorID;
                c.courseID = decodeURIComponent(courseID);
                c.owner = decodeURIComponent(owner);
                c.lecturesURLPreffix = host + '/data/slides/' + c.courseID;
                c.url = host + '/api/' + c.courseID + '/course';
                c.save(function(err) {
                    if (err) {
                        returnThrowError(500, "Problem with database", res, callback);
                    } else {
                        fs.mkdir(SLIDES_DIRECTORY + c.courseID, 0777, function(e) {
                            if (!e) {
                                fs.mkdir(SLIDES_DIRECTORY + c.courseID + '/css', 0777, function(e) {
                                    if (!e) {
                                        returnData(res, callback, c);
                                    } else {
                                        returnThrowError(500, "Directory for css for lectures was not created", res, callback);
                                    }
                                });
                            } else {
                                returnThrowError(500, "Directory for course was not created", res, callback);
                            }
                        });
                    }
                });
            }
        } else {
            returnThrowError(500, "Problems with database", res, callback);
        }
    });
};

/**
 * Updates course
 * @param user user ID 
 * @param _id internal id of course in DB
 * @param longName course's long name
 * @param isActive string if it's active
 * @param owner public identification of author (name etc.)
 * @param host domain
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 */
exports.editCourse = function(user, _id, longName, isActive, owner, host, res, callback) {
    Course.find({
        _id: _id
    }, function(err, crs) {
        if (!err) {
            if (crs.length > 0) {
                var course = crs[0];
                if (user !== course.authorID) {
                    returnThrowError(401, "Unauthorized - you have no permission  to edit this course", res, callback);
                } else {
                    if (typeof isActive != "undefined") {
                        var e = (isActive).toLowerCase()
                        if (e == 'true') {
                            course.isActive = true;
                        }
                        else {
                            course.isActive = false;
                        }
                    }
                    var prev = course.courseID;
                    course.longName = (typeof longName == "undefined") ? course.longName : decodeURIComponent(longName);
                    course.owner = (typeof owner == "undefined") ? '' : decodeURIComponent(owner);
                    course.lecturesURLPreffix = host + '/data/slides/' + course.courseID;
                    course.url = host + '/api/' + course.courseID + '/course';
                    course.save(function(err) {
                        if (err) {
                            returnThrowError(500, "Problems with database", res, callback);
                        } else {
                            returnData(res, callback, course);
                        }
                    });
                }
            } else {
                returnThrowError(404, "Course not found", res, callback);
            }
        } else {
            returnThrowError(500, "Problems with database", res, callback);
        }
    });
};

/**
 * Returns course's information
 * @param courseID course ID
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 */
exports.getCourse = function(courseID, res, callback) {
    Course.find({
        courseID:courseID
    }, function(err, crs) {
        if (!err) {
            if (crs.length > 0) {
                crs[0].authorID = null; // TODO verify it's hidden'
                returnData(res, callback, crs[0]);
            } else {
                returnThrowError(404, "Course not found", res, callback);
            }
        } else {
            returnThrowError(500, "Problems with database", res, callback);
        }
    });
};

/**
 * Returns lecture's information
 * @param course course ID
 * @param lecture lecture ID
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 */
exports.getLecture = function(course, lecture, res, callback) {
    Lecture.find({
        isActive:true,
        courseID: course,
        lectureID:lecture

    }, function(err, lectures) {
        if (!err) {
            if (lectures.length > 0) {
                lectures[0].authorID = null;
                returnData(res, callback, lectures[0]);
            } else {
                returnThrowError(404, "Lecture not found", res, callback);
            }
        } else {
            returnThrowError(500, "Problems with database", res, callback);
        }
    });
};


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
 * Creates new lecture
 * @param authorID author secret identification
 * @param courseID course ID
 * @param title lecture title
 * @param order lecture order
 * @param author public identification of author (name etc.)
 * @param authorEmail author's email
 * @param authorTwitter author's Twitter
 * @param authorWeb author's web
 * @param semester semester of the lecture
 * @param org organization to which the lecture belongs to
 * @param orgfac departament or faculty of the organization
 * @param spec specialization (field) of the lecture
 * @param web lecture's web site
 * @param abs abstract
 * @param isActive string if it's active
 * @param keywords list of keywords (string comma separated)
* @param coauthors list of coauthors (string comma separated)
 * @param host domain
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 */
exports.createLecture = function(authorID, courseID, title, order, author, authorEmail, authorTwitter, authorWeb, semester, org, orgfac, spec, web, abs, isActive, keywords, coauthors, host, res, callback) {

    Course.find({
        courseID: courseID
    }, function(err, crs) {
        if (crs.length > 0) {
            var a_id = crs[0].authorID;
            if (a_id === authorID) {
                Lecture.find({
                    courseID: courseID,
                    order: order
                }, function(err, crs) {
                    if (!err) {
                        if (crs.length > 0) {
                            returnThrowError(409, "Lecture with given course and order already exists", res, callback);
                        } else {
                            var c = new Lecture();
                            c.title = decodeURIComponent(title);
                            c.courseID = decodeURIComponent(courseID);
                            c.lectureID = 'lecture' + decodeURIComponent(order);
                            c.url = host + '/api/' + c.courseID + '/' + c.lectureID;
                            c.authorID = authorID;
                            c.presentationURL = host + '/data/slides/' + c.courseID + '/' + c.lectureID + '.html';
                            c.authorEmail = (typeof authorEmail == "undefined") ? '' : decodeURIComponent(authorEmail);
                            c.authorTwitter = (typeof authorTwitter == "undefined") ? '' : decodeURIComponent(authorTwitter);
                            c.authorWeb = (typeof authorWeb == "undefined") ? '' : decodeURIComponent(authorWeb);
                            c.semester = (typeof semester == "undefined") ? '' : decodeURIComponent(semester);
                            c.organization = (typeof org == "undefined") ? '' : decodeURIComponent(org);
                            c.organizationFac = (typeof orgfac == "undefined") ? '' : decodeURIComponent(orgfac);
                            c.field = (typeof spec == "undefined") ? '' : decodeURIComponent(spec);
                            c.web = (typeof web == "undefined") ? '' : decodeURIComponent(web);
                            c.lastModified = new Date();
                            c.lectureAbstract = (typeof abs == "undefined") ? '' : decodeURIComponent(abs);
                            var e = (isActive).toLowerCase()
                            if (e == 'true') {
                                c.isActive = true;
                            }
                            else {
                                c.isActive = false;
                            }

                            c.author = decodeURIComponent(author);
//                            keywords += "";
//                            var k = (decodeURIComponent(keywords)).split(",");
//                            var k1 = new Array();
//                            k.forEach(function(i) {
//                                var i1 = i.replace(/^\s*/, "").replace(/\s*$/, "");
//                                if (i1.length > 0) {
//                                    k1.push(i1);
//                                }
//
//                            });
//                            c.keywords = k1;
                            if (typeof keywords != "undefined" && keywords.length > 0) {
                                var tmpA = new Array();
                                for (var ww = 0; ww < keywords.length; ww++) {
                                    tmpA.push(keywords[ww]);
                                }
                                c.keywords = tmpA;
                            } else {
                                c.keywords = new Array();
                            }

                            if (typeof coauthors != "undefined" && coauthors.length > 0) {
                                var tmpA = new Array();
                                for (var ww = 0; ww < coauthors.length; ww++) {
                                    tmpA.push(coauthors[ww]);
                                }
                                c.coauthors = tmpA;
                            } else {
                                c.coauthors = new Array();
                            }

//                            coauthors += "";
//                            if (coauthors.length > 0) {
//                                k = (decodeURIComponent(coauthors)).split(",");
//                                k1 = new Array();
//                                k.forEach(function(i) {
//                                    var i1 = i.replace(/^\s*/, "").replace(/\s*$/, "");
//                                    if (i1.length > 0) {
//                                        k1.push(i1);
//                                    }
//                                });
//                                c.coauthors = k1;
//                            } else {
//                                c.coauthors = [];
//                            }

                            c.save(function(err) {
                                if (err) {
                                    returnThrowError(500, "Problems with database", res, callback);
                                } else {
                                    path.exists(SLIDES_DIRECTORY + c.courseID, function(exists) {
                                        if (exists) { // course dir exists
                                            copyTemplateHTML(res, callback, c, decodeURIComponent(order), decodeURIComponent(keywords));
                                        } else { // create dir

                                            fs.mkdir(SLIDES_DIRECTORY + c.courseID, 0777, function(e) {
                                                if (!e) {
                                                    copyTemplateHTML(res, callback, c, decodeURIComponent(order), decodeURIComponent(keywords));
                                                } else { // copy template
                                                    returnThrowError(500, "Problems with file system", res, callback);
                                                    //     copyTemplateHTML( res, c, decodeURIComponent(order), decodeURIComponent(keywords));
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    } else {
                        returnThrowError(500, "Problems with database", res, callback);
                    }
                });
            } else {
                returnThrowError(401, "Unauthorized - you have no permission  to create lectures for this course", res, callback);
            }
        } else {
            returnThrowError(404, "Course does not exist", res, callback);
        }
    });
};


/**
 * Edits new lecture
 * @param user user ID
 * @param _id internal id of lecture in DB
 * @param title lecture title
 * @param order lecture order
 * @param author public identification of author (name etc.)
 * @param authorEmail author's email
 * @param authorTwitter author's Twitter
 * @param authorWeb author's web
 * @param semester semester of the lecture
 * @param org organization to which the lecture belongs to
 * @param orgfac departament or faculty of the organization
 * @param spec specialization (field) of the lecture
 * @param web lecture's web site
 * @param abs abstract
 * @param isActive string if it's active
 * @param keywords list of keywords (string comma separated)
*@param coauthors listf of coauthors (string comma seprarated)
 * @param host domain
 * @param res HTTP response (if called internally set to undefined!)
 * @param callback callback function (if called via REST it could be omitted)
 */
exports.editLecture = function(user, _id, title, order, author, authorEmail, authorTwitter, authorWeb, semester, org, orgfac, spec, web, abs, isActive, keywords, coauthors, host, res, callback) {

    Lecture.find({
        _id: decodeURIComponent(_id)
    }, function(err, crs) {
        if (!err) {
            if (crs.length > 0) {

                var c = crs[0];
                if (user !== c.authorID) {
                    returnThrowError(401, "Unauthorized - you have no permission  to edit this lecture", res, callback);
                } else {
                    c.title = (typeof title == "undefined") ? c.title : decodeURIComponent(title);
                    var prev = c.lectureID;
                    c.lectureID = (typeof order == "undefined") ? c.lectureID : 'lecture' + decodeURIComponent(order);
                    c.url = host + '/api/' + c.courseID + '/' + c.lectureID;
                    c.presentationURL = host + '/data/slides/' + c.courseID + '/' + c.lectureID + '.html';

                    if (typeof isActive != "undefined") {
                        var e = (isActive).toLowerCase()
                        if (e == 'true') {
                            c.isActive = true;
                        }
                        else {
                            c.isActive = false;
                        }
                    }

                    c.authorEmail = (typeof authorEmail == "undefined") ? '' : decodeURIComponent(authorEmail);
                    c.authorTwitter = (typeof authorTwitter == "undefined") ? '' : decodeURIComponent(authorTwitter);
                    c.authorWeb = (typeof authorWeb == "undefined") ? '' : decodeURIComponent(authorWeb);
                    c.semester = (typeof semester == "undefined") ? '' : decodeURIComponent(semester);
                    c.organization = (typeof org == "undefined") ? '' : decodeURIComponent(org);
                    c.organizationFac = (typeof orgfac == "undefined") ? '' : decodeURIComponent(orgfac);
                    c.field = (typeof spec == "undefined") ? '' : decodeURIComponent(spec);
                    c.web = (typeof web == "undefined") ? '' : decodeURIComponent(web);
                    c.lectureAbstract = (typeof abs == "undefined") ? '' : decodeURIComponent(abs);
                    c.lastModified = new Date();
                    c.author = (typeof author == "undefined") ? c.author : decodeURIComponent(author);
//                    keywords += "";
//                    if (keywords.length > 0) {
//                        var k = (decodeURIComponent(keywords)).split(",");
//                        var k1 = new Array();
//                        k.forEach(function(i) {
//                            var i1 = i.replace(/^\s*/, "").replace(/\s*$/, "");
//
//                            if (i1.length > 0) {
//                                k1.push(i1);
//                            }
//
//                        });
//                        c.keywords = k1;
//
//                    } else {
//                        c.keywords = [];
//                    }

                    if (typeof keywords != "undefined" && keywords.length > 0) {
                        var tmpA = new Array();
                        for (var ww = 0; ww < keywords.length; ww++) {
                            tmpA.push(keywords[ww]);
                        }
                        c.keywords = tmpA;
                    } else {
                        c.keywords = new Array();
                    }

//                    coauthors += "";
//                    if (coauthors.length > 0) {
//                        k = (decodeURIComponent(coauthors)).split(",");
//                        k1 = new Array();
//                        k.forEach(function(i) {
//                            var i1 = i.replace(/^\s*/, "").replace(/\s*$/, "");
//
//                            if (i1.length > 0) {
//                                k1.push(i1);
//                            }
//
//                        });
//                        c.coauthors = k1;
//
//                    } else {
//                        c.coauthors = [];
//                    }

                    if (typeof coauthors != "undefined" && coauthors.length > 0) {
                        var tmpA = new Array();
                        for (var ww = 0; ww < coauthors.length; ww++) {
                            tmpA.push(coauthors[ww]);
                        }
                        c.coauthors = tmpA;
                    } else {
                        c.coauthors = new Array();
                    }

                    c.save(function(err) {
                        if (err) {
                            returnThrowError(500, "Problems with database", res, callback);
                        } else {
                            if (prev === c.lectureID) { // if lectureX => lectureY
                                path.exists(SLIDES_DIRECTORY + c.courseID, function(exists) {
                                    if (exists) { // course dir exists
                                        editTemplateHTML(res, callback, c, decodeURIComponent(order), decodeURIComponent(keywords));
                                    } else { // create dir

                                        fs.mkdir(SLIDES_DIRECTORY + c.courseID, 0777, function(e) {
                                            if (e) {
                                                returnThrowError(500, 'Problem with creating course folder' + e, res, callback);
                                            } else { // copy template
                                                editTemplateHTML(res, callback, c, decodeURIComponent(order), decodeURIComponent(keywords));
                                            }
                                        });
                                    }
                                });
                            } else {// need to also change slideid!!!
                                path.exists(SLIDES_DIRECTORY + c.courseID, function(exists) {
                                    if (exists) { // course dir exists
                                        editTemplateMoveHTML(prev, res, callback, c, decodeURIComponent(order), decodeURIComponent(keywords));
                                    } else { // create dir

                                        fs.mkdir(SLIDES_DIRECTORY + c.courseID, 0777, function(e) {
                                            if (e) {
                                                returnThrowError(500, 'Problem with creating course folder' + e, res, callback);
                                            } else { // copy template
                                                editTemplateMoveHTML(prev, res, callback, c, decodeURIComponent(order), decodeURIComponent(keywords));
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            } else {
                returnThrowError(409, "Lecture with given course and order doesn't exists", res, callback);
            }
        } else {
            returnThrowError(500, "Problems with database", res, callback);
        }
    });
}

function editTemplateHTML(res, callback, lecture, order, keywords) {
    fs.readFile(SLIDES_DIRECTORY + lecture.courseID + '/' + lecture.lectureID + '.html', function(err, data) {
        if (err) {
            returnThrowError(500, 'Cannot load presentation file', res, callback);
        } else {
            var content = data.toString();
            jsdom.env({
                html: SLIDES_DIRECTORY + lecture.courseID + '/' + lecture.lectureID + '.html',
                src: [
                        jquery
                        ],
                done: function(errors, window) {
                    if (errors) {
                        returnThrowError(500, 'Error while parsing document by jsdom ', res, callback);
                    } else {
                        try {
                            var $ = window.$;
                            $('meta[name="keywords"]').attr('content');
                            Course.find({
                                courseID: lecture.courseID
                            }, function(err, crs) {
                                if (!err) {
                                    if (crs.length > 0) {
                                        $('meta[name="course"]').attr('content', crs[0].longName);
                                    }
                                    $('meta[name="author"]').attr('content', lecture.author);
                                    $('meta[name="lecture"]').attr('content', 'Lecture ' + order);
                                    $('meta[name="keywords"]').attr('content', keywords);
                                    $('title').text(lecture.title);
                                    var newcontent = $("html").html();
                                    newcontent = newcontent.replace("metaXXX", "meta_" + lecture.lectureID);
                                    newcontent = newcontent.replace(/\&amp;/g, '&');
                                    newcontent = "<!DOCTYPE html><html>" + newcontent + "</html>";
                                    fs.writeFile(SLIDES_DIRECTORY + lecture.courseID + '/' + lecture.lectureID + '.html', newcontent, function(err) {
                                        if (err) {
                                            returnThrowError(500, 'Problem with saving lecture file: ' + err, res, callback);
                                        } else {
                                            getCourseFullNameAndContinue(res, callback, lecture, lecture.courseID, copyTemplateCSS, '');
                                        }
                                    });
                                } else {
                                    returnThrowError(500, 'Problem with saving lecture file - error during retrieving course info: ' + err, res, callback);
                                }
                            });
                        }
                        catch (err) {
                            returnThrowError(500, 'Error while parsing document ', res, callback);
                        }
                    }
                }
            });
        }
    });
}

function editTemplateMoveHTML(prevFile, res, callback, lecture, order, keywords) {

    fs.readFile(SLIDES_DIRECTORY + lecture.courseID + '/' + prevFile + '.html', function(err, data) {
        if (err) {
            returnThrowError(500, 'Cannot load presentation template ', res, callback);
        } else {
            var content = data.toString();
            jsdom.env({
                html: SLIDES_DIRECTORY + lecture.courseID + '/' + prevFile + '.html',
                src: [
                        jquery
                        ],
                done: function(errors, window) {
                    if (errors) {
                        returnThrowError(500, 'Problem while parsing document by jsdom ', res, callback);
                    } else {
                        try {
                            var $ = window.$;
                            $('meta[name="keywords"]').attr('content');
                            Course.find({
                                courseID: lecture.courseID
                            }, function(err, crs) {
                                if (!err) {
                                    if (crs.length > 0) {
                                        $('meta[name="course"]').attr('content', crs[0].longName);
                                    }
                                    $('meta[name="author"]').attr('content', lecture.author);
                                    $('meta[name="lecture"]').attr('content', 'Lecture ' + order);
                                    $('meta[name="keywords"]').attr('content', keywords);
                                    $('title').text(lecture.title);

                                    // update slideid
                                    $('body').find('.slide').each(function() {
                                        if ($(this).attr('data-slideid')) { // slide doesn't have ID => all following slideids have to be update
                                            var parts = ($(this).attr('data-slideid')).split("_");
                                            $(this).attr('data-slideid', lecture.courseID + "_" + lecture.lectureID + "_" + parts[2] + "_" + parts[3]);
                                        }
                                    });

                                    var newcontent = $("html").html();
                                    newcontent = newcontent.replace("meta_" + prevFile + ".css", "meta_" + lecture.lectureID + ".css");
                                    newcontent = newcontent.replace(/\&amp;/g, '&');
                                    newcontent = "<!DOCTYPE html><html>" + newcontent + "</html>";
                                    fs.writeFile(SLIDES_DIRECTORY + lecture.courseID + '/' + prevFile + '.html', newcontent, function(err) {
                                        if (err) {
                                            returnThrowError(500, 'Problem with saving lecture file ' + err, res, callback);
                                        } else {
                                            fs.rename(SLIDES_DIRECTORY + lecture.courseID + '/' + prevFile + '.html', SLIDES_DIRECTORY + lecture.courseID + '/' + lecture.lectureID + '.html', function(err) {
                                                if (err) {
                                                    returnThrowError(500, 'Problem with saving lecture file ' + err, res, callback);
                                                } else {
                                                    getCourseFullNameAndContinue(res, callback, lecture, lecture.courseID, moveTemplateCSS, prevFile);
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    returnThrowError(500, 'Problem with saving lecture file - error during retrieving course info: ' + err, res, callback);
                                }
                            });
                        }
                        catch (err) {
                            returnThrowError(500, "Problems with database", res, callback);
                        }
                    }
                }
            });
        }
    });
}

function changeSlideidsInDatabase(oldLectureID, lecture, res, callback) {
    var prefix = new RegExp("^" + lecture.courseID + "_" + oldLectureID + "_");
    Slideid.find({
        slideid: prefix
    }, function(err, crs) {
        if (!err) {
            for (var i = 0; i < crs.length; i++) {
                var old = (crs[i].slideid).split("_");
                crs[i].slideid = lecture.courseID + "_" + lecture.lectureID + "_" + old[2] + "_" + old[3];
                crs[i].save(function(err) {
                    if (err) {
                        console.error("Error updating slideid");
                    }
                });
            }
        }
        returnData(res, callback, lecture);
    }
    );
}


function moveTemplateCSS(res, callback, lecture, prevFile, longName) {

    fs.readFile(SLIDES_DIRECTORY + lecture.courseID + '/css/meta_' + prevFile + '.css', function(err, data) {
        if (err) {
            returnThrowError(500, "Cannot load presentation css template " + SLIDES_DIRECTORY + lecture.courseID + '/css/meta_' + prevFile + '.css  ' + err, res, callback);
        } else {
            var content = data.toString();
            content = content.replace("##author", lecture.author);
            content = content.replace("##authoremail", lecture.authorEmail);
            content = content.replace("##authortwitter", lecture.authorTwitter);
            content = content.replace("##authorweb", lecture.authorWeb);
            content = content.replace("##semester", lecture.semester);
            content = content.replace("##org", lecture.organization);
            content = content.replace("##orgfac", lecture.organizationFac);
            content = content.replace("##field", lecture.field);
            content = content.replace("##orgweb", lecture.web);
            content = content.replace("##coursename", longName);
            fs.writeFile(SLIDES_DIRECTORY + lecture.courseID + '/css/meta_' + lecture.lectureID + '.css', content, function(err) {
                if (err) {
                    returnThrowError(500, 'Problem with saving lecture css file: ' + err, res, callback);
                } else {
                    fs.rename(SLIDES_DIRECTORY + lecture.courseID + '/css/meta_' + prevFile + '.css', SLIDES_DIRECTORY + lecture.courseID + '/css/meta_' + lecture.lectureID + '.css', function(err) {
                        if (err) {
                            returnThrowError(500, 'Problem with saving lecture css file: ' + err, res, callback);
                        } else {
                            // update slideid
                            changeSlideidsInDatabase(prevFile, lecture, res, callback);
                        }
                    });
                }
            });
        }
    });
}

function copyTemplateHTML(res, callback, lecture, order, keywords) {
    fs.readFile(LECTURE_TEMPLATE + 'presentation.html', function(err, data) {
        if (err) {
            returnThrowError(500, "Problems with file system", res, callback);
        } else {
            var content = data.toString();
            jsdom.env({
                html: LECTURE_TEMPLATE + 'presentation.html',
                src: [
                        jquery
                        ],
                done: function(errors, window) {
                    if (errors) {
                        returnThrowError(500, 'Error while parsing document by jsdom', res, callback);
                    } else {
                        try {
                            var $ = window.$;
                            $('meta[name="keywords"]').attr('content');
                            Course.find({
                                courseID: lecture.courseID
                            }, function(err, crs) {
                                if (!err) {
                                    if (crs.length > 0) {
                                        $('meta[name="course"]').attr('content', crs[0].longName);
                                    }
                                    $('meta[name="author"]').attr('content', lecture.author);
                                    $('meta[name="lecture"]').attr('content', 'Lecture ' + order);
                                    $('meta[name="keywords"]').attr('content', keywords);
                                    $('title').text(lecture.title);
                                    var newcontent = $("html").html();
                                    newcontent = newcontent.replace("metaXXX", "meta_" + lecture.lectureID);
                                    newcontent = newcontent.replace(/\&amp;/g, '&');
                                    newcontent = "<!DOCTYPE html><html>" + newcontent + "</html>";
                                    fs.writeFile(SLIDES_DIRECTORY + lecture.courseID + '/' + lecture.lectureID + '.html', newcontent, function(err) {
                                        if (err) {
                                            returnThrowError(500, 'Problem with saving lecture file: ' + err, res, callback);
                                        } else {
                                            getCourseFullNameAndContinue(res, callback, lecture, lecture.courseID, copyTemplateCSS, '');
                                        }
                                    });
                                } else {
                                    returnThrowError(500, 'Problem with saving lecture file - error during retrieving course info: ' + err, res, callback);
                                }

                            });
                        }
                        catch (err) {
                            returnThrowError(500, 'Error while parsing document: ' + err, res, callback);
                        }
                    }
                }
            });
        }
    });
}


function copyTemplateCSS(res, callback, lecture, prevFile, longName) {
    fs.readFile(LECTURE_TEMPLATE + 'meta.css', function(err, data) {
        if (err) {
            returnThrowError(500, "Cannot load presentation css template", res, callback);
        } else {
            var content = data.toString();
            content = content.replace("##author", lecture.author);
            content = content.replace("##authoremail", lecture.authorEmail);
            content = content.replace("##authortwitter", lecture.authorTwitter);
            content = content.replace("##authorweb", lecture.authorWeb);
            content = content.replace("##semester", lecture.semester);
            content = content.replace("##org", lecture.organization);
            content = content.replace("##orgfac", lecture.organizationFac);
            content = content.replace("##field", lecture.field);
            content = content.replace("##orgweb", lecture.web);
            content = content.replace("##coursename", longName);
            fs.writeFile(SLIDES_DIRECTORY + lecture.courseID + '/css/meta_' + lecture.lectureID + '.css', content, function(err) {
                if (err) {
                    returnThrowError(500, 'Problem with saving lecture css file: ' + err, res, callback);
                } else {
                    returnData(res, callback, lecture);
                }
            });
        }
    });
}


function getCourseFullNameAndContinue(res, originalCallback, lecture, id, callback, prevFile) {

    Course.find({
        courseID: id
    }, function(err, crs) {
        if (!err) {
            if (crs.length > 0) {
                callback(res, originalCallback, lecture, prevFile, crs[0].longName);
            } else {
                returnThrowError(404, "Lecture not found", res, originalCallback);
            }

        } else {
            returnThrowError(500, "Problems with database", res, originalCallback);
        }
    });
}

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


//var RAW_SLIDES_DIRECTORY = '/data/slides';
//var SLIDES_DIRECTORY = (path.join(path.dirname(__filename), '../../public/data/slides')).toString();
//var LECTURE_TEMPLATE = (path.join(path.dirname(__filename), '../../public/data/templates')).toString();