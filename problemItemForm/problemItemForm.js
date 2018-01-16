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

var prepareItemData = document.getElementById("prepareItemData"),
  patronBarcode = document.getElementById("patronBarcode"),
  getPatronData = document.getElementById("getPatronData"),
  printForm = document.getElementById("printForm");

// Trigger prepareItemData() when enter is pressed in itemBarcode input
itemBarcode.addEventListener("keyup", event => {
  if (event.key !== "Enter") return;
  document.getElementById("prepareItemData").click();
  event.preventDefault();
});

if (prepareItemData) prepareItemData.addEventListener("click", function () {
  var itemTitle = document.getElementById("itemTitle"),
    itemBarcode = document.getElementById("itemBarcode"),
    cCode = document.getElementById("cCode"),
    holds = document.getElementById("holds"),
    copies = document.getElementById("copies"),
    use = document.getElementById("use");
    
  itemTitle.value = "";
  cCode.value = "";
  holds.value = "";
  copies.value = "";
  use.value = "";
  
  if (/^3[0-9]{13}$/.test(itemBarcode.value)) {
    if (itemBarcode.classList.contains("invalidInput")) {
      itemBarcode.classList.remove("invalidInput");
    }
    browser.runtime.sendMessage({
      "key": "prepareItemData",
      "itemBarcode": itemBarcode.value
    });
  } else {
    if (!itemBarcode.classList.contains("invalidInput")) {
      itemBarcode.classList.add("invalidInput");
    }
  }
});

// Trigger getPatronData() when enter is pressed in patronBarcode input
patronBarcode.addEventListener("keyup", event => {
  if (event.key !== "Enter") return;
  document.getElementById("getPatronData").click();
  event.preventDefault();
});

if (getPatronData) getPatronData.addEventListener("click", function() {
  var patronBarcode = document.getElementById("patronBarcode"),
    name = document.getElementById("name"),
    phone = document.getElementById("phone"),
    email = document.getElementById("email");
  
  name.value = "";
  phone.value = "";
  email.value = "";
  
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
  if (request.key === "returnItemData") {
    document.getElementById("itemDataErrMsg").style.display = "none";
    document.getElementById("itemTitle").value = request.itemTitle;
    document.getElementById("cCode").value = request.cCode;
    document.getElementById("copies").value = request.copies;
  } else if (request.key === "failedItemData") {
    document.getElementById("itemDataErrMsg").style.display = "";
    document.getElementById("itemTitle").value = "";
    document.getElementById("cCode").value = "";
    document.getElementById("copies").value = "";
  } else if (request.key === "returnItemHolds") {
    document.getElementById("holds").value = request.holds;
  } else if (request.key === "failedItemHolds") {
    document.getElementById("holds").value = "";
  } else if (request.key === "returnItemUse") {
    document.getElementById("use").value = request.use;
  } else if (request.key === "failedItemUse") {
  } else if (request.key === "returnPatronData") {
    document.getElementById("patronDataErrMsg").style.display = "none";
    document.getElementById("name").value = request.patronName;
    document.getElementById("phone").value = !!request.patronPhone ? request.patronPhone : "";
    document.getElementById("email").value = !!request.patronEmail ? request.patronEmail : "";
  } else if (request.key === "failedPatronData") {
    document.getElementById("patronDataErrMsg").style.display = "";
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";
  }
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
    patronEmail = document.getElementById("email"),
    notified = document.getElementById("dateNotified"),
    staffInit = document.getElementById("notifiedBy"),
    contactedVia = document.getElementById("contactedVia");
    
  var emailParts = patronEmail
  
  if (to.value == "" | date.value == "" | from.value == "" | staffName.value == "" | type.value == "" | idBy.value == "" |receivedVia.value == "" | details.value == "" | itemTitle.value == "" | itemBarcode.value == "" | patron.value == "" | patronBarcode.value == "") {
    alert("Please check that all required fields have been filled in.");
  } else {
    window.location.hash = "instructions";
    document.getElementById("instructions").style.display = "";
    
    switch(type.value) {
      case "Defect Reported":
        document.getElementById("defect").style.display = "";
        break;
      default:
        if (receivedVia.value === "Transit Hold") {
          document.getElementById("nonDefectHold").style.display = "";
        } else {
          document.getElementById("nonDefectNonHold").style.display = "";
        }
        break;    
    } 
    
    var submitData = browser.runtime.sendMessage({
      key: "printProblemForm",
      urlSearch: encodeURI("?to=" + to.value +
        "&date=" + formatDateForDisplay(date.value) +
        "&from=" + from.value +
        "&staffName=" + staffName.value +
        "&type=" + type.value +
        "&idBy=" + idBy.value +
        "&receivedVia=" + receivedVia.value +
        "&ckiBySorter=" + ckiBySorter.checked.toString() +
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
        "&patronEmail=" + patronEmail.value +
        "&notified=" + formatDateForDisplay(notified.value) +
        "&staffInit=" + staffInit.value +
        "&contactedVia=" + contactedVia.value)
    });
  }
});