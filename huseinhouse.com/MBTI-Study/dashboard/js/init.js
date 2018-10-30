var personalities = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ',
'ESFJ', 'ENFJ', 'ENTJ'];
var describes = ['Introversion + Sensing + Thinking + Judging', 'Introversion + Sensing + Feeling + Judging',
'Introversion + Intuition + Feeling + Judging', 'Introversion + Intuition + Thinking + Judging',
'Introversion + Sensing + Thinking + Perceiving', 'Introversion + Sensing + Feeling + Perceiving',
'Introversion + Intuition + Feeling + Perceiving', 'Introversion + Intuition + Thinking + Perceiving',
'Extraversion + Sensing + Thinking + Perceiving', 'Extraversion + Sensing + Feeling + Perceiving',
'Extraversion + Intuition + Feeling + Perceiving', 'Extraversion + Intuition + Thinking + Perceiving',
'Extraversion + Sensing + Thinking + Judging', 'Extraversion + Sensing + Feeling + Judging',
'Extraversion + Intuition + Feeling + Judging', 'Extraversion + Intuition + Thinking + Judging'];
var details = ['Quietly systematic.  Factual.  Organized.  Logical.  Detailed.  Conscientious.  Analytical.  Responsible. Pragmatic.  Critical.  Conservative.  Decisive. Stable.  Concrete.  Efficient.',
'Quietly warm.  Factual.  Sympathetic.  Detailed.  Dependable.  Organized.  Thorough. Conscientious.  Systematic.  Conservative.  Realistic.  Caring.  Practical. Stable.  Helpful.',
'Vision and meaning oriented. Quietly intense. Insightful. Creative. Sensitive. Seeks harmony, growth. Serious. Loves language, symbols. Persevering. Inspiring.',
'Vision oriented.  Quietly innovative.  Insightful.  Conceptual.  Logical.  Seeks understanding.  Critical. Decisive. Independent. Determined.  Pursues competence, improvement.',
'Logical. Quietly analytical. Practical.  Adaptable. Curious. Cool. Observer.  Problem-solver. Exact. Realistic. Troubleshooter. Hands-on. Variety. Adventurous. Independent.',
'Gentle. Quietly caring. Compassionate. Adaptable. Modest. Aesthetic. Idealistic. Observant. Loyal. Helpful. Realistic. Patient with details. Spontaneous. Joy in action.',
'Deep-felt valuing. Quietly caring. Compassionate. Pursues meaning, harmony. Creative. Idealistic. Empathic helpers. Inquisitive. Enjoys ideas, language, writing. Independent. Adaptable.',
'Logical. Conceptual. Analytical. Objective. Detached. Critical. Ingenious. Complex. Intellectually curious. Loves ideas. Pursues understanding. Questioning. Adaptable. Independent.',
'Excitement seeking. Active. Pragmatic. Direct. Easygoing. Observant. Concrete. Realistic. Adaptable. Efficient. Analytical. Troubleshooter. Spontaneous.  Adventurous. Experiential.',
'Energetic. Sociable. Practical. Friendly. Caring. Expressive. Open. Enthusiastic. Excitement seeking. Spontaneous. Resourceful. Adaptable. Observant. Hands-on. Generous. Fun-loving.',
'Enthusiastic. Imaginative. Energetic. Creative.  Warm. Future-oriented. Individualistic. Insightful. Caring. Optimistic. Possibility focused. Open. Novelty seeking. Spontaneous. Playful.',
'Energetic. Inventive. Enthusiastic. Abstract. Logical. Theoretical. Analytical. Complex. Ingenious. Verbal. Novelty seeking. Change oriented. Global. Independent. Adaptable.',
'Active organizer.  Logical. Assertive. Fact minded.  Decisive.  Practical. Results oriented. Analytical. Systematic. Concrete. Critical. Responsible. Take charge. Common sense.',
'Actively sociable. Warm. Harmonizer. Caring. Enthusiastic. Empathic. People-oriented. Practical. Responsible. Concrete. Orderly. Conscientious. Cooperative. Appreciative. Loyal.',
'Actively sociable. Enthusiastic. Harmonizer.  Expressive. Warm. Idealistic.  Empathic. Possibility-oriented.  Insightful. Cooperative. Imaginative. Conscientious. Appreciative. Tactful.',
'Driving organizer. Planner. Vision focused. Decisive. Initiating. Conceptual. Strategic. Systematic. Assertive. Critical. Logical. Organized. Pursues improvement and achievement.'];

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

var color = Chart.helpers.color;
var firstperson, xhttp;
colors = ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)'];
window.chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

$('#uploadpdf').change(function(){
  file = document.getElementById('uploadpdf');
  size = file.files[0].size;
  if($(this).val().search('.pdf') <= 0){
    $(this).val('');
    Materialize.toast('Only support PDF', 4000);
    return;
  }
  if(parseInt(size) > 5000000){
    $(this).val('');
    Materialize.toast('Only support file less than 5MB', 4000);
    return;
  }
})

function setgraph(outputs){
  var data = [{
    y: outputs['nouns_count'],
    mode: 'markers',
    marker: {
      size: outputs['nouns_count'],
      color: outputs['nouns_count'],
      colorscale: 'Portland',
      showscale: true
    },
    text: outputs['nouns']
  }];

  var layout = {
    title: 'Scatter plot of keyword',
    hovermode: 'closest',
    yaxis:{
      title: 'Frequency keywords'
    },
    showlegend: false
  }
  Plotly.newPlot('myDiv', data, layout);
}

function setbar(outputs){
  var barChartData = {
    labels: outputs['personality'],
    datasets: [{
      label: 'Percentage',
      backgroundColor: window.chartColors.red,
      borderColor: window.chartColors.red,
      borderWidth: 1,
      data: outputs['personality_percent']
    }]
  };
  $('#canvas-personality').replaceWith("<canvas id='canvas-personality'></canvas>");
  window.myBar = new Chart(document.getElementById('canvas-personality'), {
    type: 'horizontalBar',
    data: barChartData,
    options: {
      responsive: true,
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Personality analysis'
      }
    }
  });
  var config = {
    type: 'radar',
    data: {
      labels: [["Wordpress", "Developer"], ["Back-end", "Developer"], ['React', 'Developer'], ['Python', 'Developer'],
      ['Ruby-On-Rails', 'Developer'], ['Unity', 'Developer'], ['IOS', 'Developer'], ['HTML5', 'Developer'], ['Android', 'Developer'],
      ['.NET', 'Developer'], ['Web', 'Developer'], ['Nodejs', 'Developer'], ['Ruby', 'Developer'], ['Data', 'Scientist'], ['Javascript', 'Developer'],
      ['C++', 'Developer'], ['Machine-Learning', 'Engineer'], ['Java', 'Developer'], ['PHP', 'Developer'], ['Front-End', 'Developer']],
      datasets: [{
        label: "density",
        backgroundColor: color(window.chartColors.blue).alpha(0.2).rgbString(),
        borderColor: window.chartColors.blue,
        pointBackgroundColor: window.chartColors.blue,
        data: [outputs['developer']['wordpress-dev'], outputs['developer']['back-end-dev'], outputs['developer']['react-dev'], outputs['developer']['python-dev'], outputs['developer']['ruby-on-rails-dev'],
        outputs['developer']['unity-dev'], outputs['developer']['ios-dev'], outputs['developer']['html5-dev'], outputs['developer']['android-dev'], outputs['developer']['dotnet-dev'], outputs['developer']['web-dev'],
        outputs['developer']['nodejs-dev'], outputs['developer']['ruby-dev'], outputs['developer']['data-scientist'], outputs['developer']['javascript-dev'], outputs['developer']['C-plus-plus-dev'],
        outputs['developer']['machine-learning-engineer'], outputs['developer']['java-dev'], outputs['developer']['php-dev'], outputs['developer']['front-end-dev']]
      }]
    },
    options: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Developer Personality'
      },
      scale: {
        ticks: {
          beginAtZero: true
        }
      }
    }
  };
  $('#canvas-developer').replaceWith("<canvas id='canvas-developer'></canvas>");
  new Chart(document.getElementById("canvas-developer").getContext("2d"), config);
}

$("#submitbutton").click(function(){
  if($('#uploadpdf').val().length == 0){
    Materialize.toast('Insert PDF file', 4000);
    return;
  }
  $(".loadingscreen").css("display", "block");
  file = document.getElementById('uploadpdf');
  formData = new FormData();
  formData.append("file", file.files[0]);
  $('#paraloading').html('Uploading PDF file..');
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      outputs = JSON.parse(this.responseText);
      if(outputs['error']){
        $(".loadingscreen").css("display", "none");
        Materialize.toast(outputs['error'], 4000);
        return;
      }
      $('#slidedownhell').slideUp(500, function(){
        setgraph(outputs);
        setbar(outputs);
        $('#userpersonality').html(outputs['type']);
        $('#personalitydesc').html(details[personalities.indexOf(outputs['type'])]);
        $(".loadingscreen").css("display", "none");
        $('#slidedownhell').slideDown(500).delay(500);
      })

    }
  };
  xhttp.open("POST", "http://www.huseinhouse.com:8021/uploader", true);
  xhttp.upload.onloadend = function (e) {
    $('#paracsv').html('Analyzing PDF file..');
  }
  xhttp.send(formData);
})


$("#cancelrequest").click(function() {
  xhttp.abort();
  $(".loadingscreen").css("display", "none");
  Materialize.toast("You cancel the request", 4000);
})

setgraph(husein);
setbar(husein);
$('#userpersonality').html(husein['type']);
$('#personalitydesc').html(details[personalities.indexOf(husein['type'])]);
$('#slidedownhell').slideDown(500);
