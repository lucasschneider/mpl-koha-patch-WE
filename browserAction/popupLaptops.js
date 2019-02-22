var defaultMenu = document.getElementById('defaultMenu'),
  laptopMenu = document.getElementById('laptopMenu'),
  laptopFormOn = document.getElementById("laptopFormOn"),
  laptopFormOnSwitch = document.getElementById("laptopFormOnSwitch"),
  patronBarcode = document.getElementById("anyNumber"),
  accessory = document.getElementById("accessories"),
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
accessory.addEventListener('input', function() {
  if (!/^[1-4]$/.test(this.value)) this.value = "";
});

logLaptop.innerText = "Log Entry";
logLaptop.style.cursor = "pointer";
logLaptop.addEventListener('click', function() {
  // https://doc.esdoc.org/github.com/rpl/idb-file-storage/class/src/idb-file-storage.js~IDBFileStorage.html#instance-method-get

  const laptopLogs = await IDBFiles.getFileStorage({"name": "laptopLogs"});

  const file = await laptopLogs.createMutableFile("test.txt");
  const fh = file.open("readwrite");

  const metadata = await fh.getMetadata();

  await fh.append((new Date()).toUTCString());

  await fh.close();
  await file.persist();
});

function validateInput() {
  if (!/[0-9]/.test(this.value[this.value.length-1]) || (this.value.length === 1 && this.value !== "2")
      || (this.value.length === 2 && this.value !== "29")
      || (this.value.length === 3 && this.value !== "290")
      || (this.value.length === 4 && this.value !== "2907")
      || (this.value.length === 5 && this.value !== "29078")
      || (this.value.length === 6 && this.value !== "290780")) this.value = this.value.slice(0,-2);
}
