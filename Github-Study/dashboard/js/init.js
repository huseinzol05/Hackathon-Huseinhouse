$('.button-collapse').sideNav();
get_card();
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
window.chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

function generatedate(count, name){
  var array = [];
  for(var i = count; i >= 0; i--){
    array.push(moment().subtract(i, name).format('L'));
  }
  return array;
}

function generatelinedata(labels, array, title){
  var config = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: "Commit",
        backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(),
        borderColor: window.chartColors.blue,
        fill: false,
        data: array,
      }]
    },
    options: {
      title:{
        display: true,
        text: title
      },
      scaleShowLabels : false,
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Date'
          }
        }, ],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'value'
          }
        }]
      },
    }
  };

  return config;
}

function generateradardata(array){
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
        data: array
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
  return config;
}

function generatebardata(array){
  var config = {
    type: 'bar',
    data: {
      labels: ['Technology Impact', 'Technology Sensitivity', 'Technology Satisfaction'],
      datasets: [{
        label: "polarity",
        backgroundColor: color(window.chartColors.blue).alpha(0.7).rgbString(),
        borderColor: window.chartColors.blue,
        pointBackgroundColor: window.chartColors.blue,
        data: array
      }]
    },
    options: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Developer Polarity'
      },
      scale: {
        ticks: {
          beginAtZero: true
        }
      }
    }
  };
  return config;
}

function generatepinned(){
  var string = "";
  for(var i = 0; i < firstperson['profile']['pinned'].length; i++){
    string += "<li class='collection-item'><span class='blue-text text-darken-2' style='margin-right: 20px;'>" + firstperson['profile']['pinned'][i]['title'] + "</span> " + firstperson['profile']['pinned'][i]['sentence'] + "</li>";
  }
  $('#firstpinned').html(string);
}

function generaterepo(){
  var string = "";
  for(var i = 0; i < firstperson['repositories'].length; i++){
    string += "<li><div class='collapsible-header'><i class='material-icons'>book</i><span class='blue-text text-darken-2' style='margin-right: 20px;'>" + firstperson['repositories'][i]['title'] + "</span> " + firstperson['repositories'][i]['description'] + "</div><div class='collapsible-body'><span>";

    string += "<div class='row'>Last updated: " + firstperson['repositories'][i]['date'] + "</div>";

    var tags = "<div class='row'>";
    for(var k = 0; k < firstperson['repositories'][i]['details']['tags'].length; k++){
      chips += "<div class='chip'>" + firstperson['repositories'][i]['details']['tags'][k] + "</div>";
    }
    tags += "</div>";

    var chips = "<div class='row'>";
    for(var k = 0; k < firstperson['repositories'][i]['details']['language'].length; k++){
      chips += "<div class='chip red lighten-2'>" + firstperson['repositories'][i]['details']['language'][k]['language'] + " " + firstperson['repositories'][i]['details']['language'][k]['percent'] +"</div>";
    }
    chips += "</div>";

    string += tags + chips;
    string += "<div class='row'><div class='chip orange lighten-2'>Watched: " + firstperson['repositories'][i]['details']['watched'] + "</div><div class='chip orange lighten-2'>Starred: " + firstperson['repositories'][i]['details']['stars'] + "</div><div class='chip orange lighten-2'>Forked: " + firstperson['repositories'][i]['details']['forked'] + "</div></div><div class='row'>" + firstperson['repositories'][i]['details']['readme'].join('<br>') + "</div></span></div></li>";
  }
  $('#firstrepos').html(string);
}

window.onload = function() {
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      firstperson = JSON.parse(this.responseText);
      $('#firstname').val(firstperson['profile']['name']);
      $('#firststatus').val(firstperson['profile']['status']);
      $('#firsturl').val(firstperson['profile']['url']);
      $('#firstcontribution').html(firstperson['profile']['contribution']);
      try{
        $('#firstavgcontribution').html(firstperson['profile']['persintence'].toFixed(2));
      }
      catch(err){
          $('#firstavgcontribution').html('not found');
      }
      new Chart(document.getElementById("firstdailychart").getContext("2d"), generatelinedata(generatedate(firstperson['profile']['days'].length, 'days'), firstperson['profile']['days'], 'Daily commit'));
      new Chart(document.getElementById("firstweekchart").getContext("2d"), generatelinedata(generatedate(firstperson['profile']['weeks'].length, 'weeks'), firstperson['profile']['weeks'], 'Weekly commit'));
      new Chart(document.getElementById("firstmonthchart").getContext("2d"), generatelinedata(generatedate(firstperson['profile']['months'].length, 'months'), firstperson['profile']['months'], 'Monthly commit'));
      var dev = [firstperson['dev-prob']['wordpress-dev'], firstperson['dev-prob']['back-end-dev'], firstperson['dev-prob']['react-dev'], firstperson['dev-prob']['python-dev'], firstperson['dev-prob']['ruby-on-rails-dev'],
      firstperson['dev-prob']['unity-dev'], firstperson['dev-prob']['ios-dev'], firstperson['dev-prob']['html5-dev'], firstperson['dev-prob']['android-dev'], firstperson['dev-prob']['dotnet-dev'], firstperson['dev-prob']['web-dev'],
      firstperson['dev-prob']['nodejs-dev'], firstperson['dev-prob']['ruby-dev'], firstperson['dev-prob']['data-scientist'], firstperson['dev-prob']['javascript-dev'], firstperson['dev-prob']['C-plus-plus-dev'],
      firstperson['dev-prob']['machine-learning-engineer'], firstperson['dev-prob']['java-dev'], firstperson['dev-prob']['php-dev'], firstperson['dev-prob']['front-end-dev']];
      new Chart(document.getElementById("firstradar").getContext("2d"), generateradardata(dev));
      new Chart(document.getElementById("firstbar").getContext("2d"), generatebardata([firstperson['technology-impact'], firstperson['technology-sensitivity'], firstperson['technology-satisfaction']]));
      generatepinned();
      generaterepo();
      $('#slidedownhell').delay(1000).slideDown(1000);
    }
  };
  xhttp.open("GET", "data/myself.txt", true);
  xhttp.send();
};

$("#submitbutton").click(function(){
  if($('#githubname').val().length == 0){
    Materialize.toast('Insert github name', 4000);
    return;
  }
  xhttp = new XMLHttpRequest();
  $('#paraloading').html('Searching github account..');
  setTimeout(function(){
    $('#paraloading').html('Analyzing ' + $('#githubname').val() + ' profiles..');
  }, 4000)
  $(".loadingscreen").css("display", "block");
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      firstperson = JSON.parse(this.responseText);
      if(firstperson['error']){
        $(".loadingscreen").css("display", "none");
        Materialize.toast(firstperson['error'], 4000);
        return;
      }
      else{
        $('#slidedownhell').slideUp(500, function(){
          $('#firstname').val(firstperson['profile']['name']);
          $('#firststatus').val(firstperson['profile']['status']);
          $('#firsturl').val(firstperson['profile']['url']);
          $('#firstcontribution').html(firstperson['profile']['contribution']);
          try{
            $('#firstavgcontribution').html(firstperson['profile']['persintence'].toFixed(2));
          }
          catch(err){
              $('#firstavgcontribution').html('not found');
          }
          $('#firstradar').replaceWith("<canvas id='firstradar'></canvas>");
          $('#firstbar').replaceWith("<canvas id='firstbar' height='300'></canvas>");
          $('#firstdailychart').replaceWith("<canvas id='firstdailychart' height='80'></canvas>");
          $('#firstweekchart').replaceWith("<canvas id='firstweekchart' height='120'></canvas>");
          $('#firstmonthchart').replaceWith("<canvas id='firstmonthchart' height='120'></canvas>");
          $('#githubhell').html("<div class='github-card' data-github='" + $('#githubname').val() + "' data-width='800' data-height='150' data-theme='default'></div>");
          new Chart(document.getElementById("firstdailychart").getContext("2d"), generatelinedata(generatedate(firstperson['profile']['days'].length, 'days'), firstperson['profile']['days'], 'Daily commit'));
          new Chart(document.getElementById("firstweekchart").getContext("2d"), generatelinedata(generatedate(firstperson['profile']['weeks'].length, 'weeks'), firstperson['profile']['weeks'], 'Weekly commit'));
          new Chart(document.getElementById("firstmonthchart").getContext("2d"), generatelinedata(generatedate(firstperson['profile']['months'].length, 'months'), firstperson['profile']['months'], 'Monthly commit'));
          var dev = [firstperson['dev-prob']['wordpress-dev'], firstperson['dev-prob']['back-end-dev'], firstperson['dev-prob']['react-dev'], firstperson['dev-prob']['python-dev'], firstperson['dev-prob']['ruby-on-rails-dev'],
          firstperson['dev-prob']['unity-dev'], firstperson['dev-prob']['ios-dev'], firstperson['dev-prob']['html5-dev'], firstperson['dev-prob']['android-dev'], firstperson['dev-prob']['dotnet-dev'], firstperson['dev-prob']['web-dev'],
          firstperson['dev-prob']['nodejs-dev'], firstperson['dev-prob']['ruby-dev'], firstperson['dev-prob']['data-scientist'], firstperson['dev-prob']['javascript-dev'], firstperson['dev-prob']['C-plus-plus-dev'],
          firstperson['dev-prob']['machine-learning-engineer'], firstperson['dev-prob']['java-dev'], firstperson['dev-prob']['php-dev'], firstperson['dev-prob']['front-end-dev']];
          new Chart(document.getElementById("firstradar").getContext("2d"), generateradardata(dev));
          new Chart(document.getElementById("firstbar").getContext("2d"), generatebardata([firstperson['technology-impact'], firstperson['technology-sensitivity'], firstperson['technology-satisfaction']]));
          generatepinned();
          generaterepo();
          get_card();
          $(".loadingscreen").css("display", "none");
          $('#slidedownhell').slideDown(500);
        })
      }
    }
  };
  xhttp.open("GET", "http://www.huseinhouse.com:8007/github?name=" + $('#githubname').val() + "&dev=yes", true);
  xhttp.send();
})

$("#cancelrequest").click(function() {
  xhttp.abort();
  $(".loadingscreen").css("display", "none");
  Materialize.toast("You cancel the request", 4000);
})
