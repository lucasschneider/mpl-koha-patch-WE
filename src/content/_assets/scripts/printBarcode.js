(function () {"use strict"; /*jslint browser:true regexp: true indent: 2 devel: true plusplus: true*/
  /*global self*/

  function printBarcode() {
    var start = false,
      barcode = "",
      name = document.getElementsByClassName('patroninfo')[0].children[0].innerHTML,
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
      self.port.emit("printBarcode",barcode);
    }
  }

  var toolbar = document.getElementsByClassName('toolbar')[0],
  li,
  button;
  
  if (toolbar && /^https?\:\/\/scls-staff\.kohalibrary\.com\/cgi-bin\/koha\/(members|circ).*/.test(location.href)) {
    li = document.createElement('li');
    button = document.createElement('button');
    button.onclick = printBarcode;
    button.innerHTML = "Print Barcode";

    li.appendChild(button);
    toolbar.appendChild(li);
  }

}()); //end use strict
