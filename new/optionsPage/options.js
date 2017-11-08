function setDefaultOptions() {
  var defaultOptions = {
    skin: "mad",
    patronMsg: true,
    validAddr: true,
    autoBarcode: true,
    lookupPSTAT: true,
    digestOnly: true,
    dueDateToggle: true,
    middleInitials: true,
    updateAccountType: true,
    receiptFont: "36",
    disableDropbox: false
  };
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
  var gettingItem = browser.storage.sync.get('color');
  gettingItem.then((res) => {
    document.querySelector("#color").value = res.color || 'Firefox red';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);