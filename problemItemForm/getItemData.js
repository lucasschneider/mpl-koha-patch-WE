var urlFieldsTmp = location.search.substr(1).split('&'),
  urlFields = []
  itemBarcode = null;

//Extract all search key-vals from the URI into arrays
for (var i = 0; i < urlFieldsTmp.length; i++) {
  urlFields[i] = urlFieldsTmp[i].split('=');
}

//Extract the item barcode
for (var i = 0; i < urlFields.length; i++) {
  if (urlFields[i][0] == "mkpItemBarcode") {
    itemBarcode = urlFields[i][1];
  }
}

//If we successfully extracted the item barcode
if (itemBarcode) {
  
}