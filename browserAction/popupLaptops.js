const defaultMenu = document.getElementById('defaultMenu');
const laptopMenu = document.getElementById('laptopMenu');
const laptopFormOn = document.getElementById("laptopFormOn");
const laptopFormOnSwitch = document.getElementById("laptopFormOnSwitch");
const patronBarcode = document.getElementById("patronBarcode");
const logLaptop = document.getElementById("logLaptop");

let db;
let request = window.indexedDB.open('laptopCKO', 1);

request.onerror = function() {
  console.log('Error loading database.');
}

request.onsuccess = function() {
  console.log('Database success');
  db = request.result;
}

request.onupgradeneeded = function(e) {
  let db = e.target.result;

  db.onerror = function(e) {
    console.log('Database initialised.');
  }

  let laptopStore = db.createObjectStore('laptopCKO', {
    "keyPath":  "id",
    "autoIncrement": true
  });

  laptopStore.createIndex('issueDate', 'barcode', {'unique': true});
  laptopStore.createIndex('patronBarcode', 'barcode', {'unique': false});
}

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

patronBarcode.addEventListener('input', function() {
  if (!/[0-9]/.test(this.value[this.value.length-1])) this.value = this.value.slice(0,-1);
});

logLaptop.innerText = "Log Entry";
logLaptop.style.cursor = "pointer";
logLaptop.addEventListener('click', function() {

});

updateContent();
