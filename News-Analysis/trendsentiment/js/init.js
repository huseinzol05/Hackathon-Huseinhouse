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
$('.collapsible').collapsible();
var xmlhttp;
var output;

function returnchild(sentence, negative, positive, politics){
  var string = "<li class='collection-item'><p>" + sentence + "</p><p>negative: " + negative + "</p><p>positive: " + positive +"</p><p>politics element: " + politics + "</p></li>";
  return string;
}

function returnheader(url, val, child, keywords, person, org, gpe){
  var string = "<li><div class='collapsible-header'><i class='material-icons'>whatshot</i>" + url +"</div><div class='collapsible-body'><div class='row center' style='border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 0px;'><div class='col l3 s12'><h4 style='margin-top: -10px;' class='header center blue-grey-text lighten-2'>Overall Sentiment</h4><canvas id='myChart" + val + "-0'></canvas></div><div class='col l3 s12'><h4 style='margin-top: -10px;' class='header center blue-grey-text lighten-2'>Overall Emotion</h4><canvas id='myChart" + val + "-1'></canvas></div><div class='col l3 s12'><h4 style='margin-top: -10px;' class='header center blue-grey-text lighten-2'>Overall Message Elements</h4><canvas id='myChart" + val + "-2'></canvas></div><div class='col l3 s12'><h4 style='margin-top: -10px;' class='header center blue-grey-text lighten-2'>Overall Polarity & Subjectivity</h4><canvas id='myChart" + val + "-3'></canvas></div></div><div class='row center' style='border-bottom: 1px solid #e0e0e0;padding-bottom: 5px; margin-bottom: 0px;'><p>Frequent keywords: " + keywords + "</p><p>Person: " + person + "</p><p>Organization: " + org + "</p><p>GPE: " + gpe + "</p></div><div class='row center'><ul class='collection'>";
  string += child + "</ul></div></div></li>";
  return string;
}

$("#submitbutton").click(function(){
  if($('#search').val().length == 0){
    Materialize.toast('Insert all the details', 4000);
    return;
  }
  $(".loadingscreen").css("display", "block");
  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      try{
        var returnoutput = JSON.parse(this.responseText);
        if(returnoutput['error']){
          $(".loadingscreen").css("display", "none");
          $("#failparagraph").html(returnoutput['error']);
          $(".loadingscreen-fail").css("display", "block");
        }
        else{
          setgraph(returnoutput, $('#search').val());
    }
      }
      catch(err){
        $(".loadingscreen").css("display", "none");
        $("#failparagraph").html('keyword is not strong enough to analyse');
        $(".loadingscreen-fail").css("display", "block");
      }

}
};
xmlhttp.open("GET", "http://www.huseinhouse.com:8017/sentimentsearch?search=" + $('#search').val() + "&token=" + $('#api').val(), true);
xmlhttp.send();
})

$("#cancelrequest").click(function() {
  xmlhttp.abort();
  $(".loadingscreen").css("display", "none");
  Materialize.toast("You cancel the request", 4000);
})

$('.loadingscreen-fail').click(function(){
  $('.loadingscreen-fail').css('display', 'none');
})

function setgraph(outputs, keyword){
  WordCloud(document.getElementById('canvas-wordcloud'), { list: outputs['wordcloud'],weightFactor: 10,color:'random-dark',backgroundColor:'white',rotateRatio: 0 } );
  $('#span-person').html(outputs['person'].join(', '));
  $('#span-org').html(outputs['org'].join(', '));
  $('#span-gpe').html(outputs['gpe'].join(', '));
  Plotly.newPlot('div-network', outputs['sentiment-network'], {title:'Sentiment Network',
  showlegend:false,
  hovermode:'closest',
  titlefont:{size:16},
  xaxis:{showgrid:false, zeroline:false, showticklabels:false},
  yaxis:{showgrid:false, zeroline:false, showticklabels:false}});
  var barChartData = {
    labels: outputs['tokens'],
    datasets: [{
      label: 'Subjectivity',
      backgroundColor: "rgb(54,162,235)",
      borderColor: "rgb(54,162,235)",
      borderWidth: 1,
      data: outputs['subjectivity']
    }, {
      label: 'Polarity',
      backgroundColor: "rgb(153,102,255)",
      borderColor: "rgb(153,102,255)",
      borderWidth: 1,
      data: outputs['polarity']
    },
    {
      label: 'Irony',
      backgroundColor: "rgb(85,168,104)",
      borderColor: "rgb(85,168,104)",
      borderWidth: 1,
      data: outputs['irony']
    },
    {
      label: 'Bias',
      backgroundColor: "rgb(255,215,0)",
      borderColor: "rgb(255,215,0)",
      borderWidth: 1,
      data: outputs['bias']
    }]
  };

  $('#canvas-sentiment').replaceWith("<canvas id='canvas-sentiment'></canvas>");
  new Chart(document.getElementById('canvas-sentiment'), {
    "type":"doughnut",
    "data": {
      "labels":["Negative", "Positive"],
      "datasets":[ {
        "data": outputs['overall_sentiment'],
        "backgroundColor": ["rgb(255, 99, 132)", "rgb(54, 162, 235)"]
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Overall sentiment analysis'
      }}
    });
    $('#canvas-emotion').replaceWith("<canvas id='canvas-emotion'></canvas>");
    new Chart(document.getElementById('canvas-emotion'), {
      "type":"doughnut",
      "data": {
        "labels":['anger', 'fear', 'joy', 'love', 'sadness', 'surprise'],
        "datasets":[ {
          "data": outputs['overall_emotion'],
          "backgroundColor": ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255,205,86)", "rgb(75,192,192)",
        "rgb(255,159,64)", "rgb(153,102,255)"]
        }]
      },
      options: {
        title: {
          display: true,
          text: 'Overall emotion analysis'
        }}
      });
      $('#canvas-msg').replaceWith("<canvas id='canvas-msg'></canvas>");
      new Chart(document.getElementById('canvas-msg'), {
        "type":"doughnut",
        "data": {
          "labels":['attack', 'constituency', 'information', 'media', 'mobilization', 'other', 'personal', 'policy', 'support'],
          "datasets":[ {
            "data": outputs['overall_msg'],
            "backgroundColor": ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255,205,86)", "rgb(75,192,192)",
          "rgb(255,159,64)", "rgb(153,102,255)", "rgb(0,116,217)", "rgb(133,20,75)", "rgb(170,170,170)"]
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Overall Message elements analysis'
          }}
        });
      $('#canvas-polarity').replaceWith("<canvas id='canvas-polarity'></canvas>");
      new Chart(document.getElementById('canvas-polarity'), {
        "type":"bar",
        "data": {
          "labels":["Subjectivity", "Polarity", "Irony", "Politics"],
          "datasets":[ {
            "data": [outputs['overall_subjectivity'], outputs['overall_polarity'], outputs['overall_irony'], outputs['overall_bias']],
            "backgroundColor": ["rgb(54,162,235)", "rgb(153,102,255)", "rgb(85,168,104)", "rgb(255,215,0)"],
            "label": "value"
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Overall polarity & subjectivity analysis'
          }}
        });

        $('#divresult').slideUp(500, function(){
          var parent = "";
          for(var i = 0; i < outputs['outputs'].length; i++){
            var child = "";
            for(var k = 0; k < outputs['outputs'][i]['p'].length; k++) child += returnchild(outputs['outputs'][i]['p'][k], outputs['outputs'][i]['sentiment'][k][0], outputs['outputs'][i]['sentiment'][k][1],
          outputs['outputs'][i]['bias'][k]);
            parent += returnheader(outputs['outputs'][i]['title'] + ' ' + outputs['outputs'][i]['date'], i, child, outputs['outputs'][i]['tokens'].join(', '), outputs['outputs'][i]['person'].join(', '), outputs['outputs'][i]['org'].join(', '), outputs['outputs'][i]['gpes'].join(', '));
          }
          parent = "<ul class='collapsible' data-collapsible='accordion'>" + parent + "</ul>";
          $('#divresult').html(parent);
          for(var i = 0; i < outputs['outputs'].length; i++){
            new Chart(document.getElementById('myChart' + i + '-0'), {
              "type":"doughnut", "data": {
                "labels":["Negative", "Positive"], "datasets":[ {
                  "data": outputs['outputs'][i]['avg_sentiment'], "backgroundColor": ["rgb(255, 99, 132)", "rgb(54, 162, 235)"]
                }
              ]
            }
          }
        );
        new Chart(document.getElementById('myChart' + i + '-1'), {
          "type":"doughnut", "data": {
            "labels":['anger', 'fear', 'joy', 'love', 'sadness', 'surprise'], "datasets":[ {
              "data": outputs['outputs'][i]['avg_emotion'], "backgroundColor": ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255,205,86)", "rgb(75,192,192)",
            "rgb(255,159,64)", "rgb(153,102,255)"]
            }
          ]
        }
      }
    );
    new Chart(document.getElementById('myChart' + i + '-2'), {
      "type":"doughnut", "data": {
        "labels":['attack', 'constituency', 'information', 'media', 'mobilization', 'other', 'personal', 'policy', 'support'], "datasets":[ {
          "data": outputs['outputs'][i]['avg_msg'], "backgroundColor": ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255,205,86)", "rgb(75,192,192)",
        "rgb(255,159,64)", "rgb(153,102,255)", "rgb(0,116,217)", "rgb(133,20,75)", "rgb(170,170,170)"]
        }
      ]
    }
  }
);
    new Chart(document.getElementById('myChart' + i + '-3'), {
      "type":"bar",
      "data": {
        "labels":["Subjectivity", "Polarity", "Irony", "Politics"],
        "datasets":[ {
          "data": [outputs['outputs'][i]['avg_subjectivity'], outputs['outputs'][i]['avg_polarity'], outputs['outputs'][i]['avg_irony'], outputs['outputs'][i]['avg_bias']],
          "backgroundColor": ["rgb(54,162,235)", "rgb(153,102,255)", "rgb(85,168,104)", "rgb(255,215,0)"],
          "label": "value"
        }]
      }
      });
      }
      $('#divresult').delay(1500).slideDown(500, function(){
        $('.collapsible').collapsible();
        $(".loadingscreen").css("display", "none");
      })
    })
}

setgraph(najib, 'najib razak');
