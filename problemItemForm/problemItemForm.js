(function() {
  'use strict';

  const to = document.getElementById("to");
  const date = document.getElementById("date");
  const from = document.getElementById("from");
  const staffName = document.getElementById("staffInit");
  const type = document.getElementById("problem");
  const idBy = document.getElementById("idBy");
  const receivedVia = document.getElementById("receivedBy");
  const ckiBySorter = document.getElementById("ckiBySorter");
  const details = document.getElementById("details");
  const itemTitle = document.getElementById("itemTitle");
  const itemBarcode = document.getElementById("itemBarcode");
  const cCode = document.getElementById("cCode");
  const holds = document.getElementById("holds");
  const copies = document.getElementById("copies");
  const use = document.getElementById("use");
  const patron = document.getElementById("name");
  const patronBarcode = document.getElementById("patronBarcode");
  const patronPhone = document.getElementById("phone");
  const patronEmail = document.getElementById("email");
  const notified = document.getElementById("dateNotified");
  const staffInit = document.getElementById("notifiedBy");
  const contactedVia = document.getElementById("contactedVia");
  const instructions = document.getElementById("instructions");
  const nonDefectNonHold = document.getElementById("nonDefectNonHold");
  const nonDefectHold = document.getElementById("nonDefectHold");
  const defect = document.getElementById("defect");

  const prepareItemData = document.getElementById("prepareItemData");
  const getPatronData = document.getElementById("getPatronData");
  const itemDataErrMsg  = document.getElementById("itemDataErrMsg");
  const patronDataErrMsg = document.getElementById("patronDataErrMsg");
  const printForm = document.getElementById("printForm");

  let getCurrDate = function() {
    let d = new Date();
    d.setHours(d.getHours() - 6);

    let month = (d.getMonth()+1).toString(),
      day = d.getDate().toString();

    if (month.length == 1) {
       month = "0" + month;
    }

    if (day.length == 1) {
      day = "0" + day;
    }

    return d.getFullYear() + "-" + month + "-" + day;
  };

  let formatDateForDisplay = function(date) {
    if (date && date !== "") {
      var d = new Date(date);
      return (d.getUTCMonth()+1) + "/" + d.getUTCDate() + "/" + d.getUTCFullYear();
    } else {
      return "";
    }
  };

  date.value = getCurrDate();

  // Trigger prepareItemData() when enter is pressed in itemBarcode input
  itemBarcode.addEventListener("keyup", evt => {
    if (evt.key !== "Enter") return;
    prepareItemData.click();
    evt.preventDefault();
  });

  prepareItemData.addEventListener("click", function () {
    itemTitle.value = "";
    cCode.value = "";
    holds.value = "";
    copies.value = "";
    use.value = "";
    use.removeAttribute('data-currUse');
    use.removeAttribute('data-pastUse');

    if (itemBarcode.value.length === 8) {
      itemBarcode.value = "390780" + itemBarcode.value;
    }

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
  patronBarcode.addEventListener("keyup", evt => {
    if (evt.key !== "Enter") return;
    getPatronData.click();
    evt.preventDefault();
  });

  getPatronData.addEventListener("click", function() {
    patron.value = "";
    patronPhone.value = "";
    patronEmail.value = "";

    if (patronBarcode.value.length === 8) {
      patronBarcode.value = "290780" + patronBarcode.value;
    }

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

  printForm.addEventListener("click", function() {

    var emailParts = patronEmail

    if (to.value == "" | date.value == "" | from.value == "" | staffName.value == "" | type.value == "" | idBy.value == "" |receivedVia.value == "" | details.value == "" | itemTitle.value == "" | itemBarcode.value == "") {
      alert("Please check that all required fields have been filled in.");
    } else {
      instructions.style.display = "";

      switch(type.value) {
        case "Defect Reported":
            nonDefectNonHold.style.display = "none";
            nonDefectHold.style.display = "none";
            defect.style.display = "";
          break;
        default:
          if (receivedVia.value === "Transit Hold") {
            nonDefectNonHold.style.display = "none";
            nonDefectHold.style.display = "";
            defect.style.display = "none";
          } else {
            nonDefectNonHold.style.display = "";
            nonDefectHold.style.display = "none";
            defect.style.display = "none";
          }
          break;
      }

      window.location.hash = "instructions";

      browser.runtime.sendMessage({
        "key": "printProblemForm",
        "data": [
          ["to", to.value.toUpperCase()],
          ["date", formatDateForDisplay(date.value)],
          ["from", from.value.toUpperCase()],
          ["staffName", staffName.value.toUpperCase()],
          ["type", type.value],
          ["idBy", idBy.value],
          ["receivedVia", receivedVia.value],
          ["ckiBySorter", ckiBySorter.checked.toString()],
          ["details", details.value],
          ["itemTitle", itemTitle.value],
          ["itemBarcode", itemBarcode.value],
          ["cCode", cCode.value],
          ["holds", holds.value],
          ["copies", copies.value],
          ["use", use.value],
          ["patron", patron.value],
          ["patronBarcode", patronBarcode.value],
          ["patronPhone", patronPhone.value],
          ["patronEmail", patronEmail.value],
          ["notified", formatDateForDisplay(notified.value)],
          ["staffInit", staffInit.value],
          ["contactedVia", contactedVia.value]
        ]
      });
    }
  });

  // Handle cases when we're loading the problem form with barcode data
  if (location.search.length > 0) {
    var data = location.search.substr(1).split("=");

    if (data && data.length === 2) {
      if (data[0] === "item") {
        itemBarcode.value = data[1];
        prepareItemData.click();
      } else if (data[0] === "patron") {
        patronBarcode.value = data[1];
        getPatronData.click();
      }
    }
  }

  browser.runtime.onMessage.addListener(message => {
    switch (message.key) {
      case "returnItemData":
        itemDataErrMsg.style.display = "none";
        cCode.value = message.cCode;
        copies.value = message.copies;
        use.setAttribute('data-currUse', message.ckoHist);
        break;
      case "returnItemHolds":
        holds.value = message.holds;
        if (message.itemTitle) {
          itemTitle.value = message.itemTitle;
        }
        break;
      case "returnItemPastUse":
        use.setAttribute('data-pastUse', message.pastUse);

        let currUse = parseInt(use.getAttribute('data-currUse'));
        let pastUse = parseInt(use.getAttribute('data-pastUse'));

        if (!isNaN(currUse) && !isNaN(pastUse)) {
          use.value = currUse + pastUse;
        }
        break;
      case "returnPatronData":
        patronDataErrMsg.style.display = "none";
        patron.value = message.patronName;
        patronBarcode.value = message.patronBarcode;
        patronPhone.value = !!message.patronPhone ? message.patronPhone : "";
        patronEmail.value = !!message.patronEmail ? message.patronEmail : "";
        break;
    }
  });
})();
