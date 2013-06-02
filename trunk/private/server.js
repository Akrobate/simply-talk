var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

server.listen(8080);

var md5 = require('MD5');

app.use(express.static(__dirname + '/../public'));

app.get('/login', function(req, res) {
	res.render('login.ejs', {etage: req.params.etagenum});
});


io.sockets.on('connection', function(socket) {

	var me;
	console.log("nouvel utilisateur");
	
	socket.on('login', function(user) {
		me = user;
		me.id = md5(user.pseudo);
		me.avatar = 'https://gravatar.com/avatar/'+ user.id + '?s=50';
		console.log('user login:' + user.pseudo);
		if (user.pseudo == '' || user.pseudo == 'undefined') {	
			socket.emit('logerror');
		} else {
			socket.emit('logged');
		}
		
	});



});

