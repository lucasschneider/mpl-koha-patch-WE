"use strict";
/*** CHECK AGAINST LIST OF UNACCEPTABLE
     AND RESTRICTED ADDRESSES ***/
var addr = document.getElementById('address'),
  addr2 = document.getElementById('address2'),
  city = document.getElementById('city'),
  bn = document.getElementById('borrowernotes'),
  cc = document.getElementsByClassName('categorycode'),
  field = document.getElementsByClassName('action'),
  cityRegEx = /mad(ison([,]? wi.*)?)?|monona([,]? wi.*)?/i,
  fullAddrRegEx = new RegExp(),
  addrVal,
  i,
  field,
  initial,
  wasLU = false,
  wasNotifiedToDel = false;
     
     
// Define address object
var Address = function(addrRegEx, addr, place) {
    // addrRegEx formatted to be inserted as a regex literal
    this.addrRegEx = addrRegEx;
    // The place/organization of the restricted address
    this.place = place;
    // The type of restricted address {unacceptable,restricted}
    this.addr = addr;
  },
  addr,
  city;

/** Restore the save button if the override buttton is clicked */
function restoreSave() {
  var field = document.getElementsByClassName('action')[0];
  if (field !== null && field.childElementCount === 3) {
    field.replaceChild(field.children[2], field.children[0]);
    field.children[0].style = "cursor:pointer;";
  } else {
    alert("Unable to save. Please refresh the page.");
  }
  return false;
}

/** Replace the save button at the bottom of the screen with
 * an override button if the patron has an unacceptable
 * address */
function blockSubmit() {
  var field = document.getElementsByClassName('action')[0],
    button;
  if (field !== null) {
    button = document.createElement('input');
    button.type = 'button';
    button.value = 'Override Block';
    button.style = 'cursor:pointer;';
    button.addEventListener('click', restoreSave);
    field.appendChild(button);
    field.appendChild(field.children[1]);
    field.appendChild(field.children[0]);
    field.children[2].style = "display:none;";
  }
  return false;
}

/** Calculate the current date */
function curDate() {
  var date = new Date(),
    year = date.getFullYear(),
    month = (1 + date.getMonth()).toString(),
    day;
  month = month.length > 1 ? month : '0' + month;
  day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return month + '/' + day + '/' + year;
}

function deleteMsgNotice() {
  alert('Please delete the circulation note regarding the patron\'s pervious limited use address');
}

/** Compare a patron's address to the list of unacceptable and
 * restricted addresses */
function parseBadAddr() {
  if (cc) cc = cc[0];
  if (addr && city && cityRegEx.test(city.value) && bn) {
    addrVal = addr2 !== null && (addr2.value !== null && addr2.value !== "") ? addr.value + " " + addr2.value : addr.value;    
    browser.runtime.sendMessage({
      key: "getBadAddrs",
      addrVal: addrVal
    });
  }
}

browser.runtime.onMessage.addListener(message => {
  if (message && message.key == "receivedBadAddrs") {
    if (message.name && message.type) {
      if (message.type === "unacceptable") {
        alert("--- STOP ---\nA library card CANNOT be issued to this address.\n" + message.address + " (" + message.name + ") is NOT a valid residential address.\n\nInform any patron providing this address that they must provide proof of a valid residential address in order to get a library card. (You could offer them an internet access card.)\n\nFor more info refer to the list of unacceptable addresses on the staff wiki:\nhttp://www.mplnet.org/system/files/UNACCEPTABLE%20ADDRESSES.pdf");
        field = document.getElementsByClassName('action')[0];
        if (field !== null && field.children[0].value !== 'Override Block') {
          blockSubmit();
        }
      } else {
        // Make account Limited Use
        if (cc) {
          if (cc.value === "AD") {
            wasLU = false;
            cc.value = "LU";
          } else if (cc.value === "JU") {
            wasLU = false;
            cc.value = "LUJ";
          } else if (cc.value === "LU" || cc.value === "LUJ") {
            wasLU = true;
          }
        }

        // Enable save button, if necessary
        if (field && field[0].children[0].value === 'Override Block') {
          restoreSave();
        }

        // Handle non-unacceptable bad addresses
        if (message.type === "restricted") {
          if (!(new RegExp("Patron's account is Limited Use due to temporary residence at " + message.name + " \\(" + message.address)).test(bn.value)) {
            initial = prompt("--- NOTE ---\nA library card issued to " + message.address + " (" +message.name + ") must be LIMITED USE.\n\nIn order to have the limited use restrictions removed from their account, a patron must first provide proof that they are living at a valid residential address.\n\nFor more info refer to the list of unacceptable addresses on the staff wiki:\nhttp://www.mplnet.org/system/files/UNACCEPTABLE%20ADDRESSES.pdf\n\nIf this is a new address, enter your initials and library code to confirm: (e.g. LS/MAD)");
            if (!initial) initial = "";
            if (bn.value !== '') {
              bn.value += "\n\n";
            }
            if (!initial) {
              initial = "";
            }
            bn.value += "Patron's account is Limited Use due to temporary residence at " + message.name + " (" + message.address + "). Patron must show proof of valid residential address in order to remove restrictions. " + curDate() + " " + initial;
            if (wasLU && !wasNotifiedToDel) {
              wasNotifiedToDel = true;
              deleteMsgNotice();
            }
          }
        } else if (message.type === "unique") {
          if (!(new RegExp("Patron's account is Limited Use due to temporary residence at " + message.name + " \\(" + message.address)).test(bn.value)) {
            initial = prompt(message.note.replace(/\\n/g, "\n"));
            if (!initial) initial = "";
            if (bn.value !== '') {
              bn.value += "\n\n";
            }
            bn.value += "Patron's account is Limited Use due to temporary residence at " + message.name + " (" + message.address + "). Patron must show proof of valid residential address in order to remove restrictions. " + curDate() + " " + initial;
            if (wasLU && !wasNotifiedToDel) {
              wasNotifiedToDel = true;
              deleteMsgNotice();
            }
          }
        }
      }
    } else {
      // TODO: Handle bad address without data for name or type
    }
  } else if (message && message.key == "noBadAddrs") {
    if (field && field[0].children[0].value === 'Override Block') {
      restoreSave();
    }
    if (/Patron must show proof of valid residential address in order to remove restrictions/.test(bn.value) && !wasNotifiedToDel) {
      wasNotifiedToDel = true;
      deleteMsgNotice();

      if (cc.value === "LU") {
        cc.value = "AD";
      } else if (cc.value === "LUJ") {
        cc.value = "JU";
      }
    }
  }
});

addr = document.getElementById('address');
if (addr !== null) {
  addr.addEventListener('blur', parseBadAddr);
}
city = document.getElementById('city');
if (city !== null) {
  city.addEventListener('blur', parseBadAddr);
}
