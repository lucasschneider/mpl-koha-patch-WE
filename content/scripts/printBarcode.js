"use strict";
function printBarcode() {
  var start = false,
    barcode = "",
    name = document.getElementsByClassName('patroninfo')[0].children[0].textContent,
    i;
  if (name != null) {
    for (i = name.length - 1; i > -1; i--) {
      if (name[i] === ")") {
        start = true;
      } else if (name[i] === "("){
        start = false;
        break;
      } else if (start === true) {
        barcode = name[i] + barcode
      }
    }
    browser.runtime.sendMessage({
      key: "printBarcode",
      data: barcode
    });
  }
}

var toolbar = document.getElementsByClassName('toolbar')[0],
  patroninfo = document.getElementsByClassName('patroninfo'),
  li,
  button;
  
if (toolbar && /^https?\:\/\/scls-staff\.kohalibrary\.com\/cgi-bin\/koha\/(members|circ).*/.test(location.href) && patroninfo.length > 0) {
  li = document.createElement('li');
  button = document.createElement('button');
  button.onclick = printBarcode;
  button.innerHTML = "Print Barcode";

  li.appendChild(button);
  toolbar.appendChild(li);
}
