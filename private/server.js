var express = require('express');
var app = express();
var server = require('http').createServer(app);
const fileSystem = require('fs');
const path = require('path');
var io = require('socket.io').listen(server);
var md5 = require('MD5');

server.listen(3333);

app.get('/mp3/', function(req, res) {
	res.setHeader("Cache-Control", "public, max-age=345600");
    res.setHeader("Expires", new Date(Date.now() + 345600000).toUTCString());
});

// static server

app.use(express.static(__dirname + '/../public'));

app.get('/login', function(req, res) {
	res.render('login.ejs', {etage: req.params.etagenum});
});

app.get('/', function(req, res) {
	res.render('main.ejs', {etage: req.params.etagenum});
});

app.get('/home', function(req, res) {
	res.render('main.ejs', {etage: req.params.etagenum});
});

app.get('/accueil', function(req, res) {
	res.render('main.ejs', {etage: req.params.etagenum});
});

var users = {};
var messages = [];
var history = 4;

io.sockets.on('connection', function(socket) {

	var me = false;
	console.log("Nouvel utilisateur");
	
	for (var i in users) {
		socket.emit('newuser', users[i]);
	}

	socket.on('login', function(user) {
		me = user;
		me.id = md5(user.pseudo);
		me.avatar = 'https://gravatar.com/avatar/'+ user.id + '?s=50';
		console.log('user login:' + user.pseudo);
		if (user.pseudo == '' || user.pseudo == 'undefined') {	
			socket.emit('logerror');
		} else {
			socket.emit('logged', user );
		}
		users[me.id] = me;
		io.sockets.emit('newuser', me);	
	});

	socket.on('disconnect', function () {
    	io.sockets.emit('userremove', me);
    	socket.emit('userremove', me);
    	socket.emit('logout', me);
    	delete users[me.id];
  	});
		
	socket.on('logout', function(){
		if(!me) {
			return false;
		}
		io.sockets.emit('userremove', me);
		socket.emit('userremove', me);
		socket.emit('logout', me);
		delete users[me.id];
	});

	socket.on('setmail', function(data){
		if(!me) {
			return false;
		}

		var hash = md5(data.mail);
		me.hash = hash;
		me.mail = data.mail;
		me.avatar = 'https://gravatar.com/avatar/'+ me.hash + '?s=50';
		socket.emit('setmailok');		
	});

	socket.on('newmessage', function(msg) {
		console.log('msg:' + msg.message);
		msg.user = me;
		date = new Date();
		msg.h = date.getHours();
		msg.m = date.getMinutes();
		
		messages.push(msg);
		if (messages.length > history) {
			messages.shift();
		}
				
		io.sockets.emit('newmessageconfirmation', msg);
	});

	socket.on('getpreviousmessages', function() {
		for (var i in messages) {
			socket.emit('newmessageconfirmation', messages[i]);
			console.log(messages[i]);
		}
	});

	socket.on('typing', function() {		
		io.sockets.emit('typing', me);
	});
});



var server2 = require('http').createServer(function(request, response) {
    var filePath = path.join(__dirname, 'noise.mp3');
    var stat = fileSystem.statSync(filePath);
    console.log(filePath);
    response.writeHead(200, {
        'Content-Type': 'audio/mpeg', 
        'Content-Length': stat.size
    });
    
    var readStream = fileSystem.createReadStream(filePath);
    readStream.on('data', function(data) {
        response.write(data);
    });
    
    readStream.on('end', function() {
        response.end();        
    });
})
.listen(2000);
