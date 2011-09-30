/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


app.get('/api/v1/likes/:lectureid/', null);
app.get('/api/v1/likes/:lectureid/:slideid?', null);
app.post('/api/v1/likes/:lectureid/:slideid', function(req, res){});
app.post('/api/v1/likes/:lectureid/:slideid/:op', function(req, res, next){});
