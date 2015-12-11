jQuery(function($){
  $('.btn-toolbar,.fea-btn').hide();
  $('#la-title').attr('contenteditable', 'false'); 
  $('.deactive,.hid').hide();
  $('.eneditor').removeClass('editor');
  $('#la-save').hide();

  function initToolbarBootstrapBindings() {
    var fonts = ['Serif', 'Sans', 'Arial', 'Arial Black', 'Courier', 
          'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
          'Times New Roman', 'Verdana'],
          fontTarget = $('[title=Font]').siblings('.dropdown-menu');
    $.each(fonts, function (idx, fontName) {
        fontTarget.append($('<li><a data-edit="fontName ' + fontName +'" style="font-family:\''+ fontName +'\'">'+fontName + '</a></li>'));
    });
    $('a[title]').tooltip({container:'body'});
  	$('.dropdown-menu input').click(function() {return false;})
	    .change(function () {$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');})
      .keydown('esc', function () {this.value='';$(this).change();});

    $('[data-role=magic-overlay]').each(function () { 
      var overlay = $(this), target = $(overlay.data('target')); 
      overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
    });
    if ("onwebkitspeechchange"  in document.createElement("input")) {
      var editorOffset = $('#editor').offset();
      $('#voiceBtn').css('position','absolute').offset({top: editorOffset.top, left: editorOffset.left+$('#editor').innerWidth()-35});
    } else {
      $('#voiceBtn').hide();
    }
  };

  function showErrorAlert (reason, detail) {
  	var msg='';
  	if (reason==='unsupported-file-type') { msg = "Unsupported format " +detail; }
  	else {
  		console.log("error uploading file", reason, detail);
  	}
  	$('<div class="alert"> <button type="button" class="close" data-dismiss="alert">&times;</button>'+ 
  	 '<strong>File upload error</strong> '+msg+' </div>').prependTo('#alerts');
  };

  $('.activep').click(function(event) {
    $('.btn-toolbar,.fea-btn,.hid').show();
    initToolbarBootstrapBindings();
    
    $('.editor').wysiwyg({
      fileUploadError: showErrorAlert
    });

    window.prettyPrint && prettyPrint();
    $(this).hide();
    $('.deactive').show();
    $('#la-title').attr('contenteditable', 'true');
    $('.eneditor').addClass('editor').attr('contenteditable', 'true');
    $('#la-save').show();
  });

  $('.deactive').click(function(event) {
    $('.btn-toolbar,.fea-btn,.hid').hide();
    $(this).hide();
    $('.deactive').hide();
    $('#la-title').attr('contenteditable', 'false');
    $('.activep').show();
    $('.eneditor').removeClass('editor').attr('contenteditable', 'false');
    $('#la-save').hide();
  });



jQuery('.loader').hide();
$('#la-save').click(function(event) {
    jQuery('.loader').show();
    event.preventDefault();
    var title = $('#la-title').html();
    var content = $('.eneditor').html();
    var image = $('.wp-post-image').attr('src');
    var data = {
      action: 'save_content_front',
      content: content,
      title: title,
      image: image,
      imageid: $(".wp-post-image").attr("id"),
      id: $('#la-id').data('laid'),
    };
    $.post(laAjax.url, data, function(resp) {
      console.log(resp);
      jQuery('.loader').hide();
    });
  });

  $('#upload-btn').click(function(e) {
    e.preventDefault();
    var image = wp.media({
      title: 'Upload Image',

      multiple: false
    }).open()
      .on('select', function(e) {

        var uploaded_image = image.state().get('selection').first();

        console.log(uploaded_image);
        var image_url = uploaded_image.toJSON().url;

        $(".eneditor").prepend('<img src="' + image_url + '">');


      });
  });


  $('.fea-btn').on("click", ".add", function(e) {
    e.preventDefault();
    var image = wp.media({
      title: 'Upload Image',

      multiple: false
    }).open()
      .on('select', function(e) {

        var uploaded_image = image.state().get('selection').first();

        var image_url = uploaded_image.toJSON().url;
        var imageid = uploaded_image.toJSON().id;
        $(".post-fea").append('<img style="width:100%;" src="' + image_url + '" id="' + imageid + '" class="wp-post-image">');

      });

  });

      $('.fea-btn').on("click", ".fea", function(e) {
    e.preventDefault();
    var image = wp.media({
      title: 'Upload Image',

      multiple: false
    }).open()
      .on('select', function(e) {

        var uploaded_image = image.state().get('selection').first();

        var image_url = uploaded_image.toJSON().url;
        var imageid = uploaded_image.toJSON().id;

        $(".wp-post-image").attr("src", image_url);
        $(".wp-post-image").attr("id", imageid);
      });

  });

  $('.fea-btn ').on('click', '.remo', function(event) {
    event.preventDefault();
    // $('.wp-post-image').remove();
    $('.wp-post-image').remove();
  });

  wpQfee.init();
});

var wpQfee = {
  editMode: false,
  contentToEdit: null,
  selectedEditable: null,

  init: function(){
     this.initMarkup();
     this.initEvents();
  },

  initMarkup: function(){
    // wrap span tag around editable elements
    $('.wpQfee-editable').wrapInner('<span class="eneditor" contenteditable="false"></span>').wrapInner('<span class="editable-area"></span>');
  },

  initEvents: function(){
    // edit button event
    $('body').on('click', '.wpQfee-edit-btn', function(e){
      e.preventDefault();

      var editor = $(this).closest('.wpQfee-editable').find('.eneditor');

      wpQfee.editMode = true;

      // remove edit button
      wpQfee.removeButton($(this));

      // store text before edit in case of cancel 
      wpQfee.contentToEdit = editor.text();

      // store current editable obj to ensure no empty string because it will remove the node
      wpQfee.selectedEditable = editor;

      wpQfee.showConfirmationButtons(editor);
      wpQfee.enableEditableText(editor);
    });

    // cancel button event
    $('body').on('click', '.wpQfee-cancel-btn', function(e){
      e.preventDefault();

      var editor = $(this).closest('.wpQfee-editable').find('.eneditor');

      editor.closest('.editable-area').removeClass('hover');
      wpQfee.disableEditableText(editor);

      wpQfee.removeEditableButtons();

      editor.html(wpQfee.contentToEdit);

      wpQfee.resetValues();
    });

    // save button event
    $('body').on('click', '.wpQfee-save-btn', function(e){
      e.preventDefault();

      wpQfee.removeEditableButtons();
      $('.wpQfee-editable .editable-area .eneditor').contents().unwrap();
      $('.wpQfee-editable .editable-area').contents().unwrap();

      // save data
      jQuery('.loader').show();
      event.preventDefault();
      var title = $('#la-title').html();
      var content = $('.eneditor').html();
      var image = $('.wp-post-image').attr('src');
      var data = {
        action: 'save_content_front',
        content: content,
        title: title,
        image: image,
        imageid: $(".wp-post-image").attr("id"),
        id: $('#la-id').data('laid'),
      };
      $.post(laAjax.url, data, function(resp) {
        console.log(resp);
        jQuery('.loader').hide();
      });

      // init UI
      wpQfee.contentToEdit = null;
      wpQfee.initMarkup();
      wpQfee.resetValues();
    });

    // hover event for editable content
    $('body').on({
      mouseenter: function(){
        if(!wpQfee.editMode){
          $(this).addClass('hover');
          wpQfee.showEditButton($(this));
        }
      },
      mouseleave: function(){
        if(!wpQfee.editMode){
          $(this).removeClass('hover');
          wpQfee.hideButton($(this).find('.wpQfee-edit-btn'));
        }
      }
    }, '.wpQfee-editable .editable-area');
  },

  enableEditableText: function(jqElement){
    jqElement.attr({
      'contenteditable': true
    }).addClass('active');
  },

  disableEditableText: function(jqElement){
    jqElement.attr({
      'contenteditable': false
    }).removeClass('active');
  },

  showEditButton: function(jqAttachElement){
    if(jqAttachElement.find('.wpQfee-edit-btn').length == 0){
      var $btn = $('<button class="btn btn-primary wpQfee-edit-btn">Edit</button>');
      jqAttachElement.append($btn);
    } else {
      jqAttachElement.find('.wpQfee-edit-btn').show();
    }
  },

  showConfirmationButtons: function(jqAttachElement){
    var $cancelBtn = $('<button class="btn btn-default wpQfee-cancel-btn">Cancel</button>'),
        $saveBtn = $('<button class="btn btn-primary wpQfee-save-btn">Save</button>');

    jqAttachElement.closest('.editable-area').append($cancelBtn).append($saveBtn);
  },

  hideButton: function(jqElement){
    jqElement.hide();
  },

  removeButton: function(jqElement){
    jqElement.remove();
  },

  removeEditableButtons: function(){
    $('.wpQfee-edit-btn').remove();
    $('.wpQfee-cancel-btn').remove();
    $('.wpQfee-save-btn').remove();
  },

  resetValues: function(){
    wpQfee.editMode = false;
    wpQfee.contentToEdit = null;
    wpQfee.selectedEditable = null;
  }
}