HTMLInputElement.prototype.parseName = function () {
  var surname = document.getElementById('surname'),
    initials = document.getElementById('initials'),
    names,
    len;
  // Strip commas from string
  this.value = this.value.replace(/,/g, '');
  // Move suffix "JR" or "SR" to end of last name
  if (/ (S|J)R$/i.test(this.value)) {
    var suffix = this.value.substr(this.value.length-3, this.value.length);
    this.value = this.value.substr(0, this.value.length-3);
    surname.value += "," + suffix.toUpperCase();
  }
  if (!/^[ 	]+/.test(this.value) && initials) {
    names = this.value.split(' ');
    len = names.length;
    if (len > 1 && names[1] && /[A-Za-z]/.test(names[1][0]) && initials.value === "") {
      initials.value = names[1][0].toUpperCase();
    }
  }

  return false;
}

if (/memberentry\.pl/.test(location.toString())) {
  var firstName = document.getElementById('firstname'),
    initials = document.getElementById('initials');
  if (firstName) {
    firstName.parseName();
    firstName.addEventListener('blur', HTMLInputElement.prototype.parseName);
  }
}
undefined;
