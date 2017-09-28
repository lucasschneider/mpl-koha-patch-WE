"use strict";

var Address = function Address(addrRegEx, place) {
  // addrRegEx formated to be inserted at a regex literal
  this.addrRegEx = addrRegEx;
  // The place/organization of the restricted address
  this.place = place;
  // The type of restricted address {unacceptable,restricted}
};

var addr = document.getElementById('address'),
    addr2 = document.getElementById('address2'),
    city = document.getElementById('city'),
    expiry = document.getElementById('dateexpiry'),
    bn = document.getElementById('borrowernotes'),
    fullAddrRegEx = new RegExp(),
    addressVal,
    date = new Date(),
    year = date.getUTCFullYear();

browser.runtime.onMessage.addListener(function (message) {
  if (message && message.key == "receivedMatchDorm") {
    switch (parseInt(date.getUTCMonth(), 10)) {
      case 0:
      case 1:
      case 2:
      case 3:
        year = date.getUTCFullYear();
        break;
      case 4:
        if (parseInt(date.getUTCDate(), 10) < 15) {
          year = date.getUTCFullYear();
        } else {
          year = (parseInt(date.getUTCFullYear(), 10) + 1).toString();
        }
        break;
      default:
        year = (parseInt(date.getUTCFullYear(), 10) + 1).toString();
        break;
    }
    expiry.value = "05/15/" + year;
    var noteTest = new RegExp("Special expiration date of 05/15/" + year + " set due to residence at " + message.dormName + ", a university dorm");
    if (bn !== null && !noteTest.test(bn.value, "i")) {
      if (bn.value !== "") {
        bn.value += "\n\n";
      }
      var noteBody = "Special expiration date of 05/15/" + year + " set due to residence at " + message.dormName + ", a university dorm. Patron must verbally update address before account renewal (proof of address not necessary).";

      bn.value += noteBody;
      alert(noteBody);
    }
  } else if (message && message.key == "failedMatchDorm") {
    //:TODO Failure response
  }
});

/** CHECK FOR COLLEGE DORM ADDRESSES
    AND SET EXP DATE IF NECESSARY **/
function fillDormExp() {
  if (zip && addr && expiry) {
    addressVal = addr2 !== null ? addr.value + " " + addr2.value : addr.value;
    if (/[ ]*mad(ison)?(,? wi)?/i.test(city.value)) {
      browser.runtime.sendMessage({
        key: "getDormData",
        addrVal: addressVal
      });
    }
  }
}

var addr = document.getElementById('address'),
    city = document.getElementById('city'),
    zip = document.getElementById('zipcode');
if (addr !== null) {
  addr.addEventListener('blur', fillDormExp);
}
if (city !== null) {
  city.addEventListener('blur', fillDormExp);
}