/**
 * Comments handler
 * 
 * 
 */

app.get('/api/v1/comments/:lectureid/', null);
app.get('/api/v1/comments/:lectureid/:slideid?', null);
app.post('/api/v1/comments/:lectureid/:slideid', function(req, res){});
app.post('/api/v1/comments/:lectureid/:slideid/:op', function(req, res, next){});
