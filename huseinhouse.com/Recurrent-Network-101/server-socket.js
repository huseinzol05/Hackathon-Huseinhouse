var fs = require('fs');

// choose port
var port = 9001;
var app = require('express')();
var https = require('https');

// if https
var server = https.createServer({
  key: ,
  cert: ,
  ca: ,
  requestCert: false,
  rejectUnauthorized: false
},app);
server.listen(port, '0.0.0.0');

var io = require('socket.io').listen(server);

var rnnnet = io.of('/rnnnet');
rnnnet.on('connection', function(socket){
  socket.on('privatesocket',function(data){
    socket.join(data.id);
    console.log(data.id + ' joined');
  });
  socket.on('senddata',function(data){
    data = JSON.parse(data);
    socket.in(data.id).emit('senddata', data.data);
  });
  socket.on('leaveroom',function(data){
    console.log(data);
    socket.in(data.id).emit('leaveroom', data);
    socket.leave(data.id);
    console.log(data.id + ' leaved');
  });
});
