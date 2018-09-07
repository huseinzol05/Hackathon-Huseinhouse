var dict_emotion = {'neutral': 0, 'sadness': 1, 'disgust': 2, 'anger': 3, 'surprise': 4, 'fear': 5, 'happiness': 6};
emotion_keywords = [['inoffensive', 'bland', 'unobjectionable', 'unexceptionable', 'anodyne', 'unremarkable', 'ordinary', 'commonplace', 'everyday'],
['unhappiness', 'sorrow', 'dejection', 'regret', 'depression', 'misery', 'cheerlessness', 'downheartedness', 'despondency', 'despair', 'desolation'],
['revulsion', 'repugnance', 'aversion', 'distaste', 'abhorrence', 'loathing', 'detestation', 'odium'],
['irate', 'annoyed', 'cross', 'vexed', 'irritated', 'exasperated', 'indignant', 'aggrieved', 'irked', 'piqued', 'displeased', 'provoked'],
['shock', 'bolt', 'thunderbolt', 'bombshell', 'revelation', 'amazement'],
['terror', 'fright', 'fearfulness', 'horror', 'alarm', 'panic', 'agitation', 'trepidation', 'dread'],
['contentment', 'pleasure', 'contentedness', 'satisfaction', 'cheerfulness', 'cheeriness', 'merriment', 'merriness']];
var lis = [];
function addmessage(id, str, status){
  if(lis.length > 20){
    lis.pop();
  }
  var d = new Date();
  var li = $('<li />', {'class': 'demo-' + status});
  var message = '[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ';
  message += 'STATUS: ' + status + ', LOG: ' + str;
  li.html(message);
  lis.push(li);
  $('#'+id).html(lis[lis.length-1]);
  for(var i = lis.length - 2; i >= 0; i--){
    $('#'+id).append(lis[i]);
  }
}

function requestmusic(keyword){
  keyword = emotion_keywords[dict_emotion[keyword]][Math.floor(Math.random() * emotion_keywords[dict_emotion[keyword]].length)];
  Materialize.toast('Searching music keyword ' + keyword, 4000);
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var music = JSON.parse(xhttp.responseText);
      try{
        $('#refmusic').attr('href', music['playlists']['items'][0]['external_urls']['spotify']);
        $('#imgalbum').attr('src', music['playlists']['items'][0]['images'][0]['url']);
        Materialize.toast('Changed music', 4000);
      }
      catch(err){
        Materialize.toast('Fail to change music, Oh god Spotify!', 4000);
      }
    }
  };
  xhttp.open("GET", "https://api.spotify.com/v1/search?q=" + keyword + "&type=playlist&limit=1", true);
  xhttp.setRequestHeader("Accept", "application/json");
  xhttp.setRequestHeader("Authorization", "Bearer BQB0s76cYOAt66nf1_N91c1V1hZgVJMfGko8lM0qEnNSCAk2Qn9feNLquasN795ygoY7NwHdj1tvhjar5r13le9fy1Z7YNB6r5KnShcqmdeXyGxfFsyvCx3TnsHvi7WKpvvuaPsU4TwOwbxuBKd0hdXg2Ddk1oY");
  xhttp.send();
}

var d = new Date();
$('#updatetime').html(d);
var data_recognized = {
  labels : [d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()],
  datasets : [
    {
      fillColor : "rgba(54,162,235,0.5)",
      strokeColor : "rgba(54,162,235,1)",
      pointColor : "rgba(54,162,235,1)",
      pointStrokeColor : "#fff",
      data : [0]
    }
  ]
}
var data_unknown = {
  labels : [d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()],
  datasets : [
    {
      fillColor : "rgba(54,162,235,0.5)",
      strokeColor : "rgba(54,162,235,1)",
      pointColor : "rgba(54,162,235,1)",
      pointStrokeColor : "#fff",
      data : [0]
    }
  ]
}

function updateData(Data, data){
  var d = new Date();
  var labels = Data["labels"];
  var dataSet = Data["datasets"][0]["data"];
  if(labels.length > 12) labels.shift();
  labels.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
  if(dataSet.length > 12) dataSet.shift();
  dataSet.push(data);
}

var optionsAnimation = {
  scaleOverride : true,
  scaleSteps : 10,
  scaleStepWidth : 10,
  scaleStartValue : 0
}
var optionsNoAnimation = {
  animation : false,
  scaleOverride : true,
  scaleSteps : 20,
  scaleStepWidth : 10,
  scaleStartValue : 0
}
var ctx = document.getElementById("myChart_recognized").getContext("2d");
var optionsNoAnimation = {animation : false}
var myNewChart = new Chart(ctx);
var ctx2 = document.getElementById("myChart_unknown").getContext("2d");
var myNewChart2 = new Chart(ctx2);
myNewChart.Line(data_recognized, optionsAnimation);
myNewChart2.Line(data_unknown, optionsAnimation);
setInterval(function(){
  myNewChart.Line(data_recognized, optionsNoAnimation);
  myNewChart2.Line(data_unknown, optionsNoAnimation);
}, 5000);
