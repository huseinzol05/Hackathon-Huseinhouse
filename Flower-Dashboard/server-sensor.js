var port = 8060;
var express = require('express');
var app = express();
var path = require('path');
var mysql = require('mysql');
var http = require('http');
var server = require('http').createServer(app);
server.listen(port, '0.0.0.0');
var io = require('socket.io').listen(server);

// insert correct database here
// var con_database = mysql.createConnection({
//   host: "localhost",
//   user: "user",
//   password: "password",
//   database: "database"
// });

// debug for connection database
// con_database.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected to ripple database!");
// });

var light = io.of('/sensorlight');
light.on('connection', function(socket){

  // if we got database
  // con_database.query("SELECT * FROM TABLE", function (err, result) {
  //   if (err) throw err;
  //   resultdatabase = JSON.stringify(result);
  // });
  // socket.emit('rippleupdate', resultdatabase);

  socket.emit('lightupdate', JSON.stringify({'status': 'OK', 'msg': 'DETECTED TEMP SENSOR'}));
  socket.on('lightupdate', function(msg){
    socket.broadcast.emit('lightupdate', msg);
  });
});

var humidity = io.of('/sensorhumidity');
humidity.on('connection', function(socket){

  // if we got database
  // con_database.query("SELECT * FROM TABLE", function (err, result) {
  //   if (err) throw err;
  //   resultdatabase = JSON.stringify(result);
  // });
  // socket.emit('rippleupdate', resultdatabase);

  socket.emit('humidityupdate', JSON.stringify({'status': 'OK', 'msg': 'DETECTED HUMIDITY SENSOR'}));
  socket.on('humidityupdate', function(msg){
    socket.broadcast.emit('humidityupdate', msg);
  });
});

var camera = io.of('/sensorcamera');
camera.on('connection', function(socket){

  // if we got database
  // con_database.query("SELECT * FROM TABLE", function (err, result) {
  //   if (err) throw err;
  //   resultdatabase = JSON.stringify(result);
  // });
  // socket.emit('rippleupdate', resultdatabase);

  socket.emit('cameraupdate', JSON.stringify({'status': 'OK', 'msg': 'DETECTED CAMERA'}));
  socket.on('cameraupdate', function(msg){
    socket.broadcast.emit('cameraupdate', msg);
  });
});

var io_client = require('socket.io-client');
var socket_light = io_client.connect('http://www.huseinhouse.com:8060/sensorlight', {reconnect: true});
socket_light.on('connect', function (socket) {
    console.log('Connected!');
});
var socket_humidity = io_client.connect('http://www.huseinhouse.com:8060/sensorhumidity', {reconnect: true});
setInterval(function() {
  // we should replace with real sensor values
  socket_light.emit('lightupdate', JSON.stringify({'status': 'OK', 'msg': Math.floor(Math.random() * 10) + 20}));
  socket_humidity.emit('humidityupdate', JSON.stringify({'status': 'OK', 'msg': Math.floor(Math.random() * 70) + 20}));
}, 5000);

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
