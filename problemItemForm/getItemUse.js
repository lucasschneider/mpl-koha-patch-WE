var limitBarcode = document.getElementById('limitBarcode'),
  searchResults = document.querySelector(".searchresults p b"),
  itemBarcodeArr = /itemBarcode=[0-9]*/.exec(location.toString()),
  itemBarcode;
  
if (searchResults && itemBarcodeArr) {
  itemBarcode = itemBarcodeArr[0].match(/\d+/)[0];
  if (limitBarcode && itemBarcode) {
    limitBarcode.value = itemBarcode;
    limitBarcode.dispatchEvent(new Event("input"));
    setTimeout(() => {
      searchResults = searchResults.textContent.match(/\d+/g)[1];
      browser.runtime.sendMessage({
        "key": "returnItemUse",
        "use": searchResults
      });
    }, 200);
  } else {
    browser.runtime.sendMessage({
      "key": "failedItemUse",
    });
  }
} else {
  browser.runtime.sendMessage({
    "key": "failedItemUse",
  });
}