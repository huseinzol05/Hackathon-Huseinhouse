var labels;
var sentiments;
var selected;
var correlation;
var colors = ['rgb(0,31,63)', 'rgb(255,133,27)', 'rgb(255,65,54)', 'rgb(0,116,217)', 'rgb(133,20,75)', 'rgb(57,204,204)',
'rgb(240,18,190)', 'rgb(46,204,64)', 'rgb(1,255,112)', 'rgb(255,220,0)'];
$('.collapsible').collapsible();
var xhttp = new XMLHttpRequest();
$('.collapsible').collapsible();
xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    labels = JSON.parse(this.responseText);
    for(var i = 0; i < labels.length; i++) $('#issuesentiment').append("<option value='" + labels[i] + "'>" + labels[i] + "</option>");
    $('select').material_select();
    selected = labels[0];
    getsentiment(labels[0]);
  }
};
xhttp.open("GET", "data/datatrend.txt", true);
xhttp.send();

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    $('#updatetime').html(this.responseText);
  }
};
xhttp.open("GET", "data/update.txt", true);
xhttp.send();

function linearregression(corr, x, y){
  var lr = {};
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;
  var array_x = [];
  var array_y = [];
  var linear = [];
  for (var i = 0; i < correlation['df'].length; i++) {
    sum_x += correlation['df'][i][x];
    sum_y += correlation['df'][i][y];
    sum_xy += (correlation['df'][i][x] * correlation['df'][i][y]);
    sum_xx += (correlation['df'][i][x] * correlation['df'][i][x]);
    sum_yy += (correlation['df'][i][y] * correlation['df'][i][y]);
    array_x.push(correlation['df'][i][x]);
    array_y.push(correlation['df'][i][y]);
  }
  lr['intercept'] = (sum_y - corr * sum_x) / correlation['df'].length;
  for (var i = 0; i < correlation['df'].length; i++) linear.push(corr * array_x[i] + lr['intercept']);
  var trace1 = {
    x: array_x,
    y: array_y,
    mode: 'markers',
    type: 'scatter',
    name: 'BOW plot',
    text: correlation['bow']
  };
  var trace2 = {
    x: array_x,
    y: linear,
    mode: 'lines',
    name: 'Linear line',
    type: 'scatter'
  };
  var layout = {
    title: corr + ' correlation plot',
    xaxis:{
      title: correlation['list'][x]
    },
    yaxis:{
      title: correlation['list'][y]
    }
  };
  Plotly.newPlot('myDiv2', [trace1, trace2], layout);
}

function gettrend(){
  Plotly.d3.csv('data/tsne-trend.csv', function(err, rows){
    function unpack(rows, key) {
      return rows.map(function(row)
      { return row[key]; });}
      var data = [];
      for(var i = 0; i < labels.length; i++){
        var trace = {
          x:unpack(rows, 'x' + (i + 1)), y: unpack(rows, 'y' + (i + 1)), z: unpack(rows, 'z' + (i + 1)),
          text:unpack(rows, 'string' + (i + 1)),
          mode: 'markers',
          name: labels[i],
          marker: {
            size: 12,
            color: colors[i],
            line: {
              color: 'rgba(217, 217, 217, 0.14)',
              width: 0.5},
              opacity: 0.8},
              type: 'scatter3d'
            };
            data.push(trace);
          }

          var layout = {
            scene : {
              camera:{
                eye:{
                  x: 0.7,
                  y: 0.7,
                  z: 0.7
                }
              }
            },
            margin: {
              l: 0,
              r: 0,
              b: 0,
              t: 0
            }};
            Plotly.newPlot('myDiv', data, layout);
          });
        }
        function getvector(){
          Plotly.d3.csv('data/tsne-wordvector.csv', function(err, rows){
            function unpack(rows, key) {
              return rows.map(function(row)
              { return row[key]; });}
              var data = [];
              for(var i = 0; i < 5; i++){
                var trace = {
                  x:unpack(rows, 'x' + (i + 1)), y: unpack(rows, 'y' + (i + 1)), z: unpack(rows, 'z' + (i + 1)),
                  text:unpack(rows, 'string' + (i + 1)),
                  name: 'mean' + (i + 1),
                  marker: {
                    size: 12,
                    color: colors[i],
                    line: {
                      color: 'rgba(217, 217, 217, 0.14)',
                      width: 0.5},
                      opacity: 0.8},
                      type: 'scatter3d'
                    };
                    data.push(trace);
                  }

                  var layout = {
                    scene : {
                      camera:{
                        eye:{
                          x: 0.4,
                          y: 0.4,
                          z: 0.4
                        }
                      }
                    },
                    margin: {
                      l: 0,
                      r: 0,
                      b: 0,
                      t: 0
                    }};
                    Plotly.newPlot('myDiv', data, layout);
                  });
                }

                var vector = false;
                $('#submitbutton').click(function(){
                  $('#plotly-graph').attr('style', 'display: block;');
                  $('#d3-graph').attr('style', 'display: none;');
                  $('#banner').attr('style', 'display: none;');
                  $('#myDiv').attr('style', 'width:100%;height:1080px;');
                  if(!vector){
                    getvector();
                    vector = true;
                    $(this).html('Trend Issues');
                  }
                  else{
                    gettrend();
                    vector = false;
                    $(this).html('Word Vector');
                  }
                });

                $(document).ready(function() {
                  $('select').material_select();
                });

                function getsentiment(val){
                  var xhttp = new XMLHttpRequest();
                  xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                      sentiments = JSON.parse(this.responseText);
                      $('#span-person').html(sentiments[7].join('<br>'))
                      $('#span-org').html(sentiments[8].join('<br>'))
                      $('#span-gpe').html(sentiments[9].join('<br>'))
                      $('#myChart1').replaceWith("<canvas id='myChart1'></canvas>");
                      $('#myChart2').replaceWith("<canvas id='myChart2'></canvas>");
                      $('#myChart3').replaceWith("<canvas id='myChart3'></canvas>");
                      $('#myChart4').replaceWith("<canvas id='myChart4'></canvas>");
                      $('#myChart5').replaceWith("<canvas id='myChart5'></canvas>");
                      new Chart(document.getElementById('myChart1'), {
                        "type":"doughnut", "data": {
                          "labels":["Negative", "Positive"], "datasets":[ {
                            "data": sentiments[0], "backgroundColor": ["rgb(255, 99, 132)", "rgb(54, 162, 235)"]
                          }
                        ]
                      }
                    }
                  );
                  new Chart(document.getElementById('myChart5'), {
                    "type":"doughnut", "data": {
                      "labels":["Brand", "Female", "Male", "Unknown"], "datasets":[ {
                        "data": sentiments[10], "backgroundColor": ["rgb(255, 99, 132)", "rgb(255,159,64)", "rgb(255,205,86)", "rgb(75,192,192)"]
                      }
                    ]
                  }
                }
              );
                  new Chart(document.getElementById('myChart2'), {
                    "type":"doughnut", "data": {
                      "labels":["Negative", "Positive"], "datasets":[ {
                        "data": sentiments[1], "backgroundColor": ["rgb(255, 99, 132)", "rgb(54, 162, 235)"]
                      }
                    ]
                  }
                }
              );
              new Chart(document.getElementById('myChart3'), {
                "type":"doughnut", "data": {
                  "labels":['anger', 'fear', 'joy', 'love', 'sadness', 'surprise'], "datasets":[ {
                    "data": sentiments[2], "backgroundColor": ["rgb(255, 99, 132)", "rgb(255,159,64)", "rgb(255,205,86)", "rgb(75,192,192)", "rgb(54,162,235)", "rgb(153,102,255)"]
                  }
                ]
              }
            }
          );
          new Chart(document.getElementById('myChart4'), {
            "type":"horizontalBar", "data": {
              "labels":['Text'], "datasets":[ {
                "label": "Subjectivity",
                "data": [sentiments[3]], "backgroundColor": ["rgb(54,162,235)"]
              },
              {
                "label": "Polarity",
                "data": [sentiments[4]], "backgroundColor": ["rgb(153,102,255)"]
              },
              {
                "label": "Irony",
                "data": [sentiments[5]], "backgroundColor": ["rgb(85,168,104)"]
              },
              {
                "label": "Bias",
                "data": [sentiments[6]], "backgroundColor": ["rgb(255,215,0)"]
              }
            ]
          }
        }
      );
        }
      };
      xhttp.open("GET", "data/" + encodeURIComponent(val) + ".txt", true);
      xhttp.send();
    }

    $('#issuesentiment').change(function(){
      if($(this).val() == selected) {
        Materialize.toast("You selected the same issue", 3000);
        return;
      }
      selected = $(this).val();
      getsentiment(selected);
    })

    $('#heatmapbutton').click(function(){
      $('#plotly-graph').attr('style', 'display: block;');
      $('#d3-graph').attr('style', 'display: none;');
      $('#banner').attr('style', 'display: block;');
      var myPlot = document.getElementById('myDiv');
      var xhttp = new XMLHttpRequest();
      var xhttp2 = new XMLHttpRequest();
      xhttp2.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
          correlation = JSON.parse(this.responseText);
          var x_ = parseInt(Math.random()*(correlation['list'].length - 1));
          var y_ = parseInt(Math.random()*(correlation['list'].length - 1));
          linearregression(correlation['correlation'][x_][y_], x_, y_);
        }
      };
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          $('#myDiv').attr('style', 'width:100%;height:800px;');
          data = JSON.parse(this.responseText);
          var datamap = [
            {
              z: data['z'],
              x: data['label'],
              y: data['label'],
              type: 'heatmap'
            }
          ];
          var layout = {
            'title': 'Tweets Correlation',
            'annotations': []
          }
          for(var i = 0; i < data['label'].length; i++){
            for(var j = 0; j < data['label'].length; j++){
              var result = {
                xref: 'x1',
                yref: 'y1',
                x: data['label'][j],
                y: data['label'][i],
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
              layout.annotations.push(result);
            }
          }
          Plotly.newPlot('myDiv', datamap, layout);
          myPlot.on('plotly_click', function(notate){
            linearregression(correlation['correlation'][correlation['list'].indexOf(notate.points[0].x)][correlation['list'].indexOf(notate.points[0].y)],
            correlation['list'].indexOf(notate.points[0].x), correlation['list'].indexOf(notate.points[0].y));
          });
        }
      };
      xhttp.open("GET", "data/heatmap.txt", true);
      xhttp2.open("GET", "data/correlation.txt", true);
      xhttp.send();
      xhttp2.send();
    })

    $('#decisionbutton').click(function(){
      $('#plotly-graph').attr('style', 'display: block;');
      $('#d3-graph').attr('style', 'display: none;');
      $('#banner').attr('style', 'display: none;');
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          $('#myDiv').attr('style', 'width:100%;height:800px;');
          data = JSON.parse(this.responseText);
          var data_map = [
            {
              z: data['z'],
              x: data['xx'],
              y: data['y_'],
              type: 'contour',
              opacity: 0.7,
              colorscale: 'Jet',
              colorbar: {
                title: 'Label',
                titleside: 'top',
                tickvals: [...Array(data['label'].length).keys()],
                ticktext: data['label']
              }
            },
            {
              x: data['x'],
              y: data['y'],
              mode: 'markers',
              type: 'scatter',
              marker: {
                colorscale: 'Jet',
                color: data['color']
              }
            }
          ];
          var layout = {
            title: 'Decision Boundaries',
            hovermode: !1,
          }
          Plotly.newPlot('myDiv', data_map, layout);
        }
      };
      xhttp.open("GET", "data/decision.txt", true);
      xhttp.send();
    })

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.1).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    var svg = d3.select("svg");
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    var simulation = d3.forceSimulation().force("link", d3.forceLink().distance(100).strength(0.05).id(function(d) { return d.id; })).force("charge", d3.forceManyBody().strength(-50)).force("center", d3.forceCenter(600 , 300));
$('#graphbutton').click(function(){
  svg.selectAll("*").remove();
  $('#plotly-graph').attr('style', 'display: none;');
  $('#d3-graph').attr('style', 'display: block;');
  var height = $('#svggraph').height();
  var width = $('#svggraph').width();
  var radius = 6;
  d3.json("data/stopwords.json", function(error, graph) {
      if (error) throw error;
      var link = svg.append("g").attr("class", "links").selectAll("line").data(graph.links).enter().append("line").attr("stroke-width", function(d) { return Math.sqrt(d.value); });
      var node = svg.append("g").attr("class", "nodes").selectAll("g").data(graph.nodes).enter().append("g");
      var circles = node.append("circle").attr("r", 8).attr("fill", function(d) { return color(d.group); }).call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));
      var lables = node.append("text").text(function(d) {return d.id;}).attr('x', 6).attr('y', 3);
      node.append("title").text(function(d) { return d.id; });
      simulation.nodes(graph.nodes).on("tick", ticked);
      simulation.force("link").links(graph.links);
      function ticked() {
        link.attr("x1", function(d) { return d.source.x; }).attr("y1", function(d) { return d.source.y; }).attr("x2", function(d) { return d.target.x; }).attr("y2", function(d) { return d.target.y; });
        node.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
        node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
      }
    });
})
