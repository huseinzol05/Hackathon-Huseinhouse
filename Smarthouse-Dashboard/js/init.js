window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

$('.dropdown-button').dropdown({
  inDuration: 300,
  outDuration: 225,
  constrainWidth: false,
  hover: true,
  gutter: 0,
  belowOrigin: true,
  alignment: 'left',
  stopPropagation: false
});

var d = new Date();
$('#updatetime').html(d);
var data_fan = {
  type: 'line',
  data: {
    labels: [d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()],
    datasets: [{
      label: 'signal',
      backgroundColor: window.chartColors.blue,
      borderColor: window.chartColors.blue,
      data: [0],
      fill: false,
    }]
  },
  options: {
    responsive: true,
    title:{
      display:false
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'time'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Value'
        }
      }]
    }
  }
};
var data_biglamp = {
  type: 'line',
  data: {
    labels: [d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()],
    datasets: [{
      label: 'signal',
      backgroundColor: window.chartColors.blue,
      borderColor: window.chartColors.blue,
      data: [0],
      fill: false,
    }]
  },
  options: {
    responsive: true,
    title:{
      display:false
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'time'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Value'
        }
      }]
    }
  }
};
var data_smalllamp = {
  type: 'line',
  data: {
    labels: [d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()],
    datasets: [{
      label: 'signal',
      backgroundColor: window.chartColors.blue,
      borderColor: window.chartColors.blue,
      data: [0],
      fill: false,
    }]
  },
  options: {
    responsive: true,
    title:{
      display:false
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'time'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Value'
        }
      }]
    }
  }
};
var data_humidity = {
  type: 'line',
  data: {
    labels: [d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()],
    datasets: [{
      label: 'temperature',
      backgroundColor: window.chartColors.red,
      borderColor: window.chartColors.red,
      data: [0],
      fill: false,
    }]
  },
  options: {
    responsive: true,
    title:{
      display:false
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'time'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Value'
        }
      }]
    }
  }
};
var data_temperature = {
  type: 'line',
  data: {
    labels: [d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()],
    datasets: [{
      label: 'humidity',
      backgroundColor: window.chartColors.red,
      borderColor: window.chartColors.red,
      data: [0],
      fill: false,
    }]
  },
  options: {
    responsive: true,
    title:{
      display:false
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'time'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Value'
        }
      }]
    }
  }
};
var socket_house = io('https://huseinzol05.dynamic-dns.net:9001/smarthouse', {secure: true});
window.onload = function() {
  window.myLine_fan = new Chart(document.getElementById("chart-fan").getContext("2d"), data_fan);
  window.myLine_biglamp = new Chart(document.getElementById("chart-biglamp").getContext("2d"), data_biglamp);
  window.myLine_smalllamp = new Chart(document.getElementById("chart-smalllamp").getContext("2d"), data_smalllamp);
  window.myLine_humidity = new Chart(document.getElementById("chart-humidity").getContext("2d"), data_humidity);
  window.myLine_temperature = new Chart(document.getElementById("chart-temperature").getContext("2d"), data_temperature);
};
var FAN = 'ON', BIG_LAMP = 'ON', SMALL_LAMP = 'ON';
$('#fanbutton').click(function(){
  if(FAN == 'ON'){
    FAN = 'OFF';
  }
  else{
    FAN = 'ON';
  }
  socket_house.emit('smarthouse-utility', 0);
  $('#fanstatus').html(FAN);
})
$('#biglampbutton').click(function(){
  if(BIG_LAMP == 'ON'){
    BIG_LAMP = 'OFF';
  }
  else{
    BIG_LAMP = 'ON';
  }
  socket_house.emit('smarthouse-utility', 1);
  $('#biglampstatus').html(BIG_LAMP);
})
$('#smalllampbutton').click(function(){
  if(SMALL_LAMP == 'ON'){
    SMALL_LAMP = 'OFF';
  }
  else{
    SMALL_LAMP = 'ON';
  }
  socket_house.emit('smarthouse-utility', 2);
  $('#smalllampstatus').html(SMALL_LAMP);
})
function updateData(Data, data){
  var d = new Date();
  var labels = Data['data']['labels'];
  var dataSet = Data['data']['datasets'][0]['data'];
  if(labels.length > 12) labels.shift();
  labels.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
  if(dataSet.length > 12) dataSet.shift();
  dataSet.push(data);
}

socket_house.on('smarthouse-update', function(msg){
  var json = JSON.parse(msg);
  if(json['VAL']){
    updateData(data_fan, json['VAL'][0]);
    updateData(data_biglamp, json['VAL'][1]);
    updateData(data_smalllamp, json['VAL'][2]);
    updateData(data_humidity, json['VAL'][3]);
    updateData(data_temperature, json['VAL'][4]);
    if(json['VAL'][0] == 0) FAN = 'ON';
    else FAN = 'OFF';
    if(json['VAL'][1] == 0) BIG_LAMP = 'ON';
    else BIG_LAMP = 'OFF';
    if(json['VAL'][2] == 0) SMALL_LAMP = 'ON';
    else SMALL_LAMP = 'OFF';
    $('#fanstatus').html(FAN);
    $('#biglampstatus').html(BIG_LAMP);
    $('#smalllampstatus').html(SMALL_LAMP);
    window.myLine_fan.update();
    window.myLine_biglamp.update();
    window.myLine_smalllamp.update();
    window.myLine_humidity.update();
    window.myLine_temperature.update();
  }
})
