if (window.location.toString().includes("/cgi-bin/koha/circ/returns.pl")) {
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
    //"390780XXXXXXXX": "PC2-A4",
    "39078083272428": "PC2-A5",
    "39078086196814": "PC2-B1",
    "39078091512245": "PC2-B2",
    "39078091512302": "PC2-B3"
  };

  function returnLaptop(laptopID, retDate) {
    var db;
    const DB_NAME = "laptopCKO";
    const DB_VERSION = 1;
    const DB_STORE_NAME = "laptopCKOStore";

    let req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function(evt) {
      console.log("database opened");
      db = this.result;

      let tx = db.transaction(DB_STORE_NAME, 'readwrite');
      let store = tx.objectStore(DB_STORE_NAME);
      let key;

      store.getAll().onsuccess = function(evt) {
        let data = evt.target.result;
        console.log(evt);

        for (let item of data) {
          if (item.returnDate === null && item.laptopID === laptopID) {
            item.returnDate = retDate;

            let itemUpdate = store.put(item);

            itemUpdate.onerror = function(evt) {
              console.log("Item update error.");
            };

            itemUpdate.onsuccess = function(evt) {
              console.log("Item update success!");
            };
            break;
          }
        }
      }
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

  let returnCells = document.querySelectorAll('#bd td');

  if (returnCells.length > 0 && returnCells[5].textContent.trim() !== "Not checked out") {
    let returnBC = returnCells[3].textContent.trim();

    if (Object.keys(laptopMap).includes(returnBC)) {
      let d = new Date();
      d.setHours(d.getHours() - (d.getTimezoneOffset()/60));
      browser.runtime.sendMessage({"key": "returnLaptop"})
      //returnLaptop(laptopMap[returnBC], d);
    }
  }
}
