/**
 * REST handlers
 * 
 * 
 */
//TODO: použít tu router knihovnu z connectu



get('/posts/:id', function(req) {
    return db.openDoc(req.params.id).then(function(post) {
        return viewEngine.respond('post.html', {
            locals: post
        });
    });
});

post('/posts/:id/comments', function(req) {
    var comment = req.params;

    return db.openDoc(req.params.id).then(function(post) {
        post.comments = post.comments || [];
        post.comments.push(comment);

        return db.saveDoc(post).then(function(resp) {
            return bogart.redirect('/posts/'+req.params.id);
        });
    });
});