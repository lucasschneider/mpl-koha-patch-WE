(function () {"use strict"; /*jslint browser:true regexp: true indent: 2 devel: true plusplus: true*/
  /*global self*/
  var dropbox = document.getElementById('dropboxcheck');
  if (dropbox) {
    dropbox.checked = false;
    dropbox.disabled = true;
    dropbox.parentElement.title = "Disabled by MPL Koha Patch. Can be enabled from about:addons preferences.";
  }
}()); //end use strict
