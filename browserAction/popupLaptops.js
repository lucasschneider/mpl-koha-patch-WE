const defaultMenu = document.getElementById('defaultMenu');
const laptopMenu = document.getElementById('laptopMenu');
const laptopFormOn = document.getElementById("laptopFormOn");
const laptopFormOnSwitch = document.getElementById("laptopFormOnSwitch");
const patronBarcode = document.getElementById("patronBarcode");
const notes = document.getElementById("notes");
const addNote = document.getElementById("addNote");
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

addNote.style.cursor = "pointer";
addNote.addEventListener('click', function(e) {
  e.preventDefault();
  if (/^29078\d{9}$/.test(patronBarcode.value)) {
    browser.runtime.sendMessage({
      "key": "addLaptopNote",
      "patronBC": patronBarcode.value,
      "notes": notes.value
    });

    patronBarcode.value = "";
    notes.value = "";
  } else {
    alert("Enter a proper patron barcode.");
  }
});

viewData.style.cursor = "pointer";
viewData.addEventListener('click',function() {
  browser.runtime.sendMessage({"key": "viewLaptopData"});
});

updateContent();
