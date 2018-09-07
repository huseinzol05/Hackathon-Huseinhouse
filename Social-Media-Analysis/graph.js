function update_select(arr, no, select){
  string = ""
  for(var i = 0; i < arr.length;i++){
    if(i==no)string += "<option selected value='"+arr[i]+"'>"+arr[i]+"</option>"
    else string += "<option value='"+arr[i]+"'>"+arr[i]+"</option>"
  }
  $('#'+select).html(string)
}
function createRandomtextStyle() {
    return {
        normal: {
            color: 'rgb(' + [
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160)
            ].join(',') + ')'
        }
    };
}
$('#tweet-count').html(' tweets processed: '+TWITTER['len'])
hashtags = []
words = []
for(var i = 0; i < TWITTER.wordcloud_hashtags.length;i++){
  hashtags.push({name: TWITTER.wordcloud_hashtags[i][0],
  value: TWITTER.wordcloud_hashtags[i][1],
  textStyle: createRandomtextStyle()})
  words.push({name: TWITTER.wordcloud[i][0],
  value: TWITTER.wordcloud[i][1],
  textStyle: createRandomtextStyle()})
}

option = {
    tooltip: {
        show: true
    },
    series: [{
        name: 'Hashtags',
        type: 'wordCloud',
        size: ['80%', '80%'],
        rotationRange : [0,0],
        gridSize: 8,
        width: '100%',
        height: '100%',
        textPadding: 0,
        autoSize: {
            enable: true,
            minSize: 14
        },
        data: hashtags
    }]
};

var hashtags_graph = echarts.init(document.getElementById('div_wordcloud_hashtags'));
hashtags_graph.setOption(option)

option = {
    tooltip: {
        show: true
    },
    series: [{
        name: 'Hashtags',
        type: 'wordCloud',
        size: ['80%', '80%'],
        rotationRange : [0,0],
        gridSize: 8,
        width: '100%',
        height: '100%',
        textPadding: 0,
        autoSize: {
            enable: true,
            minSize: 14
        },
        data: words
    }]
};

var words_graph = echarts.init(document.getElementById('div_wordcloud'));
words_graph.setOption(option)

var chart_sentiment = echarts.init(document.getElementById('div_sentiment'));
var colors_sentiment = ['red','orange','blue','grey'];
chart_sentiment.setOption({
  color: colors_sentiment,
  legend: {
    data: ['negative','neutral','positive','average'],
    align: 'left'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    type: 'category',
    data: TWITTER['neutral'][0]
  },
  yAxis: {
    type: 'value'
  },
  title : {
    text: 'sentiment graph',
    x:'left'
  },
  tooltip : {
    trigger: 'axis'
  },
  series: [{
    name: 'negative',
    data: TWITTER['negative'][1],
    type: 'line'
  },
  {
    name: 'neutral',
    data: TWITTER['neutral'][1],
    type: 'line'
  },
  {
    name: 'positive',
    data:  TWITTER['positive'][1],
    type: 'line'
  },
  {
    name: 'average',
    data: TWITTER['average'],
    type: 'bar',
    itemStyle: {
      normal: {
        opacity: 0.2
      }
    },
  }]
})

var chart_heatmap = echarts.init(document.getElementById('div_heatmap'));
data = TWITTER['heatmap'];
max = 0;
data = data.map(function (item) {
  if(item[2]>max) max=item[2];
  return [item[0], item[1], item[2] || '-'];
});
chart_heatmap.setOption({
  title: {
    text: 'Sentiment heatmap',
    left: 'center'
  },
  tooltip: {
    position: 'top'
  },
  animation: false,
  grid: {
    height: '50%',
    y: '10%'
  },
  xAxis: {
    type: 'category',
    data: TWITTER['x-axis'],
    splitArea: {
      show: true
    },
    axisLabel: {
      interval: 0,
      rotate: 90
    }
  },
  yAxis: {
    type: 'category',
    data: ['negative','neutral','positive'],
    splitArea: {
      show: true
    }
  },
  visualMap: {
    min: 0,
    max: max,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '1%'
  },
  series: [{
    name: 'Influencers & Issues sentiment',
    type: 'heatmap',
    data: data,
    itemStyle: {
      emphasis: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
})

var chart_influencer = echarts.init(document.getElementById('div_influencer_social'));
var colors_influencer = ['#D01622'];
chart_influencer.setOption({
  color: colors_influencer,
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    type: 'category',
    data:  TWITTER['influencers'][0]
  },
  yAxis: {
    type: 'value'
  },
  title : {
    text: 'Influencers Top-30',
    x:'left'
  },
  tooltip : {
    trigger: 'axis'
  },
  series: [{
    data: TWITTER['influencers'][1],
    type: 'bar'
  }]
})

var chart_topics = echarts.init(document.getElementById('div_topic_social'));
var colors_topics = ['#304455'];
chart_topics.setOption({
  color: colors_topics,
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    type: 'category',
    data:  TWITTER['topics'][0]
  },
  yAxis: {
    type: 'value'
  },
  title : {
    text: 'Hot Topics Top-30',
    x:'left'
  },
  tooltip : {
    trigger: 'axis'
  },
  series: [{
    data: TWITTER['topics'][1],
    type: 'bar'
  }]
})

$('#fullscreen').click(function(){
  elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
})

update_select(EXPORT['x_axis'],0,'xaxisleft')
update_select(EXPORT['x_axis'],1,'yaxistop')
update_select(EXPORT['x_axis'],2,'xaxisright')
update_select(EXPORT['x_axis'],3,'yaxisbottom')
var app = {};
app.config = {
  xAxisLeft: EXPORT['x_axis'][0],
  yAxisTop: EXPORT['x_axis'][1],
  xAxisRight: EXPORT['x_axis'][2],
  yAxisBottom: EXPORT['x_axis'][3]
}

$('select').material_select();

var chart = echarts.init(document.getElementById('div_correlation'));

chart.setOption({
  title: {
    text: 'Products correlation',
    left: 'center',
    top: 16
  },
  tooltip: {
    position: 'top'
  },
  tooltip: {
    formatter: function (params) {
      return params.value[2] + ': ' + EXPORT['x_axis'][params.value[1]] + ' & ' + EXPORT['x_axis'][params.value[0]];
    },
    position: 'top'
  },
  animation: false,
  grid: {
    height: '50%',
    y: '10%'
  },
  xAxis: {
    type: 'category',
    data: EXPORT['x_axis'],
    splitArea: {
      show: true
    },
    axisLabel: {
      interval: 0,
      rotate: 90
    }
  },
  yAxis: {
    type: 'category',
    data: EXPORT['x_axis'],
    splitArea: {
      show: true
    }
  },
  visualMap: {
    min: 0,
    max: 1,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '0%'
  },
  series: [{
    name: 'correlation',
    type: 'heatmap',
    data: EXPORT['correlation'],
    label: {
      normal: {
        show: false
      }
    },
    itemStyle: {
      emphasis: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
})

var schema = EXPORT['schema_4_axis']
option = null;

var axisColors = {
  'xAxisLeft': '#2A8339',
  'xAxisRight': '#367DA6',
  'yAxisTop': '#A68B36',
  'yAxisBottom': '#BD5692'
};
var colorBySchema = {};

var fieldIndices = schema.reduce(function (obj, item) {
  obj[item.name] = item.index;
  return obj;
}, {});

var groupCategories = [];
var groupColors = [];
var data;

function normalizeData_4_axis(originData) {
  var groupMap = {};
  originData.forEach(function (row) {

  });

  originData.forEach(function (row) {
    row.forEach(function (item, index) {
    });
  });

  for (var groupName in groupMap) {
    if (groupMap.hasOwnProperty(groupName)) {
      groupCategories.push(groupName);
    }
  }
  var hStep = Math.round(300 / (groupCategories.length - 1));
  for (var i = 0; i < groupCategories.length; i++) {
    groupColors.push(echarts.color.modifyHSL('#5A94DF', hStep * i));
  }

  return originData;
}

function makeAxis(dimIndex, id, name, nameLocation) {
  var axisColor = axisColors[id.split('-')[dimIndex]];
  colorBySchema[name] = axisColor;
  return {
    id: id,
    name: name,
    nameLocation: nameLocation,
    nameGap: nameLocation === 'middle' ? 30 : 10,
    gridId: id,
    splitLine: {show: false},
    axisLine: {
      lineStyle: {
        color: axisColor
      }
    },
    axisLabel: {
      textStyle: {
        color: axisColor
      }
    },
    axisTick: {
      lineStyle: {
        color: axisColor
      }
    }
  };
}

function makeSeriesData(xLeftOrRight, yTopOrBottom) {
  return data.map(function (item, idx) {
    var schemaX = app.config[xLeftOrRight];
    var schemaY = app.config[yTopOrBottom];
    return [
      item[fieldIndices[schemaX]], // 0: xValue
      item[fieldIndices[schemaY]], // 1: yValue
      item[1],                     // 2: group
      item[0],                     // 3: name
      schemaX,                     // 4: schemaX
      schemaY,                     // 5: schemaY
      idx                          // 6
    ];
  });
}

function makeSeries(xLeftOrRight, yTopOrBottom) {
  var id = xLeftOrRight + '-' + yTopOrBottom;
  return {
    zlevel: 1,
    type: 'scatter',
    name: 'exports',
    xAxisId: id,
    yAxisId: id,
    symbolSize: 8,
    itemStyle: {
      emphasis: {
        color: '#fff'
      }
    },
    animationThreshold: 5000,
    progressiveThreshold: 5000,
    data: makeSeriesData(xLeftOrRight, yTopOrBottom)
  };
}

function makeDataZoom(opt) {
  return echarts.util.extend({
    type: 'slider',
    fillerColor: 'rgba(255,255,255,0.1)',
    borderColor: '#777',
    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
    handleSize: '60%',
    handleStyle: {
      color: '#aaa'
    },
    textStyle: {
      color: '#aaa'
    },
    filterMode: 'empty',
    realtime: false
  }, opt);
}

function getOption_4_axis(data,xAxisLeft,yAxisTop,xAxisRight,yAxisBottom) {
  var gridWidth = '35%';
  var gridHeight = '35%';
  var gridLeft = 80;
  var gridRight = 50;
  var gridTop = 50;
  var gridBottom = 80;

  return {
    axisPointer: {
      show: true,
      snap: true,
      lineStyle: {
        type: 'dashed'
      },
      label: {
        show: true,
        margin: 6,
        backgroundColor: '#556',
        textStyle: {
          color: '#fff'
        }
      },
      link: [{
        xAxisId: ['xAxisLeft-yAxisTop', 'xAxisLeft-yAxisBottom']
      }, {
        xAxisId: ['xAxisRight-yAxisTop', 'xAxisRight-yAxisBottom']
      }, {
        yAxisId: ['xAxisLeft-yAxisTop', 'xAxisRight-yAxisTop']
      }, {
        yAxisId: ['xAxisLeft-yAxisBottom', 'xAxisRight-yAxisBottom']
      }]
    },
    xAxis: [
      makeAxis(0, 'xAxisLeft-yAxisTop', xAxisLeft, 'middle'),
      makeAxis(0, 'xAxisLeft-yAxisBottom', xAxisLeft, 'middle'),
      makeAxis(0, 'xAxisRight-yAxisTop', xAxisRight, 'middle'),
      makeAxis(0, 'xAxisRight-yAxisBottom', xAxisRight, 'middle')
    ],
    yAxis: [
      makeAxis(1, 'xAxisLeft-yAxisTop', yAxisTop, 'end'),
      makeAxis(1, 'xAxisLeft-yAxisBottom', yAxisBottom, 'end'),
      makeAxis(1, 'xAxisRight-yAxisTop', yAxisTop, 'end'),
      makeAxis(1, 'xAxisRight-yAxisBottom', yAxisBottom, 'end')
    ],
    grid: [{
      id: 'xAxisLeft-yAxisTop',
      left: gridLeft,
      top: gridTop,
      width: gridWidth,
      height: gridHeight
    }, {
      id: 'xAxisLeft-yAxisBottom',
      left: gridLeft,
      bottom: gridBottom,
      width: gridWidth,
      height: gridHeight
    }, {
      id: 'xAxisRight-yAxisTop',
      right: gridRight,
      top: gridTop,
      width: gridWidth,
      height: gridHeight
    }, {
      id: 'xAxisRight-yAxisBottom',
      right: gridRight,
      bottom: gridBottom,
      width: gridWidth,
      height: gridHeight
    }],
    dataZoom: [
      makeDataZoom({
        width: gridWidth,
        height: 20,
        left: gridLeft,
        bottom: 10,
        xAxisIndex: [0, 1]
      }),
      makeDataZoom({
        width: gridWidth,
        height: 20,
        right: gridRight,
        bottom: 10,
        xAxisIndex: [2, 3]
      }),
      makeDataZoom({
        orient: 'vertical',
        width: 20,
        height: gridHeight,
        left: 10,
        top: gridTop,
        yAxisIndex: [0, 2]
      }),
      makeDataZoom({
        orient: 'vertical',
        width: 20,
        height: gridHeight,
        left: 10,
        bottom: gridBottom,
        yAxisIndex: [1, 3]
      })
    ],
    visualMap: [{
      show: false,
      type: 'piecewise',
      categories: groupCategories,
      dimension: 2,
      inRange: {
        color: groupColors //['#d94e5d','#eac736','#50a3ba']
      },
      outOfRange: {
        color: ['#ccc'] //['#d94e5d','#eac736','#50a3ba']
      },
      top: 20,
      textStyle: {
        color: '#fff'
      },
      realtime: false
    }],
    series: [
      makeSeries('xAxisLeft', 'yAxisTop'),
      makeSeries('xAxisLeft', 'yAxisBottom'),
      makeSeries('xAxisRight', 'yAxisTop'),
      makeSeries('xAxisRight', 'yAxisBottom')
    ],
    animationEasingUpdate: 'cubicInOut',
    animationDurationUpdate: 1000
  };
}

var fieldNames = schema.map(function (item) {
  return item.name;
})

var myChart = echarts.init(document.getElementById('div_4_axis'));
data = normalizeData_4_axis(EXPORT['data_4_axis']);
myChart.setOption(option = getOption_4_axis(data,app.config.xAxisLeft,app.config.yAxisTop,app.config.xAxisRight,app.config.yAxisBottom));

$("#yaxisbottom").change(function() {
  app.config.yAxisBottom = $("#yaxisbottom").val();
  myChart.setOption(option = getOption_4_axis(data,app.config.xAxisLeft,app.config.yAxisTop,app.config.xAxisRight,app.config.yAxisBottom));
});

$("#xaxisright").change(function() {
  app.config.xAxisRight = $("#xaxisright").val();
  myChart.setOption(option = getOption_4_axis(data,app.config.xAxisLeft,app.config.yAxisTop,app.config.xAxisRight,app.config.yAxisBottom));
});

$("#yaxistop").change(function() {
  app.config.yAxisTop = $("#yaxistop").val();
  myChart.setOption(option = getOption_4_axis(data,app.config.xAxisLeft,app.config.yAxisTop,app.config.xAxisRight,app.config.yAxisBottom));
});

$("#xaxisleft").change(function() {
  app.config.xAxisLeft = $("#xaxisleft").val();
  myChart.setOption(option = getOption_4_axis(data,app.config.xAxisLeft,app.config.yAxisTop,app.config.xAxisRight,app.config.yAxisBottom));
});

function calculate_function(x, arr){
  var total = 0
  for(var i = 0; i < arr.length-1;i++) {
    total += (Math.pow(x,arr.length-(i+1)) * arr[i])
  }
  total += arr[arr.length-1]
  return total
}

var myRegression;
$('#trainbutton').click(function(){
  myRegression = ecStat.regression('polynomial', EXPORT['polynomial'], parseInt($('#polynomial-k').val()));
  copy_polynomial = EXPORT['polynomial'].slice()
  lists_copy = []
  for(var i = 0; i < copy_polynomial.length;i++) lists_copy.push(copy_polynomial[i][1]);
  reversed = myRegression.parameter.slice().reverse()
  for(var i = 0; i < parseInt($('#future').val());i++){
    future_year = myRegression['points'][myRegression['points'].length-1][0] + 1
    myRegression['points'].push([future_year,calculate_function(future_year,reversed)])
  }
  myRegression.points.sort(function(a, b) {
    return a[0] - b[0];
  });
  dates_original = ['2017/09/01']
  for(var n = 0; n < EXPORT['polynomial'].length+parseInt($('#future').val())-1;n++){
    mydate = new Date(dates_original[dates_original.length-1])
    mydate.setMonth(mydate.getMonth()+1);
    dates_original.push(mydate.toLocaleDateString());
  }
  lists_points = []
  for(var i = 0; i < myRegression.points.length;i++) lists_points.push(myRegression.points[i][1]);

  option = {

    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    title: {
      text: 'Nestle 09/2017-06/2018 Sales',
      left: 'center',
      top: 16
    },
    xAxis: {
      type: 'category',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
      data:dates_original
    },
    yAxis: {
      type: 'value',
      min: -40,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    grid: {
      top: 90
    },
    series: [{
      name: 'scatter',
      type: 'scatter',
      label: {
        emphasis: {
          show: true,
          position: 'right',
          textStyle: {
            color: 'blue',
            fontSize: 16
          }
        }
      },
      data: lists_copy
    },{
      name: 'line',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: lists_points
    }]
  };
  var chart = echarts.init(document.getElementById('div_polynomial'));
  chart.setOption(option, true);
  create_table();
})

dense_layer1 = tf.variable(tf.tensor(LAYERS['LAYER1']))
dense_layer2 = tf.variable(tf.tensor(LAYERS['LAYER2']))
sigmoid = tf.layers.activation({activation: 'sigmoid'});
softmax = tf.layers.activation({activation: 'softmax'});
function f(x){
  feed = sigmoid.apply(tf.matMul(x,dense_layer1))
  return softmax.apply(tf.matMul(feed,dense_layer2))
}

function create_table(){
  batch_x = []
  for(var i = myRegression.points.length-parseInt($('#future').val()); i < myRegression.points.length;i++)batch_x.push(myRegression.points[i][1]/1000000)
  batch_x = tf.tensor(batch_x).reshape([-1,1]);
  to_list = tf_nj_list(f(batch_x).transpose())
  dates_original = ['2017/09/01']
  for(var n = 0; n < EXPORT['polynomial'].length+parseInt($('#future').val())-1;n++){
    mydate = new Date(dates_original[dates_original.length-1])
    mydate.setMonth(mydate.getMonth()+1);
    dates_original.push(mydate.toLocaleDateString());
  }
  header = "<th>Products</th>"
  for(var i = 0; i < myRegression.points.length;i++) header += "<th>"+dates_original[i]+" (%)</th>"
  $('#table-header').html(header);
  body = "";
  for(var i = 0; i < EXPORT['Y'][0].length;i++){
    nested = "<tr><td>"+EXPORT['x_axis'][i]+"</td>"
    for(var k = 0; k < EXPORT['Y'].length;k++){
      nested += "<td>"+EXPORT['Y'][k][i].toFixed(3)+"</td>"
    }
    for(var k = 0; k < to_list[i].length;k++){
      nested += "<td class='red-text'>"+to_list[i][k].toFixed(3)+"</td>"
    }
    nested += "</br>";
    body += nested
  }
  $('#table-body').html(body);
}
$('#trainbutton').click();

option = {
  legend: {},
  tooltip: {
    trigger: 'axis',
    showContent: false
  },
  dataset: {
    source: EXPORT['data_stack']
  },
  xAxis: {type: 'category'},
  yAxis: {gridIndex: 0},
  grid: {top: '55%'},
  series: [
    {type: 'line', smooth: true, seriesLayoutBy: 'row'},
    {type: 'line', smooth: true, seriesLayoutBy: 'row'},
    {type: 'line', smooth: true, seriesLayoutBy: 'row'},
    {type: 'line', smooth: true, seriesLayoutBy: 'row'},
    {
      type: 'pie',
      id: 'pie',
      radius: '30%',
      center: ['50%', '25%'],
      label: {
        formatter: '{b}: {@201709} ({d}%)'
      },
      encode: {
        itemName: 'product',
        value: '201709',
        tooltip: '201709'
      }
    }
  ]
};
var chart_pie = echarts.init(document.getElementById('div_pie'));
chart_pie.on('updateAxisPointer', function (event) {
  var xAxisInfo = event.axesInfo[0];
  if (xAxisInfo) {
    var dimension = xAxisInfo.value + 1;
    chart_pie.setOption({
      series: {
        id: 'pie',
        label: {
          formatter: '{b}: {@[' + dimension + ']} ({d}%)'
        },
        encode: {
          value: dimension,
          tooltip: dimension
        }
      }
    });
  }
});

chart_pie.setOption(option);

var chart_influencer = echarts.init(document.getElementById('div_influencer'));
var colors_influencer = ['#D01622'];
chart_influencer.setOption({
  color: colors_influencer,
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    type: 'category',
    data:  NEWS['influencers'][0]
  },
  yAxis: {
    type: 'value'
  },
  title : {
    text: 'Influencers Top-50',
    x:'left'
  },
  tooltip : {
    trigger: 'axis'
  },
  series: [{
    data: NEWS['influencers'][1],
    type: 'bar'
  }]
})

// topics bar
var chart_topics = echarts.init(document.getElementById('div_topic'));
var colors_topics = ['#304455'];
chart_topics.setOption({
  color: colors_topics,
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    type: 'category',
    data:  NEWS['topics'][0]
  },
  yAxis: {
    type: 'value'
  },
  title : {
    text: 'Topics Top-50',
    x:'left'
  },
  tooltip : {
    trigger: 'axis'
  },
  series: [{
    data: NEWS['topics'][1],
    type: 'bar'
  }]
})

var chart_graph = echarts.init(document.getElementById('div_graph'));
NEWS['lists_node'].forEach(function (node) {
  node.label = {
    normal: {
      show: true
    }
  };
})
chart_graph.setOption({
  title : {
    text: 'Influencers and Topics relationship',
    x:'left'
  },
  tooltip: {},
  animationDurationUpdate: 1500,
  animationEasingUpdate: 'quinticInOut',
  series : [
    {
      type: 'graph',
      layout: 'circular',
      circular: {
        rotateLabel: true
      },
      data: NEWS['lists_node'],
      links: NEWS['lists_edge'],
      roam: true,
      label: {
        normal: {
          position: 'right',
          formatter: '{b}'
        }
      },
      lineStyle: {
        normal: {
          color: 'source',
          curveness: 0.3
        }
      }
    }
  ]
})

var chart_radial = echarts.init(document.getElementById('div_radial'));
chart_radial.setOption({
  title : {
    text: 'hierarchy text clustering',
    x:'left'
  },
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove'
  },
  series: [
    {
      type: 'tree',
      data: [NEWS['radial']],
      top: '1%',
      left: '7%',
      bottom: '1%',
      right: '20%',
      symbolSize: 7,
      label: {
        normal: {
          position: 'left',
          verticalAlign: 'middle',
          align: 'right',
          fontSize: 9
        }
      },

      leaves: {
        label: {
          normal: {
            position: 'right',
            verticalAlign: 'middle',
            align: 'left'
          }
        }
      },

      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750
    }
  ]
})

var chart_sankey = echarts.init(document.getElementById('div_sankey'));
chart_sankey.setOption({
  title : {
    text: 'Influencers and Topics similarity',
    x:'left'
  },
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove'
  },
  series: {
    type: 'sankey',
    layout:'none',
    data: NEWS['lists_node_similarity'],
    links: NEWS['lists_edge_similarity'],
    itemStyle: {
      normal: {
        borderWidth: 1,
        borderColor: '#aaa'
      }
    },
    lineStyle: {
      normal: {
        color: 'source',
        curveness: 0.5
      }
    }
  }
})

var markpoints = []
for (var key in NEWS['dict-sentiment']){
  ind = STOCK['date'].indexOf(key)
  splitted = NEWS['dict-sentiment'][key]['sentiment'].split(', ')
  text = 'negative'
  sentiment_val = parseFloat(splitted[0].split(': ')[1])
  if(parseFloat(splitted[1].split(': ')[1]) > sentiment_val){
    text = 'neutral'
    sentiment_val = parseFloat(splitted[1].split(': ')[1])
  }
  if(parseFloat(splitted[2].split(': ')[1]) > sentiment_val){
    text = 'positive'
    sentiment_val = parseFloat(splitted[2].split(': ')[1])
  }
  markpoints.push({name: 'sentiment', value: text, xAxis: ind, yAxis: STOCK['close'][ind]})
}

function plot_stock(data){
  option_stock = {
    tooltip: {
      trigger: 'axis',
      position: function (pt) {
        return [pt[0], '10%'];
      }
    },
    legend: {
      data:['real shares','predicted shares','linear shares','Volume']
    },
    xAxis:[{
      type: 'category',
      data: data['date'],
      boundaryGap : false,
      axisLine: { lineStyle: { color: '#777' } },
      axisLabel: {
        formatter: function (value) {
          return echarts.format.formatTime('MM-dd', value);
        }
      },
      min: 'dataMin',
      max: 'dataMax',
      axisPointer: {
        show: true
      }
    }, {
      type: 'category',
      gridIndex: 1,
      data: data['date'],
      scale: true,
      boundaryGap : false,
      splitLine: {show: false},
      axisLabel: {show: false},
      axisTick: {show: false},
      axisLine: { lineStyle: { color: '#777' } },
      splitNumber: 20,
      min: 'dataMin',
      max: 'dataMax',
      axisPointer: {
        type: 'shadow',
        label: {show: false},
        triggerTooltip: true,
        handle: {
          show: true,
          margin: 30,
          color: '#B80C00'
        }
      }
    }],
    yAxis: [{
      scale: true,
      splitNumber: 2,
      axisLine: { lineStyle: { color: '#777' } },
      splitLine: { show: true },
      axisTick: { show: false },
      axisLabel: {
        inside: true,
        formatter: '{value}\n'
      }
    }, {
      scale: true,
      gridIndex: 1,
      splitNumber: 2,
      axisLabel: {show: false},
      axisLine: {show: false},
      axisTick: {show: false},
      splitLine: {show: false}
    }],
    grid: [{
      left: 20,
      right: 20,
      top: 110,
      height: 300
    }, {
      left: 20,
      right: 20,
      height: 150,
      top: 260
    }],
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 100
    }, {
      start: 0,
      end: 10,
      handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      handleSize: '80%',
      handleStyle: {
        color: '#fff',
        shadowBlur: 3,
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    }],
    series: [
      {
        name:'real shares',
        type:'line',
        symbol: 'none',
        data: data['close'],
        markPoint: {
          data: markpoints
        },
      },
      {
        name:'predicted shares',
        type:'line',
        symbol: 'none',
        data: data['predict_close'],
        lineStyle: {
          normal: {
            opacity:0.5
          }
        },
      },
      {
        name:'linear shares',
        type:'line',
        symbol: 'none',
        data: data['future_linear'],
        lineStyle: {
          normal: {
            opacity:0.5
          }
        },
      },
      {
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: {
          normal: {
            color: '#7fbe9e'
          },
          emphasis: {
            color: '#140'
          }
        },
        data: data['volume']
      }
    ]
  };

  var chart_stock = echarts.init(document.getElementById('div_stock'));
  chart_stock.setOption(option_stock,true);
  chart_stock.on('click', function (params) {
    set_news(STOCK.date[params['data']['xAxis']])
  })
}

function set_news(date){
  $('#nested-date').html(date);
  nested = NEWS['dict-sentiment'][date]
  legends = [], pie_data = []
  for(var i = 0; i < nested['news'][0].length;i++){
    legends.push(nested['news'][0][i])
    pie_data.push({'name':nested['news'][0][i],'value':nested['news'][1][i]})
  }
  option_nested_pie = {
    tooltip: {
      trigger: 'item',
      formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    legend: {
      orient: 'vertical',
      x: 'left',
      data:legends
    },
    series: [
      {
        name:'pie News',
        type:'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          normal: {
            show: false,
            position: 'center'
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: '30',
              fontWeight: 'bold'
            }
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data:pie_data
      }
    ]
  };
  var chart_option_nested_pie = echarts.init(document.getElementById('div_news'));
  chart_option_nested_pie.setOption(option_nested_pie,true);

  influencer_legends = [], influencer_data = []
  for(var i = 0; i < nested['influencer'][0].length;i++){
    influencer_legends.push(nested['influencer'][0][i])
    pie_data.push({'name':nested['influencer'][0][i],'value':nested['influencer'][1][i]})
  }
  option_nested_influencer = {
    tooltip: {
      trigger: 'item',
      formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    legend: {
      orient: 'vertical',
      x: 'left',
      data:influencer_legends
    },
    series: [
      {
        name:'pie influencer',
        type:'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          normal: {
            show: false,
            position: 'center'
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: '30',
              fontWeight: 'bold'
            }
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data:pie_data
      }
    ]
  };
  var chart_option_nested_influencer = echarts.init(document.getElementById('div_hot_person'));
  chart_option_nested_influencer.setOption(option_nested_influencer,true);

  issue_legends = [], issue_data = []
  for(var i = 0; i < nested['issue'][0].length;i++){
    issue_legends.push(nested['issue'][0][i])
    issue_data.push({'name':nested['issue'][0][i],'value':nested['issue'][1][i]})
  }
  option_nested_issue = {
    tooltip: {
      trigger: 'item',
      formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    legend: {
      orient: 'vertical',
      x: 'left',
      data:issue_legends
    },
    series: [
      {
        name:'pie issue',
        type:'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          normal: {
            show: false,
            position: 'center'
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: '30',
              fontWeight: 'bold'
            }
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data:issue_data
      }
    ]
  };
  var chart_option_nested_issue = echarts.init(document.getElementById('div_hot_topics'));
  chart_option_nested_issue.setOption(option_nested_issue,true);
  $('#summary').html(nested['summary'])
  $('#sentiment-string').html(nested['sentiment'])
}

plot_stock(STOCK)
set_news('2018-01-05')
$('#trainbutton_stock').click(function(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      data_stock=JSON.parse(xhttp.responseText);
      plot_stock(data_stock);
    }
  };
  xhttp.open("GET", "http://huseinhouse.com:8087/nestle?future="+parseInt($('#future_stock').val()), true);
  xhttp.send();
})

setTimeout(function(){ $('.loadingscreen').slideUp(500); }, 2000);
