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
  zipElt = document.getElementById('zipcode'),
  zipEltAlt = document.getElementById('B_zipcode'),
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
  var address = "",
    addrParts;
  if (addrElt) {
     address = addrElt.value.trim().toLowerCase()
      .replace(/\./, '')
      .replace(/ cn?ty /i, ' co ')
      .replace(/ n /i, ' north ')
      .replace(/ s /i, ' south ')
      .replace(/ e /i, ' east ')
      .replace(/ w /i, ' west ');
      
    addrParts = address.split(" ");
    
    if (/^\#?[0-9]+$/.test(addrParts[addrParts.length-1])) {
      addrParts.pop();
    } else if (addrParts.length > 2 && 
        /^(\#|apt|bldg|fl(oor)?|ste|unit|r(oo)?m|dept)$/.test(addrParts[addrParts.length-2]) &&
        /^[0-9]+$/.test(addrParts[addrParts.length-1])) {
      addrParts.pop();
      addrParts.pop();
    }
    
    address = "";
    for (var i = 0; i < addrParts.length; i++) {
      if (i === 0) {
        address += addrParts[i];
      } else {
        address += "%20" + addrParts[i];
      }
    }
  }

  return address.replace(/\#/, '');
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
      noticeElt.style.color = "#00c000";
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
    noticeElt.style.color = "#c00c00";
    noticeElt.textContent = "Searching, please wait: ";
    timerElt.textContent = '16';
    noticeElt.appendChild(timerElt);
    
    var timerListener = self.setInterval(() => {timer()}, 1000);
    function timer() {
      if (!isNaN(timerElt.textContent) && parseInt(timerElt.textContent) > 1) {
        timerElt.textContent = parseInt(timerElt.textContent)-1;
      } else {
        clearInterval(timerListener);
        if (!/MATCH/.test(noticeElt.textContent)) {
          noticeElt.textContent = "[FAILED] Please search for PSTAT manually." ;
        }
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
  if (message && message.key === "returnCensusData") {
    var sortCode = "X-UND",
      errorMsg;    
    
    // Set PSTAT value
    switch(message.county) {
      // SCLS Counties
      case "Adams":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Columbia":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Dane":
        switch (message.countySub) {
          case "Madison city":
            if (message.censusTract) {
              sortCode = "D-" + message.censusTract;
            }
            break;
        }
      break;
      case "Green":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Portage":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Sauk":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Wood":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      
      // Other Counties
      case "Ashland":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Barron":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Bayfield":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Brown":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Buffalo":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Burnett":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Calumet":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Chippewa":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Clark":
        switch (message.countySub) {
          case "Beaver town":
            sortCode = "CL-BEA-T";
            break;
          case "Butler town":
            sortCode = "CL-BUT-T";
            break;
          case "Colby town":
            sortCode = "CL-COL-T";
            break;
          case "Curtiss village":
            sortCode = "CL-CUR-V";
            break;
          case "Dewhurst town":
            sortCode = "CL-DEW-T";
            break;
          case "Eaton town":
            sortCode = "CL-EAT-T";
            break;
          case "Foster town":
            sortCode = "CL-FOS-T";
            break;
          case "Fremont town":
            sortCode = "CL-FRE-T";
            break;
          case "Grant town":
            sortCode = "CL-GRA-T";
            break;
          case "Granton village":
            sortCode = "CL-GRN-V";
            break;
          case "Green Grove town":
            sortCode = "CL-GRG-T";
            break;
          case "Greenwood city":
            sortCode = "CL-GWD-C";
            break;
          case "Hendren town":
            sortCode = "CL-HEN-T";
            break;
          case "Hewett town":
            sortCode = "CL-HEW-T";
            break;
          case "Hixon town":
            sortCode = "CL-HIX-T";
            break;
          case "Hoard town":
            sortCode = "CL-HOA-T";
            break;
          case "Levis town":
            sortCode = "CL-LEV-T";
            break;
          case "Longwood town":
            sortCode = "CL-LWD-T";
            break;
          case "Loyal city":
            sortCode = "CL-LOY-C";
            break;
          case "Loyal town":
            sortCode = "CL-LOY-T";
            break;
          case "Lynn town":
            sortCode = "CL-LYN-T";
            break;
          case "Mayville town":
            sortCode = "CL-MAY-T";
            break;
          case "Mead town":
            sortCode = "CL-MEA-T";
            break;
          case "Mentor town":
            sortCode = "CL-MEN-T";
            break;
          case "Neillsville city":
            sortCode = "CL-NEI-C";
            break;
          case "Owen city":
            sortCode = "CL-OWN-C";
            break;
          case "Pine Valley town":
            sortCode = "CL-PIN-T";
            break;
          case "Reseburg town":
            sortCode = "CL-RES-T";
            break;
          case "Seif town":
            sortCode = "CL-SEI-T";
            break;
          case "Sherman town":
            sortCode = "CL-SHM-T";
            break;
          case "Sherwood town":
            sortCode = "CL-SHW-T";
            break;
          case "Thorp city":
            sortCode = "CL-THP-C";
            break;
          case "Thorp town":
            sortCode = "CL-THP-T";
            break;
          case "Unity town":
            sortCode = "CL-UNI-T";
            break;
          case "Warner town":
            sortCode = "CL-WAR-T";
            break;
          case "Washburn town":
            sortCode = "CL-WAS-T";
            break;
          case "Weston town":
            sortCode = "CL-WES-T";
            break;
          case "Withee town":
            sortCode = "CL-WIT-T";
            break;
          case "Withee village":
            sortCode = "CL-WIT-V";
            break;
          case "Worden town":
            sortCode = "CL-WOR-T";
            break;
          case "York town":
            sortCode = "CL-YOR-T";
            break;

          // Clark + Chippewa County
          case "Stanley city":
            sortCode = "CL-STA-C";
            break;
          
          // Clark + Marathon County
          case "Abbotsford city":
            sortCode = "CL-ABB-C";
            break;
          case: "Colby city":
            sortCode = "CL-COL-C";
            break;
          case "Dorchester village":
            sortCode = "CL-DOR-T":
            break;
          case "Unity village":
            sortCode = "CL-UNI-V";
            break;
        }
        break;
      case "Crawford":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Dodge":
        switch (message.countySub) {
          case "Ashippun town":
            sortCode = "DG-ASH-T";
            break;
          case "Beaver Dam city":
            sortCode = "DG-BDM-C";
            break;
          case "Beaver Dam village":
            sortCode = "DG-BDM-T";
            break;
          case "Brownsville village":
            sortCode = "DG-BRO-V";
            break;
          case "Burnett town":
            sortCode = "DG-BUR-T";
            break;
          case "Calamus town":
            sortCode = "DG-CAL-T";
            break;
          case "Chester town":
            sortCode = "DG-CHE-T";
            break;
          case "Clyman town":
            sortCode = "DG-CLY-T";
            break;
          case "Clyman village":
            sortCode = "DG-CLY-V";
            break;
          case "Elba town":
            sortCode = "DG-ELB-T";
            break;
          case "Emmet town":
            sortCode = "DG-EMM-T";
            break;
          case "Fox Lake city":
            sortCode = "DG-FXL-C";
            break;
          case "Fox Lake town":
            sortCode = "DG-FXL-T";
            break;
          case "Herman town":
            sortCode = "DG-HER-T";
            break;
          case "Horicon city":
            sortCode = "DG-HOR-C";
            break;
          case "Hubbard town":
            sortCode = "DG-HUB-T";
            break;
          case "Hustisford town":
            sortCode = "DG-HUS-T";
            break;
          case "Hustisford village":
            sortCode = "DG-HUS-V";
            break;
          case "Iron Ridge village":
            sortCode = "DG-IRO-V";
            break;
          case "Juneau city":
            sortCode = "DG-JUN-C";
            break;
          case "Kekoskee village":
            sortCode = "DG-KEK-V";
            break;
          case "Lebanon town":
            sortCode = "DG-LEB-T";
            break;
          case "Leroy town":
            sortCode = "DG-LER-T";
            break;
          case "Lomira town":
            sortCode = "DG-LOM-T";
            break;
          case "Lomira village":
            sortCode = "DG-LOM-V";
            break;
          case "Lowell town":
            sortCode = "DG-LOW-T";
            break;
          case "Lowell village":
            sortCode = "DG-LOW-V";
            break;
          case "Mayville city":
            sortCode = "DG-MAY-C";
            break;
          case "Neosho village":
            sortCode = "DG-NEO-V";
            break;
          case "Oak Grove town":
            sortCode = "DG-OAK-T";
            break;
          case "Portland town":
            sortCode = "DG-POR-T";
            break;
          case "Reeseville village":
            sortCode = "DG-REE-V";
            break;
          case "Rubicon town":
            sortCode = "DG-RUB-T";
            break;
          case "Shields town":
            sortCode = "DG-SHI-T";
            break;
          case "Theresa town":
            sortCode = "DG-THE-T";
            break;
          case "Theresa village":
            sortCode = "DG-THE-V";
            break;
          case "Trenton town":
            sortCode = "DG-TRE-T";
            break;
          case "Westford town":
            sortCode = "DG-WES-T";
            break;
          case "Williamstown town":
            sortCode = "DG-WIL-T";
            break;
           
          // Dodge + Columbia counties
          case "Columbus city":
            sortCode = "DG-COL-C";
            break;
          case "Randolph village":
            sortCode = "DG-RAN-V";
            break;
          
          // Dodge + Fond du Lac counties
          case "Waupun city":
            sortCode = "DG-WAU-C";
            break;
          
          // Dodge + Jefferson counties
          case "Watertown city":
            sortCode = "DG-WAT-C";
            break;
          
          // Dodge + Washington counties
          case "Hartford city":
            sortCode = "DG-HAR-T";
            break;
        }
        break;
      case "Door":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Douglas":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Dunn":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Eau Claire":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Florence":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Fond du Lac":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Forest":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Grant":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Green Lake":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Iowa":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Iron":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Jackson":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Jefferson":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Juneau":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Kenosha":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Kewaunee":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "La Crosse":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Lafayette":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Langlade":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Lincoln":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Manitowoc":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Marathon":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Marinette":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Marquette":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Menominee":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Milwaukee":
        errorMsg = "[FAILED] Library cards MAY NOT be issued to Milwaukee County residents.";
        break;
      case "Monroe":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Oconto":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Oneida":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Outagamie":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Ozaukee":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Pepin":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Pierce":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Polk":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Price":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Racine":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Richland":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Rock":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Rusk":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Sawyer":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Shawano":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Sheboygan":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "St. Croix":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Taylor":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Trempealeau":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Vernon":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Vilas":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Walworth":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Washburn":
        break;
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
      case "Washington":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Waukesha":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Waupaca":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Waushara":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
      case "Winnebago":
        switch (message.countySub) {
          case "":
            sortCode = "";
            break;
        }
        break;
    }
    
    // Set zipcode
    zipElt.value = message.zip;
    
    // Set PSTAT
    selectPSTAT(sortCode, message.matchAddr);
  }
});

/*** RUNTIME MESSAGE LISTENERS : END ***/