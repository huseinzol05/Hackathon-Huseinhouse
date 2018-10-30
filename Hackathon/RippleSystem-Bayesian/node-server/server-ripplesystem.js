var fs = require('fs');
var mysql = require('mysql');
var port = 9001;
var app = require('express')();
var https = require('https');
var server = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/huseinzol05.dynamic-dns.net-0001/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/huseinzol05.dynamic-dns.net-0001/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/huseinzol05.dynamic-dns.net-0001/chain.pem'),
  requestCert: false,
  rejectUnauthorized: false
},app);
server.listen(port, '0.0.0.0');

var io = require('socket.io').listen(server);

var resultdatabase;

var con = mysql.createConnection({
  host: "localhost",
  user: "huseinguest",
  password: "rumahhusein123",
  database: "ripplesystem"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

io.on('connection', function(socket){
  con.query("SELECT cause, longitude, latitude, reporttime FROM traffic where DATE(reporttime) = DATE(NOW())", function (err, result) {
    if (err) throw err;
    resultdatabase = JSON.stringify(result);
  });
  socket.emit('rippleupdate', resultdatabase);
  socket.on('rippleupdate', function(msg){
    socket.broadcast.emit('rippleupdate', msg);
  });
});
