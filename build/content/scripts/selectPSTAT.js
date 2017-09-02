"use strict";

/** Define global variables **/
var addrElt = document.getElementById('address'),
    cityElt = document.getElementById('city'),
    cityElt2 = document.getElementById('B_city'),
    cityElt3 = document.getElementById('altcontactaddress3'),
    notice = document.createElement('div'),
    result = document.createElement('span'),
    userEnteredAddress,
    userEnteredCity,
    matchAddr4DistQuery,
    selected;
notice.id = 'tractNotice';
notice.setAttribute('style', 'margin-top:.2em;margin-left:118px;font-style:italic;color:#c00;');
result.setAttribute('id', 'tractResult');

/**
 * This fuction cleans the user-entered address so that it can be more accurately
 * interpreted by the Census Geocoder.
 * 
 * addr: A plain-text address
 *
 * Returns the cleaned, plain-text address
 */
function cleanAddr(addr) {
  var i, addrParts, addrTrim;
  if (addr !== null) {
    addrParts = addr.value.toLowerCase().replace(/ cn?ty /i, ' co ').split(" ");
  }
  addrTrim = '';
  for (i = 0; i < addrParts.length; i++) {
    switch (addrParts[i]) {
      case "n":
        addrParts[i] = "north";
        break;
      case "e":
        addrParts[i] = "east";
        break;
      case "s":
        addrParts[i] = "south";
        break;
      case "w":
        addrParts[i] = "west";
        break;
      default:
        break;
    }
    if (i === 0) {
      addrTrim += encodeURIComponent(addrParts[i]);
    } else if (i === addrParts.length - 1) {
      if (!/\#?[0-9]+/.test(addrParts[i])) {
        addrTrim += "+" + encodeURIComponent(addrParts[i]);
      }
    } else {
      addrTrim += "+" + encodeURIComponent(addrParts[i]);
    }
  }
  return addrTrim;
}

/**
 * Extracts the city from the cit/state text field string
 *
 * city: The plaintext string including the user-entered city and state
 *
 * Returns: The extracted city from the city/state string
 */
function pullCity(city) {
  var cleanCity = '',
      cityArr,
      i;
  if (city !== null) {
    cityArr = city.replace(/[^a-zA-Z 0-9]+/g, '').toLowerCase().splitcc(' ');
    for (i = 0; i < cityArr.length - 1; i++) {
      if (i === 0) {
        cleanCity += cityArr[i];
      } else {
        cleanCity += " " + cityArr[i];
      }
    }
  }
  return cleanCity;
}

/**
 * Forces the city/state field in a patron's record to show up as
 * "MADISON WI" and allows staff to just type "mad" as a shortcut.
 */
function parseMadisonWI(elt) {
  if (/madison(,? wi(sconsin)?)?|mad/i.test(elt.value)) {
    elt.value = "MADISON WI";
  }
  elt.value = elt.value.replace(/,/, '');
}

if (cityElt2) {
  cityElt2.addEventListener('blur', function () {
    parseMadisonWI(this);
  });
}

if (cityElt3) {
  cityElt3.addEventListener('blur', function () {
    parseMadisonWI(this);
  });
}
