var express = require('express');

var port = process.env.PORT || 80; // Required for Heroku

var app = express();

app.use(express.static('public'))

app.get('/', function(req, res) {
	res.redirect('/index.html');
});

app.listen(port);
console.log('Server started at http://localhost:' + port);
