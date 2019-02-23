var defaultMenu = document.getElementById('defaultMenu'),
  laptopMenu = document.getElementById('laptopMenu'),
  laptopFormOn = document.getElementById("laptopFormOn"),
  laptopFormOnSwitch = document.getElementById("laptopFormOnSwitch"),
  patronBarcode = document.getElementById("anyNumber"),
  logLaptop = document.getElementById("logLaptop");


function updateContent() {
  browser.storage.sync.get("laptopFormChecked").then(res => {
    laptopFormOn.checked = res.laptopFormChecked;

    if (res.laptopFormChecked) {
      defaultMenu.style.display = 'none';
      laptopMenu.style.display = '';
    } else {
      defaultMenu.style.display = '';
      laptopMenu.style.display = 'none';
    }
  });
}

laptopFormOnSwitch.addEventListener('click', function() {
  browser.storage.sync.set({"laptopFormChecked": laptopFormOn.checked}).then(updateContent);
});

updateContent();

patronBarcode.addEventListener('input', validateInput);

logLaptop.innerText = "Log Entry";
logLaptop.style.cursor = "pointer";
logLaptop.addEventListener('click', logData);

// https://dexie.org
function logData() {
  var db = new Dexie('laptopCheckoutTest');
  db.version(1).stores({"issue":"++id,dateIn,barcode"});

  db.open().then(() => {
    return db.laptopCheckoutTest.add({
      "dateIn": (new Date()).toString(),
      "barcode": "290780XXXXXXXX"
    })
  }).then(() => {
    return db.laptopCheckoutTest.toArray();
  }).then(res => {
    console.log(res);
  }).catch (Dexie.MissingAPIError, function (e) {
	log ("Couldn't find indexedDB API");
}).catch ('SecurityError', function(e) {
  log ("SecurityError - This browser doesn't like fiddling with indexedDB.");
  log ("If using Safari, this is because jsfiddle runs its samples within an iframe");
  log ("Go run some samples instead at: https://github.com/dfahlander/Dexie.js/wiki/Samples");
}).catch (function (e) {
	log (e);
});
}

function validateInput() {
  if (!/[0-9]/.test(this.value[this.value.length-1]) || (this.value.length === 1 && this.value !== "2")
      || (this.value.length === 2 && this.value !== "29")
      || (this.value.length === 3 && this.value !== "290")
      || (this.value.length === 4 && this.value !== "2907")
      || (this.value.length === 5 && this.value !== "29078")
      || (this.value.length === 6 && this.value !== "290780")) this.value = this.value.slice(0,-2);
}
