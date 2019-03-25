const defaultMenu = document.getElementById('defaultMenu');
const laptopMenu = document.getElementById('laptopMenu');
const laptopFormOn = document.getElementById("laptopFormOn");
const laptopFormOnSwitch = document.getElementById("laptopFormOnSwitch");
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

viewData.style.cursor = "pointer";
viewData.addEventListener('click',function() {
  browser.runtime.sendMessage({"key": "viewLaptopData"});
});

updateContent();
