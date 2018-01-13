var d = new Date(),
  month = (d.getMonth()+1).toString(),
  day = d.getDate().toString();

if (month.length == 1) {
   month = "0" + month;
}

if (day.length == 1) {
  day = "0" + day;
}

document.getElementById('date').value = d.getFullYear() + "-" + month + "-" + day;

var getItemData = document.getElementById("getItemData"),
  patronBarcode = document.getElementById("patronBarcode"),
  getPatronData = document.getElementById("getPatronData"),
  printForm = document.getElementById("printForm");

// Trigger getPatronData() when enter is pressed in patronBarcode input
patronBarcode.addEventListener("keyup", event => {
  if (event.key !== "Enter") return;
  document.getElementById("getPatronData").click();
  event.preventDefault();
});

/*// Trigger getItemData() when enter is pressed in itemBarcode input
itemBarcode.addEventListener("keyup", event => {
  if (event.key !== "Enter") return;
  document.getElementById("getItemData").click();
  event.preventDefault();
});

if (getItemData) getItemData.addEventListener("click", function () {
  var itemBarcode = document.getElementById("itemBarcode");
  
  if (/^3[0-9]{13}$/.test(itemBarcode.value)) {
    if (itemBarcode.classList.contains("invalidInput")) {
      itemBarcode.classList.remove("invalidInput");
    }
  } else {
    if (!itemBarcode.classList.contains("invalidInput")) {
      itemBarcode.classList.add("invalidInput");
    }
  }
});*/

if (getPatronData) getPatronData.addEventListener("click", function() {
  var patronBarcode = document.getElementById("patronBarcode");
  
  if (/^2[0-9]{13}$/.test(patronBarcode.value)) {
    if (patronBarcode.classList.contains("invalidInput")) {
      patronBarcode.classList.remove("invalidInput");
    }
    browser.runtime.sendMessage({
      "key": "getPatronData",
      "patronBarcode": patronBarcode.value
    });
  } else {
    if (!patronBarcode.classList.contains("invalidInput")) {
      patronBarcode.classList.add("invalidInput");
    }
  }
});

browser.runtime.onMessage.addListener(request => {
  document.getElementById("name").value = request.patronName;
  document.getElementById("phone").value = request.patronPhone;
});

function formatDateForDisplay(date) {
  if (date && date !== "") {
    var d = new Date(date);
    return (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getFullYear();
  } else {
    return "";
  }
}

if (printForm) printForm.addEventListener("click", function() {
  var to = document.getElementById("to"),
    date = document.getElementById("date"),
    from = document.getElementById("from"),
    staffName = document.getElementById("staffInit"),
    type = document.getElementById("problem"),
    idBy = document.getElementById("idBy"),
    receivedVia = document.getElementById("receivedBy"),
    ckiBySorter = document.getElementById("ckiBySorter"),
    details = document.getElementById("details"),
    itemTitle = document.getElementById("itemTitle"),
    itemBarcode = document.getElementById("itemBarcode"),
    cCode = document.getElementById("cCode"),
    holds = document.getElementById("holds"),
    copies = document.getElementById("copies"),
    use = document.getElementById("use"),
    patron = document.getElementById("name"),
    patronBarcode = document.getElementById("patronBarcode"),
    patronPhone = document.getElementById("phone"),
    notified = document.getElementById("dateNotified"),
    staffInit = document.getElementById("notifiedBy"),
    contactedVia = document.getElementById("contactedVia");
  
  if (to.value == "" | date.value == "" | from.value == "" | staffName.value == "" | type.value == "" | idBy.value == "" |receivedVia.value == "" | details.value == "" | itemTitle.value == "" | itemBarcode.value == "" | patron.value == "" | patronBarcode.value == "") {
    alert("Please check that all required fields have been filled in.");
  } else {
    var submitData = browser.runtime.sendMessage({
      key: "printProblemForm",
      urlSearch: encodeURI("?to=" + to.value +
        "&date=" + formatDateForDisplay(date.value) +
        "&from=" + from.value +
        "&staffName=" + staffName.value +
        "&type=" + type.value +
        "&idBy=" + idBy.value +
        "&receivedVia=" + receivedVia.value +
        "&ckiBySorter=" + ckiBySorter.value +
        "&details=" + details.value +
        "&itemTitle=" + itemTitle.value +
        "&itemBarcode=" + itemBarcode.value +
        "&cCode=" + cCode.value +
        "&holds=" + holds.value +
        "&copies=" + copies.value +
        "&use=" + use.value +
        "&patron=" + patron.value +
        "&patronBarcode=" + patronBarcode.value +
        "&patronPhone=" + patronPhone.value +
        "&notified=" + formatDateForDisplay(notified.value) +
        "&staffInit=" + staffInit.value +
        "&contactedVia=" + contactedVia.value)
    });
  }
});