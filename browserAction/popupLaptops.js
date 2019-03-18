const defaultMenu = document.getElementById('defaultMenu');
const laptopMenu = document.getElementById('laptopMenu');
const laptopFormOn = document.getElementById("laptopFormOn");
const laptopFormOnSwitch = document.getElementById("laptopFormOnSwitch");
const patronBarcode = document.getElementById("patronBarcode");
const laptopID = document.getElementById("laptopID");
const numAcc = document.getElementById("accessories");
const notes = document.getElementById("notes");
const logLaptop = document.getElementById("logLaptop");
const viewData = document.getElementById("viewData");

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
    browser.runtime.sendMessage({
      "key": "issueLaptop",
      "patronBC": patronBarcode.value,
      "laptopID": laptopID.value,
      "numAcc": numAcc.value,
      "notes": notes.value
    });

    patronBarcode.value = "";
    laptopID.value = "PC1-A1";
    numAcc.value = "0";
    notes.value = "";
  } else {
    alert("Enter a proper patron barcode.");
  }
});

viewData.addEventListener('click',function() {
  browser.runtime.sendMessage({"key": "viewLaptopData"});
});

updateContent();
