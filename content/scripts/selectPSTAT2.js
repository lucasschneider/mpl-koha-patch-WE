"use strict";

/**
  * This script is used to look up the proper PSTAT (sort1) value
  * for a patron's record based on their address, using the US
  * Census Geocoder
  */

// Declare global variables
var addrElt = document.getElementById('address'),
  cityElt = document.getElementById('city'),
  cityElt2 = document.getElementById('B_city'),
  cityElt3 = document.getElementById('altcontactaddress3'),
  notice = document.createElement('div'),
  result = document.createElement('span'),
  userEnteredAddress,
  userEnteredCity,
  matchAddr4DistQuery,
  entryForm = document.forms.entryform,
  selectList = entryForm ? entryForm.elements.sort1 : null,
  zipElt = document.getElementById('zipcode'),
  zipEltB = document.getElementById('B_zipcode'),
  selected,
  matchAddr,
  sortID = "X-UND",
  generatedZip,
  exceptionQuery = false,
  secondPass = false,
  queryB = false;
  
// Initialize the notice and result messages for communicating success/failure
// and place them underneath the address field
notice.id = 'tractNotice';
notice.setAttribute('style', 'margin-top:.2em;margin-left:118px;font-style:italic;color:#c00;');
result.setAttribute('id', 'tractResult');
if (addrElt) {
  addrElt.parentElement.appendChild(notice);
}