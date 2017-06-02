"use strict";

var fineLabels = document.getElementsByClassName('circ-hlt'),
  usr  = document.getElementsByClassName('loggedinusername'),
  label,
  fineAmt,
  fineCounter,
  fineVal = "";

if (fineLabels && usr && fineLabels.length > 0 && /(mad|hpb|seq|smb|msb|pin|haw|lak|mea)/i.test(usr[0].textContent.trim())) {
  for (var i  = 0; i < fineLabels.length; i++) {
    label = fineLabels[i].textContent;
    if (label.includes("Fines:")) {
      fineAmt = fineLabels[i].parentElement.textContent;
      fineCounter = fineAmt.length;
      while(fineCounter--) {
      }
      console.log(fineLabels[i].parentElement.textContent);
    }
    if (label.includes("Replacement fees")) {
      console.log(label);
    }
    if (label.includes("Other fees")) {
      console.log(label);
    }
  }
}