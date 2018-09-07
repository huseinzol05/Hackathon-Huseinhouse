(function($){
  $(function(){
    $('.button-collapse').sideNav();
  });
})(jQuery);

var xmlhttp;
var filename;
var numlayer = 0;
var socket = io('https://huseinzol05.dynamic-dns.net:9001/neuralnet', {secure: true, reconnect: true});
window.onbeforeunload = function () {
  xmlhttp.abort();
  socket.emit('leaveroom', {'id': String(filename), 'data': 'leave'});
};
socket.on('senddata', function(msg){
  setgraph(msg);
  $('#span-status').append(msg['status'] + '<br>');
  Materialize.toast('On Training, epoch: ' + msg['epoch'].pop(), 1200);
})

function buildConfig()
{
  return {
    delimiter: $('#delimiter').val(),
    header: $('#header').prop('checked'),
    dynamicTyping: $('#dynamicTyping').prop('checked'),
    skipEmptyLines: $('#skipEmptyLines').prop('checked'),
    preview: parseInt($('#preview').val() || 0),
    step: $('#stream').prop('checked') ? stepFn : undefined,
    encoding: $('#encoding').val(),
    worker: $('#worker').prop('checked'),
    comments: $('#comments').val(),
    complete: completeFn,
    error: errorFn
  };
}

function completeFn(results)
{
  if (results && results.errors)
  {
    if (results.errors)
    {
      errorCount = results.errors.length;
      firstError = results.errors[0];
    }
    if (results.data && results.data.length > 0)
    rowCount = results.data.length;
  }
  csv = results;
  var child = "";
  for(var i = 0; i < csv['data'][0].length; i++) child += "<input type='checkbox' class='selected-column-checkbox filled-in' id='" + csv['data'][0][i] + "'><label class='label-checkbox' for='" + csv['data'][0][i] + "'>" + csv['data'][0][i] + "</label><br>";
  $('#insertcolumn1').html(child);
  var child = "";
  for(var i = 0; i < csv['data'][0].length; i++) child += "<input type='radio' name='group1' class='target-column-radio with-gap' id='radio:" + csv['data'][0][i] + "'><label class='label-radio' for='radio:" + csv['data'][0][i] + "'>" + csv['data'][0][i] + "</label><br>";
  $('#insertcolumn2').html(child);
  totalrows = csv['data'].length - 1;
  $('#updatecount').html(Math.round(totalrows * 0.1));
}

$('#activationarray').on('chip.add', function(e, chip){
  doc = document.getElementById('activationarray');
  notes = doc.getElementsByClassName('chip');
  text = notes[notes.length - 1].textContent.slice(0, -5);
  if(text != 'sigmoid' && text != 'relu' && text != 'tanh'){
    notes[notes.length - 1].getElementsByClassName('close')[0].click();
    Materialize.toast('Only support tanh, relu, sigmoid', 4000);
  }
  if(notes.length > numlayer){
    notes[notes.length - 1].getElementsByClassName('close')[0].click();
    Materialize.toast('Cannot more than ' + numlayer + ' size', 4000);
  }
});

$('#sizearray').on('chip.add', function(e, chip){
  doc = document.getElementById('sizearray');
  notes = doc.getElementsByClassName('chip');
  text = notes[notes.length - 1].textContent.slice(0, -5);
  if(!(/^\d+$/.test(text))){
    notes[notes.length - 1].getElementsByClassName('close')[0].click();
    Materialize.toast('Only support positive integer', 4000);
  }
  if(notes.length > numlayer){
    notes[notes.length - 1].getElementsByClassName('close')[0].click();
    Materialize.toast('Cannot more than ' + numlayer + ' size', 4000);
  }
});

$('#dropoutarray').on('chip.add', function(e, chip){
  doc = document.getElementById('dropoutarray');
  notes = doc.getElementsByClassName('chip');
  text = notes[notes.length - 1].textContent.slice(0, -5);
  if(!(/^[0]+(\.)?[0-9]*$/.test(text))){
    notes[notes.length - 1].getElementsByClassName('close')[0].click();
    Materialize.toast('Only support [0.0, 1.0)', 4000);
  }
  if(notes.length > numlayer){
    notes[notes.length - 1].getElementsByClassName('close')[0].click();
    Materialize.toast('Cannot more than ' + numlayer + ' size', 4000);
  }
});

$(document).ready(function() {
  $('select').material_select();
  if($(document).width() <= 1450) {
    $('.imagetoshow').attr('style', 'width: 1200px;height: 300px;display: initial;');
    $('.imagegallery').attr('width', '1000px;');
  }
  if($(document).width() <= 500){
    $('.imagetoshow').attr('style', 'width:300px; display: initial;');
    $('.imagegallery').attr('width', '300px;');
  }
  $('#activationarray').material_chip({
    autocompleteOptions: {
      data: {
        'relu': null,
        'sigmoid': null,
        'tanh': null
      },
      limit: 10,
      minLength: 1
    }
  });
  $('#sizearray').material_chip();
  $('#dropoutarray').material_chip();
  $("#dropoutarray *").attr("disabled", "disabled").off('click');
});

function errorFn(err, file)
{
  $('#rowgoingdown*').slideUp(300);
  Materialize.toast("ERROR: " + err + file);
}

var csv, config = buildConfig();


$('#uploadcsv').change(function(){
  csv = null;
  file = document.getElementById('uploadcsv');
  size = file.files[0].size;
  if($(this).val().search('.csv') <= 0){
    $(this).val('');
    Materialize.toast('Only support CSV', 4000);
    $('#rowgoingdown1').slideUp(300);
    $('#rowgoingdown2').slideUp(300);
    return;
  }
  if(parseInt(size) > 10000000){
    $(this).val('');
    Materialize.toast('Only support file less than 10MB', 4000);
    return;
  }
  $(this).parse({
    config: config
  });
})

var enable_selected = false;
var enable_target = false;

$('#selectedcolumn').click(function(){
  if($('#uploadcsv').val().length == 0){
    Materialize.toast('Upload CSV first', 4000);
    return;
  }
  if(enable_selected) return;
  $('#rowgoingdown2').slideUp(300);
  $('#rowgoingdown1').slideUp(300, function(){
    $('#rowgoingdown1').slideDown(300);
    enable_selected = true; enable_target = false;
  });
})

$('#targetcolumn').click(function(){
  if($('#uploadcsv').val().length == 0){
    Materialize.toast('Upload CSV first', 4000);
    return;
  }
  if(enable_target) return;
  $('#rowgoingdown1').slideUp(300);
  $('#rowgoingdown2').slideUp(300, function(){
    $('#rowgoingdown2').slideDown(300);
    enable_target = true; enable_selected = false;
  });
})

$(document).mouseup(function(e)
{
  if(String(e.target.className) == 'label-checkbox'){
    var string = [];
    setTimeout(function(){
      $('.selected-column-checkbox').each(function(index) {
        if($(this).prop('checked') == true) string.push($(this).attr('id'));
      });
      $('#selectedcolumn').val(string.join(','));
    }, 100)
    return;
  }

  if(String(e.target.className) == 'label-radio'){
    var string;
    setTimeout(function(){
      $('.target-column-radio').each(function(index) {
        if($(this).prop('checked') == true) string = $(this).attr('id').slice(6);
      });
      $('#targetcolumn').val(string);
    }, 100)
    return;
  }
  var container = $("#rowgoingdown1");
  if (String(e.target.id) != 'selectedcolumn' && !container.is(e.target) && container.has(e.target).length === 0) {
    enable_selected = false;
    container.slideUp(300);
  }
  var container = $("#rowgoingdown2");
  if (String(e.target.id) != 'targetcolumn' && !container.is(e.target) && container.has(e.target).length === 0) {
    enable_target = false;
    container.slideUp(300);
  }
});

function isNormalInteger(str) {
  return /^\+?(0|[1-9]\d*)$/.test(str);
}

function setgraph(data){
  var trace_loss = {
    x: data['epoch'],
    y: data['loss'],
    mode: 'lines',
    type: 'scatter'
  }
  var layout_loss = {
    'title': 'Loss Graph',
    xaxis: {
      autotick: true
    }
  }
  var trace_acc = {
    x: data['epoch'],
    y: data['accuracy'],
    mode: 'lines',
    type: 'scatter',
    name: 'Training accuracy'
  }
  var trace_valid = {
    x: data['epoch'],
    y: data['valid'],
    mode: 'lines',
    type: 'scatter',
    name: 'Valid accuracy'
  }
  var layout_acc = {
    'title': 'Accuracy Graph',
    xaxis: {
      autotick: true
    }
  }
  var data_map = [
    {
      z: data['z'],
      x: data['xx'],
      y: data['y_'],
      type: 'heatmap',
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
    title: 'Decision Boundaries'
  }
  Plotly.newPlot('div_loss', [trace_loss], layout_loss);
  Plotly.newPlot('div_acc', [trace_acc, trace_valid], layout_acc);
  Plotly.newPlot('div_output', data_map, layout);
}

$('#hiddenlayer').keyup(function(){
  if(parseInt($(this).val()) > 10){
    $(this).val('');
    Materialize.toast("Only support max 10 hidden layers", 4000);
    $('#disablerow').slideUp(500);
    return;
  }
  if(parseInt($(this).val()) < 1){
    $(this).val('');
    Materialize.toast("Only support min 1 hidden layers", 4000);
    $('#disablerow').slideUp(500);
    return;
  }
  numlayer = parseInt($(this).val());
  $('#disablerow').slideDown(500);
})

$('#selectpenalty').change(function(){
  if($(this).val() == 'True') {
    $('#penalty').prop("disabled", false);
  }
  else $('#penalty').prop("disabled", true);
})

$('#selectcolumn').change(function(){
  if($(this).val() == 'True') {
    $("#dropoutarray *").removeAttr("disabled");
  }
  else $("#dropoutarray *").attr("disabled", "disabled").off('click');
})

$("#submitbutton").click(function(){
  if(filename){
    xmlhttp.abort();
    Materialize.toast("Aborted previous training", 4000);
    socket.emit('leaveroom', {'id': String(filename), 'data': 'leave'});
    $('#span-status').html('');
  }
  var activatearray = [], sizearray = [], dropoutarray = [];
  var activateobjects = $('#activationarray').material_chip('data');
  var sizeobjects = $('#sizearray').material_chip('data');
  var dropoutobjects = $('#dropoutarray').material_chip('data');

  if(activateobjects.length != numlayer){
    Materialize.toast("activation array must size of " + numlayer, 4000);
    return;
  }
  if(sizeobjects.length != numlayer){
    Materialize.toast("size array must size of " + numlayer, 4000);
    return;
  }
  if($('#selectcolumn').val() == 'True' && dropoutobjects.length != numlayer){
    Materialize.toast("dropout array must size of " + numlayer, 4000);
    return;
  }

  for (var i = 0; i < activateobjects.length; i++) activatearray.push(activateobjects[i]['tag']);
  for (var i = 0; i < sizeobjects.length; i++) sizearray.push(sizeobjects[i]['tag']);
  for (var i = 0; i < dropoutobjects.length; i++) dropoutarray.push(dropoutobjects[i]['tag']);
  activatearray = activatearray.toString();
  sizearray = sizearray.toString();
  dropoutarray = dropoutarray.toString();

  if(parseInt($('#splitdata').val()) > 99){
    Materialize.toast("split input must less than 100", 4000);
    return;
  }

  if(!isNormalInteger($('#splitdata').val())){
    Materialize.toast("split input must positive integer", 4000);
    return;
  }

  if(!isNormalInteger($('#epoch').val())){
    Materialize.toast("epoch must be positive integer", 4000);
    return;
  }


  if(!isNormalInteger($('#hiddenlayer').val())){
    Materialize.toast("split input must positive integer", 4000);
    return;
  }

  if(parseInt($('#hiddenlayer').val()) > 10){
    Materialize.toast("Only support max 10 hidden layers", 4000);
    return;
  }

  if($('#targetcolumn').val().length == 0 || $('#learningrate').val().length == 0
  || $('#batchsize').val().length == 0 || $('#selectedcolumn').val().length == 0 || $('#epoch').val().length == 0){
    Materialize.toast("insert required column", 4000);
    return;
  }

  if($('#selectpenalty').val() == 'True' && ($('#penalty').val().length == 0 || !(/^[0]+(\.)?[0-9]*$/.test($('#penalty').val())))){
    Materialize.toast("insert delta value", 4000);
    return;
  }

  if($('#selectedcolumn').val().search($('#targetcolumn').val()) >= 0){
    Materialize.toast("Selected column cannot have same value as target column", 4000);
    return;
  }

  $(".loadingscreen").css("display", "block");

  pcaortsne = $('#pcaortsne').prop('checked');
  normalization = $('#normalization').prop('checked');
  standardization = $('#standardization').prop('checked');
  targetcolumn = $('#targetcolumn').val();
  split = $('#splitdata').val();
  numberlayer = $('#hiddenlayer').val();
  enabledropout = $('#selectcolumn').val();
  optimizer = $('#optimizer').val();
  learningrate = $('#learningrate').val();
  batchsize = $('#batchsize').val();
  selectpenalty = $('#selectpenalty').val();
  penalty = $('#penalty').val();
  selectoutputlayer = $('#selectoutputlayer').val();
  selectloss = $('#selectloss').val();
  columntoselect = $('#selectedcolumn').val();
  filename = new Date().getTime();
  file = document.getElementById('uploadcsv');

  formData = new FormData();
  formData.append("file", file.files[0]);
  formData.append("pcaortsne", pcaortsne);
  formData.append("normalization", normalization);
  formData.append("standardization", standardization);
  formData.append("targetcolumn", targetcolumn);
  formData.append("split", split);
  formData.append("numberlayer", numberlayer);
  formData.append("enabledropout", enabledropout);
  formData.append("activationarray", activatearray);
  formData.append("sizearray", sizearray);
  formData.append("optimizer", optimizer);
  formData.append("dropoutarray", dropoutarray);
  formData.append("learningrate", learningrate);
  formData.append("batchsize", batchsize);
  formData.append("selectpenalty", selectpenalty);
  formData.append("penalty", penalty);
  formData.append("selectoutputlayer", selectoutputlayer);
  formData.append("selectloss", selectloss);
  formData.append("columntoselect", columntoselect);
  formData.append("id", filename);
  formData.append("epoch", $('#epoch').val());

  $('#paracsv').html('Upload CSV');
  try{
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        data = JSON.parse(this.responseText);
        if(data['error']){
          $("#failparagraph").html(data['error']);
          $(".loadingscreen-fail").css("display", "block");
        }
      }
    };
    xmlhttp.open("POST", "http://www.huseinhouse.com:8096/uploader", true);
    xmlhttp.upload.onloadend = function (e) {
      socket.emit('privatesocket', {'id':String(filename)});
      $('#span-status').html('');
      $('html, body').animate({
        scrollTop: $("#output").offset().top
      }, 500);
      setTimeout(function(){
        $(".loadingscreen").css("display", "none");
      }, 1500);
    }
    xmlhttp.onerror = function(e){
      $("#failparagraph").html('Fail connected to server, please email to husein.zol05@gmail.com');
      $(".loadingscreen-fail").css("display", "block");
    }
    xmlhttp.send(formData);
  }
  catch(e){
    $("#failparagraph").html('Fail connected to server, please email to husein.zol05@gmail.com');
    $(".loadingscreen-fail").css("display", "block");
  }
})

$("#cancelrequest").click(function() {
  xmlhttp.abort();
  $(".loadingscreen").css("display", "none");
  Materialize.toast("You cancel the request", 4000);
})

$('.loadingscreen-fail').click(function(){
  $('.loadingscreen-fail').css('display', 'none');
})

$(document).ready(function(){
  setgraph(pokemon);
  var width = $(document).width();
  if(width >= 1500){
    // do something
  }
  else{
    Materialize.toast('preferrable 1080p above', 4000);
  }
})
