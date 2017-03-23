"use strict";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  window.onload = function (e) {
    if (request.key == "printBarcode") {
      document.getElementById("barcode").textContent = request.data;
      window.print();
    }
  };
});