(function($){
  $(function(){
    $('.button-collapse').sideNav();
  });
})(jQuery);

var xmlhttp;
var filename;
var numlayer = 0;
var socket = io('https://huseinzol05.dynamic-dns.net:9001/rnnnet', {secure: true, reconnect: true});
var histories = [];
var totalrows;
window.onbeforeunload = function () {
  xmlhttp.abort();
  socket.emit('leaveroom', {'id': String(filename), 'data': 'leave'});
};
socket.on('senddata', function(msg){
  setgraph(msg);
  $('#span-status').append(msg['status'] + '<br>');
  Materialize.toast('On Training, epoch: ' + msg['epoch'].pop(), 1200);
  histories.push(msg);
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
  totalrows = csv['data'].length - 1;
}

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
  if(totalrows > 300){
    $(this).val('');
    Materialize.toast('Only support less than 300 rows', 4000);
    return;
  }
})

var enable_selected = false;

$('#selectedcolumn').click(function(){
  if($('#uploadcsv').val().length == 0){
    Materialize.toast('Upload CSV first', 4000);
    return;
  }
  if(enable_selected) return;
  $('#rowgoingdown1').slideUp(300, function(){
    $('#rowgoingdown1').slideDown(300);
    enable_selected = true;
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

  var container = $("#rowgoingdown1");
  if (String(e.target.id) != 'selectedcolumn' && !container.is(e.target) && container.has(e.target).length === 0) {
    enable_selected = false;
    container.slideUp(300);
  }
});

function isNormalInteger(str) {
  return /^\+?(0|[1-9]\d*)$/.test(str);
}


function setgraph(data){
  var data_plot = [], data_plot_seperate = [], data_plot_qq_real = [], data_plot_qq_predict = [], data_plot_bar_real = [], data_plot_bar_predict = [];
  var color_count = 0;
  for(var i = 0; i < data['columns'].length; i++){
    trace_real = {
      type: 'scatter',
      x: data['ori-range'],
      y: data['ori'][i],
      mode: 'lines',
      name: data['columns'][i] + ' Real',
      line: {
        color: data['color'][color_count]
      }
    };
    trace_predict = {
      type: 'scatter',
      x: data['predict-range'],
      y: data['predict'][i],
      mode: 'lines',
      name: data['columns'][i] + ' Predict',
      line: {
        color: data['color'][color_count + 1]
      }
    };
    trace_predict_seperate = {
      type: 'scatter',
      x: data['predict-range'],
      y: data['predict'][i],
      mode: 'lines',
      xaxis: 'x2',
      yaxis: 'y2',
      name: data['columns'][i] + ' Predict',
      line: {
        color: data['color'][color_count + 1]
      }
    };
    var scatter_real =  {
      x: data['quantile-real'][i][0],
      y: data['quantile-real'][i][1],
      mode: 'markers',
      xaxis: 'x' + (i + 1),
      yaxis: 'y' + (i + 1),
      name: 'QQ ' + data['columns'][i]
    };
    var scatter_predict =  {
      x: data['quantile_predict'][i][0],
      y: data['quantile_predict'][i][1],
      mode: 'markers',
      xaxis: 'x' + (i + 1),
      yaxis: 'y' + (i + 1),
      name: 'QQ ' + data['columns'][i]
    };
    var line_real =  {
      x: data['quantile-real'][i][0],
      y: data['linear_real'][i],
      mode: 'lines',
      xaxis: 'x' + (i + 1),
      yaxis: 'y' + (i + 1),
      name: 'linear ' + data['columns'][i]
    };
    var line_predict =  {
      x: data['quantile_predict'][i][0],
      y: data['linear_predict'][i],
      mode: 'lines',
      xaxis: 'x' + (i + 1),
      yaxis: 'y' + (i + 1),
      name: 'linear ' + data['columns'][i]
    };
    var bar_real = {
      x: data['bar_real'][i][0],
      y: data['bar_real'][i][1],
      type: 'bar',
      xaxis: 'x' + (i + 1),
      yaxis: 'y' + (i + 1),
      name: 'histogram ' + data['columns'][i]
    }
    var kde_real = {
      x: data['kde_real'][i][0],
      y: data['kde_real'][i][1],
      mode: 'lines',
      xaxis: 'x' + (i + 1),
      yaxis: 'y' + (i + 1),
      name: 'KDE ' + data['columns'][i]
    }
    var bar_predict = {
      x: data['bar_predict'][i][0],
      y: data['bar_predict'][i][1],
      type: 'bar',
      xaxis: 'x' + (i + 1),
      yaxis: 'y' + (i + 1),
      name: 'histogram ' + data['columns'][i]
    }
    var kde_predict = {
      x: data['kde_predict'][i][0],
      y: data['kde_predict'][i][1],
      mode: 'lines',
      xaxis: 'x' + (i + 1),
      yaxis: 'y' + (i + 1),
      name: 'KDE ' + data['columns'][i]
    }
    data_plot_bar_real.push(bar_real);
    data_plot_bar_real.push(kde_real);
    data_plot_bar_predict.push(bar_predict);
    data_plot_bar_predict.push(kde_predict);
    data_plot_qq_real.push(scatter_real);
    data_plot_qq_real.push(line_real);
    data_plot_qq_predict.push(scatter_predict);
    data_plot_qq_predict.push(line_predict);
    data_plot.push(trace_real);
    data_plot.push(trace_predict);
    data_plot_seperate.push(trace_real);
    data_plot_seperate.push(trace_predict_seperate);
    color_count += 2;
  }
  var layout = {
    'title': 'Overlap Graph',
    xaxis: {
      autotick: true
    },
    margin: {
      t: 25,
      pad: 4,
    }
  }
  var layout_seperate = {
    'title': 'Seperate Graph',
    xaxis: {
      autotick: true
    },
    margin: {
      t: 25,
      pad: 4,
    },
    xaxis: {domain: [0, 0.45]},
    yaxis2: {anchor: 'x2'},
    xaxis2: {domain: [0.55, 1]}
  }
  var split = 1 / data['columns'].length;
  var boundary = 0.05;
  var layout_qq_real = {
    'title': 'Real QQ Plot',
    margin: {
      t: 25,
      pad: 4,

    }
  };
  var layout_qq_predict = {
    'title': 'Predict QQ Plot',
    margin: {
      t: 25,
      pad: 4,

    }
  };
  var layout_bar_real = {
    'title': 'Real Histogram Plot',
    margin: {
      t: 25,
      pad: 4,

    }
  };
  var layout_bar_predict = {
    'title': 'Predict Histogram Plot',
    margin: {
      t: 25,
      pad: 4,

    }
  };
  for(var i = 0; i < data['columns'].length; i++){
    layout_qq_real['yaxis' + (i + 1)] = {anchor: 'x' + (i + 1)}
    layout_qq_real['xaxis' + (i + 1)] = {domain: [(i * split), (i + 1) * split - boundary]}
    layout_qq_predict['yaxis' + (i + 1)] = {anchor: 'x' + (i + 1)}
    layout_qq_predict['xaxis' + (i + 1)] = {domain: [(i * split), (i + 1) * split - boundary]}
    layout_bar_real['yaxis' + (i + 1)] = {anchor: 'x' + (i + 1)}
    layout_bar_real['xaxis' + (i + 1)] = {domain: [(i * split), (i + 1) * split - boundary]}
    layout_bar_predict['yaxis' + (i + 1)] = {anchor: 'x' + (i + 1)}
    layout_bar_predict['xaxis' + (i + 1)] = {domain: [(i * split), (i + 1) * split - boundary]}
  }
  var trace_loss = {
    x: data['epoch'],
    y: data['loss'],
    mode: 'lines',
    type: 'scatter',
    name: 'Training loss'
  }
  var trace_valid = {
    x: data['epoch'],
    y: data['valid'],
    mode: 'lines',
    type: 'scatter',
    name: 'Validation loss'
  }
  var layout_valid = {
    'title': 'Validation Graph',
    xaxis: {
      autotick: true
    }
  }
  Plotly.newPlot('div_output', data_plot, layout);
  Plotly.newPlot('div_real', data_plot_seperate, layout_seperate);
  Plotly.newPlot('div_qq_real', data_plot_qq_real, layout_qq_real);
  Plotly.newPlot('div_qq_predict', data_plot_qq_predict, layout_qq_predict);
  Plotly.newPlot('div_kde_real', data_plot_bar_real, layout_bar_real);
  Plotly.newPlot('div_kde_predict', data_plot_bar_predict, layout_bar_predict);
  Plotly.newPlot('div_graph', [trace_loss, trace_valid], layout_valid);
}

$('#history').on('change', function(){
  setgraph(histories[parseInt($(this).val())]);
})

$('#hiddenlayer').keyup(function(){
  if(parseInt($(this).val()) > 10){
    $(this).val('');
    Materialize.toast("Only support max 10 hidden layers", 4000);
    return;
  }
  if(parseInt($(this).val()) < 1){
    $(this).val('');
    Materialize.toast("Only support min 1 hidden layers", 4000);
    return;
  }
  numlayer = parseInt($(this).val());
})

$('#dropout-rate').keyup(function(){
  if(parseFloat($(this).val()) > 1){
    $(this).val('');
    Materialize.toast("Dropout must less than 1.0", 4000);
    return;
  }
  if(parseFloat($(this).val()) < 0){
    $(this).val('');
    Materialize.toast("Dropout must bigger than 0.0", 4000);
    return;
  }
  numlayer = parseInt($(this).val());
})

$('#selectpenalty').change(function(){
  if($(this).val() == 'True') {
    $('#penalty').prop("disabled", false);
  }
  else $('#penalty').prop("disabled", true);
})

$('#selectdropout').change(function(){
  if($(this).val() == 'True') {
    $('#dropout-rate').prop("disabled", false);
  }
  else $('#dropout-rate').prop("disabled", true);
})

$("#submitbutton").click(function(){
  if(filename){
    xmlhttp.abort();
    Materialize.toast("Aborted previous training", 4000);
    socket.emit('leaveroom', {'id': String(filename), 'data': 'leave'});
    $('#span-status').html('');
    histories = [];
    $('#row-history').slideUp(500);
  }

  if(parseInt($('#splitdata').val()) > 99){
    Materialize.toast("split input must less than 100", 4000);
    return;
  }
  if(parseInt($('#epoch').val()) > 50){
    Materialize.toast("epoch must less than 50", 4000);
    return;
  }

  if(!isNormalInteger($('#splitdata').val())){
    Materialize.toast("split input must positive integer", 4000);
    return;
  }

  if(!isNormalInteger($('#future').val())){
    Materialize.toast("Future timestamp must be positive integer", 4000);
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
  if($('#learningrate').val().length == 0 || $('#timestamp').val().length == 0
  || $('#selectedcolumn').val().length == 0 || $('#epoch').val().length == 0
  || $('#sizelayer').val().length == 0 || $('#future').val().length == 0){
    Materialize.toast("insert required column", 4000);
    return;
  }

  if($('#selectpenalty').val() == 'True' && ($('#penalty').val().length == 0 || !(/^[0]+(\.)?[0-9]*$/.test($('#penalty').val())))){
    Materialize.toast("insert delta value", 4000);
    return;
  }

  if($('#selectdropout').val() == 'True' && ($('#dropout-rate').val().length == 0 || !(/^[0]+(\.)?[0-9]*$/.test($('#dropout-rate').val())))){
    Materialize.toast("insert drop-out rate", 4000);
    return;
  }

  if($('#selectedcolumn').val().split(',').length > 4){
    Materialize.toast("Only support less than 5 columns only", 4000);
    return;
  }

  $(".loadingscreen").css("display", "block");
  split = $('#splitdata').val();
  numberlayer = $('#hiddenlayer').val();
  optimizer = $('#optimizer').val();
  learningrate = $('#learningrate').val();
  timestamp = $('#timestamp').val();
  selectpenalty = $('#selectpenalty').val();
  penalty = $('#penalty').val();
  selectloss = $('#selectloss').val();
  columntoselect = $('#selectedcolumn').val();
  filename = new Date().getTime();
  file = document.getElementById('uploadcsv');

  formData = new FormData();
  formData.append("file", file.files[0]);
  formData.append("numberlayer", $('#hiddenlayer').val());
  formData.append("sizelayer", $('#sizelayer').val());
  formData.append("split", $('#splitdata').val());
  formData.append("gate", $('#selectgate').val());
  formData.append("enabledropout", $('#selectdropout').val());
  formData.append("dropout", $('#dropout-rate').val());
  formData.append("learningrate", learningrate);
  formData.append("timestamp", timestamp);
  formData.append("selectpenalty", selectpenalty);
  formData.append("penalty", penalty);
  formData.append("activationfunction", $('#selectactivation').val());
  formData.append("optimizer", optimizer);
  formData.append("selectloss", selectloss);
  formData.append("epoch", $('#epoch').val());
  formData.append("columntoselect", columntoselect);
  formData.append("future", $('#future').val());
  formData.append("id", filename);


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
        if(data['status']){
          $('#history').attr('max', String(histories.length - 1));
          Materialize.toast("Done training", 4000);
          $('#row-history').slideDown(500);
        }
      }
    };
    xmlhttp.open("POST", "http://www.huseinhouse.com:8095/uploader", true);
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
  setgraph(google);
  var width = $(document).width();
  if(width >= 1500){
    // do something
  }
  else{
    Materialize.toast('preferrable 1080p above', 4000);
  }
})
