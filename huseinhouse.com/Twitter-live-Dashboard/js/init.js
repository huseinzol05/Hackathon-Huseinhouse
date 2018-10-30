$('.button-collapse').sideNav();
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
$('select').material_select();
$('.collapsible').collapsible();
var xmlhttp;
var output;

$('.rows-feed').click(function(){
  $(this).slideUp();
})

$(document).ready(function(){
  $('#canvas-wordcloud').attr('width',$('#div_influencer').width());
})

var socket = io('https://huseinzol05.dynamic-dns.net:9001/twitter', {secure: true, reconnect: true});
socket.on('twitterlive', function(msg){
  rows = $('.rows-feed');
  if(rows.length > 3) {

    $('.rows-feed:first').slideUp(500,function(){
      $('.rows-feed:first').remove();
    });
    $('.rows-feed:second').slideUp(700,function(){
      $('.rows-feed:second').remove();
    });
  }
  var inner_string = "<div class='row rows-feed'><div class='divider'></div><div class='section'>";
  inner_string += "<h5>"+msg['name']+" <small>"+msg['datetime']+"</small></h5>"+"<p>"+msg['text']+"</p>";
  inner_string += "</div><div class='divider'></div></div>";
  $('#livefeed').append(inner_string);
})

function request_wordcloud(){
  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      data = JSON.parse(this.responseText);
      if(data['error']){
        $("#failparagraph").html(data['error']);
        $(".loadingscreen-fail").css("display", "block");
      }
      else setgraph(data);
    }
  };
  xmlhttp.open("GET", "http://www.huseinhouse.com:8011/everything?count="+$('#query').val()+"&count_wordcloud="+$('#wordcloud').val()+"&count_topic="+$('#topn').val(), true);
  xmlhttp.send();
}

function setgraph(outputs){
  WordCloud(document.getElementById('canvas-wordcloud'), { list: outputs['wordcloud'],
  weightFactor: 5,color:'random-dark',backgroundColor:'white',rotateRatio: 0});

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
      data:  outputs['influencer'][0]
    },
    yAxis: {
      type: 'value'
    },
    title : {
      text: 'Influencers Top-'+$('#topn').val(),
      x:'left'
    },
    tooltip : {
      trigger: 'axis'
    },
    series: [{
      data: outputs['influencer'][1],
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
      data:  outputs['topic'][0]
    },
    yAxis: {
      type: 'value'
    },
    title : {
      text: 'Topics Top-'+$('#topn').val(),
      x:'left'
    },
    tooltip : {
      trigger: 'axis'
    },
    series: [{
      data: outputs['topic'][1],
      type: 'bar'
    }]
  })

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

  // network graph
  var chart_graph = echarts.init(document.getElementById('div_graph'));
  outputs['nodes'].forEach(function (node) {
    node.label = {
      normal: {
        show: true
      }
    };
  })
  chart_graph.setOption({
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series : [
      {
        name: 'Influencers',
        type: 'graph',
        layout: 'circular',
        circular: {
          rotateLabel: true
        },
        data: outputs['nodes'],
        links: outputs['edges'],
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

  // heatmap graph
  var chart_heatmap = echarts.init(document.getElementById('div_heatmap'));
  data = outputs['heatmap'];
  max = 0;
  data = data.map(function (item) {
    if(item[2]>max) max=item[2];
    return [item[0], item[1], item[2] || '-'];
  });
  chart_heatmap.setOption({
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
      label: {
        normal: {
          show: true
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
                label: {
                  normal: {
                    show: false
                  }
                },
                symbolSize: 7,
                initialTreeDepth: 2,
                animationDurationUpdate: 750
            }
        ]
    })

}

function checkTime(i) {
  if (i < 10) {i = "0" + i};
  return i;
}
function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById('time').innerHTML =
  h + ":" + m + ":" + s;
  var t = setTimeout(startTime, 1000);
}
startTime();

function startTimer(duration, display) {
  var timer = duration, minutes, seconds;
  setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    display.text(minutes + ":" + seconds);
    if (--timer < 0) {
      duration = 60 * parseInt($('#refresh').val());
      request_wordcloud();
      timer = duration;
    }
  }, 1000);
}

jQuery(function ($) {
  var minutes = 60 * parseInt($('#refresh').val()), display = $('#timer');
  //var minutes = 15, display = $('#timer');
  startTimer(minutes, display);
});

$("#cancelrequest").click(function() {
  xmlhttp.abort();
  $(".loadingscreen").css("display", "none");
  Materialize.toast("You cancel the request", 4000);
})

$('.loadingscreen-fail').click(function(){
  $('.loadingscreen-fail').css('display', 'none');
})

var settings = document.getElementById('card-table');
document.onclick = function(e){
  var target = (e && e.target) || (event && event.srcElement);
  var display = 'none';
  while (target.parentNode) {
    if (target == settings || target.getAttribute("class") == 'paginate_button ' || target.getAttribute("class") == 'paginate_button next' || target.getAttribute("class") == 'paginate_button previous') {
      display ='block';
      break;
    }
    target = target.parentNode;
  }
  $('#tablescreen').css('display',display);
}

request_wordcloud();
