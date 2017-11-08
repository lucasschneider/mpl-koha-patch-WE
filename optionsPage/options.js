function setDefaultOptions() {    
  browser.storage.sync.set({
    skin: "MAD",
    patronMsg: true,
    validAddr: true,
    autoBarcode: true,
    lookupPSTAT: true,
    digestOnly: true,
    dueDateToggle: true,
    middleInitials: true,
    updateAccountType: true,
    receiptFont: "MPL",
    disableDropbox: false
  });
  browser.runtime.sendMessage({key: "updateExtensionIcon"});
  restoreOptions();
}

function restoreOptions() {
  browser.storage.sync.get('skin').then((res) => {
    document.querySelector("#skin").value = res.skin;
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
    document.querySelector("#receiptFont").value = res.receiptFont;
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
    }
  });
});

// Listener for Set Default Options Button
document.getElementById("setDefault").addEventListener('click', setDefaultOptions);

// Option update listeners
document.getElementById("skin").addEventListener('change', function() {
  browser.storage.sync.set({skin: document.getElementById("skin").value}).then((res) => {
    browser.runtime.sendMessage({key: "updateExtensionIcon"});
  });
});
document.getElementById("patronMsg").addEventListener('click', function() {
   browser.storage.sync.set({patronMsg: document.getElementById("patronMsg").checked});
});
document.getElementById("validAddr").addEventListener('click', function() {
   browser.storage.sync.set({validAddr: document.getElementById("validAddr").checked});
});
document.getElementById("autoBarcode").addEventListener('click', function() {
   browser.storage.sync.set({autoBarcode: document.getElementById("autoBarcode").checked});
});
document.getElementById("lookupPSTAT").addEventListener('click', function() {
   browser.storage.sync.set({lookupPSTAT: document.getElementById("lookupPSTAT").checked});
});
document.getElementById("digestOnly").addEventListener('click', function() {
   browser.storage.sync.set({digestOnly: document.getElementById("digestOnly").checked});
});
document.getElementById("dueDateToggle").addEventListener('click', function() {
   browser.storage.sync.set({dueDateToggle: document.getElementById("dueDateToggle").checked});
});
document.getElementById("middleInitials").addEventListener('click', function() {
   browser.storage.sync.set({middleInitials: document.getElementById("middleInitials").checked});
});
document.getElementById("updateAccountType").addEventListener('click', function() {
   browser.storage.sync.set({updateAccountType: document.getElementById("updateAccountType").checked});
});
document.getElementById("receiptFont").addEventListener('change', function() {
   browser.storage.sync.set({receiptFont: document.getElementById("receiptFont").value});
});
document.getElementById("disableDropbox").addEventListener('click', function() {
   browser.storage.sync.set({disableDropbox: document.getElementById("disableDropbox").checked});
});