var express = require('express');
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var io = require('socket.io-client');
var socket = io.connect('https://huseinzol05.dynamic-dns.net:9001', {reconnect: true});
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "huseinguest",
  password: "rumahhusein123",
  database: "ripplesystem"
});


var text_not_understand = ['Oh oh oh?', 'Herm, maybe one of these can help you?', 'What? choose one', 'Heh?', 'Hurm?'];
var talk = ['Lets talk', 'What do you to say?', 'Please leave a message', 'Ya?', 'Say something'];
var enable_comment = false;

var reason = '';

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/huseinzol05.dynamic-dns.net-0001/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/huseinzol05.dynamic-dns.net-0001/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/huseinzol05.dynamic-dns.net-0001/chain.pem')
};

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
  req.query['hub.verify_token'] === 'kiss_husein_ass') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;
  res.status(200).send(req.query['hub.challenge']);
  if (data.object === 'page') {
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        }
        else if (event.postback) {
          receivedPostback(event);
        }
        else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
  senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;
  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    if(enable_comment){
      sendTextMessage(senderID, 'Thank you, your submission have been saved.');
      enable_comment = false;
      return;
    }
    switch (messageText) {
      case 'hello':
      case 'hi':
      case 'menu':
      sendGenericMessage(senderID);
      break;

      case 'report':
      case 'Accident':
      case 'Weather':
      case 'Landslide':
      case 'I don\'t know':
      reportTrafficMessage(senderID);
      reason = messageText;
      break;

      default:
      sendMenuMessage(senderID);
    }
  } else if (messageAttachments) {
    if(messageAttachments[0].type === 'location') {
      var lat = messageAttachments[0].payload.coordinates.lat;
      var long = messageAttachments[0].payload.coordinates.long;
      var sql = "INSERT INTO traffic(facebookid, cause, longitude, latitude) VALUES ('" + senderID + "', '" + reason +"', '" + long + "', '" + lat + "')";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
      var obj = [{"cause": reason, "latitude": lat, "longitude": long, "reporttime": Date().toString().split(' ').slice(0, 5).join(' ')}];
      var myJSON = JSON.stringify(obj);
      socket.emit('rippleupdate', myJSON);
      sendTextMessage(senderID, 'Thank you, your information have been saved.');
      sendTextMessage(senderID, 'Just type \'menu\' if you need anything');
    }
    else sendMenuMessage(senderID);
  }
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "ripplesystem",
            subtitle: "Ripple System",
            item_url: "https://huseinzol05.dynamic-dns.net/ripplesystem/",
            image_url: "http://www.huseinhouse.com/myhouse/img/ripplesystem.jpg",
            buttons: [{
              type: "web_url",
              url: "https://huseinzol05.dynamic-dns.net/ripplesystem/",
              title: "Open Ripple System"
            }],
          }, {
            title: "report",
            subtitle: "Report any traffic here",
            image_url: "https://huseinzol05.dynamic-dns.net/ripplesystem/img/material/report_ripple.png",
            buttons: [{
              type: "postback",
              title: "Click here to report",
              payload: "postback_report",
            }]
          },{
            title: "get traffic",
            subtitle: "Receive any traffic value for a location",
            image_url: "https://huseinzol05.dynamic-dns.net/ripplesystem/img/material/value_ripple.png",
            buttons: [{
              type: "postback",
              title: "Click here to enter KL location",
              payload: "postback_get_traffic",
            }]
          }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

function reportTrafficMessage(recipientId){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text:"Please share your location:",
      quick_replies:[
        {
          content_type:"location",
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function sendMenuMessage(recipientId){
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text_not_understand[Math.floor((Math.random() * (text_not_understand.length - 1)))],
          buttons: [
            {
              type: "postback",
              title: "Main menu",
              payload: "postback_mainmenu",
            },
            {
              type: "postback",
              title: "Leave a message",
              payload: "postback_leave_message",
            }
          ],
        }
      }
    }
  };
  callSendAPI(messageData);
}

function sendStartMessage(senderID){
  sendTextMessage(recipientId, 'Hi, welcome to Ripple System!');
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
  "at %d", senderID, recipientID, payload, timeOfPostback);

  switch(payload){
    case 'postback_mainmenu':
    sendGenericMessage(senderID);
    break;

    case 'postback_leave_message':
    sendTextMessage(senderID, talk[Math.floor((Math.random() * (talk.length - 1)))]);
    enable_comment = true;
    break;

    case 'postback_get_traffic':
    sendTextMessage(senderID, 'Sorry, this feature not ready yet.');
    break;

    case 'postback_report':
    replyTraffic(senderID);
    break;
  }
}

function replyTraffic(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Choose one",
      quick_replies: [{
        content_type: "text",
        title: 'Accident',
        payload: 'payload_report_accident'
      },{
        content_type: 'text',
        title: 'Weather',
        payload: 'payload_report_weather'
      },{
        content_type: 'text',
        title: 'Landslide',
        payload: 'payload_report_landslide'
      },
      {
        content_type: 'text',
        title: 'I don\'t know',
        payload: 'payload_report_dontknow'
      }
    ]
  }
};

callSendAPI(messageData);
}


function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAADJhmiji4wBAHskpprmoBJy0JEcBPRZCJFyeej2l5UWgMSLWdIhJTNZC4mY5pvJEwxTheNYck54rMhRZAXQiQrrU7fsgY7YG2326XJRzcIkUuwIUX3wKdf14StgWoYf6NHZAaAvD3YCwqQFS68YsbZBKN7bQC5ZC4ZArasJsKuzAZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
      messageId, recipientId);
    } else {
      console.error("Unable to send message.");
    }
  });
}

https.createServer(options, app).listen(8099, function() {
  console.log('Express server listening on port ' + 8099);
});
