"use strict";

/**
  * This script is used to look up the proper PSTAT (sort1) value
  * for a patron's record based on their address, using the US
  * Census Geocoder
  */

/*** INITIALIZATION : START ***/
  
// Declare global variables
var addrElt = document.getElementById('address'),
  addrEltAlt = document.getElementById('B_address'),
  cityElt = document.getElementById('city'),
  cityEltAlt = document.getElementById('B_city'),
  cityEltAltContact = document.getElementById('altcontactaddress3'),
  selectList = document.getElementsByName('sort1'),
  noticeElt = document.createElement('div'),
  timerElt = document.createElement('span');
  
// Set selectList to reference the element
selectList = (selectList.length > 0) ? selectList[0] : null;
  
// Initialize the notice and result messages for communicating success/failure
// and place them underneath the address field
noticeElt.id = 'tractNotice';
noticeElt.setAttribute('style', 'margin-top:.2em;margin-left:118px;font-style:italic;color:#c00;');
timerElt.setAttribute('id', 'timerElt');

if (addrElt) {
  addrElt.parentElement.appendChild(noticeElt);
}
/*** INITIALIZATION : END ***/

/*** FUNCTIONS : START ***/

/**
  * This function takes the address from an input field
  * and returns a plaintext address that can more easily
  * be interpreted by the Census Geocoder
  * 
  * addrElt: The html input field containing an address
  */
function cleanAddr(addrElt) {
  var i, addrParts, addrTrim;
  if (addrElt !== null) {
    addrParts = addrElt.value.toLowerCase().replace(/ cn?ty /i, ' co ').split(" ");
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
        addrTrim += "%20" + encodeURIComponent(addrParts[i]);
      }
    } else {
      addrTrim += "%20" + encodeURIComponent(addrParts[i]);
    }
  }
  return addrTrim;
}

/**
  * This function extracts the city from an input field
  * containing both the city and state abbreviation
  * by stripping non-alphabetic characters and removing
  * the last string separated by a space
  *
  * cityElt: The html input field containing a city and
  *          state abbreviation.
  */
function pullCity(cityElt) {
  var city = '',
    ctyArr,
    i;
  if (cityElt !== null) {
    ctyArr = cityElt.replace(/[^a-zA-Z 0-9]+/g, '').toLowerCase().split(' ');
    for (i = 0; i < ctyArr.length - 1; i++) {
      if (i === 0) {
        city += ctyArr[i];
      } else {
        city += " " + ctyArr[i];
      }
    }
  }
  return city;
}

/**
  * This function forces the city/state html input field
  * to display Madison as "MADISON WI" and allows users to
  * enter "mad" as a shortcut for "MADISON WI"
  */
function parseMadisonWI(cityElt) {
  if (/madison(,? wi(sconsin)?)?|mad/i.test(cityElt.value)) {
    cityElt.value = "MADISON WI";
  }
  cityElt.value = cityElt.value.replace(/,/, '');
}

/**
  * This funciton selects the PSTAT value based on the provided
  * he value of the PSTAT option, and the matching address
  * returned by the Geocoder.
  *
  * value:      The plaintext PSTAT value that would match the
  *             target option in the select list
  * matchAddr:  The matching address returned by the Geocoder
  */
function selectPSTAT(value, matchAddr) {
  if (selectList && value && matchAddr) {
    if (value == "D-X-SUN" || value == "X-UND") {
	  // Select the proper undetermined code if no value is
	  // currently in the select list
      if (selectList.value == '') {
        selectList.value = value;
      }
    } else {
      selectList.value = value;
      noticeElt.style.color = "#00c000;";
      noticeElt.textContent = ' [MATCH: ' + matchAddr + ']';
    }
  }
}

/**
  * This function selects the "Undetermined" PSTAT value for a
  * patron's library record.
  */
function selectUND() {
  if (addrElt && selectList && selectList.value === '') {
    selectList.value = "X-UND";
  }
}

/**
  * This is the main function used to send a data query to the US
  * Census Geocoder. The data returned determines the way in which
  * the PSTAT is selected (i.e. Census Tract Number for MPL, Voting
  * district for SUN, MOO, MID, and VER, or the County Subdivision
  * for everywhere else.
  */
function queryPSTAT() {
   queryPSTAT(false, false);
}

/**
  * This is the main function used to send a data query to the US
  * Census Geocoder. The data returned determines the way in which
  * the PSTAT is selected (i.e. Census Tract Number for MPL, Voting
  * district for SUN, MOO, MID, and VER, or the County Subdivision
  * for everywhere else.
  *
  * secondPass: if true, the query should be
  * performed with the previous term's census data
  */
function queryPSTAT(secondPass) {
  queryPSTAT(secondPass, false);
}

/**
  * This is the main function used to send a data query to the US
  * Census Geocoder. The data returned determines the way in which
  * the PSTAT is selected (i.e. Census Tract Number for MPL, Voting
  * district for SUN, MOO, MID, and VER, or the County Subdivision
  * for everywhere else.
  *
  * secondPass: if true, the query should be
  * performed with the previous term's census data
  *
  * secondaryAddrQuery: if true, the query should
  * be performed with the alternate address field rather than the
  * primary address field.
  *
  */
function queryPSTAT(secondPass, secondaryAddrQuery) {
  var targetAddr = secondaryAddrQuery ? addrEltAlt : addrElt,
    targetCity = secondaryAddrQuery ? cityEltAlt : cityElt;
    
  if (targetAddr.value !== "" && targetCity.value !== "" && selectList) {
    // Generate loading message
    noticeElt.textContent = "Searching, please wait: ";
    timerElt.textContent = '16';
    noticeElt.appendChild(timerElt);
    
    var timerListener = self.setInterval(() => {timer()}, 1000);
    function timer() {
      if (!isNaN(timerElt.textContent) && parseInt(timerElt.textContent) > 1) {
        timerElt.textContent = parseInt(timerElt.textContent)-1;
      } else if (!/MATCH/.test(noticeElt)) {
       clearInterval(timerListener);
       noticeElt.textContent = "[FAILED] Please search for PSTAT manually." ;
      }
    }
    
    // Send Geocoder Query
    browser.runtime.sendMessage({
      key: "queryGeocoder",
      URIencodedAddress: cleanAddr(targetAddr),
      address: targetAddr.value,
      city: pullCity(targetCity.value),
      isSecondPass: secondPass
    });
  }
}
/*** FUNCTIONS : END ***/

/*** EVENT LISTENERS : START ***/
// Query PSTAT if the address and city fields contain values
if (addrElt && cityElt) {
  
  addrElt.addEventListener('blur', function() {
    if (addrElt.value && cityElt.value) {
	    parseMadisonWI(cityElt);
      queryPSTAT();
    }
  });

  // Parse the city value for "MADISON WI"
  cityElt.addEventListener('blur', function() {
	  parseMadisonWI(cityElt);
    queryPSTAT();
  });
}

// Parse the city field of the alternate address for "MADISON WI"
if (cityEltAlt) {
  cityEltAlt.addEventListener('blur', function() {
    parseMadisonWI(this);
  });
}

// Parse the city field of ther alternate contact for "MADISON WI"
if (cityEltAltContact) {
  cityEltAltContact.addEventListener('blur', function() {
    parseMadisonWI(this);
  });
}
/*** EVENT LISTENERS : END ***/

/*** RUNTIME MESSAGE LISTENERS : START ***/

browser.runtime.onMessage.addListener(message => {
  if (message && message.key === "returnFactFinderData") {
    console.log({
      "key": "receivedGeocoderQuery",
      "matchAddr": message.matchAddr,
      "county": message.county,
      "countySub": message.countySub,
      "censusTract": message.censusTract,
      "zip": message.zip
    });
    
    selectPSTAT("D-"+censusTract, matchAddr)
  }
});

/*** RUNTIME MESSAGE LISTENERS : END ***/