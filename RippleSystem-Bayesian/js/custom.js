$(document).ready(function() {
  $('.action-towernav-toggle').click(function() {
    if ($('.action-towernav-container').hasClass('hidden'))
      $('.action-towernav-container').removeClass('hidden');
    else
      $('.action-towernav-container').addClass('hidden');
  });

  $('.action-drawer-open').click(function() {
    var drawerType = $(this).data('drawerType');
    var $actionDrawer = $(".action-drawer[data-drawer-type=" + drawerType + "]");
    $actionDrawer.slideDown();
    $(".action-drawer").not($actionDrawer).slideUp();
  });

  $('.action-drawer-close').click(function() {
    $(this).closest(".action-drawer").slideUp();
  });

  $(document).off('click.modal-trigger').on('click.modal-trigger', '.modal-trigger', function(e) {
    var $this = $(this);
    var modalId = $this.attr('href');

    if ($this.hasClass('close-modals'))
      $('.modal').closeModal();

    return materialModal(modalId, $this.data('force'), $this.data('serverData'));
  });

  $(document).off('click.modal-close').on('click.modal-close', '.modal-close', function(e) {
    var $this = $(this);
    e.preventDefault();
    $this.closest('.modal').closeModal();
    if ($this.hasClass('close-destroy')) {
      $this.closest('.modal').remove();
    }
    return false;
  });

  var $input = $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 1, // Creates a dropdown of 15 years to control year
    closeOnSelect: true,
    format: 'dd-mm-yyyy',
    min: [2016, 0, 1],
    max: [2016, 1, 20],
    disable: [true, [2016, 0, 4], [2016, 0, 5], [2016, 0, 6], [2016, 0, 7], [2016, 0, 8], [2016, 0, 9], [2016, 0, 10], [2016, 0, 11], [2016, 1, 1], [2016, 1, 2], [2016, 1, 3], [2016, 1, 4],
  [2016, 1, 5], [2016, 1, 6], [2016, 1, 7], [2016, 1, 8]]
  });

  var picker = $input.pickadate('picker');
  picker.set('select', [2016, 1, 8]);
});

$('.button-collapse').sideNav({
  menuWidth: 330,
  edge: 'left'
});

$('.collapsible').collapsible();

$('#activatecalendar').click(function() {
  $('#datedata_root').attr('class', 'picker picker--opened picker--focused');
  $('#datedata').attr('class', 'datepicker picker__input picker__input--active');
})

$('#activateinformation').click(function() {
  $("#containerinformation").animate({
    right: '5%'
  });
})

$(".containerfloat").click(function() {
  width = $(document).width();
  if (width < 800) $(".containerfloat").animate({
    right: '-50%'
  });
  else $(".containerfloat").animate({
    right: '-15%'
  });
})

var about = 'This system basically can predict dynamic traffic flow using Bayesian approached. Thanks to OpenTraffic for the traffic data.';
var business = 'You can contact us at facebook, Husein Zolkepli, Firdaus Ibrahim, Akmal Shaari and Azrul Hazizan';
var share = 'Please, do not share.';

$("#openabout").click(function() {
  $('#containerspan').html(about);
  $("#container").css('display', 'block');
})

$("#openbusiness").click(function() {
  $('#containerspan').html(business);
  $("#container").css('display', 'block');
  $('.containerpictures').css('display', 'block');
})

$("#openshare").click(function() {
  $('#containerspan').html(share);
  $("#container").css('display', 'block');
})

$("#container").click(function() {
  $("#container").css('display', 'none');
  $('.containerpictures').css('display', 'none');
})

$('.loadingscreen-fail').click(function() {
  $('.loadingscreen-fail').css('display', 'none');
})
