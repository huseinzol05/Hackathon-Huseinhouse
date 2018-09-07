outputs_najib=JSON.parse(outputs);
outputs_mahathir=JSON.parse(outputs_mahathir);

xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    data = JSON.parse(this.responseText);
    setgraph(data);
  }
};
xmlhttp.open("GET", "http://www.huseinhouse.com/twitterlive/data/overall.json", true);
xmlhttp.send();

function setgraph(outputs){
  $('#tweets-count').html(outputs['len']);
  $('#last_update').html(outputs['last_update']);
  WordCloud(document.getElementById('canvas-wordcloud'), { list: outputs['wordcloud'],
  weightFactor: 5,color:'random-dark',backgroundColor:'white',rotateRatio: 0});
  WordCloud(document.getElementById('canvas-hashtags-wordcloud'), { list: outputs['wordcloud_hashtags'],
  weightFactor: 5,color:'random-dark',backgroundColor:'white',rotateRatio: 0});

  // sentiment graph
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
      data: outputs['neutral'][0]
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
      data: outputs['negative'][1],
      type: 'line'
    },
    {
      name: 'neutral',
      data: outputs['neutral'][1],
      type: 'line'
    },
    {
      name: 'positive',
      data:  outputs['positive'][1],
      type: 'line'
    },
    {
      name: 'average',
      data: outputs['average'],
      type: 'bar',
      itemStyle: {
        normal: {
          opacity: 0.2
        }
      },
    }]
  })

  // sentiment kde
  var div_sentiment_kde = echarts.init(document.getElementById('div_sentiment_kde'));
  div_sentiment_kde_colors = ['red','orange','blue','red','orange','blue']
  div_sentiment_kde.setOption({
    color: div_sentiment_kde_colors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      right: '20%'
    },
    legend: {
      data:['density negative','density neutral','density positive',
      'norm histogram negative','norm histogram neutral','norm histogram positive']
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name:'norm histogram negative',
        type:'bar',
        data:outputs['bar_negative'],
        itemStyle: {
          normal: {
            opacity: 0.5
          }
        }
      },
      {
        name:'norm histogram neutral',
        type:'bar',
        data:outputs['bar_neutral'],
        itemStyle: {
          normal: {
            opacity: 0.5
          }
        }
      },
      {
        name:'norm histogram positive',
        type:'bar',
        data:outputs['bar_positive'],
        itemStyle: {
          normal: {
            opacity: 0.5
          }
        }
      },
      {
        name:'density negative',
        type:'line',
        data:outputs['kde_negative'],
      },
      {
        name:'density neutral',
        type:'line',
        data:outputs['kde_neutral'],
      },
      {
        name:'density positive',
        type:'line',
        data:outputs['kde_positive'],
      }
    ]
  })

  // influencer bar
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
      data:  outputs['influencers'][0]
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
      data: outputs['influencers'][1],
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
      data:  outputs['topics'][0]
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
      data: outputs['topics'][1],
      type: 'bar'
    }]
  })

  // network graph
  var chart_graph = echarts.init(document.getElementById('div_graph'));
  outputs['lists_node'].forEach(function (node) {
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
        data: outputs['lists_node'],
        links: outputs['lists_edge'],
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

  var chart_punchcard = echarts.init(document.getElementById('div_punchcard'));
  var hours = outputs['times'];
  var days = ['neutral', 'positive', 'negative'];
  var data = outputs['punch']
  chart_punchcard.setOption({
    title: {
      text: 'Punch Card of Sentiment',
    },
    legend: {
      data: ['Punch Card'],
      left: 'right'
    },
    polar: {},
    tooltip: {
      formatter: function (params) {
        return params.value[2]+ ' '+ days[params.value[0]] + ' at ' + hours[params.value[1]];
      }
    },
    angleAxis: {
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
    radiusAxis: {
      type: 'category',
      data: days,
      axisLine: {
        show: false
      },
      axisLabel: {
        rotate: 45
      }
    },
    series: [{
      name: 'Punch Card Sentiment',
      type: 'scatter',
      coordinateSystem: 'polar',
      symbolSize: function (val) {
        return val[2] / 500;
      },
      data: data,
      animationDelay: function (idx) {
        return idx * 5;
      }
    }]
  })

  var div_cluster = echarts.init(document.getElementById('div_cluster'));
  var data0 = outputs['cluster'][0]
  var data1 = outputs['cluster'][1]

  div_cluster.setOption({
    title: {
      text: 'Clustering based on Tweets related',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    xAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
    },
    series: [{
      name: '0',
      type: 'scatter',
      symbolSize: function(data) {
        return data[2] / 700;
      },
      label: {
        normal: {
          show: true,
          formatter: function(param) {
            return param.data[3];
          },
          position: 'top'
        }
      },
      data: data0
    }, {
      name: '1',
      type: 'scatter',
      symbolSize: function(data) {
        return data[2] / 700;
      },
      label: {
        normal: {
          show: true,
          formatter: function(param) {
            return param.data[3];
          },
          position: 'top'
        }
      },
      data: data1
    }]
  })

  var div_network = echarts.init(document.getElementById('div_network'));
  outputs_najib['nodes'].forEach(function (node) {
    if (node.symbolSize > 25) node.symbolSize = 25
    node.label = {
      normal: {
        show: true
      }
    };
  })
  outputs_mahathir['nodes'].forEach(function (node) {
    if (node.symbolSize > 25) node.symbolSize = 25
    node.label = {
      normal: {
        show: true
      }
    };
  })
  div_network.setOption({
    legend: {
      data: ['najib network','mahathir network'],
    },
    title : {
      text: 'Twitter social network for Mahathir and Najib Razak',
      x:'left'
    },
    tooltip: {},
    animation: false,
    series : [
      {
        type: 'graph',
        layout: 'force',
        name: 'najib network',
        data: outputs_najib['nodes'],
        links: outputs_najib['edges'],
        roam: true,
        label: {
          normal: {
            position: 'right'
          }
        },
        force: {
          repulsion: 500
        }
      },
      {
        type: 'graph',
        layout: 'force',
        name: 'mahathir network',
        data: outputs_mahathir['nodes'],
        links: outputs_mahathir['edges'],
        roam: true,
        label: {
          normal: {
            position: 'right'
          }
        },
        force: {
          repulsion: 500
        }
      }
    ]
  })

  // heatmap graph
  var chart_heatmap = echarts.init(document.getElementById('div_heatmap'));
  data = outputs['heatmap'];
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
      data: outputs['x-axis'],
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
      bottom: '15%'
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

  var chart_radial = echarts.init(document.getElementById('div_radial'));
  chart_radial.setOption({
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'tree',
        data: [outputs['radial']],
        top: '18%',
        bottom: '14%',
        layout: 'radial',
        symbol: 'emptyCircle',
        symbolSize: 7,
        initialTreeDepth: 3,
        animationDurationUpdate: 750
      }
    ]
  })

  var chart_tree = echarts.init(document.getElementById('div_tree'));
  // echarts.util.each(outputs['radial'].children, function (datum, index) {
  //   index % 2 === 0 && (datum.collapsed = true);
  // });
  chart_tree.setOption({
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'tree',
        data: [outputs['radial']],
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

  // var chart_hot_retweet = echarts.init(document.getElementById('div_hot_retweet'));
  // chart_hot_retweet.setOption(option = {
  //   title: {
  //     text: 'Retweet Famous',
  //     left: 'center'
  //   },
  //   animationDurationUpdate: 1500,
  //   animationEasingUpdate: 'quinticInOut',
  //   series : [
  //     {
  //       type: 'graph',
  //       layout: 'none',
  //       data: outputs['lists_node_tfidf_retweet'].map(function (node) {
  //         return {
  //           x: node.x,
  //           y: node.y,
  //           id: node.id,
  //           attributes: {},
  //           name: node.label,
  //           symbolSize: node.size / 1000,
  //           itemStyle: {
  //               normal: {
  //                   color: 'red'
  //               }
  //           }
  //         };
  //       }),
  //       edges: outputs['lists_edge_tfidf_retweet'].map(function (edge) {
  //         return {
  //           source: edge.sourceID,
  //           target: edge.targetID,
  //           attributes: {}
  //         };
  //       }),
  //       label: {
  //         emphasis: {
  //           position: 'right',
  //           show: true
  //         }
  //       },
  //       roam: true,
  //       focusNodeAdjacency: true,
  //       lineStyle: {
  //         normal: {
  //           width: 0.5,
  //           curveness: 0.3,
  //           opacity: 0.7
  //         }
  //       }
  //     }
  //   ]
  // })
  //
  // var chart_hot_favorite = echarts.init(document.getElementById('div_hot_favorite'));
  // chart_hot_favorite.setOption(option = {
  //   title: {
  //     text: 'Favourite Famous',
  //     left: 'center'
  //   },
  //   animationDurationUpdate: 1500,
  //   animationEasingUpdate: 'quinticInOut',
  //   series : [
  //     {
  //       type: 'graph',
  //       layout: 'none',
  //       data: outputs['lists_node_tfidf_favorite'].map(function (node) {
  //         return {
  //           x: node.x,
  //           y: node.y,
  //           id: node.id,
  //           attributes: {},
  //           name: node.label,
  //           symbolSize: node.size / 1000,
  //           itemStyle: {
  //               normal: {
  //                   color: 'red'
  //               }
  //           }
  //         };
  //       }),
  //       edges: outputs['lists_edge_tfidf_favorite'].map(function (edge) {
  //         return {
  //           source: edge.sourceID,
  //           target: edge.targetID,
  //           attributes: {}
  //         };
  //       }),
  //       label: {
  //         emphasis: {
  //           position: 'right',
  //           show: true
  //         }
  //       },
  //       roam: true,
  //       focusNodeAdjacency: true,
  //       lineStyle: {
  //         normal: {
  //           width: 0.5,
  //           curveness: 0.3,
  //           opacity: 0.7
  //         }
  //       }
  //     }
  //   ]
  // })

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
      data: outputs['lists_node_similarity'],
      links: outputs['lists_edge_similarity'],
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

  convertedData = outputs['negeri_density'].concat(outputs['dun_density'], outputs['parlimen_density']);
  var dom = document.getElementById("div_location");
  var myChart = echarts.init(dom);
  var app = {};
  option = null;
  option = {
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicInOut',
    animationDurationUpdate: 1000,
    animationEasingUpdate: 'cubicInOut',
    title: [
      {
        text: 'Location analysis',
        left: 'center'
      },
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
      boundaryGap: false,
      splitLine: {show: false},
      axisLine: {show: false},
      axisTick: {show: false},
      axisLabel: {margin: 2, textStyle: {color: '#aaa'}},
    },
    yAxis: {
      type: 'category',
      name: 'Top 20 Density location',
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
        data: convertedData,
        symbolSize: function (val) {
          return Math.min(val[2] / 10, 8);
        },
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
      },
      {
        name: 'Negeri',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: outputs['negeri_density'],
        symbolSize: function (val) {
          return Math.min(val[2] / 10, 8);
        },
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
            color: 'red'
          }
        }
      },
      {
        name: 'Dun',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: outputs['dun_density'],
        symbolSize: function (val) {
          return Math.min(val[2] / 10, 8);
        },
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
            color: 'green'
          }
        }
      },
      {
        name: 'Parlimen',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: outputs['negeri_density'],
        symbolSize: function (val) {
          return Math.min(val[2] / 10, 8);
        },
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
            color: 'blue'
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
  myChart.on('brushselected', renderBrushed);
  setTimeout(function () {
    myChart.dispatchAction({
      type: 'brush',
      areas: [
        {
          geoIndex: 0,
          brushType: 'polygon',
          coordRange: [[101.686855,3.139003],[101.253628,3.398333],[101.835904,3.392849],[102.050137,3.381882],[102.225918,3.178968],[102.582974,2.921155],
          [102.561001,2.438287],[102.170987,2.224231],[101.473355,2.734615],[101.303067,2.877266]]
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
      var dataItem = convertedData[rawIndex];
      var pmValue = dataItem.value[2];
      sum += pmValue;
      count++;
      selectedItems.push(dataItem);
    }

    selectedItems.sort(function (a, b) {
      return a.value[2] - b.value[2];
    });

    for (var i = 0; i < Math.min(selectedItems.length, maxBar); i++) {
      categoryData.push(selectedItems[i].name);
      barData.push(selectedItems[i].value[2]);
    }

    this.setOption({
      yAxis: {
        data: categoryData
      },
      xAxis: {
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
  if (option && typeof option === "object") {
    myChart.setOption(option, true);
  }

  top_6 = outputs['top_6'];
  strings = "";
  for(i=0;i<3;i++) strings += "<div class='col s12 m4'><div class='tweet' tweetID='"+top_6[i]+"'></div></div>";
  $('#row1-tweets').html(strings);
  strings = "";
  for(i=3;i<6;i++) strings += "<div class='col s12 m4'><div class='tweet' tweetID='"+top_6[i]+"'></div></div>";
  $('#row2-tweets').html(strings);
  var tweets = document.getElementsByClassName("tweet");
  for (i = 0; i < tweets.length; i++) {
    var id = tweets[i].getAttribute("tweetID");
    twttr.widgets.createTweet(id, tweets[i],{
      conversation : 'none',
      cards        : 'hidden',  // or visible
      linkColor    : '#cc0000', // default is blue
      theme        : 'light'    // or dark
    })
    .then (function (el) {
      el.contentDocument.querySelector(".footer").style.display = "none";
    });
  }
}
