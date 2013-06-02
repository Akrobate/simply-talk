var express = require('express');
 
var app = express();

app.use(express.static(__dirname + '/../public'));

console.log("debug " + __dirname);


app.get('/', function(req, res) {
  res.writeHead(200);
  res.end('Salut tout le monde !');
});

app.listen(8080);

