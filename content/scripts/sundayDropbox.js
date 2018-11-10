(function () {"use strict"; /*jslint browser:true regexp: true indent: 2 devel: true plusplus: true*/
  /*global self*/
  var dropbox = document.getElementById('dropboxcheck');
  
  if (dropbox) {
    dropbox.checked = true;
  
    dropbox.addEventListener( 'change', function() {
      if(!this.checked) {
        browser.runtime.sendMessage({key: "pauseSundayDropbox"});
      } else {
        browser.runtime.sendMessage({key: "resumeSundayDropbox"});
      }
    });
  }
}()); //end use strict
