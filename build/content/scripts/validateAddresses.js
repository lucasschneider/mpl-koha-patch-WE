"use strict";
/*** CHECK AGAINST LIST OF UNACCEPTABLE
     AND RESTRICTED ADDRESSES ***/

// Define address object

var Address = function Address(addrRegEx, addr, place) {
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

/** Compare a patron's address to the list of unacceptable and
 * restricted addresses */
function parseBadAddr() {
  var addr = document.getElementById('address'),
      addr2 = document.getElementById('address2'),
      city = document.getElementById('city'),
      bn = document.getElementById('borrowernotes'),
      cc = document.getElementsByClassName('categorycode'),
      field = document.getElementsByClassName('action'),
      cityRegEx = /mad(ison([,]? wi.*)?)?|monona([,]? wi.*)?/i,
      unacceptable = [new Address("1819 aberg a", "1819 Aberg Ave", "State Job Placement Center"), new Address("1955 atwood a", "1955 Atwood Ave", "Briarpatch"), new Address("4581 w(est)? beltline h(igh)?wa?y", "4581 W Beltline Hwy", "PO Boxes/Mail Services"), new Address("147 s(outh)? butler s", "147 S Butler St", "Veteran's house"), new Address("115 w(est)? doty s", "115 W Doty St", "Dane County Jail"), new Address("4230 e(ast)? towne b", "4230 E Towne Blvd", "PO Boxes/Mail Services"), new Address("6441 enterprise l", "6441 Enterprise Ln", "PO Boxes/Mail Services"), new Address("2935 fish hatchery r", "2935 Fish Hatchery Rd", "PO Boxes/Mail Services"), new Address("802 e(ast)? gorham s", "802 E Gorham St", "Yahara House"), new Address("408 w(est)? gorham s", "408 W Gorham St", "Social Club"), new Address("310 s(outh)? ingersoll s", "310 S Ingersoll St", "Luke House"), new Address("210 martin luther king j(unio)?r b", "210 Matrin Luther King Jr Blvd", "Dane County Jail"), new Address("215 martin luther king j(unio)?r b", "215 Matrin Luther King Jr Blvd", "Madison Municipal Building"), new Address("3902 milwaukee s", "3902 Milwaukee St", "Main Post Office"), new Address("4514 monona d", "4514 Monona Dr", "PO Boxes/Mail Services"), new Address("1202 northport d", "1202 Northport Dr", "Dane County Social Services"), new Address("1206 northport d", "1206 Northport Dr", "Dane County Social Services"), new Address("6666 odana r", "6666 Odana Rd", "PO Boxes/Mail Services"), new Address("128 e(ast)? olin a", "128 E Olin Ave", "Family Service Madison"), new Address("1228 s(outh)? park s", "1228 S Park St", "Dane County Housing Authority"), new Address("1240 s(outh)? park s", "1240 S Park St", "Housing Service"), new Address("1360 regent s", "1360 Regent St", "PO Boxes/Mail Services"), new Address("2120 rimrock r", "2120 Rimrock Rd", "Dane County Jail"), new Address("3150 st paul a", "3150 St Paul Ave", "DoC Housing - 2 Week Stay"), new Address("103 s(outh)? (second|2nd) s", "103 S Second St", "Mail Service"), new Address("1213 n(orth)? sherman a", "1213 N Sherman Ave", "PO Boxes/Mail Services"), new Address("731 state s", "731 State St", "Pres House"), new Address("2701 university a", "2701 University Ave", "PO Boxes/Mail Services"), new Address("322 e(ast)? washington a", "322 E Washington Ave", "St John's Lutheran Church"), new Address("512 e(ast)? washington a", "512 E Washington Ave", "Probation/Parole"), new Address("1245 e(ast)? washinton a", "1245 E Washington Ave", "Advocacy Offices"), new Address("116 w(est)? washington a", "116 W Washington Ave", "Grace Episcopal Church"), new Address("625 w(est)? washington a", "625 W Washington Ave", "Meriter Health Center"), new Address("668 w(est)? washington a", "668 W Washington Ave", "Mail Service")],
      restricted = [new Address("221 s(outh)? baldwin s", "221 S Baldwin St", "Port St Vincent"), new Address("141 s(outh)? butler s", "141 S Butler St", "Hostelling International - Madison"), new Address("2009 e(ast)? dayton s", "2009 E Dayton St", "ARC Dayton"), new Address("4117 dwight d", "4117 Dwight Dr", "Dwight Halfway House"), new Address("300 femrite d", "300 Femrite Dr", "Telurian"), new Address("4 n(orth)? hancock s", "4 N Hancock St", "Off Square Club"), new Address("3501 kipling d", "3501 Kipling Dr", "Schwert Halfway House"), new Address("4202 monona d", "4202 Monona Dr", "ARC Maternal Infant Program"), new Address("4006 nakoosa t", "4006 Nakoosa Trl", "Porchlight/Safe Haven"), new Address("422 n(orth)? s", "422 North St", "Arise Family Services"), new Address("5706 odana r", "5706 Odana Rd", "Foster Halfway House"), new Address("810 w(est)? olin a", "810 W Olin Ave", "Rebos Chris Farley House"), new Address("202 n(orth)? patt?erson s", "202 N Paterson St", "ARC Patterson"), new Address("2720 rimrock r", "2720 Rimrock Rd", "Youth Services of Southern Wisconsin"), new Address("312 wisconsin a", "312 Wisconsin Ave", "Bethel Lutheran Church"), new Address("1301 williamson s", "1301 Williamson St", "Port St Vincent")],
      addrRegExFirst = /^[ ]*/,
      addrRegExLast = /.*/,
      fullAddrRegEx = new RegExp(),
      foundBadAddr = false,
      addrVal,
      i,
      field,
      initial,
      wasLU = false;
  if (cc) cc = cc[0];
  if (addr && city && cityRegEx.test(city.value) && bn) {
    addrVal = addr2 !== null && addr2.value !== null && addr2.value !== "" ? addr.value + " " + addr2.value : addr.value;
    // Test for Hospitality House
    if (/1490 martin s/i.test(addrVal)) {
      foundBadAddr = true;
      if (cc) {
        if (cc.value === "AD") {
          cc.value = "LU";
        } else if (cc.value === "JU") {
          cc.value = "LUJ";
        } else if (cc.value === "LU" || cc.value === "LUJ") {
          wasLU = true;
        }
      }
      if (field && field[0].children[0].value === 'Override Block') {
        restoreSave();
      }
      if (!/Patron's account is Limited Use due to address \(Hospitality House, 1490 Martin St/i.test(bn.value)) {
        initial = prompt("--- NOTE ---\n1490 MARTIN ST is the Hospitality House, a daytime resource center for homeless and low-income people in Dane County. A LIMITED USE account may be set up, however, all library cards issued to that address MUST be mailed, whether or not the patron provides proof of that address.\n\nIn order to have the Limited Use restrictions removed from their account, a patron must first provide proof that they are living at a valid residential address.\n\nFor more info refer to the list of unacceptable addresses on the staff wiki:\nhttp://mplnet.pbworks.com/w/file/fetch/79700849/UNACCEPTABLE%20ADDRESSES.pdf\n\nIf this is a new address, enter your initials and library code to confirm: (e.g. LS/MAD)");
        if (!initial) initial = "";
        if (bn.value !== '') {
          bn.value += "\n\n";
        }
        bn.value += "Patron's account is Limited Use due to address (Hospitality House, 1490 Martin St). Patron must show proof of valid residential address in order to remove restrictions. " + curDate() + " " + initial;
        if (wasLU) alert('Please delete the circulation note regarding the patron\'s pervious limited use address');
      }
      // Test for Salvation Army address
    } else if (/630 e(ast)? washington a/i.test(addrVal)) {
      foundBadAddr = true;
      if (cc) {
        if (cc.value === "AD") {
          cc.value = "LU";
        } else if (cc.value === "JU") {
          cc.value = "LUJ";
        } else if (cc.value === "LU" || cc.value === "LUJ") {
          wasLU = true;
        }
      }
      if (field && field[0].children[0].value === 'Override Block') {
        restoreSave();
      }
      if (!/Patron's account is Limited Use due to address \(Salvation Army, 630 E Washington Ave/i.test(bn.value)) {
        initial = prompt("--- NOTE ---\n630 E WASHINGTON AVE is the Salvation Army. People staying at the Salvation Army cannot receive personal mail there so library cards CANNOT BE MAILED. Patrons must have proof that they are staying at the Salvation Army to get a library card (usually through a letter from the director).\n\nIn order to have the Limited Use restrictions removed from their account, a patron must first provide proof that they are living at a valid residential address.\n\nFor more info refer to the list of unacceptable addresses on the staff wiki:\nhttp://mplnet.pbworks.com/w/file/fetch/79700849/UNACCEPTABLE%20ADDRESSES.pdf\n\nIf this is a new address, enter your initials and library code to confirm: (e.g. LS/MAD)");
        if (!initial) initial = "";
        if (bn.value !== '') {
          bn.value += "\n\n";
        }
        bn.value += "Patron's account is Limited Use due to address (Salvation Army, 630 E Washington Ave). Patron must show proof of valid residential address in order to remove restrictions. " + curDate() + " " + initial;
        if (wasLU) alert('Please delete the circulation note regarding the patron\'s pervious limited use address');
      }
    }
    // Test for unacceptable addresses
    for (i = 0; i < unacceptable.length; i++) {
      if (foundBadAddr) {
        break;
      }
      fullAddrRegEx = new RegExp(addrRegExFirst.source + unacceptable[i].addrRegEx + addrRegExLast.source, "i");
      if (fullAddrRegEx.test(addrVal)) {
        alert("--- STOP ---\nA library card CANNOT be issued to this address.\n" + unacceptable[i].addr + " (" + unacceptable[i].place + ") is NOT a valid residential address.\n\nInform any patron providing this address that they must provide proof of a valid residential address in order to get a library card. (You could offer them an internet access card.)\n\nFor more info refer to the list of unacceptable addresses on the staff wiki:\nhttp://mplnet.pbworks.com/w/file/fetch/79700849/UNACCEPTABLE%20ADDRESSES.pdf");
        field = document.getElementsByClassName('action')[0];
        if (field !== null && field.children[0].value !== 'Override Block') {
          blockSubmit();
        }
        foundBadAddr = true;
      }
    }
    // Test for restricted addresses
    for (i = 0; i < restricted.length; i++) {
      if (foundBadAddr) {
        break;
      }
      fullAddrRegEx = new RegExp(addrRegExFirst.source + restricted[i].addrRegEx + addrRegExLast.source, "i");
      var noteTest = new RegExp(restricted[i].place + ".{3}" + restricted[i].addr + addrRegExLast.source, "i");
      if (fullAddrRegEx.test(addrVal)) {
        foundBadAddr = true;
        if (cc) {
          if (cc.value === "AD") {
            cc.value = "LU";
          } else if (cc.value === "JU") {
            cc.value = "LUJ";
          } else if (cc.value === "LU" || cc.value === "LUJ") {
            wasLU = true;
          }
        }
        if (field && field[0].children[0].value === 'Override Block') {
          restoreSave();
        }
        if (!noteTest.test(bn.value)) {
          initial = prompt("--- NOTE ---\nA library card issued to " + restricted[i].addr + " (" + restricted[i].place + ") must be LIMITED USE.\n\nIn order to have the limited use restrictions removed from their account, a patron must first provide proof that they are living at a valid residential address.\n\nFor more info refer to the list of unacceptable addresses on the staff wiki:\nhttp://mplnet.pbworks.com/w/file/fetch/79700849/UNACCEPTABLE%20ADDRESSES.pdf\n\nIf this is a new address, enter your initials and library code to confirm: (e.g. LS/MAD)");
          if (!initial) initial = "";
          if (bn.value !== '') {
            bn.value += "\n\n";
          }
          if (!initial) {
            initial = "";
          }
          bn.value += "Patron's account is Limited Use due to temporary residence at " + restricted[i].place + ", (" + restricted[i].addr + "). Patron must show proof of valid residential address in order to remove restrictions. " + curDate() + " " + initial;
          if (wasLU) alert('Please delete the circulation note regarding the patron\'s pervious limited use address');
        }
      }
    }
    if (!foundBadAddr) {
      if (field && field[0].children[0].value === 'Override Block') {
        restoreSave();
      }
      if (cc.value === "LU" && /Patron must show proof of valid residential address in order to remove restrictions/.test(bn.value)) {
        cc.value = "AD";
        alert('Please delete the circulation note regarding the patron\'s pervious limited use address');
      } else if (cc.value === "LUJ" && /Patron must show proof of valid residential address in order to remove restrictions/.test(bn.value)) {
        cc.value = "JU";
        alert('Please delete the circulation note regarding the patron\'s pervious limited use address');
      }
    }
  }
}

addr = document.getElementById('address');
if (addr !== null) {
  addr.addEventListener('blur', parseBadAddr);
}
city = document.getElementById('city');
if (city !== null) {
  city.addEventListener('blur', parseBadAddr);
}