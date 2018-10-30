var geo_map = {
  "Terengganu":[103.205299,5.207053],
  "Kelantan":[102.242203, 6.139872],
  "Kedah":[100.569649, 6.155672],
  "Selangor":[101.538116,3.519863],
  "Johor": [103.358727,1.934400]
}

var ripple = []

function add_ripple(){
  ripple.push({animal:'kok sang',name:'Johor',value:[103.358727, 1.9344, 10]});
  chart_location.on('brushselected', renderBrushed);
  setTimeout(function () {
    chart_location.dispatchAction({
      type: 'brush',
      areas: [
        {
          geoIndex: 0,
          brushType: 'polygon',
          coordRange: [[
            101.4630747,
            6.4038852
          ],
          [
            104.1107798,
            6.4148028
          ],
          [
            104.1766977,
            4.1723567
          ],
          [
            101.6278696,
            4.1723567
          ],
          [
            101.4520884,
            6.3711308
          ]]
        }
      ]
    });
  }, 0);
  chart_location.setOption(option_map, true);
}

var convertData = function (data) {
  var res = [];
  for (var i = 0; i < data.length; i++) {
    var geoCoord = geo_map[data[i].name];
    if (geoCoord) {
      res.push({
        name: data[i].name,
        animal: data[i].animal,
        value: geoCoord.concat(data[i].value)
      });
    }
  }
  return res;
};

var convertedData = [
  convertData(ANIMAL),
  convertData(ANIMAL.sort(function (a, b) {
    return b.value - a.value;
  }).slice(0, 6))
];

var dom_location = document.getElementById("div_location");
var chart_location = echarts.init(dom_location);
var app = {};
option_map = {
  animation: true,
  animationDuration: 1000,
  animationEasing: 'cubicInOut',
  animationDurationUpdate: 1000,
  animationEasingUpdate: 'cubicInOut',
  title: [
    {
      id: 'statistic',
      right: 120,
      top: 40,
      width: 100,
      textStyle: {
        fontSize: 16
      }
    }
  ],
  toolbox: {
    iconStyle: {
      normal: {

      },
      emphasis: {

      }
    }
  },
  brush: {
    outOfBrush: {
      color: '#abc'
    },
    brushStyle: {
      borderWidth: 2,
      color: 'rgba(0,0,0,0.2)',
      borderColor: 'rgba(0,0,0,0.5)',
    },
    seriesIndex: [0, 1],
    throttleType: 'debounce',
    throttleDelay: 300,
    geoIndex: 0
  },
  geo: {
    map: 'world',
    left: '10',
    right: '35%',
    center: [108.967611, 4.464573],
    zoom: 20,
    label: {
      emphasis: {
        show: false
      }
    },
    roam: true,
    itemStyle: {
      normal: {
      },
      emphasis: {
      }
    }
  },
  tooltip : {
    trigger: 'item'
  },
  grid: {
    right: 40,
    top: 100,
    bottom: 40,
    width: '30%'
  },
  xAxis: {
    type: 'value',
    scale: true,
    position: 'top',
    min: 0,
    boundaryGap: false,
    splitLine: {show: false},
    axisLine: {show: false},
    axisTick: {show: false},
    axisLabel: {margin: 2, textStyle: {color: '#aaa'}},
  },
  yAxis: {
    type: 'category',
    name: 'Top 20 animals',
    nameGap: 16,
    axisLine: {show: false},
    axisTick: {show: false},
    axisLabel: {interval: 0},
    data: []
  },
  series : [
    {
      type: 'scatter',
      coordinateSystem: 'geo',
      data: convertedData[0],
      label: {
        normal: {
          formatter: '{b}',
          position: 'right',
          show: true
        },
        emphasis: {
          show: true
        }
      },
    },
    {
      type: 'effectScatter',
      coordinateSystem: 'geo',
      rippleEffect: {
        brushType: 'fill',
        scale: 10
      },
      showEffectOn: 'render',
      data: ripple,
      label: {
        normal: {
          formatter: '{b}',
          position: 'right',
          show: false
        },
        emphasis: {
          show: true
        }
      },
      itemStyle: {
        normal: {
          color: '#ddb926'
        }
      }
    },
    {
      id: 'bar',
      zlevel: 2,
      type: 'bar',
      symbol: 'none',
      itemStyle: {
        normal: {
          color: '#ddb926'
        }
      },
      data: []
    }
  ]
};
chart_location.on('brushselected', renderBrushed);
setTimeout(function () {
  chart_location.dispatchAction({
    type: 'brush',
    areas: [
      {
        geoIndex: 0,
        brushType: 'polygon',
        coordRange: [[
          101.4630747,
          6.4038852
        ],
        [
          104.1107798,
          6.4148028
        ],
        [
          104.1766977,
          4.1723567
        ],
        [
          101.6278696,
          4.1723567
        ],
        [
          101.4520884,
          6.3711308
        ]]
      }
    ]
  });
}, 0);

function renderBrushed(params) {
  var mainSeries = params.batch[0].selected[0];
  var selectedItems = [];
  var categoryData = [];
  var barData = [];
  var maxBar = 30;
  var sum = 0;
  var count = 0;
  for (var i = 0; i < mainSeries.dataIndex.length; i++) {
    var rawIndex = mainSeries.dataIndex[i];
    var dataItem = convertedData[0][rawIndex];
    var pmValue = dataItem.value[2];
    sum += pmValue;
    count++;
    selectedItems.push(dataItem);
  }

  selectedItems.sort(function (a, b) {
    return a.value[2] - b.value[2];
  });

  for (var i = 0; i < Math.min(selectedItems.length, maxBar); i++) {
    indexof = categoryData.indexOf(selectedItems[i].animal);
    if(indexof > -1) barData[indexof] += selectedItems[i].value[2];
    else{
      categoryData.push(selectedItems[i].animal);
      barData.push(selectedItems[i].value[2]);
    }
  }

  this.setOption({
    yAxis: {

      data: categoryData
    },
    xAxis: {
      min:0,
      axisLabel: {show: !!count}
    },
    title: {
      id: 'statistic',
      text: count ? 'Total: ' + sum : ''
    },
    series: {
      id: 'bar',
      data: barData
    }
  });
};
if (option_map && typeof option_map === "object") {
  chart_location.setOption(option_map, true);
}


var hours = ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM',
'7AM', '8AM', '9AM','10AM','11AM',
'12PM', '1PM', '2PM', '3PM', '4PM', '5PM',
'6PM', '7PM', '8PM', '9PM', '10PM', '11PM'];
var days = ['Saturday', 'Friday', 'Thursday',
'Wednesday', 'Tuesday', 'Monday', 'Sunday'];

var data_punch = [[0,0,5],[0,1,1],[0,2,0],[0,3,0],[0,4,0],[0,5,0],[0,6,0],[0,7,0],[0,8,0],[0,9,0],[0,10,0],[0,11,2],[0,12,4],[0,13,1],[0,14,1],[0,15,3],[0,16,4],[0,17,6],[0,18,4],[0,19,4],[0,20,3],[0,21,3],[0,22,2],[0,23,5],[1,0,7],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[1,5,0],[1,6,0],[1,7,0],[1,8,0],[1,9,0],[1,10,5],[1,11,2],[1,12,2],[1,13,6],[1,14,9],[1,15,11],[1,16,6],[1,17,7],[1,18,8],[1,19,12],[1,20,5],[1,21,5],[1,22,7],[1,23,2],[2,0,1],[2,1,1],[2,2,0],[2,3,0],[2,4,0],[2,5,0],[2,6,0],[2,7,0],[2,8,0],[2,9,0],[2,10,3],[2,11,2],[2,12,1],[2,13,9],[2,14,8],[2,15,10],[2,16,6],[2,17,5],[2,18,5],[2,19,5],[2,20,7],[2,21,4],[2,22,2],[2,23,4],[3,0,7],[3,1,3],[3,2,0],[3,3,0],[3,4,0],[3,5,0],[3,6,0],[3,7,0],[3,8,1],[3,9,0],[3,10,5],[3,11,4],[3,12,7],[3,13,14],[3,14,13],[3,15,12],[3,16,9],[3,17,5],[3,18,5],[3,19,10],[3,20,6],[3,21,4],[3,22,4],[3,23,1],[4,0,1],[4,1,3],[4,2,0],[4,3,0],[4,4,0],[4,5,1],[4,6,0],[4,7,0],[4,8,0],[4,9,2],[4,10,4],[4,11,4],[4,12,2],[4,13,4],[4,14,4],[4,15,14],[4,16,12],[4,17,1],[4,18,8],[4,19,5],[4,20,3],[4,21,7],[4,22,3],[4,23,0],[5,0,2],[5,1,1],[5,2,0],[5,3,3],[5,4,0],[5,5,0],[5,6,0],[5,7,0],[5,8,2],[5,9,0],[5,10,4],[5,11,1],[5,12,5],[5,13,10],[5,14,5],[5,15,7],[5,16,11],[5,17,6],[5,18,0],[5,19,5],[5,20,3],[5,21,4],[5,22,2],[5,23,0],[6,0,1],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[6,5,0],[6,6,0],[6,7,0],[6,8,0],[6,9,0],[6,10,1],[6,11,0],[6,12,2],[6,13,1],[6,14,3],[6,15,4],[6,16,0],[6,17,0],[6,18,0],[6,19,0],[6,20,1],[6,21,2],[6,22,2],[6,23,6]];
data_punch = data_punch.map(function (item) {
  return [item[1], item[0], item[2]];
});
var dom = document.getElementById("div_punch");
var chart_punch = echarts.init(dom);
option = {
  tooltip: {
    position: 'top',
    formatter: function (params) {
      return params.value[2] + ' animals in ' + hours[params.value[0]] + ' of ' + days[params.value[1]];
    }
  },
  grid: {
    left: 10,
    top: 10,
    bottom: 10,
    right: 30,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: hours,
    boundaryGap: false,
    splitLine: {
      show: true,
      lineStyle: {
        color: '#999',
        type: 'dashed'
      }
    },
    axisLine: {
      show: false
    }
  },
  yAxis: {
    type: 'category',
    data: days,
    axisLine: {
      show: false
    }
  },
  series: [{
    name: 'Punch Card',
    type: 'scatter',
    symbolSize: function (val) {
      return val[2] * 2;
    },
    data: data_punch,
    animationDelay: function (idx) {
      return idx * 5;
    }
  }]
};
chart_punch.setOption(option, true);

option_bar = {
  tooltip : {
    trigger: 'axis'
  },
  legend: {
    data:['critically','endangered','threatened']
  },
  calculable : true,
  xAxis : [
    {
      type : 'category',
      data : ['orangutan','tiger',
      'African crocodile',
      'bear',
      'leopard',
      'gorilla',
      'cheetah',
      'brown bear',
      'zebra',
      'chimpanzee',
      'African elephant',
      'Indian elephant',
      'hippopotamus',
      'water buffalo',
      'tiger cat',
      'African crocodile',
      'American alligator']
    }
  ],
  yAxis : [
    {
      type : 'value',
    }
  ],
  series : [
    {
      name:'critically',
      type:'bar',
      data:[50.0,
        50.0,
        140.0,
        0.0,
        0.0,
        70.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        30.0],
        markPoint : {
          data : [
            {type : 'max', name: 'critically max'},
            {type : 'min', name: 'critically min'}
          ]
        },
        markLine : {
          data : [
            {type : 'average', name: 'critically mean'}
          ]
        }
      },
      {
        name:'endangered',
        type:'bar',
        data:[0.0,
          0.0,
          0.0,
          0.0,
          0.0,
          0.0,
          0.0,
          60.0,
          40.0,
          110.0,
          0.0,
          0.0,
          60.0,
          70.0,
          40.0,
          0.0,
          0.0],
          markPoint : {
            data : [
              {type : 'max', name: 'endangered max'},
              {type : 'min', name: 'endangered min'}
            ]
          },
          markLine : {
            data : [
              {type : 'average', name: 'endangered mean'}
            ]
          }
        },
        {
          name:'threatened',
          type:'bar',
          data:[0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            60.0,
            0.0,
            0.0,
            0.0,
            60.0,
            20.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0],
            markPoint : {
              data : [
                {type : 'max', name: 'threatened max'},
                {type : 'min', name: 'threatened min'}
              ]
            },
            markLine : {
              data : [
                {type : 'average', name: 'threatened mean'}
              ]
            }
          }
        ]
      };
      var dom = document.getElementById("div_bar");
      var chart_bar = echarts.init(dom);
      chart_bar.setOption(option_bar, true);


data_correlation = [[0, 0, 1.0],
 [1, 0, 0.274],
 [2, 0, -0.73],
 [3, 0, 0.348],
 [4, 0, -0.539],
 [5, 0, -0.24],
 [6, 0, -0.33],
 [7, 0, -0.347],
 [8, 0, -0.012],
 [9, 0, 0.213],
 [10, 0, -0.379],
 [11, 0, -0.222],
 [12, 0, -0.294],
 [13, 0, 0.136],
 [14, 0, 0.408],
 [15, 0, 0.713],
 [0, 1, 0.274],
 [1, 1, 1.0],
 [2, 1, -0.241],
 [3, 1, 0.257],
 [4, 1, -0.2],
 [5, 1, -0.214],
 [6, 1, 0.233],
 [7, 1, 0.206],
 [8, 1, 0.164],
 [9, 1, 0.272],
 [10, 1, 0.578],
 [11, 1, -0.617],
 [12, 1, -0.535],
 [13, 1, -0.512],
 [14, 1, -0.587],
 [15, 1, 0.643],
 [0, 2, -0.73],
 [1, 2, -0.241],
 [2, 2, 1.0],
 [3, 2, 0.061],
 [4, 2, 0.084],
 [5, 2, 0.073],
 [6, 2, 0.355],
 [7, 2, -0.148],
 [8, 2, -0.591],
 [9, 2, -0.768],
 [10, 2, -0.107],
 [11, 2, 0.339],
 [12, 2, 0.499],
 [13, 2, 0.469],
 [14, 2, -0.194],
 [15, 2, -0.396],
 [0, 3, 0.348],
 [1, 3, 0.257],
 [2, 3, 0.061],
 [3, 3, 1.0],
 [4, 3, 0.112],
 [5, 3, -0.272],
 [6, 3, 0.399],
 [7, 3, 0.197],
 [8, 3, -0.33],
 [9, 3, -0.051],
 [10, 3, -0.029],
 [11, 3, 0.489],
 [12, 3, 0.48],
 [13, 3, 0.431],
 [14, 3, -0.043],
 [15, 3, 0.791],
 [0, 4, -0.539],
 [1, 4, -0.2],
 [2, 4, 0.084],
 [3, 4, 0.112],
 [4, 4, 1.0],
 [5, 4, -0.091],
 [6, 4, 0.558],
 [7, 4, 0.86],
 [8, 4, 0.551],
 [9, 4, 0.454],
 [10, 4, 0.606],
 [11, 4, 0.452],
 [12, 4, 0.306],
 [13, 4, -0.332],
 [14, 4, -0.451],
 [15, 4, -0.233],
 [0, 5, -0.24],
 [1, 5, -0.214],
 [2, 5, 0.073],
 [3, 5, -0.272],
 [4, 5, -0.091],
 [5, 5, 1.0],
 [6, 5, -0.735],
 [7, 5, 0.112],
 [8, 5, -0.325],
 [9, 5, 0.157],
 [10, 5, -0.02],
 [11, 5, 0.277],
 [12, 5, 0.408],
 [13, 5, -0.04],
 [14, 5, 0.503],
 [15, 5, -0.199],
 [0, 6, -0.33],
 [1, 6, 0.233],
 [2, 6, 0.355],
 [3, 6, 0.399],
 [4, 6, 0.558],
 [5, 6, -0.735],
 [6, 6, 1.0],
 [7, 6, 0.379],
 [8, 6, 0.265],
 [9, 6, -0.119],
 [10, 6, 0.44],
 [11, 6, 0.058],
 [12, 6, -0.012],
 [13, 6, -0.062],
 [14, 6, -0.804],
 [15, 6, 0.077],
 [0, 7, -0.347],
 [1, 7, 0.206],
 [2, 7, -0.148],
 [3, 7, 0.197],
 [4, 7, 0.86],
 [5, 7, 0.112],
 [6, 7, 0.379],
 [7, 7, 1.0],
 [8, 7, 0.569],
 [9, 7, 0.724],
 [10, 7, 0.838],
 [11, 7, 0.261],
 [12, 7, 0.168],
 [13, 7, -0.588],
 [14, 7, -0.494],
 [15, 7, 0.098],
 [0, 8, -0.012],
 [1, 8, 0.164],
 [2, 8, -0.591],
 [3, 8, -0.33],
 [4, 8, 0.551],
 [5, 8, -0.325],
 [6, 8, 0.265],
 [7, 8, 0.569],
 [8, 8, 1.0],
 [9, 8, 0.758],
 [10, 8, 0.623],
 [11, 8, -0.365],
 [12, 8, -0.565],
 [13, 8, -0.807],
 [14, 8, -0.474],
 [15, 8, -0.141],
 [0, 9, 0.213],
 [1, 9, 0.272],
 [2, 9, -0.768],
 [3, 9, -0.051],
 [4, 9, 0.454],
 [5, 9, 0.157],
 [6, 9, -0.119],
 [7, 9, 0.724],
 [8, 9, 0.758],
 [9, 9, 1.0],
 [10, 9, 0.619],
 [11, 9, -0.109],
 [12, 9, -0.254],
 [13, 9, -0.753],
 [14, 9, -0.139],
 [15, 9, 0.237],
 [0, 10, -0.379],
 [1, 10, 0.578],
 [2, 10, -0.107],
 [3, 10, -0.029],
 [4, 10, 0.606],
 [5, 10, -0.02],
 [6, 10, 0.44],
 [7, 10, 0.838],
 [8, 10, 0.623],
 [9, 10, 0.619],
 [10, 10, 1.0],
 [11, 10, -0.253],
 [12, 10, -0.273],
 [13, 10, -0.834],
 [14, 10, -0.796],
 [15, 10, 0.076],
 [0, 11, -0.222],
 [1, 11, -0.617],
 [2, 11, 0.339],
 [3, 11, 0.489],
 [4, 11, 0.452],
 [5, 11, 0.277],
 [6, 11, 0.058],
 [7, 11, 0.261],
 [8, 11, -0.365],
 [9, 11, -0.109],
 [10, 11, -0.253],
 [11, 11, 1.0],
 [12, 11, 0.962],
 [13, 11, 0.584],
 [14, 11, 0.39],
 [15, 11, -0.02],
 [0, 12, -0.294],
 [1, 12, -0.535],
 [2, 12, 0.499],
 [3, 12, 0.48],
 [4, 12, 0.306],
 [5, 12, 0.408],
 [6, 12, -0.012],
 [7, 12, 0.168],
 [8, 12, -0.565],
 [9, 12, -0.254],
 [10, 12, -0.273],
 [11, 12, 0.962],
 [12, 12, 1.0],
 [13, 12, 0.638],
 [14, 12, 0.397],
 [15, 12, -0.012],
 [0, 13, 0.136],
 [1, 13, -0.512],
 [2, 13, 0.469],
 [3, 13, 0.431],
 [4, 13, -0.332],
 [5, 13, -0.04],
 [6, 13, -0.062],
 [7, 13, -0.588],
 [8, 13, -0.807],
 [9, 13, -0.753],
 [10, 13, -0.834],
 [11, 13, 0.584],
 [12, 13, 0.638],
 [13, 13, 1.0],
 [14, 13, 0.564],
 [15, 13, 0.066],
 [0, 14, 0.408],
 [1, 14, -0.587],
 [2, 14, -0.194],
 [3, 14, -0.043],
 [4, 14, -0.451],
 [5, 14, 0.503],
 [6, 14, -0.804],
 [7, 14, -0.494],
 [8, 14, -0.474],
 [9, 14, -0.139],
 [10, 14, -0.796],
 [11, 14, 0.39],
 [12, 14, 0.397],
 [13, 14, 0.564],
 [14, 14, 1.0],
 [15, 14, -0.02],
 [0, 15, 0.713],
 [1, 15, 0.643],
 [2, 15, -0.396],
 [3, 15, 0.791],
 [4, 15, -0.233],
 [5, 15, -0.199],
 [6, 15, 0.077],
 [7, 15, 0.098],
 [8, 15, -0.141],
 [9, 15, 0.237],
 [10, 15, 0.076],
 [11, 15, -0.02],
 [12, 15, -0.012],
 [13, 15, 0.066],
 [14, 15, -0.02],
 [15, 15, 1.0]]
 data_correlation = data_correlation.map(function (item) {
     return [item[1], item[0], item[2] || '-'];
 });

 x_axis = ['orangutan','tiger',
 'African crocodile',
 'bear',
 'leopard',
 'gorilla',
 'cheetah',
 'brown bear',
 'zebra',
 'chimpanzee',
 'African elephant',
 'Indian elephant',
 'hippopotamus',
 'water buffalo',
 'tiger cat',
 'African crocodile',
 'American alligator']
 var chart = echarts.init(document.getElementById('div_correlation'));

 chart.setOption({
   tooltip: {
     position: 'top'
   },
   tooltip: {
         formatter: function (params) {
             return params.value[2] + ': ' + x_axis[params.value[1]] + ' & ' + x_axis[params.value[0]];
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
     data: x_axis,
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
     data: x_axis,
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
     data: data_correlation,
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
 function calculate_function(x, arr){
   var total = 0
   for(var i = 0; i < arr.length-1;i++) {
     total += (Math.pow(x,arr.length-(i+1)) * arr[i])
   }
   total += arr[arr.length-1]
   return total
 }
line_animals = [[0,115.0625], [1,108.5625], [2,72.5625], [3,86.1875], [4,94.0], [5,129.375]]
var myRegression;
  myRegression = ecStat.regression('polynomial', line_animals, 3);
  copy_polynomial = line_animals.slice()
  lists_copy = []
  for(var i = 0; i < copy_polynomial.length;i++) lists_copy.push(copy_polynomial[i][1]);
  reversed = myRegression.parameter.slice().reverse()
  for(var i = 0; i < 5;i++){
    future_year = myRegression['points'][myRegression['points'].length-1][0] + 1
    myRegression['points'].push([future_year,calculate_function(future_year,reversed)])
  }
  myRegression.points.sort(function(a, b) {
    return a[0] - b[0];
  });
  dates_original = ['1/2018','2/2018','3/2018','4/2018','5/2018','6/2018','7/2018','8/2018','9/2018','10/2018','11/2018']
  lists_points = []
  for(var i = 0; i < myRegression.points.length;i++) lists_points.push(myRegression.points[i][1]);
  option = {

    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
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
