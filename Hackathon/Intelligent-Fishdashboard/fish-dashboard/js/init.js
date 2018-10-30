var modal = document.getElementById('myModal');
var modalImg = document.getElementById("img01");
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
  modal.style.display = "none";
}
$('#drag-and-drop-zone').dmUploader({
  url: 'http://www.huseinhouse.com:8087/fish',
  dataType: 'json',
  allowedTypes: 'image/*',
  onInit: function(){
    $.danidemo.addLog('#demo-debug', 'default', 'Plugin initialized correctly');
  },
  onBeforeUpload: function(id){
    $.danidemo.addLog('#demo-debug', 'default', 'Starting the upload of #' + id);

    $.danidemo.updateFileStatus(id, 'default', 'Uploading.');
  },
  onNewFile: function(id, file){
    $.danidemo.addFile('#demo-files', id, file);
  },
  onComplete: function(){
    $.danidemo.addLog('#demo-debug', 'default', 'All pending transfers completed');
  },
  onUploadProgress: function(id, percent){
    var percentStr = percent + '%';

    $.danidemo.updateFileProgress(id, percentStr);
  },
  onUploadSuccess: function(id, data){
    $.danidemo.addLog('#demo-debug', 'success', 'Upload of file #' + id + ' completed');

    $.danidemo.addLog('#demo-debug', 'info', 'Server Response for file #' + id + ': ' + JSON.stringify(data));

    $.danidemo.updateFileStatus(id, 'success', 'Upload Complete');

    $.danidemo.updateFileProgress(id, '100%');
    out = JSON.parse(JSON.stringify(data));
    if(out['filename']){
      modalImg.src = 'http://www.huseinhouse.com/output-vandalism/' + out['filename'];
      modal.style.display = "block";
    }
    else{
      Materialize.toast('Error', 4000);
    }
  },
  onUploadError: function(id, message){
    $.danidemo.updateFileStatus(id, 'error', message);

    $.danidemo.addLog('#demo-debug', 'error', 'Failed to Upload file #' + id + ': ' + message);
  },
  onFileTypeError: function(file){
    $.danidemo.addLog('#demo-debug', 'error', 'File \'' + file.name + '\' cannot be added: must be an image');
  },
  onFileSizeError: function(file){
    $.danidemo.addLog('#demo-debug', 'error', 'File \'' + file.name + '\' cannot be added: size excess limit');
  },
  onFallbackMode: function(message){
    $.danidemo.addLog('#demo-debug', 'info', 'Browser not supported(do something else here!): ' + message);
  }
});

$(document).ready(function(){
   $('.collapsible').collapsible();
 });
