var https = require('https');

app.get('/api/gbooks/:id/:mode', function(req, res){
    require('../server_ext/gbooks/gbooks_ext.js').book(req.params.id, req.params.mode, res);
});


