var canSave = false;

function hideOverlay() {
  $('.modal.show').modal('hide');
}

function saveImage(isOutdatedUrl) { // jshint ignore:line
  if (canSave) {
    $.ajax({ url: isOutdatedUrl,
      dataType: 'json',
      success: function(json) {
        var isOutdated = json.isOutdated;
        if (isOutdated && !window.confirm("This image has been modified while you were editing it.\nDo you want to apply the changes anyway?"))
          return;
        $('#kiwi-image-update-form').submit();
      }
    });
  }
}

function enableSave() {
  canSave = true;
  $('#kiwi-image-update-form-save, #kiwi-image-update-form-revert').removeClass('disabled');
}

function editRepositoryDialog() { // jshint ignore:line
  var fields = $(this).parents('.nested-fields');
  var dialog = fields.find('.modal');
  var sourcePath = fields.find("[id$='source_path']");

  dialog.modal('show');
  var matchedObsSourcePath = sourcePath.val().match(/^obs:\/\/([^\/]+)\/([^\/]+)$/);
  if (matchedObsSourcePath) {
    var projectField = fields.find('[name=target_project]');
    var repoField = fields.find('[name=target_repo]');
    var aliasField = fields.find('[name=alias_for_repo]');
    var expertRepoAlias = fields.find("[id$='alias']");
    var repoTypeField = fields.find("[id$='repo_type']");
    aliasField.val(expertRepoAlias.val());
    projectField.val(matchedObsSourcePath[1]);
    repoField.html('');
    repoField.append(new Option(matchedObsSourcePath[2]));
    repoField.val(matchedObsSourcePath[2]);
    repoTypeField.val('rpm-md');
  }

  $('span[role=status]').text(''); // empty autocomplete status
}

function addRepositoryErrorMessage(sourcePath, field) {
  if (sourcePath === 'obsrepositories:/') {
    field.text('If you want use obsrepositories:/ as source_path, please check the checkbox "use project repositories".');
  }
  else {
    field.text('The source path can not be empty!');
  }

  field.removeClass('d-none');
}

function closeKiwiDescriptionDialog() { // jshint ignore:line
  var fields = $(this).parents('.nested-fields');
  var dialog = fields.find('.modal.show');
  var name = dialog.find("[id$='name']");

  if (name.val() !== '') {
    $('#image-name').text(name.val());
  }
  else {
    fields.find(".ui-state-error").removeClass('d-none');
    return false;
  }

  var elements = fields.find('.fill');
  for(var i=0; i < elements.length; i++) {
    var object = dialog.find("[id$='" + $(elements[i]).data('tag') + "']");
    if ( object.val() !== "") {
      $(elements[i]).text(object.val());
    }
  }

  addDefault(dialog);

  if (!canSave) {
    enableSave();
  }

  fields.find(".ui-state-error").addClass('d-none');

  hideOverlay();
}

function closeKiwiPreferencesDialog() { // jshint ignore:line
  var fields = $(this).parents('.nested-fields');
  var dialog = fields.find('.modal.show');

  var elements = fields.find('.fill');
  for(var i=0; i < elements.length; i++) {
    var object = dialog.find("[id$='_" + i + "_" + $(elements[i]).data('tag') + "']");
    if ( object.val() !== "") {
      if ( $(elements[i]).data('tag') === 'type_image' ) {
        $(elements[i]).text(object.find(":selected").text());
      }
      else {
        $(elements[i]).text(object.val());
      }
    }
  }

  addDefault(dialog);

  if (!canSave) {
    enableSave();
  }

  hideOverlay();
}

function closeKiwiDialog() { // jshint ignore:line
  var fields = $(this).parents('.nested-fields'),
      isRepository = fields.parents('#kiwi-repositories-list').length === 1,
      name = fields.find('.kiwi_element_name'),
      dialog = fields.find('.modal.show'),
      arch;

  if(isRepository) {
    var sourcePath = dialog.find("[id$='source_path']");
    if(sourcePath.val() !== '' && sourcePath.val() !== 'obsrepositories:/') {
      var alias = dialog.find("[id$='alias']");
      if (alias.val() !== '') {
        name.text(alias.val());
      }
      else {
        name.text(sourcePath.val().replace(/\//g, '_'));
      }
    }
    else {
      addRepositoryErrorMessage(sourcePath.val(), fields.find(".ui-state-error"));
      return false;
    }
  }
  else {
    var namePackage = dialog.find("[id$='name']").val();
    if(namePackage !== '') {
      name.text(namePackage);

      arch = dialog.find("[id$='arch']").val();
      if(arch !== '') {
        name.append(" <small>(" + arch + ")</small>");
      }
    }
    else {
      fields.find(".ui-state-error").removeClass('d-none');
      return false;
    }
  }

  addDefault(dialog);

  if( /^Add/.test(dialog.find('.modal-title').text())) {
    dialog.find('.modal-title').text('Edit '+ dialog.find('.modal-title').text().split(' ')[1]);
  }

  fields.find(".ui-state-error").addClass('d-none');
  fields.find('.kiwi_list_item').removeClass('has-error');
  dialog.removeClass('new_element');

  if (!canSave) {
    enableSave();
  }

  hideOverlay();
}

function revertDialog() { // jshint ignore:line
  var fields = $(this).parents('.nested-fields');
  var dialog = fields.find('.modal');
  dialog.find(".ui-state-error").addClass('d-none');

  if(dialog.hasClass('new_element')) {
    hideOverlay(dialog);

    fields.find('.remove_fields').click();
  }
  else {
    $.each(dialog.find('input, select'), function(index, input) {
      if (input.type === 'checkbox') {
        $(input).prop('checked', input.getAttribute('data-default') === 'true');
      }
      else {
        $(input).val(input.getAttribute('data-default'));
      }
    });

    hideOverlay();
  }
}

function addDefault(dialog) {
  $.each(dialog.find('input, select'), function(index, input) {
    if (input.type === 'checkbox') {
      input.setAttribute('data-default', input.checked);
    }
    else {
      input.setAttribute('data-default', $(input).val());
    }
  });
}

function showOnAddition(list, show) { // jshint ignore:line
  list.on('cocoon:after-remove', function() {
    if ($(this).find('.nested-fields:visible').length === 0) {
      show.removeClass('d-none');
    }
  });
}

function initializeTabs() { // jshint ignore:line
  $("#kiwi-details-trigger").click(function() {
    $("#kiwi-image-details-section").removeClass('d-none');
    $("#kiwi-preferences").removeClass('d-none');
    $(".detailed-info").removeClass('d-none');
    $("#kiwi-image-profiles-section").addClass('d-none');
    $("#kiwi-image-repositories-section").addClass('d-none');
    $("#kiwi-image-packages-section").addClass('d-none');
    $("#kiwi-software-trigger").removeClass("active");
    $("#kiwi-details-trigger").addClass("active");
  });

  $("#kiwi-software-trigger").click(function() {
    $("#kiwi-image-profiles-section").removeClass('d-none');
    $("#kiwi-image-repositories-section").removeClass('d-none');
    $("#kiwi-image-packages-section").removeClass('d-none');
    $("#kiwi-preferences").addClass('d-none');
    $(".detailed-info").addClass('d-none');
    $("#kiwi-image-details-section").addClass('d-none');
    $("#kiwi-software-trigger").addClass("active");
    $("#kiwi-details-trigger").removeClass("active");
  });
}

function initializeKiwi(isOutdatedUrl) { // jshint ignore:line
  // Save image
  $('#kiwi-image-update-form-save').click(function() { saveImage(isOutdatedUrl); });
  $('#kiwi_image_use_project_repositories').click(function(){
    $('#kiwi-repositories-list, #use-project-repositories-text').toggleClass('d-none');
    enableSave();
  });

  $('[id^="kiwi_image_profiles_attributes_"]').click(enableSave);

  // Revert image
  $('#kiwi-image-update-form-revert').click(function(){
    if (!$(this).hasClass('disabled')) {
      if (window.confirm('Attention! All unsaved data will be lost! Continue?')) {
        window.location.reload();
      }
    }
  });

  // Enable save button
  $('.remove_fields').click(enableSave);

  // Edit dialog for Description
  $('.close-description-dialog').click(closeKiwiDescriptionDialog);

  // Edit dialog for Description
  $('.close-preferences-dialog').click(closeKiwiPreferencesDialog);

  // Edit dialog for Repositories and Packages
  $('.repository_edit').click(editRepositoryDialog);
  $('#kiwi-repositories-list .close-dialog, #kiwi-packages-list .close-dialog').click(closeKiwiDialog);
  $('.revert-dialog').click(revertDialog);

  // After inserting new repositories add the Callbacks
  $('#kiwi-repositories-list').on('cocoon:after-insert', function(e, addedFields) {
    var lastOrder = 0;
    var orders = $(this).find("[id$='order']");
    var lastNode = $(orders[orders.length - 2]);
    if (lastNode.length > 0) {
      lastOrder = parseInt(lastNode.val());
    }
    $(addedFields).find("[id$='order']").val(lastOrder + 1);
    $(addedFields).find('.repository_edit').click(editRepositoryDialog);
    $(addedFields).find('.close-dialog').click(closeKiwiDialog);
    $(addedFields).find('.revert-dialog').click(revertDialog);
    $('#no-repositories').addClass('d-none');
  });

  showOnAddition($('#kiwi-repositories-list'), $('#no-repositories'));

  // After inserting new packages add the Callbacks
  $('#kiwi-packages-list').on('cocoon:after-insert', function(e, addedFields) {
    $(addedFields).find('.close-dialog').click(closeKiwiDialog);
    $(addedFields).find('.revert-dialog').click(revertDialog);
    $('#no-packages').addClass('d-none');
  });

  showOnAddition($('#kiwi-packages-list'), $('#no-packages'));
}

