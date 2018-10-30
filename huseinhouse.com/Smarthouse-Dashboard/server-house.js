module.paths.push('/usr/local/lib/node_modules');
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('/dev/ttyUSB0');
const parser = new Readline();
const Gpio = require('onoff').Gpio;
var FAN = new Gpio(4, 'out');
var BIG_LAMP = new Gpio(17, 'out');
var SMALL_LAMP = new Gpio(27, 'out');
var io_client = require('socket.io-client');
var socket_smart = io_client.connect('https://huseinzol05.dynamic-dns.net:9001/smarthouse', {reconnect: true});
socket_smart.on('connect', function (socket) {
  console.log('Connected!');
  socket_smart.emit('smarthouse-get', [FAN.readSync(), BIG_LAMP.readSync(), SMALL_LAMP.readSync(), 0, 0]);
});
port.pipe(parser);
parser.on('data', function(input){
  input = input.split(':');
  socket_smart.emit('smarthouse-get', [FAN.readSync(), BIG_LAMP.readSync(), SMALL_LAMP.readSync(), parseFloat(input[0]), parseFloat(input[1])]);
});

socket_smart.on('smarthouse-utility', function(msg){
  if(msg == 0){
    if (FAN.readSync() == 0) {
      FAN.writeSync(1);
    } else {
      FAN.writeSync(0);
    }
  }
  if(msg == 1){
    if (BIG_LAMP.readSync() == 0) {
      BIG_LAMP.writeSync(1);
    } else {
      BIG_LAMP.writeSync(0);
    }
  }
  if(msg == 2){
    if (SMALL_LAMP.readSync() == 0) {
      SMALL_LAMP.writeSync(1);
    } else {
      SMALL_LAMP.writeSync(0);
    }
  }
});
