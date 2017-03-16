'use strict';

(function () {
  "use strict"; /*jslint browser:true regexp: true indent: 2 devel: true plusplus: true*/
  /*global self*/

  function parseName() {
    var surname = document.getElementById('surname'),
        initials = document.getElementById('initials'),
        names,
        len;
    // Strip commas and periods from string
    this.value = this.value.replace(/[\.,]/g, '');
    // Move suffix "JR" or "SR" to end of last name
    if (/ (S|J)R$/i.test(this.value)) {
      var suffix = this.value.substr(this.value.length - 3, this.value.length);
      this.value = this.value.substr(0, this.value.length - 3);
      surname.value += "," + suffix.toUpperCase();
    }
    if (!/^[ 	]+/.test(this.value) && initials) {
      names = this.value.split(' ');
      len = names.length;
      if (len > 1 && names[1] && /[A-Za-z]/.test(names[1][0])) {
        initials.value = names[1][0].toUpperCase(); //.replace(/[.,\/#!@$%\^&\*;{}=\-_`~]/g,"");
      } else {
        initials.value = "";
      }
    }
  }

  var firstName = document.getElementById('firstname'),
      initials = document.getElementById('initials');
  if (firstName) {
    firstName.addEventListener('blur', parseName);
  }
  /*// Forbid punctuation
  if (initials) {
    initials.addEventListener('blur', function () {
      this.value = this.value.replace(/[.,\/#!@$%\^&\*;{}=\-_`~]/g,"");
    });
  }*/
})(); //end use strict