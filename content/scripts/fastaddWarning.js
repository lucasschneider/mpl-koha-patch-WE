"strict"

var isCKOscreen = /https:\/\/scls-staff\.kohalibrary\.com\/cgi-bin\/koha\/circ\/circulation\.pl/.test(window.location),
  fastAddButton,
  enteredBarcode,
  validBarcode,
  warning = document.createElement('div');

// Test that we are on a patron's checkout screen
if (isCKOscreen) {

  // Test that the Fast-add button has appeared
  fastAddButton = document.getElementsByName('fastadd1');
  if (fastAddButton.length > 0) {
    fastAddButton = fastAddButton[0];
    enteredBarcode = document.querySelector("form.confirm input[name='barcode']");
    
    if (enteredBarcode) enteredBarcode = enteredBarcode.value;
    
    if (!/^3[0-9]{13}$/.test(enteredBarcode)) {
      
      warning.style.color = "red";
      warning.style.fontWeight = "bold";
      warning.textContent = "NOTE: \"" + enteredBarcode + "\" is not a standard item barcode number.";
      
      fastAddButton.parentElement.parentElement.insertBefore(warning,fastAddButton.parentElement);
    }
  }
}