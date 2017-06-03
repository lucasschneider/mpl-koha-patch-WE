"use strict";

var fineLabels = document.getElementsByClassName('circ-hlt'),
    usr = document.getElementsByClassName('loggedinusername'),
    label,
    fineVal = "",
    hasReplacementFee = false,
    hasOtherFee = false,
    mainform,
    warning;

function extractFineVal(textContent) {
  var fineStart = false,
      fineVal = "";

  for (var j = 0; j < textContent.length; j++) {
    if (fineStart) {
      fineVal += textContent[j];
      if (textContent[j] === ".") {
        fineVal += textContent[j + 1];
        fineVal += textContent[j + 2];
        break;
      }
    }
    if (textContent[j] === "$" && !fineStart) {
      fineStart = true;
    }
  }

  return parseFloat(fineVal);
}

function postWarning() {}

if (fineLabels && usr && fineLabels.length > 0 && /(mad|hpb|seq|smb|msb|pin|haw|lak|mea)/i.test(usr[0].textContent.trim())) {
  for (var i = 0; i < fineLabels.length; i++) {
    label = fineLabels[i].textContent;
    if (label.includes("Fines:")) {
      fineVal = extractFineVal(fineLabels[i].parentElement.textContent);
    }
    if (label.includes("Replacement fees")) {
      hasReplacementFee = true;
    }
    if (label.includes("Other fees")) {
      hasOtherFee = true;
    }
  }
}

mainform = document.getElementById('mainform');

if (mainform) {
  warning = document.createElement("div");
  warning.setAttribute('style', 'border:2px solid #cc0000;border-radius:20px;padding:10px;color:#cc0000;text-align:justify;text-justify:inter-word;font-weight:bold;');

  if (fineVal < 20 && hasReplacementFee) {
    warning.textContent = "DO NOT check out materials per MPL policy due to replacement fees on this Patron's account. Materials may not be checked out if there are any amount of replacement or damaged item fees, even if they are less than $20.";
    mainform.parentElement.insertBefore(warning, mainform);
  } else if (fineVal < 20 && hasOtherFee) {
    warning.textContent = "This patron may have damaged item fees and therefore MAY NOT checkout materials per MPL policy. Please check the reason for the \"Other fees\" to see if they include damaged item or replacement fines.";
    mainform.parentElement.insertBefore(warning, mainform);
  }
}