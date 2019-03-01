const defaultMenu = document.getElementById('defaultMenu');
const laptopMenu = document.getElementById('laptopMenu');
const laptopFormOn = document.getElementById("laptopFormOn");
const laptopFormOnSwitch = document.getElementById("laptopFormOnSwitch");
const patronBarcode = document.getElementById("patronBarcode");
const laptopID = document.getElementById("laptopID");
const numAcc = document.getElementById("accessories");
const notes = document.getElementById("notes");
const logLaptop = document.getElementById("logLaptop");

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

function getAllData() {
  var store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var data = [];

  store.openCursor().onsuccess = function(evt) {
    var cursor = evt.target.result;
    if (cursor) {
      var entry = cursor.value;
      entry.key = cursor.key;
      data.push(entry);
      cursor.continue();
    }
  }

  return data;
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
  if (/^290780\d{8}$/.test(patronBarcode.value)) {
    issueLaptop(patronBarcode.value,laptopID.value,numAcc.value,notes.value);

    patronBarcode.value = "";
    laptopID.value = "PC1-A1";
    numAcc.value = "0";
    notes.value = "";
  } else {
    //alert("Enter a proper patron barcode.");
    console.log(getAllData());
  }
});

openDB();
updateContent();
