exports.canModifyCourse = function(req, res, courseID){
    return true;
};
    
exports.canModifyCourseRealId = function(req, res, id){
    return true;
}
    
exports.canModifyLecture = function(req, res, courseID, lectureID){
    return true;
};

    
exports.canModifyLectureRealId = function(req, res, id){
    return true;
};

exports.user = function(req, res){
    return 'uknown';
}