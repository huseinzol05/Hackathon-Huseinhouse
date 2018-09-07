var zero = '#6D6D63';
var lowerbound = 1.0e-22;
var upperbound = 0.05;
var zerotext = 'impossible to be affected';
var fourclass = ['#FAEF03', '#03FA1D', '#0329FA', '#FA0338'];
var fourwords = ['almost impossible affected', 'maybe affected', 'affected', 'strongly affected'];
var fiveclass = ['#FAEF03', '#03FA1D', '#0CB565', '#0329FA', '#FA0338'];
var fivewords = ['almost impossible affected', 'somewhere affected', 'maybe affected', 'affected', 'strongly affected'];
var sixclass = ['#FAEF03', '#03FA1D', '#0CB565', '#6EC3D6', '#0329FA', '#FA0338'];
var sixwords = ['almost impossible affected', 'somewhere affected', 'maybe affected', 'somehow affected', 'affected', 'strongly affected'];
var sevenclass = ['#FAEF03', '#03FA1D', '#0CB565', '#6EA5D6', '#0329FA', '#B50C8E', '#FA0338'];
var sevenwords = ['almost impossible affected', 'somewhere affected', 'maybe affected', 'tendency affected', 'somehow affected', 'affected', 'strongly affected'];
var membership = 4;
var selectedclass = fourclass; var selectedwords = fourwords;

$('body').on('click', 'a.toclick_membership', function() {
  var val = parseInt($(this).attr('data-values'));
  if(val == membership){
    Materialize.toast("You selected same membership", 2000);
    return;
  }
  clearcoloroverlay();
  if(val == 4){
    selectedclass = fourclass; selectedwords = fourwords; membership = val;
  }
  if(val == 5){
    selectedclass = fiveclass; selectedwords = fivewords; membership = val;
  }
  if(val == 6){
    selectedclass = sixclass; selectedwords = sixwords; membership = val;
  }
  if(val == 7){
    selectedclass = sevenclass; selectedwords = sevenwords; membership = val;
  }
  $('#collectiontoadd').html("<p><img src='img/color/%236D6D63.png' class='circle circle-detail'> impossible to be affected</p>");
  for(var i = 0; i < membership; i++) $('#collectiontoadd').append("<p><img src='img/color/%23" + selectedclass[i].slice(1) + ".png' class='circle circle-detail'> " + selectedwords[i] +"</p>");

});
