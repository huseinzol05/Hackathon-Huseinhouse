var key;
var xhttp;
var time;
var date = '08-02-2016';
var timename = 'Average';
var day = 'average week';
var selectedtime = 'avg';
var enable_cancel = false;
var scalefactor = 10.0;
var filter_traffic = 'all';
var fuzzy_membership = 4;
var geojson;
var clonegeojson;
var updated_geojson;
var array_overlay = [];
var kl_polygons = [];
var array_averagetraffic = [];
var array_variancetraffic = [];
var array_count = [];
var markers = [];
var markers_overlay = [];
var markers_facilities = [];
var openoverlay = false;
var firsttime_facilities = true;
var x, y;
var array_tocalculate = [];

function logout() {
  document.cookie = "key=; path=/;";
  window.location.href = '/';
}

function droploading(enable = true) {
  $(".card-loading").fadeOut(function() {
    $(".loadingscreen").slideUp(500, function() {
      if(enable) updatefloatInformation();
    });
  });
}

function displayloading() {
  $(".card-loading").css('display', 'block');
  $(".loadingscreen").css('display', 'block');
}

function updatefloatInformation() {
  $('#dateinformation').html('Date: ' + date);
  if (date != '08-02-2016' || date != '11-01-2016') day = 'average day';
  else day = 'average week';
  $('#dayinformation').html('Day: ' + day);
  $('#timeinformation').html('Time: ' + timename);
  Materialize.toast("Setting traffic as " + date + ", " + day + ", " + timename, 4000);
}

function gaussian_prob_density(mean, variance, mean_target){
  var left = Math.sqrt(2 * Math.PI * variance);
  left = 1 / left;
  var right = Math.exp(-(Math.pow((mean_target - mean), 2) / (2 * variance)));
  return (left * right) || 0;
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: {
      lat: 3.1385036,
      lng: 101.6169484
    },
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    minZoom: 12,
    zoom: 12
  });
}

function updatecolor(){
  clonegeojson = JSON.parse(JSON.stringify(geojson));
  if(filter_traffic == 'all') return;
  else{
    if(filter_traffic == '100km') var val = 100;
    else var val = parseInt(filter_traffic[0] + filter_traffic[1]);
    for (var i = 0; i < clonegeojson['features'].length; i++) {
      if(filter_traffic == '100km') {
        if (clonegeojson['features'][i]['properties']['traffic'][selectedtime] < val)
        clonegeojson['features'][i]['properties']['color'][selectedtime] = '#EDC68D';
      }
      else{
        if (clonegeojson['features'][i]['properties']['traffic'][selectedtime] >= val)
        clonegeojson['features'][i]['properties']['color'][selectedtime] = '#EDC68D';
      }

    }
  }
}

function updatemap(datedata, firsttime) {
  clearcoloroverlay();
  if (!firsttime) {
    displayloading();
    $('#loadingtext').html('Loading GeoJson and traffic data');
    $('#neighbourhood-list').html('');
  }
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      geojson = JSON.parse(this.responseText);
      updatecolor();
      map.data.forEach(function (feature) {
        map.data.remove(feature);
      });
      map.data.addGeoJson(clonegeojson);
      updatetime(selectedtime);
      enable_cancel = true;
    }
  };
  xhttp.open("GET", "https://raw.githubusercontent.com/DevconX/Traffic-Data/master/ripplesystem/trafficdata/" + datedata + ".geojson", true);
  xhttp.timeout = 120000; // 2mins
  xhttp.addEventListener("timeout", function(e) {
    timeout();
  });
  xhttp.send();
}

function updatetime(column, filter = false) {
  clearcoloroverlay();
  if(filter) {
    $('#loadingtext').html('Filtering traffic data');
    displayloading();
  }
  setTimeout(function(){
    map.data.setStyle({});
    map.data.setStyle(function(feature) {
      var color = feature.getProperty('color');
      return {
        fillColor: color[column],
        strokeColor: color[column]
      }
    });
  }, 1);
  if(!filter){
    $('#neighbourhood-list').html('');
    $('#loadingtext').html('Calculating average data');
    array_overlay = []; array_averagetraffic = []; array_count = []; array_variancetraffic = [];
    createoverlay();
    calculate_arraytraffic();
    $('#loadingtext').html('Sorting data');
    updated_geojson = quickSort(geojson, 0, geojson['features'].length - 1);
    $('#loadingtext').html('Finding the hot places');
    updateHotplace(6);
  }
  if(filter) setTimeout(droploading(enable = false), 3000);
  else setTimeout(droploading, 3000);
}

function timeout() {
  $(".loadingscreen").css("display", "none");
  Materialize.toast("Request timeout, maybe no internet connection", 2000);
}

function initialize() {
  initMap();
  updatemap(date, true);
  map.data.addListener('mouseover', function(event) {
    $('#containerhover').css('top', y + 'px');
    $('#containerhover').css('left', x + 'px');
    $('#hoverspan').html(event.feature.getProperty('segment_id') + ': ' + gettrafficvalue(event.feature.getProperty('segment_id')) + ' km/h');
    $('#containerhover').css('display', 'block');
  });
  map.data.addListener('mouseout', function(event) {
    $('#containerhover').css('display', 'none');
  });
  map.data.addListener('click', function(event) {
    $('#loadingtext').html('plotting data from GeoJson');
    displayloading();
    time = new Date().getTime();
    formData = new FormData();
    formData.append("traffic", JSON.stringify(getTraffic(event.feature.getProperty('segment_id'))));
    formData.append('date', date);
    formData.append('id', time);
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        $(".loadingscreen").css("display", "none");
        if (this.responseText != 'success') {
          $("#failparagraph").html(this.responseText);
          $(".loadingscreen-fail").css("display", "block");
        }
        else {
          $('.imagetoshow').attr('src', 'http://www.huseinhouse.com/python-api-ripplesystem/picture/' + time + '.png');
          $(".imagescreen").css("display", "block");
        }
      }
    };
    xmlhttp.open("POST", "https://huseinzol05.dynamic-dns.net:8002/uploader", true);
    xmlhttp.send(formData);
  });
}

function gettrafficvalue(id) {
  for (var i = 0; i < geojson['features'].length; i++) {
    if (geojson['features'][i]['properties']['segment_id'] == id) return geojson['features'][i]['properties']['traffic'][selectedtime];
  }
}

function getTraffic(id) {
  for (var i = 0; i < geojson['features'].length; i++) {
    if (geojson['features'][i]['properties']['segment_id'] == id) return geojson['features'][i]['properties']['traffic'];
  }
}

function quickSort(arr, left, right) {
  var len = arr['features'].length,
  pivot, partitionIndex;
  if (left < right) {
    pivot = right;
    partitionIndex = partition(arr, pivot, left, right);
    quickSort(arr, left, partitionIndex - 1);
    quickSort(arr, partitionIndex + 1, right);
  }
  return arr;
}

function partition(arr, pivot, left, right) {
  var pivotValue = arr['features'][pivot]['properties']['traffic'][selectedtime],
  partitionIndex = left;

  for (var i = left; i < right; i++) {
    if (arr['features'][i]['properties']['traffic'][selectedtime] < pivotValue) {
      swap(arr, i, partitionIndex);
      partitionIndex++;
    }
  }
  swap(arr, right, partitionIndex);
  return partitionIndex;
}

function swap(arr, i, j) {
  var temp = arr['features'][i];
  arr['features'][i] = arr['features'][j];
  arr['features'][j] = temp;
}

function updateHotplace(count) {

  for (i = 0; i < count; i++) {
    if (updated_geojson['features'][i]['properties']['traffic'][selectedtime] == 0) {
      count++;
      continue;
    }
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        loc = JSON.parse(this.responseText);
        place = loc['results'][0]['address_components'][0]['long_name'];
        if (place.length < 5) place = place.concat(" " + loc['results'][0]['address_components'][1]['long_name']);
        $('#neighbourhood-list').append("<li><a class='toclick' data-values='" + loc['results'][0]['geometry']['location']['lat'] + "," + loc['results'][0]['geometry']['location']['lng'] + "'>" + place + "</a></li>");
      }
    };
    xmlhttp.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + updated_geojson['features'][i]['geometry']['coordinates'][0][1][1] + "," + updated_geojson['features'][i]['geometry']['coordinates'][0][1][0] + "&sensor=true", false);
    xmlhttp.send();
  }
}

function smoothZoom(map, max, cnt) {
  if (cnt >= max) {
    return;
  }
  else {
    z = google.maps.event.addListener(map, 'zoom_changed', function(event) {
      google.maps.event.removeListener(z);
      smoothZoom(map, max, cnt + 1);
    });
    setTimeout(function() {
      map.setZoom(cnt)
    }, 80);
  }
}

function placeMarker(location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  map.panTo(location);
  smoothZoom(map, 20, map.getZoom());
  markers.push(marker);
}

function setMapOnAll(map, marker_arr) {
  for (var i = 0; i < marker_arr.length; i++) {
    marker_arr[i].setMap(map);
  }
}

function createoverlay(){
  distance_x = (101.79 - 101.55) / scalefactor;
  distance_y = (3.265 - 3.019) / scalefactor;
  for(i = 0; i < parseInt(scalefactor); i++){
    for(k = 0; k < parseInt(scalefactor); k++){
      var triangleCoords = [
        {lat: 3.265 + (-i * distance_y), lng: 101.55 + (k * distance_x)}, {lat: 3.265 + (-i * distance_y), lng:  101.55 + ((k + 1) * distance_x)},
        {lat: 3.265 + ((-i - 1) * distance_y), lng: 101.55 + ((k + 1) * distance_x)}, {lat: 3.265 + ((-i - 1) * distance_y), lng: 101.55 + (k * distance_x)}
      ];
      array_overlay.push(triangleCoords);
      array_averagetraffic.push(0);
      array_count.push(0);
      array_variancetraffic.push([]);
    }
  }
}

function changecolor(val){
  var distance = (upperbound - lowerbound) / ((membership - 2) * 1.0);
  if(val == 0) return zero;
  else if(val <= lowerbound) return selectedclass[0];
  else if(val >= upperbound) return selectedclass[selectedclass.length - 1];
  else{
    for(var i = 0; i < (membership - 2); i++){
      if(val <= ((distance * (i + 1)) + lowerbound)) return selectedclass[i + 1];
    }
  }
}

function clearcoloroverlay(){
  for(var i = 0; i < array_tocalculate.length; i++) {
    kl_polygons[array_tocalculate[i]].setMap(null);
    kl_polygons[array_tocalculate[i]].strokeColor = '#F7EFEE';
    kl_polygons[array_tocalculate[i]].fillColor = '#F7EFEE';
    kl_polygons[array_tocalculate[i]].setMap(map);
  }
}

function putoverlay(){
  for(var i = 0; i < parseInt(scalefactor) * parseInt(scalefactor); i++){
    var kl_polygon = new google.maps.Polygon({
      paths: array_overlay[i],
      strokeColor: '#F7EFEE',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor: '#F7EFEE',
      fillOpacity: 0.35
    });
    kl_polygon.indexarray = i;
    kl_polygons.push(kl_polygon);
    google.maps.event.addListener(kl_polygons[i],"click",function(){
      clearcoloroverlay();
      if(this.indexarray == 0) array_tocalculate = [this.indexarray + 1, scalefactor, scalefactor + 1];
      else if(this.indexarray == (scalefactor - 1)) array_tocalculate = [this.indexarray - 1, this.indexarray + scalefactor, (this.indexarray + scalefactor) - 1];
      else if(this.indexarray == (scalefactor * (scalefactor - 1))) array_tocalculate = [(scalefactor * (scalefactor - 2)), (scalefactor * (scalefactor - 2)) + 1, (scalefactor * (scalefactor - 1)) + 1];
      else if(this.indexarray == (Math.pow(scalefactor, 2) - 1)) array_tocalculate = [Math.pow(scalefactor, 2) - 2, (scalefactor * (scalefactor - 1)) - 1, (scalefactor * (scalefactor - 1)) - 2];
      else if(this.indexarray < (scalefactor - 1)) array_tocalculate = [this.indexarray - 1, this.indexarray + 1, (this.indexarray + scalefactor) - 1, this.indexarray + scalefactor, (this.indexarray + scalefactor) + 1];
      else if(this.indexarray % scalefactor == 0) array_tocalculate = [this.indexarray + 1, (this.indexarray - scalefactor), (this.indexarray - scalefactor) + 1, (this.indexarray + scalefactor), (this.indexarray + scalefactor) + 1];
      else if((this.indexarray + 1) % scalefactor == 0) array_tocalculate = [this.indexarray - 1, this.indexarray - scalefactor, (this.indexarray - scalefactor) - 1, this.indexarray + scalefactor, (this.indexarray + scalefactor) - 1];
      else if(this.indexarray > (scalefactor * (scalefactor - 1))) array_tocalculate = [this.indexarray - 1, this.indexarray + 1, this.indexarray - scalefactor, (this.indexarray - scalefactor) - 1, (this.indexarray - scalefactor) + 1];
      else array_tocalculate = [this.indexarray - 1, this.indexarray + 1, this.indexarray - scalefactor, (this.indexarray - scalefactor) - 1, (this.indexarray - scalefactor) + 1, this.indexarray + scalefactor, (this.indexarray + scalefactor) - 1, (this.indexarray + scalefactor) + 1];
      for(var i = 0; i < array_tocalculate.length; i++) {
        var v = gaussian_prob_density(array_averagetraffic[this.indexarray], array_averagetraffic[this.indexarray], array_averagetraffic[array_tocalculate[i]]);
        var newcolor = changecolor(v);
        kl_polygons[array_tocalculate[i]].setMap(null);
        kl_polygons[array_tocalculate[i]].strokeColor = newcolor;
        kl_polygons[array_tocalculate[i]].fillColor = newcolor;
        kl_polygons[array_tocalculate[i]].setMap(map);
      }
    });
    kl_polygons[i].setMap(map);
  }
}

function calculate_arraytraffic(){
  for(var i = 0; i < geojson['features'].length; i++){
    for(var k = 0; k < array_averagetraffic.length; k++){
      if(geojson['features'][i]['geometry']['coordinates'][0][0][0] > array_overlay[k][0]['lng']
      && geojson['features'][i]['geometry']['coordinates'][0][0][0] < array_overlay[k][1]['lng']
      && geojson['features'][i]['geometry']['coordinates'][0][0][1] < array_overlay[k][0]['lat']
      && geojson['features'][i]['geometry']['coordinates'][0][0][1] > array_overlay[k][2]['lat']){
        array_averagetraffic[k] += geojson['features'][i]['properties']['traffic'][selectedtime];
        array_count[k] += 1
        array_variancetraffic[k].push(geojson['features'][i]['properties']['traffic'][selectedtime]);
        break;
      }
    }
  }
  for(var i = 0; i < array_averagetraffic.length; i++) {
    array_averagetraffic[i] /= (array_count[i] * 1.0);
    array_averagetraffic[i] = array_averagetraffic[i] || 0;
  }

  for(var i = 0; i < array_variancetraffic.length; i++){
    var sum = 0;
    for(var k = 0; k < array_variancetraffic[i].length; k++) sum += Math.pow((array_variancetraffic[i][k] - array_averagetraffic[i]), 2);
    sum /= (array_count[i] * 1.0);
    sum = sum || 0;
    array_variancetraffic[i] = sum;
  }
}

function clearmap(){
  clearcoloroverlay();
  setMapOnAll(null, markers);
  setMapOnAll(null, markers_facilities);
  setMapOnAll(null, markers_overlay);
  for(var i = 0; i < parseInt(scalefactor) * parseInt(scalefactor); i++) kl_polygons[i].setMap(null);
}

$('body').on('click', 'a.toclick', function() {
  setMapOnAll(null, markers);
  loc = $(this).attr('data-values');
  loc = loc.split(",");
  var geo = {
    'lat': parseFloat(loc[0]),
    'lng': parseFloat(loc[1])
  };
  placeMarker(geo);
});

$('body').on('click', 'a.toclick_traffic', function() {
  var val = $(this).attr('data-values');
  if(val == filter_traffic){
    Materialize.toast("You selected same filter", 2000);
    return;
  }
  filter_traffic = val;
  updatecolor();
  map.data.forEach(function (feature) {
    map.data.remove(feature);
  });
  map.data.addGeoJson(clonegeojson);
  updatetime(selectedtime, true);
});

$('.itemclick').click(function() {
  if (!firsttime_facilities) setMapOnAll(null, markers_facilities);
  val = $(this).attr('data-values');

  loop_facilities = [val];
  if (val == 'everything') loop_facilities = ['school', 'malls', 'hospital', 'sectors'];

  for (x = 0; x < loop_facilities.length; x++) {

    image_file = 'img/footguides/' + loop_facilities[x] + '-icon-small.png';

    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        loc = JSON.parse(this.responseText);

        for (i = 0; i < loc.length; i++) {
          location_mark = {
            'lat': loc[i]['lat'],
            'lng': loc[i]['lng']
          };
          var marker = new google.maps.Marker({
            position: location_mark,
            icon: image_file,
            map: map
          });
          markers_facilities.push(marker);
        }
      }
    };
    xmlhttp.open("GET", "https://raw.githubusercontent.com/DevconX/Geolocation-KualaLumpur/master/" + loop_facilities[x] + ".json", false);
    xmlhttp.send();
  }
  firsttime_facilities = false;
})

$('#closebutton').click(function() {
  $('.imagescreen').css('display', 'none');
  xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      console.log('deleted');
    }
  };
  xmlhttp.open("GET", "https://huseinzol05.dynamic-dns.net:8002/uploader?nm=" + time, true);
  xmlhttp.send();
})

$(document).ready(function() {
  $('.datepicker').pickadate().on('change', function() {
    $(this).next().find('.picker__close').click();
    date = $('#datedata').val();
    updatemap(date, false);
  });
});

$('body').mousemove(function(event) {
  x = event.pageX;
  y = event.pageY;
})

$('.timebutton').click(function() {
  var timestamp = $(this).attr('id');
  timestamp = timestamp.slice(4);
  if (selectedtime == timestamp) {
    Materialize.toast("You selected same time", 2000);
    return;
  }
  displayloading();
  selectedtime = timestamp;
  timename = $(this).html();
  updatecolor();
  map.data.forEach(function (feature) {
    map.data.remove(feature);
  });
  map.data.addGeoJson(clonegeojson);
  updatetime(selectedtime, filter = false);
})

$("#cancelrequest").click(function() {
  if (enable_cancel) {
    xhttp.abort();
    $(".loadingscreen").css("display", "none");
    Materialize.toast("You cancel the request", 2000);
  }
  else Materialize.toast("You cannot cancel this request", 2000);
})

$('#logout').click(function() {
  logout();
})
