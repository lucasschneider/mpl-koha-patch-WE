"use strict";
window.onload = function() {
  var data = location.toString().split('?')[1].split('&');

  if (data) {
    var barcode = data[0].split('=')[1],
      barcodeLib = data[1].split('=')[1];
    
    document.getElementById("barcode").style.fontSize = (barcodeLib === "MOO") ? "28px": "36px";
    document.getElementById("barcode").textContent = barcode;
  }
  window.print();
}