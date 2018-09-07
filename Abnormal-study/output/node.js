module.paths.push('/usr/local/lib/node_modules');
var port = 5001;
var app = require('express')();
var http = require('http');
var server = http.Server(app);
server.listen(port, '0.0.0.0');
var io = require('socket.io').listen(server);

var rekathon = io.of('/rekathon');
rekathon.on('connection', function(socket){
  socket.on('backend', function(msg){
    socket.broadcast.emit('backend', msg);
  });
  socket.on('frontend', function(msg){
    socket.broadcast.emit('frontend', msg);
  });
});
