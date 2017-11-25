"use strict";


// CDAMS, CDAMSID, CDJMS CDYMS
var box = document.createElement('input'),
  boxLabel = document.createElement('label'),
  labelText = document.createElement('span'),
  parentWrapper = document.getElementById('yui-main'),
  tableNotLoaded = document.getElementById('outputscreen'),
  origTable = document.getElementById("mytab"),
  origHead,
  origBody,
  CD;

  function separateCDs() {
    if(this.checked) {
      if (origTable) {
        origHead = origTable.tHead.children[0];
      }
    }
  }

if (/\/cgi-bin\/koha\/reports\/holdsaction\.pl/.test(location.pathname)) {
  parentWrapper = !!parentWrapper ? parentWrapper.children[0] : null;

  if (!tableNotLoaded) {
    box.type = "checkbox";
    box.checked = false;
    box.style.cursor = "pointer";
    box.style.margin = "0 1em 0 1.5em";
    boxLabel.style.cursor = "pointer";
    boxLabel.style.margin = "1em 0";
    boxLabel.appendChild(box);
    labelText.textContent = "Separate CDs from other hold items.";
    boxLabel.appendChild(labelText);
    parentWrapper.insertBefore(boxLabel, parentWrapper.children[1]);
    
    box.addEventListener('change', separateCDs);
  }
}