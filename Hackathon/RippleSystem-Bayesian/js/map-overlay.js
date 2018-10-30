function putoverlay_text(){
  var image = {
    url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    size: new google.maps.Size(20, 32),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(0, 32)
  };
  for(var k = 0; k < array_averagetraffic.length; k++){
    distance_y = (array_overlay[k][0]['lat'] - array_overlay[k][2]['lat']) / 2.0
    distance_x = (array_overlay[k][1]['lng'] - array_overlay[k][0]['lng']) / 2.0
    center_x = array_overlay[k][0]['lng'] + distance_x
    center_y =  array_overlay[k][2]['lat'] + distance_y
    var mapLabel = new MapLabel({
      text: array_averagetraffic[k].toFixed(2).toString(),
      position: new google.maps.LatLng(center_y, center_x),
      map: map,
      fontSize: parseInt(10 - (1.0 * (scalefactor/ 10.0))),
      align: 'center'
    });
    var marker = new google.maps.Marker();
    marker.bindTo('map', mapLabel);
    marker.bindTo('position', mapLabel);
    marker.bindTo('icon', image);
    marker.setDraggable(true);
    markers_overlay.push(marker);
  }
}

$('#rangefactor').on('change', function(){
  scalef = $(this).val();
  $('#spanscale').html(scalef);
  scalef = parseInt(scalef) * 1.0;
  if (scalef == scalefactor){
    Materialize.toast("You selected same scale factor", 4000);
    return;
  }
  for(var i = 0; i < parseInt(scalefactor) * parseInt(scalefactor); i++) {
    kl_polygons[i].setMap(null);
    setMapOnAll(null, markers_overlay);
    markers_overlay = [];
  }
  scalefactor = scalef; array_overlay = []; kl_polygons = [];
  array_averagetraffic = []; array_count = []; array_variancetraffic = [];
  createoverlay();
  calculate_arraytraffic();
  if(openoverlay) {
    putoverlay(); putoverlay_text();
  }
});

$('#rangefactor').on('input', function(){
  $('#spanscale').html($(this).val());
});

$('#activateoverlay').click(function(){
  $("#containerinformation-membership").animate({
    right: '65%'
  });
  if(!openoverlay){
    putoverlay();
    putoverlay_text();
    openoverlay = true;
  }
})

$('#clearmap').click(function(){
  clearmap();
  openoverlay = false;
})
