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
$('.collapsible').collapsible();
var queryDict = {}
location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]})
function plot(data){

  var arima_max = {
    x: data['x-axis-predict'].slice(30),
    y: data['upper-boundary'].slice(30),
    mode: 'lines',
    name: 'predict max',
    line:{
      color:'rgb(190, 223, 243)',
      width: 0
    }
  };
  var arima_min = {
    x: data['x-axis-predict'].slice(30),
    y: data['lower-boundary'].slice(30),
    fill: 'tonexty',
    mode: 'lines',
    name: 'predict min',
    line:{
      color:'rgb(190, 223, 243)',
      width: 0
    }
  };
  var avg_month = {
    x: data['x-axis'].slice(31),
    y: data['avg-mean'],
    type: 'scatter',
    name: 'average mean',
    line:{
      color: 'red',
      width: 1
    }
  };
  var month_linear = {
    x: data['x-axis-predict'].slice(31),
    y: data['mean-linear'],
    type: 'scatter',
    name: 'Linear average month',
    line:{
      color: 'purple',
      width: 1
    }
  };
  var trace_catch_normalize = {
    x: data['data-date'],
    y: data['data'][0],
    type: 'scatter',
    name: 'normalized Catch',
    line: {
      width: 3
    }
  };
  var trace_zonal_normalize = {
    x: data['data-date'],
    y: data['data'][1],
    type: 'scatter',
    name: 'normalized Zonal Winds'
  };
  var trace_meridional_normalize = {
    x: data['data-date'],
    y: data['data'][2],
    type: 'scatter',
    name: 'normalized Meridional Winds'
  };
  var trace_humidity_normalize = {
    x: data['data-date'],
    y: data['data'][3],
    type: 'scatter',
    name: 'normalized Humidity'
  };
  var trace_air_temp_normalize = {
    x: data['data-date'],
    y: data['data'][4],
    type: 'scatter',
    name: 'normalized Air Temp'
  };
  var trace_sea_temp_normalize = {
    x: data['data-date'],
    y: data['data'][5],
    type: 'scatter',
    name: 'normalized Sea Surface Temp'
  };
  var layout_overlap = {
    'title': 'Normalized Plot',
    margin: {
      t: 25,
      pad: 4,

    }
  };

  var trace_close = {
    x: data['x-axis'],
    y: data['close'],
    type: 'scatter',
    name: 'Historical catch'
  };

  var trace_predict_close = {
    x: data['x-axis-predict'],
    y: data['predict-close'],
    mode: 'lines',
    name: 'Catch prediction',
    line: {
      dash: 'dashdot',
      width: 2
    }
  };

  var layout_close = {
    'title': 'Catch Forecasting',
    legend: {traceorder: 'reversed'},
    margin: {
      t: 25,
      pad: 4
    }
  };

  var trace_day = {
    x: data['day-x'],
    y: data['day-y'],
    type: 'bar',
    name: 'day frequency'
  };

  var trace_month = {
    x: ['jan','feb','march','april','may','jun','july','aug','sep','oct','nov','dec'],
    y: data['month-y'],
    xaxis: 'x2',
    yaxis: 'y2',
    type: 'bar',
    name: 'month frequency'
  };
  var layout_bar = {
    'title': 'Bar plot',
    xaxis: {domain: [0, 0.45]},
    yaxis2: {anchor: 'x2'},
    xaxis2: {domain: [0.55, 1]},
    margin: {
      t: 25,
      pad: 4,
    }
  };
  var trace_month_avg = {
    x: data['month-x'],
    y: data['month'],
    type: 'scatter',
    name: 'Month Average'
  };

  var trace_year_avg = {
    x: data['year-x'],
    y: data['year'],
    xaxis: 'x2',
    yaxis: 'y2',
    type: 'scatter',
    name: 'Year Average'
  };

  var trace_quantile_avg = {
    x: data['quantile-x'],
    y: data['quantile'],
    xaxis: 'x3',
    yaxis: 'y3',
    type: 'scatter',
    name: 'Quantile Average'
  };
  var layout_stack = {
    'title': 'Average plot',
    xaxis: {domain: [0, 0.266]},
    yaxis2: {anchor: 'x2'},
    xaxis2: {domain: [0.366, 0.633]},
    yaxis3: {anchor: 'x3'},
    xaxis3: {domain: [0.733, 1]},
    margin: {
      t: 25,
      pad: 4,
    }
  };
  var data_correlation = [
    {
      z: data['z'],
      x: data['columns'],
      y: data['columns'],
      type: 'heatmap'
    }
  ];

var layout_correlation = {
  'title': 'Catch correlation',
  margin: {
    t: 25,
    pad: 4,

  },
  'annotations': []
}
for(var i = 0; i < data['columns'].length; i++){
  for(var j = 0; j < data['columns'].length; j++){
    var result = {
      xref: 'x1',
      yref: 'y1',
      x: data['columns'][j],
      y: data['columns'][i],
      text: data['z'][i][j].toFixed(2),
      font: {
        family: 'Arial',
        size: 12,
        color: 'rgb(50, 171, 96)'
      },
      showarrow: false,
      font: {
        color: 'white'
      }
    };
    layout_correlation.annotations.push(result);
  }
}

// shifted week starts here
var shifted_week = {
  x: data['x-axis'].slice(7),
  y: data['week-shifted'][0],
  type: 'scatter',
  name: 'Weekly catch'
}
var shifted_week_mean = {
  x: data['x-axis'].slice(7),
  y: data['week-shifted'][1],
  type: 'scatter',
  name: 'shifted mean'
}
var shifted_week_std = {
  x: data['x-axis'].slice(7),
  y: data['week-shifted'][2],
  type: 'scatter',
  name: 'shifted standard deviation'
}
var layout_close_week = {
  'title': 'Shifted 7 days',
  margin: {
    t: 25,
    pad: 4,
  }
};
// shifted week ends here

// shifted month starts here
var shifted_month = {
  x: data['x-axis'].slice(31),
  y: data['month-shifted'][0],
  type: 'scatter',
  name: 'Monthly Catch'
}
var shifted_month_mean = {
  x: data['x-axis'].slice(31),
  y: data['month-shifted'][1],
  type: 'scatter',
  name: 'shifted mean'
}
var shifted_month_std = {
  x: data['x-axis'].slice(31),
  y: data['month-shifted'][2],
  type: 'scatter',
  name: 'shifted standard deviation'
}
var layout_close_month = {
  'title': 'Shifted 31 days',
  margin: {
    t: 25,
    pad: 4,
  }
};
// shifted month ends here

// dicker fuller starts here
var dicker_desc = ['Test Statistic', 'p-value', '#Lags Used', 'Number of Observations Used', 'Critical Value (1%)', 'Critical Value (10%)', 'Critical Value (5%)'];
var str = '';
for(var i = 0; i < data['desc'].length; i++){
  str += "<p>"+dicker_desc[i]+": "+data['desc'][i]+"</p>"
}
$('#dicker-daily').html(str);
var str = '';
for(var i = 0; i < data['week-desc'].length; i++){
  str += "<p>"+dicker_desc[i]+": "+data['week-desc'][i]+"</p>"
}
$('#dicker-weekly').html(str);
var str = '';
for(var i = 0; i < data['month-desc'].length; i++){
  str += "<p>"+dicker_desc[i]+": "+data['month-desc'][i]+"</p>"
}
$('#dicker-monthly').html(str);
//dicker filler ends here

Plotly.newPlot('div-week', [shifted_week, shifted_week_mean, shifted_week_std], layout_close_week);
Plotly.newPlot('div-month', [shifted_month, shifted_month_mean, shifted_month_std], layout_close_month);
Plotly.newPlot('div-overlap', [trace_catch_normalize, trace_zonal_normalize, trace_meridional_normalize, trace_humidity_normalize, trace_air_temp_normalize, trace_sea_temp_normalize], layout_overlap);
Plotly.newPlot('div-bar', [trace_day, trace_month], layout_bar);
Plotly.newPlot('div-catch', [trace_close, trace_predict_close, arima_max, arima_min,avg_month,month_linear], layout_close);
Plotly.newPlot('div-correlation', data_correlation, layout_correlation);
Plotly.newPlot('div-avg', [trace_month_avg, trace_year_avg, trace_quantile_avg], layout_stack);
}
$('#uploadcsv').change(function(){
  file = document.getElementById('uploadcsv');
  size = file.files[0].size;
  if($(this).val().search('.csv') <= 0){
    $(this).val('');
    Materialize.toast('Only support CSV', 4000);
    return;
  }
  if(parseInt(size) > 10000000){
    $(this).val('');
    Materialize.toast('Only support file less than 10MB', 4000);
    return;
  }
})

var xmlhttp;
$("#submitbutton").click(function(){
  if($('#future').val().length == 0){
    Materialize.toast("insert future value", 4000);
    return;
  }
  $('#paracsv').html('Crunching your historical data');
  $(".loadingscreen").css("display", "block");
  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      try{
        data = JSON.parse(this.responseText);
      }
      catch(err){
        $(".loadingscreen").css("display", "none");
        $("#failparagraph").html('Data not able to process');
        $(".loadingscreen-fail").css("display", "block");
        return;
      }
      if(data['error']){
        $(".loadingscreen").css("display", "none");
        $("#failparagraph").html(data['error']);
        $(".loadingscreen-fail").css("display", "block");
      }
      else{
        $('#paracsv').html('Visualizing your data-set');
        plot(data);
        setTimeout(function(){
          $(".loadingscreen").css("display", "none");
        }, 1000);
      }
    }
  };
  xmlhttp.open("GET", "http://www.huseinhouse.com:8087/fisherman?id="+queryDict['id']+"&future="+$('#future').val(), true);
  xmlhttp.onerror = function(e){
    $(".loadingscreen").css("display", "none");
    $("#failparagraph").html('Fail connected to server, please email to husein.zol05@gmail.com');
    $(".loadingscreen-fail").css("display", "block");
  }
  xmlhttp.send();
});
$("#cancelrequest").click(function() {
  xmlhttp.abort();
  $(".loadingscreen").css("display", "none");
  Materialize.toast("You cancel the request", 4000);
})

$('.loadingscreen-fail').click(function(){
  $('.loadingscreen-fail').css('display', 'none');
})
if (queryDict['id'] == '1') {
  $('#pic').attr('src', 'image/husein.jpg');
  $('#details').html("<p>Name: Husein Zolkepli</p><p>Age: 22 years old</p><p>Address: Cyberjaya, Selangor</p><p>Port: Kuala Selangor, Selangor</p>");
  plot(husein);
}
if (queryDict['id'] == '2'){
  $('#pic').attr('src', 'image/caijuan.jpeg')
  $('#details').html("<p>Name: Liew Cai Juan</p><p>Age: 19 years old</p><p>Address: Kepong, Kuala Lumpur</p><p>Port: Kuala Selangor, Selangor</p>");
  plot(caijuan);
}
if (queryDict['id'] == '3') {
  $('#pic').attr('src', 'image/xiangting.jpeg')
  $('#details').html("<p>Name: Joe Chan</p><p>Age: 19 years old</p><p>Address: Sri Damansara, Kuala Lumpur</p><p>Port: Kuala Selangor, Selangor</p>");
  plot(xiangting);
}
if (queryDict['id'] == '4') {
  $('#pic').attr('src', 'image/wengkei.jpeg')
  $('#details').html("<p>Name: Ting Wei Kei</p><p>Age: 22 years old</p><p>Address: Damansara Height, Kuala Lumpur</p><p>Port: Kuala Selangor, Selangor</p>");
  plot(wengkei);
}
