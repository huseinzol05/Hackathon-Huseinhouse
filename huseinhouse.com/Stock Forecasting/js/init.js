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
var columns_selected = ['Buy','Sell','Crude Oil','Diesel', 'Gasoline', 'Gold', 'Heating Oil', 'Kerosene', 'Natural Gas', 'Propane'];
function plot(data){

  var str_prob = '';
  for(var i = 0; i < data['probability'].length; i++){
    str_prob += "<li><div class='collapsible-header'><i class='material-icons'>local_parking</i>Probability to Buy / Sell on "+data['probability'][i]['date']+"</div><div class='collapsible-body'><span>"+data['probability'][i]['prob'].join('<br>')+"</span></div></li>";
  }
  $('#p-prob').html(str_prob);
  var trace_close_normalize = {
    x: data['data-date'],
    y: data['data'][0],
    type: 'scatter',
    name: 'normalized close',
    line: {
      width: 3
    }
  };
  var arima_max = {
    x: data['x-axis-predict'].slice(30),
    y: data['upper-boundary'].slice(30),
    mode: 'lines',
    name: 'predict max',
    line:{
      color:'rgb(190, 223, 243)',
      width: 0
    }
  }
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
  }
  var avg_month = {
    x: data['x-axis'].slice(31),
    y: data['avg-mean'],
    type: 'scatter',
    name: 'average mean',
    line:{
      color: 'red',
      width: 1
    }
  }
  var month_linear = {
    x: data['x-axis-predict'].slice(31),
    y: data['mean-linear'],
    type: 'scatter',
    name: 'Linear average month',
    line:{
      color: 'purple',
      width: 1
    }
  }
  var trace_crudeoil_normalize = {
    x: data['data-date'],
    y: data['data'][1],
    type: 'scatter',
    name: 'normalized Crude Oil'
  };
  var trace_diesel_normalize = {
    x: data['data-date'],
    y: data['data'][2],
    type: 'scatter',
    name: 'normalized Diesel'
  };
  var trace_gasoline_normalize = {
    x: data['data-date'],
    y: data['data'][3],
    type: 'scatter',
    name: 'normalized Gasoline'
  };
  var trace_gold_normalize = {
    x: data['data-date'],
    y: data['data'][4],
    type: 'scatter',
    name: 'normalized Gold'
  };
  var trace_heatingoil_normalize = {
    x: data['data-date'],
    y: data['data'][5],
    type: 'scatter',
    name: 'normalized Heating Oil'
  };
  var trace_kerosene_normalize = {
    x: data['data-date'],
    y: data['data'][6],
    type: 'scatter',
    name: 'normalized kerosene'
  };
  var trace_naturalgas_normalize = {
    x: data['data-date'],
    y: data['data'][7],
    type: 'scatter',
    name: 'normalized Natural Gas'
  };
  var trace_propane_normalize = {
    x: data['data-date'],
    y: data['data'][8],
    type: 'scatter',
    name: 'normalized Propane'
  };
  var trace_buy_normalize = {
    x: data['data-date'],
    y: data['data'][9],
    mode: 'markers',
    name: 'Buy',
    marker: {
      color: 'black',
      width: 2,
      symbol: 'x'
    }
  };
  var trace_sell_normalize = {
    x: data['data-date'],
    y: data['data'][10],
    mode: 'markers',
    name: 'Sell',
    marker: {
      color: 'red',
      width: 2,
      symbol: 'x'
    }
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
    name: 'close'
  };
  var trace_predict_close = {
    x: data['x-axis-predict'],
    y: data['predict-close'],
    mode: 'lines',
    name: 'close-predict',
    line: {
      dash: 'dashdot',
      width: 2
    }
  };
  var trace_buy = {
    x: data['x-axis-predict'],
    y: data['buy'],
    yaxis: 'y2',
    type: 'scatter',
    name: 'buy'
  };

  var trace_sell = {
    x: data['x-axis-predict'],
    y: data['sell'],
    yaxis: 'y2',
    type: 'scatter',
    name: 'sell'
  };
  var layout_close = {
    'title': 'Turtle method and ARIMA',
    yaxis: {domain: [0.3, 1]},
    legend: {traceorder: 'reversed'},
    yaxis2: {domain: [0, 0.22]},
    margin: {
      t: 25,
      pad: 4,
      b: 25
    }
  };
  data_plot_qq_real = [], data_plot_bar_real = [];
  for(var i = 0; i < data['columns'].length; i++){
    if(i==0){
      var scatter_real_nothing =  {
        x: data['quantile-real'][i][0][0],
        y: data['quantile-real'][i][0][1],
        mode: 'markers',
        name: 'do nothing',
        marker: {
          color: 'blue'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };
      var scatter_real_sell =  {
        x: data['quantile-real'][i][1][0],
        y: data['quantile-real'][i][1][1],
        mode: 'markers',
        name: 'sell',
        marker: {
          color: 'red'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };
      var scatter_real_buy =  {
        x: data['quantile-real'][i][2][0],
        y: data['quantile-real'][i][2][1],
        mode: 'markers',
        name: 'buy',
        marker: {
          color: 'green'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };
      var line_real =  {
        x: data['linear-real'][i][0],
        y: data['linear-real'][i][1],
        mode: 'lines',
        name: 'regression line',
        line:{
          color: 'orange'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };

      var bar_real_nothing = {
        x: data['bar_real'][i][0][0],
        y: data['bar_real'][i][0][1],
        type: 'bar',
        name: 'do nothing',
        marker: {
          color: 'blue'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };
      var bar_real_sell = {
        x: data['bar_real'][i][1][0],
        y: data['bar_real'][i][1][1],
        type: 'bar',
        name: 'sell',
        marker: {
          color: 'red'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };
      var bar_real_buy = {
        x: data['bar_real'][i][2][0],
        y: data['bar_real'][i][2][1],
        type: 'bar',
        name: 'buy',
        marker: {
          color: 'green'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      }
      var kde_real = {
        x: data['kde_real'][i][0],
        y: data['kde_real'][i][1],
        mode: 'lines',
        line:{
          color: 'orange'
        },
        name: '1d kernel density',
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      }
    }
    else{
      var scatter_real_nothing =  {
        x: data['quantile-real'][i][0][0],
        y: data['quantile-real'][i][0][1],
        mode: 'markers',
        showlegend: false,
        marker: {
          color: 'blue'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };
      var scatter_real_sell =  {
        x: data['quantile-real'][i][1][0],
        y: data['quantile-real'][i][1][1],
        mode: 'markers',
        showlegend: false,
        marker: {
          color: 'red'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };
      var scatter_real_buy =  {
        x: data['quantile-real'][i][2][0],
        y: data['quantile-real'][i][2][1],
        mode: 'markers',
        showlegend: false,
        marker: {
          color: 'green'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };
      var line_real =  {
        x: data['linear-real'][i][0],
        y: data['linear-real'][i][1],
        showlegend: false,
        mode: 'lines',
        line:{
          color: 'orange'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };

      var bar_real_nothing = {
        x: data['bar_real'][i][0][0],
        y: data['bar_real'][i][0][1],
        type: 'bar',
        showlegend: false,
        marker: {
          color: 'blue'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };
      var bar_real_sell = {
        x: data['bar_real'][i][1][0],
        y: data['bar_real'][i][1][1],
        type: 'bar',
        showlegend: false,
        marker: {
          color: 'red'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      };
      var bar_real_buy = {
        x: data['bar_real'][i][2][0],
        y: data['bar_real'][i][2][1],
        type: 'bar',
        showlegend: false,
        marker: {
          color: 'green'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      }
      var kde_real = {
        x: data['kde_real'][i][0],
        y: data['kde_real'][i][1],
        mode: 'lines',
        showlegend: false,
        line:{
          color: 'orange'
        },
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
      }
    }
    data_plot_bar_real.push(bar_real_nothing);
    data_plot_bar_real.push(bar_real_sell);
    data_plot_bar_real.push(bar_real_buy);
    data_plot_bar_real.push(kde_real);
    data_plot_qq_real.push(scatter_real_nothing);
    data_plot_qq_real.push(scatter_real_sell);
    data_plot_qq_real.push(scatter_real_buy);
    data_plot_qq_real.push(line_real);
  }
  var split = 1 / data['columns'].length;
  var boundary = 0.05;
  var layout_qq_real = {
    'title': 'Quantile-Quantile plot',
    margin: {
      t: 25,
      pad: 4,

    }
  };
  var layout_bar_real = {
    'title': 'Histogram Plot',
    margin: {
      t: 25,
      pad: 4,

    }
  };
  for(var i = 0; i < data['columns'].length; i++){
    layout_qq_real['yaxis' + (i + 1)] = {anchor: 'x' + (i + 1),title:data['columns'][i]}
    layout_qq_real['xaxis' + (i + 1)] = {domain: [(i * split), (i + 1) * split - boundary]}
    layout_bar_real['yaxis' + (i + 1)] = {anchor: 'x' + (i + 1)}
    layout_bar_real['xaxis' + (i + 1)] = {domain: [(i * split), (i + 1) * split - boundary],title:data['columns'][i]}
  }
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
    name: 'month average'
  };

  var trace_year_avg = {
    x: data['year-x'],
    y: data['year'],
    xaxis: 'x2',
    yaxis: 'y2',
    type: 'scatter',
    name: 'year average'
  };

  var trace_quantile_avg = {
    x: data['quantile-x'],
    y: data['quantile'],
    xaxis: 'x3',
    yaxis: 'y3',
    type: 'scatter',
    name: 'quantile average'
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
      x: columns_selected,
      y: columns_selected,
      type: 'heatmap'
    }
  ];
  var data_kde_buy = [{
    x: data['density-buy'][0],
    y: data['density-buy'][1],
    mode: 'markers',
    name: 'scatter',
    marker: {
      size: 3,
      color: 'green'
    },
    type: 'scatter'
  },{
    x: data['density-buy'][0],
    y: data['density-buy'][1],
    name: 'density',
    ncontours: 20,
    colorscale: 'Greens',
    reversescale: true,
    showscale: true,
    type: 'histogram2dcontour'
  },
  {
    x: data['density-buy'][0],
    name: 'Buy density',
    yaxis: 'y2',
    type: 'histogram',
    marker: {
      color: "rgba(100, 200, 102, 0.7)",
      line: {
        color:  "rgba(100, 200, 102, 1)",
        width: 1
      }
    }
  },
  {
    y: data['density-buy'][1],
    name: data['selected-column'][0]+' density',
    xaxis: 'x2',
    type: 'histogram',
    marker: {
      color: "rgba(100, 200, 102, 0.7)",
      line: {
        color:  "rgba(100, 200, 102, 1)",
        width: 1
      }
    }
  }
];
var layout_kde_buy = {
  showlegend: false,
  hovermode: 'closest',
  bargap: 10,
  xaxis: {
    title: 'Buy',
    domain: [0, 0.80],
    showgrid: true,
    zeroline: false
  },
  yaxis: {
    title: data['selected-column'][0],
    domain: [0, 0.80],
    showgrid: true,
    zeroline: false
  },
  xaxis2: {
    domain: [0.85, 1],
    showgrid: true,
    zeroline: false
  },
  yaxis2: {
    domain: [0.85, 1],
    showgrid: true,
    zeroline: true
  },
  title: 'Buy VS ' + data['selected-column'][0],
  margin: {
    t: 50,
    pad: 10,

  }
}
var data_kde_sell = [{
  x: data['density-sell'][0],
  y: data['density-sell'][1],
  mode: 'markers',
    name: 'scatter',
  marker: {
    size: 3,
    color: 'red'
  },
  type: 'scatter'
},{
  x: data['density-sell'][0],
  y: data['density-sell'][1],
  ncontours: 20,
  colorscale: 'Hot',
    name: 'density',
  reversescale: true,
  showscale: true,
  type: 'histogram2dcontour'
},
{
  x: data['density-sell'][0],
  name: 'Sell density',
  yaxis: 'y2',
  type: 'histogram',
  marker: {
   color: "rgba(255, 100, 102, 0.7)",
    line: {
     color:  "rgba(255, 100, 102, 1)",
     width: 1
   }
 }
},
{
  y: data['density-buy'][1],
  name: data['selected-column'][0]+' density',
  xaxis: 'x2',
  type: 'histogram',
  marker: {
   color: "rgba(255, 100, 102, 0.7)",
    line: {
     color:  "rgba(255, 100, 102, 1)",
     width: 1
   }
 },
}
];
var layout_kde_sell = {
    showlegend: false,
    hovermode: 'closest',
    bargap: 10,
    xaxis: {
      title: 'Sell',
      domain: [0, 0.80],
      showgrid: true,
      zeroline: false
    },
    yaxis: {
      title: data['selected-column'][1],
      domain: [0, 0.80],
      showgrid: true,
      zeroline: false
    },
    xaxis2: {
      domain: [0.85, 1],
      showgrid: true,
      zeroline: false
    },
    yaxis2: {
      domain: [0.85, 1],
      showgrid: true,
      zeroline: true
    },
    title: 'Sell VS ' + data['selected-column'][1],
    margin: {
      t: 50,
      pad: 10,

    }
}
var layout_correlation = {
  'title': 'Stock correlation',
  margin: {
    t: 25,
    pad: 4,

  },
  'annotations': []
}
for(var i = 0; i < columns_selected.length; i++){
  for(var j = 0; j < columns_selected.length; j++){
    var result = {
      xref: 'x1',
      yref: 'y1',
      x: columns_selected[j],
      y: columns_selected[i],
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

var trace_observed = {
  x: data['x-axis'],
  y: data['observed'],
  type: 'line',
  name: 'Observed'
};

var trace_trend = {
  x: data['x-axis'],
  y: data['trend'],
  xaxis: 'x2',
  yaxis: 'y2',
  type: 'line',
  name: 'Trend'
};
var trace_seasonal = {
  x: data['x-axis'],
  y: data['seasonal'],
  xaxis: 'x3',
  yaxis: 'y3',
  type: 'line',
  name: 'Seasonal'
};
var trace_residual = {
  x: data['x-axis'],
  y: data['resid'],
  xaxis: 'x4',
  yaxis: 'y4',
  type: 'line',
  name: 'Residual'
};

var layout_season = {
  'title': 'Season decomposed',
  yaxis: {domain: [0, 0.2]},
  yaxis2: {domain: [0.25, 0.5]},
  xaxis2: {anchor: 'y2'},
  yaxis3: {domain: [0.55, 0.75]},
  xaxis3: {anchor: 'y3'},
  yaxis4: {domain: [0.80, 1.0]},
  xaxis4: {anchor: 'y4'},
  margin: {
    t: 25,
    pad: 4,
  }
};

var data_candlestick = {
  x: data['candle'][0],
  close: data['candle'][1],
  high: data['candle'][2],
  low: data['candle'][3],
  open: data['candle'][4],
  increasing: {line: {color: 'black'}},
  decreasing: {line: {color: 'red'}},
  type: 'candlestick',
};
var layout_candlestick = {
  dragmode: 'zoom',
  title:'Candlestick Visualization',
  margin: {
    t: 25,
    pad: 4,
    b:10
  }
};

var data_pie_title = [{
  values: [136, 30, 1954, 61, 91, 16, 54, 60],
  labels: ['china rally wall street debt crash', 'news analysis august bank business commodity', 'today price world trump reason trade', 'investor earning record morgan kong singapore',
  'record tech high gain share apple', 'bubble fund world advisor rekindle risk', 'time investor drop owner corporation angele', 'growth risk china trade trump nvidia'],
  name: 'News titles',
  hoverinfo: 'label+percent+name',
  hole: .4,
  type: 'pie'
}];

var layout_pie_title = {
  title: 'Top-8 News titles',
  margin: {
    t: 25,
    pad: 4,
    b:10
  }
};

var data_pie_news = [{
  values: [189,186,108,102,86,80,73,69],
  labels: ['Motley Fool', 'CNBC', 'Bloomberg', 'MarketWatch', 'New York Times','CNNMoney', 'Forbes', 'Reuters'],
  name: 'News titles',
  hoverinfo: 'label+percent+name',
  hole: .4,
  type: 'pie'
}];

var layout_pie_news = {
  title: 'Top-8 News',
  margin: {
    t: 25,
    pad: 4,
    b:10
  }
};

var trace_buy_normalize_sentiment = {
  x: data['data-date'],
  y: data['sentiment-data'][3],
  mode: 'markers',
  name: 'Buy',
  marker: {
    color: 'black',
    width: 2,
    symbol: 'x'
  }
};
var trace_sell_normalize_sentiment = {
  x: data['data-date'],
  y: data['sentiment-data'][4],
  mode: 'markers',
  name: 'Sell',
  marker: {
    color: 'red',
    width: 2,
    symbol: 'x'
  }
};
var trace_close_normalize_sentiment = {
  x: data['data-date'],
  y: data['sentiment-data'][0],
  type: 'scatter',
  name: 'normalized close',
  line: {
    width: 3
  }
};
var trace_negative_normalize = {
  x: data['data-date'],
  y: data['sentiment-data'][1],
  type: 'scatter',
  name: 'normalized negative sentiment'
};
var trace_positive_normalize = {
  x: data['data-date'],
  y: data['sentiment-data'][2],
  type: 'scatter',
  name: 'normalized positive sentiment'
};
var layout_overlap_sentiment = {
  'title': 'Normalized Sentiment Plot',
  margin: {
    t: 25,
    pad: 4,
  }
};

Plotly.newPlot('div-sentiment', [trace_buy_normalize_sentiment, trace_sell_normalize_sentiment, trace_close_normalize_sentiment, trace_negative_normalize, trace_positive_normalize], layout_overlap_sentiment);
Plotly.newPlot('div-donut-title', data_pie_title, layout_pie_title);
Plotly.newPlot('div-donut-news', data_pie_news, layout_pie_news);
Plotly.newPlot('div-overlap', [trace_close_normalize, trace_crudeoil_normalize, trace_kerosene_normalize, trace_gasoline_normalize, trace_heatingoil_normalize, trace_diesel_normalize, trace_naturalgas_normalize, trace_gold_normalize, trace_propane_normalize, trace_buy_normalize,trace_sell_normalize], layout_overlap);
Plotly.newPlot('div-bar', [trace_day, trace_month], layout_bar);
Plotly.newPlot('div-buysell', [trace_close, trace_predict_close, trace_buy, trace_sell, arima_max, arima_min,avg_month,month_linear], layout_close);
Plotly.newPlot('div-qq', data_plot_qq_real, layout_qq_real);
Plotly.newPlot('div-correlation', data_correlation, layout_correlation);
Plotly.newPlot('div-candlestick', [data_candlestick, trace_predict_close,avg_month,month_linear], layout_candlestick);
Plotly.newPlot('div-kde-buy', data_kde_buy, layout_kde_buy);
Plotly.newPlot('div-kde-sell', data_kde_sell, layout_kde_sell);
Plotly.newPlot('div-histogram', data_plot_bar_real, layout_bar_real);
Plotly.newPlot('div-avg', [trace_month_avg, trace_year_avg, trace_quantile_avg], layout_stack);
Plotly.newPlot('div-compose', [trace_observed, trace_trend, trace_seasonal, trace_residual], layout_season);
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
  if($('#uploadcsv').val().length == 0){
    Materialize.toast("Upload CSV first", 4000);
    return;
  }
  if($('#rollingday').val().length == 0){
    Materialize.toast("insert Historical rolling value", 4000);
    return;
  }
  $(".loadingscreen").css("display", "block");
  filename = new Date().getTime();
  file = document.getElementById('uploadcsv');
  formData = new FormData();
  formData.append("file", file.files[0]);
  formData.append("rolling", $('#rollingday').val());
  formData.append("future", $('#future').val());
  $('#paracsv').html('Upload CSV');
  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      try{
        data = JSON.parse(this.responseText);
      }
      catch(err){
        $(".loadingscreen").css("display", "none");
        $("#failparagraph").html('Data not able to process, please upload another data-set');
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
        $('html, body').animate({
          scrollTop: $("#output").offset().top
        }, 500);
        setTimeout(function(){
          $(".loadingscreen").css("display", "none");
        }, 1000);
      }
    }
  };
  xmlhttp.open("POST", "http://www.huseinhouse.com:8094/uploader", true);
  xmlhttp.upload.onloadend = function (e) {
    $('#paracsv').html('Processing CSV');
  }
  xmlhttp.onerror = function(e){
    $(".loadingscreen").css("display", "none");
    $("#failparagraph").html('Fail connected to server, please email to husein.zol05@gmail.com');
    $(".loadingscreen-fail").css("display", "block");
  }
  xmlhttp.send(formData);
});
$("#cancelrequest").click(function() {
  xmlhttp.abort();
  $(".loadingscreen").css("display", "none");
  Materialize.toast("You cancel the request", 4000);
})

$('.loadingscreen-fail').click(function(){
  $('.loadingscreen-fail').css('display', 'none');
})
plot(val);
