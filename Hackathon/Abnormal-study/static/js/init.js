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
  }
);

var d = new Date();
$('#updatetime').html(d);
var data_person = {
  type: 'line',
  data: {
    labels: [d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()],
    datasets: [{
      label: 'person count',
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
var data_abnormal = {
  type: 'line',
  data: {
    labels: [d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()],
    datasets: [{
      label: 'abnormal count',
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
var socket_rekathon = io('http://192.168.43.168:5001/rekathon');
window.onload = function() {
  window.myLine_person = new Chart(document.getElementById("person_graph").getContext("2d"), data_person);
  window.myLine_abnormal = new Chart(document.getElementById("abnormal_graph").getContext("2d"), data_abnormal);
};

function updateData(Data, data){
  var d = new Date();
  var labels = Data['data']['labels'];
  var dataSet = Data['data']['datasets'][0]['data'];
  if(labels.length > 12) labels.shift();
  labels.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
  if(dataSet.length > 12) dataSet.shift();
  dataSet.push(data);
}

socket_rekathon.on('backend', function(msg){
    var data = JSON.parse(msg);
    var heatmap = [{
    z: data['matrix'],
    type: 'heatmap'
  }];
    var layout = {
    'title': 'Heatmap sonar',
    margin: {
      t: 25,
      pad: 4,

    }
  };
  Plotly.newPlot('heatmap_sonar', heatmap, layout);
})
socket_rekathon.on('frontend', function(msg){
    var data = JSON.parse(msg);
    var bar_predict = {
      x: data['histogram'][0],
      y: data['histogram'][1],
      type: 'bar',
      name: 'histogram behavior'
    };
    var kde_predict = {
      x: data['kde'][0],
      y: data['kde'][1],
      mode: 'lines',
      name: 'KDE behavior'
    };
    var layout_bar = {
      'title': "{'abnormal': 0, 'normal': 1}",
      xaxis: {
        autotick: true
      },
    margin: {
      t: 25,
      pad: 4,

    }
    };
    Plotly.newPlot('distribution', [bar_predict, kde_predict], layout_bar);
    updateData(data_person, data['person']);
    updateData(data_abnormal, data['abnormal']);
    window.myLine_person.update();
    window.myLine_abnormal.update();
})