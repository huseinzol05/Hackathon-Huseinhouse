function addmessage(id, str, status){
  var d = new Date();
  var li = $('<li />', {'class': 'demo-' + status});
  var message = '[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ';
  message += 'STATUS: ' + status + ', LOG: ' + str;
  li.html(message);
  $('#'+id).prepend(li);
}

var d = new Date();
$('#updatetime').html(d);
var data_light = {
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
var data_humidity = {
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
var ctx = document.getElementById("myChart_temp").getContext("2d");
var optionsNoAnimation = {animation : false}
var myNewChart = new Chart(ctx);
var ctx2 = document.getElementById("myChart_humidity").getContext("2d");
var myNewChart2 = new Chart(ctx2);
myNewChart.Line(data_light, optionsAnimation);
myNewChart2.Line(data_humidity, optionsAnimation);
setInterval(function(){
  myNewChart.Line(data_light, optionsNoAnimation);
  myNewChart2.Line(data_humidity, optionsNoAnimation);
}, 5000);
