xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    var data = JSON.parse(this.responseText);
    var positive = '', negative = '';
    for(var i = 0; i < data['pos'].length; i++){
      if((i + 1) % 12 == 0) positive += "<div class='row'>";
      positive += "<div class='col l1 s3'><img src='http://www.huseinhouse.com/output-vandalism/positive/" + data['pos'][i] + "' width='80' height='80'></div>";
      if((i + 1) % 12 == 0) positive += "</div>";
    }
    for(var i = 0; i < data['neg'].length; i++){
      if((i + 1) % 12 == 0) positive += "<div class='row'>";
      negative += "<div class='col l1 s3'><img src='http://www.huseinhouse.com/output-vandalism/negative/" + data['neg'][i] + "' width='80' height='80'></div>";
      if((i + 1) % 12 == 0) positive += "</div>";
    }
    $('#positive').html(positive);
    $('#negative').html(negative);
  }
};
xmlhttp.open("GET", "http://www.huseinhouse.com:8010/vandalism?images=yes", true);
xmlhttp.send();
