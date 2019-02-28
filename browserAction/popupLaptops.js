const defaultMenu = document.getElementById('defaultMenu');
const laptopMenu = document.getElementById('laptopMenu');
const laptopFormOn = document.getElementById("laptopFormOn");
const laptopFormOnSwitch = document.getElementById("laptopFormOnSwitch");
const patronBarcode = document.getElementById("patronBarcode");
const laptopID = document.getElementById("laptopID");
const numAcc = document.getElementById("accessories");
const notes = document.getElementById("notes");
const logLaptop = document.getElementById("logLaptop");

const laptopMap = {
  "39078083272006": "PC1-A1",
  "39078083272014": "PC1-A2",
  "39078083272071": "PC1-A3",
  "39078091512427": "PC1-A4",
  "39078083272246": "PC1-A5",
  "39078091512484": "PC1-B1",
  "39078083272121": "PC1-B2",
  "39078083272063": "PC1-B3",
  "39078083272667": "PC2-A1",
  "39078083272600": "PC2-A2",
  "39078091512369": "PC2-A3",
  "": "PC2-A4",
  "39078083272428": "PC2-A5",
  "39078086196814": "PC2-B1",
  "39078091512245": "PC2-B2",
  "39078091512302": "PC2-B3"
}

const DB_NAME = "laptopCKO";
const DB_VERSION = 1;
const DB_STORE_NAME = "laptopCKOStore";

var db;

function openDB() {
  var req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onsuccess = function(evt) {
    db = this.result;
  };

  req.onerror = function(evt) {
    console.error("openDB:", evt.target.errorCode);
  };

  req.onupgradeneeded = function(evt) {
    var store = evt.currentTarget.result.createObjectStore(DB_STORE_NAME, {
      "keypath": "id",
      "autoIncrement": true
    });

    store.createIndex('issueDate', 'issueDate', {'unique': true});
    store.createIndex('patronBarcode', 'patronBarcode', {'unique': false});
    store.createIndex('laptopID', 'laptopID', {'unique': false});
    store.createIndex('numAccesories', 'numAccesories', {'unique': false});
    store.createIndex('notes', 'notes', {'unique': false});
    store.createIndex('returnDate', 'returnDate', {'unique': true});
  };
}

/**
 * @param {string} storeName
 * @param {string} mode either "readonly" or "readwrite"
 */
function getObjectStore(storeName, mode) {
  var tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

/**
 * @param {string} barcode patron's barcode number
 * @param {string} laptopID
 * @param {number} numAcc number of accessories
 * @param {string} notes
 */
function issueLaptop(barcode, laptopID, numAcc, notes) {
  // Convert date UTC -> CST
  var date = new Date();
  date.setHours(date.getHours() - 6);

  var obj = {
    'issueDate': date,
    'patronBarcode': barcode,
    'laptopID': laptopID,
    'numAccesories': numAcc,
    'notes': notes,
    'returnDate': null
  }

  var store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var req;

  try {
    req = store.add(obj);
  } catch (e) {
    throw e;
  }

  req.onsuccess = function(evt) {
    console.log('insertion success!')
  }
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
};

laptopFormOnSwitch.addEventListener('click', function() {
  browser.storage.sync.set({"laptopFormChecked": laptopFormOn.checked}).then(updateContent);
});

patronBarcode.addEventListener('input', function() {
  if (!/[0-9]/.test(this.value[this.value.length-1])) this.value = this.value.slice(0,-1);
});

logLaptop.style.cursor = "pointer";
logLaptop.addEventListener('click', function() {
  issueLaptop(patronBarcode.value,laptopID.value,numAcc.value,notes.value);
});

openDB();
updateContent();
