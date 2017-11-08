function setDefaultOptions() {
    document.querySelector("#skin").value = "mad";
    document.querySelector("#patronMsg").checked = true;
    document.querySelector("#validAddr").checked = true;
    document.querySelector("#autoBarcode").checked = true;
    document.querySelector("#lookupPSTAT").checked = true;
    document.querySelector("#digestOnly").checked = true;
    document.querySelector("#dueDateToggle").checked = true;
    document.querySelector("#middleInitials").checked = true;
    document.querySelector("#updateAccountType").checked = true;
    document.querySelector("#receiptFont").value = "36";
    document.querySelector("#disableDropbox").checked = false;
}

function saveOptions(e) {
  browser.storage.sync.set({
    skin: document.querySelector("#skin").value,
    patronMsg: document.querySelector("#patronMsg").checked,
    validAddr: document.querySelector("#validAddr").checked,
    autoBarcode: document.querySelector("#autoBarcode").checked,
    lookupPSTAT: document.querySelector("#lookupPSTAT").checked,
    digestOnly: document.querySelector("#digestOnly").checked,
    dueDateToggle: document.querySelector("#dueDateToggle").checked,
    middleInitials: document.querySelector("#middleInitials").checked,
    updateAccountType: document.querySelector("#updateAccountType").checked,
    receiptFont: document.querySelector("#receiptFont").value,
    disableDropbox: document.querySelector("#disableDropbox").checked
  });
  e.preventDefault();
}

function restoreOptions() {
  browser.storage.sync.get('skin').then((res) => {
    document.querySelector("#skin").value = res.skin || 'mad';
  });
  
  browser.storage.sync.get('patronMsg').then((res) => {
    document.querySelector("#patronMsg").checked = res.patronMsg;
  });
  
  browser.storage.sync.get('validAddr').then((res) => {
    document.querySelector("#validAddr").checked = res.validAddr;
  });
  
  browser.storage.sync.get('autoBarcode').then((res) => {
    document.querySelector("#autoBarcode").checked = res.autoBarcode;
  });
  
  browser.storage.sync.get('lookupPSTAT').then((res) => {
    document.querySelector("#lookupPSTAT").checked = res.lookupPSTAT;
  });
  
  browser.storage.sync.get('digestOnly').then((res) => {
    document.querySelector("#digestOnly").checked = res.digestOnly;
  });
  
  browser.storage.sync.get('dueDateToggle').then((res) => {
    document.querySelector("#dueDateToggle").checked = res.dueDateToggle;
  });
  
  browser.storage.sync.get('middleInitials').then((res) => {
    document.querySelector("#middleInitials").checked = res.middleInitials;
  });
  
  browser.storage.sync.get('updateAccountType').then((res) => {
    document.querySelector("#updateAccountType").checked = res.updateAccountType;
  });
  
  browser.storage.sync.get('receiptFont').then((res) => {
    document.querySelector("#receiptFont").value = res.receiptFont || '36';
  });
  
  browser.storage.sync.get('disableDropbox').then((res) => {
    document.querySelector("#disableDropbox").checked = res.disableDropbox;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  browser.storage.sync.get().then((res) => {
    if (res.hasOwnProperty('skin') &&
        res.hasOwnProperty('patronMsg') &&
        res.hasOwnProperty('validAddr') &&
        res.hasOwnProperty('autoBarcode') &&
        res.hasOwnProperty('lookupPSTAT') &&
        res.hasOwnProperty('digestOnly') &&
        res.hasOwnProperty('dueDateToggle') &&
        res.hasOwnProperty('middleInitials') &&
        res.hasOwnProperty('updateAccountType') &&
        res.hasOwnProperty('receiptFont') &&
        res.hasOwnProperty('disableDropbox')) {
      restoreOptions();
    } else {
      setDefaultOptions();
      saveOptions();
    }
  });
});
document.querySelector("form").addEventListener("submit", saveOptions);
document.getElementById("setDefault").addEventListener('click', setDefaultOptions);