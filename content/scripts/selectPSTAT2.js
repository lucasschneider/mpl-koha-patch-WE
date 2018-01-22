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
  timerElt = document.createElement('span'),
  timerListener;
  
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
  * This function returns a custom message in lieu of printing the
  * generic [FAILED] notice.
  */
function showMsg(msg) {
  showMsg(msg, "#c00c00");
}
  
function showMsg(msg, color) {
  clearInterval(timerListener);
  noticeElt.style.color = color;
  noticeElt.textContent = msg;
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
    
    clearInterval(timerListener);
    timerListener = self.setInterval(() => {timer()}, 1000);
    function timer() {
      if (!isNaN(timerElt.textContent) && parseInt(timerElt.textContent) > 1) {
        timerElt.textContent = parseInt(timerElt.textContent)-1;
      } else {
        clearInterval(timerListener);
        if (!/MATCH/.test(noticeElt.textContent)) {
          showMsg("[FAILED] Please search for PSTAT manually.");
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
  switch (message.key) {
    case "returnCensusData":
      var sortCode,
        errorMsg;    
      // Set PSTAT value
      switch(message.county) {
        // SCLS Counties
        case "Adams":
          switch (message.countySub) {
            case "Adams city":
              sortCode = "A-ADM-C";
              break;
            case "Adams town":
              sortCode = "A-ADM-T";
              break;
            case "Big Flats town":
              sortCode = "A-BIG-T";
              break;
            case "Colburn town":
              sortCode = "A-COL-T";
              break;
            case "Dell Prairie town":
              sortCode = "A-DEL-T";
              break;
            case "Easton town":
              sortCode = "A-EST-T";
              break;
            case "Friendship village":
              sortCode = "A-FRN-V";
              break;
            case "Jackson town":
              sortCode = "A-JAK-T";
              break;
            case "Leola town":
              sortCode = "A-LEO-T";
              break;
            case "Lincoln town":
              sortCode = "A-LIN-T";
              break;
            case "Monroe town":
              sortCode = "A-MON-T";
              break;
            case "New Chester town":
              sortCode = "A-NCH-T";
              break;
            case "New Haven town":
              sortCode = "A-NHV-T";
              break;
            case "Preston town":
              sortCode = "A-PRS-T";
              break;
            case "Quincy town":
              sortCode = "A-QUI-T";
              break;
            case "Richfield town":
              sortCode = "A-RCH-T";
              break;
            case "Rome town":
              sortCode = "A-ROM-T";
              break;
            case "Springville town":
              sortCode = "A-SPV-T";
              break;
            case "Strongs Prairie town":
              sortCode = "A-STP-T";
              break;
            case "Wisconsin Dells city":
              sortCode = "A-WID-C";
              break;
          }
          break;
        case "Columbia":
          switch (message.countySub) {
            case "Arlington town":
              sortCode = "C-ARL-T";
              break;
            case "Arlington village":
              sortCode = "C-ARL-V";
              break;
            case "Caledonia town":
              sortCode = "C-CAL-T";
              break;
            case "Cambria village":
              sortCode = "C-CAM-V";
              break;
            case "Columbus city":
              sortCode = "C-COL-C";
              break;
            case "Columbus town":
              sortCode = "C-COL-T";
              break;
            case "Courtland town":
              sortCode = "C-COU-T";
              break;
            case "Dekorra town":
              sortCode = "C-DEK-T";
              break;
            case "Doylestown village":
              sortCode = "C-DOY-V";
              break;
            case "Fountain Prairie town":
              sortCode = "C-FP-T";
              break;
            case "Fall River village":
              sortCode = "C-FR-V";
              break;
            case "Friesland village":
              sortCode = "C-FRI-V";
              break;
            case "Fort Winnebago town":
              sortCode = "C-FW-T";
              break;
            case "Hampden town":
              sortCode = "C-HAM-T";
              break;
            case "Leeds town":
              sortCode = "C-LEE-T";
              break;
            case "Lewiston town":
              sortCode = "C-LEW-T";
              break;
            case "Lodi city":
              sortCode = "C-LOD-C";
              break;
            case "Lodi town":
              sortCode = "C-LOD-T";
              break;
            case "Lowville town":
              sortCode = "C-LOW-T";
              break;
            case "Marcellon town":
              sortCode = "C-MARC-T";
              break;
            case "Newport town":
              sortCode = "C-NEW-T";
              break;
            case "Otsego town":
              sortCode = "C-OTS-T";
              break;
            case "Pacific town":
              sortCode = "C-PAC-T";
              break;
            case "Pardeeville village":
              sortCode = "C-PAR-V";
              break;
            case "Portage city":
              sortCode = "C-POR-C";
              break;
            case "Poynette village":
              sortCode = "C-POY-V";
              break;
            case "Randolph town":
              sortCode = "C-RAN-T";
              break;
            case "Randolph village":
              sortCode = "C-RAN-VC";
              break;
            case "Rio village":
              sortCode = "C-RIO-V";
              break;
            case "Scott town":
              sortCode = "C-SCO-T";
              break;
            case "Springvale town":
              sortCode = "C-SPV-T";
              break;
            case "Wisconsin Dells city":
              sortCode = "C-WD-CC";
              break;
            case "West Point town":
              sortCode = "C-WP-T";
              break;
            case "Wyocena town":
              sortCode = "C-WYO-T";
              break;
            case "Wyocena village":
              sortCode = "C-WYO-V";
              break;
          }
          break;
        case "Dane":
          switch (message.countySub) {
            case "Albion town":
              sortCode = "D-ALB-T";
              break;
            case "Black Earth town":
              sortCode = "D-BE-T";
              break;
            case "Black Earth village":
              sortCode = "D-BE-V";
              break;
            case "Belleville village":
              sortCode = "D-BEL-VD";
              break;
            case "Berry town":
              sortCode = "D-BERR-T";
              break;
            case "Blooming Grove town":
              sortCode = "D-BG-T";
              break;
            case "Blue Mounds town":
              sortCode = "D-BM-T";
              break;
            case "Blue Mounds village":
              sortCode = "D-BM-V";
              break;
            case "Bristol town":
              sortCode = "D-BRI-T";
              break;
            case "Brooklyn village":
              sortCode = "D-BRO-VD";
              break;
            case "Burke town":
              sortCode = "D-BUR-T";
              break;
            case "Cambridge village":
              sortCode = "D-CAM-VD";
              break;
            case "Cottage Grove town":
              sortCode = "D-CG-T";
              break;
            case "Cottage Grove village":
              sortCode = "D-CG-V";
              break;
            case "Christiana town":
              sortCode = "D-CHR-T";
              break;
            case "Cross Plains town":
              sortCode = "D-CP-T";
              break;
            case "Cross Plains village":
              sortCode = "D-CP-V";
              break;
            case "Dane town":
              sortCode = "D-DAN-T";
              break;
            case "Dane village":
              sortCode = "D-DAN-V";
              break;
            case "Deerfield town":
              sortCode = "D-DEE-T";
              break;
            case "Deerfield village":
              sortCode = "D-DEE-V";
              break;
            case "DeForest village":
              sortCode = "D-DF-V";
              break;
            case "Dunkirk town":
              sortCode = "D-DUNK-T";
              break;
            case "Dunn town":
              sortCode = "D-DUNN-T";
              break;
            case "Fitchburg city":
              sortCode = "D-FIT-T";
              break;
            case "Madison city":
              if (message.censusTract) {
                sortCode = "D-" + message.censusTract;
              }
              break;
            case "Madison town":
              sortCode = "D-MAD-T";
              break;
            case "Marshall village":
              sortCode = "D-MARS-V";
              break;
            case "Mazomanie town":
              sortCode = "D-MAZ-T";
              break;
            case "Mazomanie village":
              sortCode = "D-MAZ-V";
              break;
            case "Maple Bluff village":
              sortCode = "D-MB-V";
              break;
            case "McFarland village":
              sortCode = "D-MCF-V";
              break;
            case "Medina town":
              sortCode = "D-MED-T";
              break;
            case "Mount Horeb village":
              sortCode = "D-MH-V";
              break;
            case "Middleton city":
              browser.runtime.sendMessage({
                key: "getPstatByDist",
                matchAddr: message.matchAddr,
                lib: "Mid"
              });
              break;
            case "Middleton town":
              sortCode = "D-MID-T";
              break;
            case "Monona city":
              browser.runtime.sendMessage({
                key: "getPstatByDist",
                matchAddr: message.matchAddr,
                lib: "Moo"
              });
              break;
            case "Montrose town":
              sortCode = "D-MONT-T";
              break;
            case "Oregon town":
              sortCode = "D-ORE-T";
              break;
            case "Oregon village":
              sortCode = "D-ORE-V";
              break;
            case "Perry town":
              sortCode = "D-PER-T";
              break;
            case "Primrose town":
              sortCode = "D-PRI-T";
              break;
            case "Pleasant Springs town":
              sortCode = "D-PS-T";
              break;
            case "Rockdale village":
              sortCode = "D-ROC-V";
              break;
            case "Roxbury town":
              sortCode = "D-ROX-T";
              break;
            case "Rutland town":
              sortCode = "D-RUT-T";
              break;
            case "Shorewood Hills village":
              sortCode = "D-SH-V";
              break;
            case "Sun Prairie city":
              browser.runtime.sendMessage({
                key: "getPstatByDist",
                matchAddr: message.matchAddr,
                lib: "Sun"
              });
              break;
            case "Sun Prairie town":
              sortCode = "D-SP-T";
              break;
            case "Springdale town":
              sortCode = "D-SPD-T";
              break;
            case "Springfield town":
              sortCode = "D-SPF-T";
              break;
            case "Stoughton city":
              sortCode = "D-STO-C1";
              break;
            case "Vermont town":
              sortCode = "D-VERM-T";
              break;
            case "Verona city":
              browser.runtime.sendMessage({
                key: "getPstatByDist",
                matchAddr: message.matchAddr,
                lib: "Ver"
              });
              break;
            case "Verona town":
              sortCode = "D-VERO-T";
              break;
            case "Vienna town":
              sortCode = "D-VIE-T";
              break;
            case "Waunakee village":
              sortCode = "D-WAU-V";
              break;
            case "Westport town":
              sortCode = "D-WESP-T";
              break;
            case "Windsor village":
              sortCode = "D-WIN-T";
              break;
            case "York town":
              sortCode = "D-YOR-TD";
              break;
          }
        break;
        case "Green":
          switch (message.countySub) {
            case "Adams town":
              sortCode = "G-ADA-T";
              break;
            case "Albany town":
              sortCode = "G-ALB-T2";
              break;
            case "Albany village":
              sortCode = "G-ALB-V";
              break;
            case "Belleville village":
              sortCode = "G-BEL-VG";
              break;
            case "Brooklyn town":
              sortCode = "G-BRO-T";
              break;
            case "Brooklyn village":
              sortCode = "G-BRO-VG";
              break;
            case "Brodhead city":
              sortCode = "G-BROD-C";
              break;
            case "Browntown village": // Don't use G-BROW-V per SCLS PSTAT spreadsheet
            case "Clarno town": // Don't use G-CLA-T per SCLS PSTAT spreadsheet
            case "Monroe city": // Don't use G-MONR-C per SCLS PSTAT spreadsheet
              sortCode = "G-MRO-SD";
              break;
            case "Cadiz town":
              sortCode = "G-CAD-T";
              break;
            case "Decatur town":
              sortCode = "G-DEC-T";
              break;
            case "Exeter town":
              sortCode = "G-EXE-T";
              break;
            case "Jefferson town":
              sortCode = "G-JEF-T";
              break;
            case "Jordan town":
              sortCode = "G-JOR-T";
              break;
            case "Monroe town":
              sortCode = "G-MONR-T";
              break;
            case "Monticello village":
              sortCode = "G-MONT-V";
              break;
            case "Mount Pleasant town":
              sortCode = "G-MP-T";
              break;
            case "New Glarus town":
              sortCode = "G-NG-T";
              break;
            case "New Glarus village":
              sortCode = "G-NG-V";
              break;
            case "Spring Grove town":
              sortCode = "G-SGO-T";
              break;
            case "Sylvester town":
              sortCode = "G-SYL-T";
              break;
            case "Washington town":
              sortCode = "G-WAS-TG";
              break;
            case "York town":
              sortCode = "G-YOR-TG";
              break;
          }
          break;
        case "Portage":
          switch (message.countySub) {
            case "Alban town":
              sortCode = "P-ALB-T";
              break;
            case "Almond town":
              sortCode = "P-ALM-T";
              break;
            case "Almond village":
              sortCode = "P-ALM-V";
              break;
            case "Amherst town":
              sortCode = "P-AMH-T";
              break;
            case "Amherst village":
              sortCode = "P-AMH-V";
              break;
            case "Amherst Junction village":
              sortCode = "P-AMJ-V";
              break;
            case "Belmont town":
              sortCode = "P-BEL-T";
              break;
            case "Buena Vista town":
              sortCode = "P-BUV-T";
              break;
            case "Carson town":
              sortCode = "P-CAR-T";
              break;
            case "Dewey town":
              sortCode = "P-DEW-T";
              break;
            case "Eau PLeine town":
              sortCode = "P-EPL-T";
              break;
            case "Grant town":
              sortCode = "P-GRT-T";
              break;
            case "Hull town":
              sortCode = "P-HUL-T";
              break;
            case "Junction City village":
              sortCode = "P-JNC-V";
              break;
            case "Lanark town":
              sortCode = "P-LAN-T";
              break;
            case "Linwood town":
              sortCode = "P-LIN-T";
              break;
            case "Nelsonville village":
              sortCode = "P-NEL-V";
              break;
            case "New Hope town":
              sortCode = "P-NHP-T";
              break;
            case "Pine Grove town":
              sortCode = "P-PIN-T";
              break;
            case "Park Ridge village":
              sortCode = "P-PKR-V";
              break;
            case "Plover town":
              sortCode = "P-PLO-T";
              break;
            case "Plover village":
              sortCode = "P-PLO-V";
              break;
            case "Rosholt village":
              sortCode = "P-ROS-V";
              break;
            case "Sharon town":
              sortCode = "P-SHA-T";
              break;
            case "Stockton town":
              sortCode = "P-STO-T";
              break;
            case "Stevens Point city":
              sortCode = "P-STP-C";
              break;
            case "Whiting village":
              sortCode = "P-WHI-V";
              break;
          }
          break;
        case "Sauk":
          switch (message.countySub) {
            case "Baraboo city":
              sortCode = "S-BAR-C1";
              break;
            case "Baraboo town":
              sortCode = "S-BAR-T";
              break;
            case "Bear Creek town":
              sortCode = "S-BC-T";
              break;
            case "Cazenovia village":
              sortCode = "S-CAZ-V";
              break;
            case "Dellona town":
              sortCode = "S-DELL-T";
              break;
            case "Delton town":
              sortCode = "S-DELT-T";
              break;
            case "Excelsior town":
              sortCode = "S-EXC-T";
              break;
            case "Fairfield town":
              sortCode = "S-FAI-T";
              break;
            case "Franklin town":
              sortCode = "S-FRA-T";
              break;
            case "Freedom town":
              sortCode = "S-FRE-T";
              break;
            case "Greenfield town":
              sortCode = "S-GRE-T";
              break;
            case "Honey Creek town":
              sortCode = "S-HC-T";
              break;
            case "Hillpoint village":
              sortCode = "S-HILL-V";
              break;
            case "Ironton town":
              sortCode = "S-IRO-T";
              break;
            case "Ironton village":
              sortCode = "S-IRO-V";
              break;
            case "Lake Delton village":
              sortCode = "S-LD-V";
              break;
            case "Loganville village":
              sortCode = "S-LOG-V";
              break;
            case "Lime Ridge village":
              sortCode = "S-LR-V";
              break;
            case "La Valle town":
              sortCode = "S-LV-T";
              break;
            case "La Valle village":
              sortCode = "S-LV-V";
              break;
            case "Merrimac town":
              sortCode = "S-MER-T";
              break;
            case "Merrimac village":
              sortCode = "S-MER-V";
              break;
            case "North Freedom village":
              sortCode = "S-NF-V";
              break;
            case "Prairie du Sac town":
              sortCode = "S-PDS-T";
              break;
            case "Prairie du Sac village":
              sortCode = "S-PDS-V";
              break;
            case "Plain village":
              sortCode = "S-PLA-V";
              break;
            case "Reedsburg city":
              sortCode = "S-REE-C";
              break;
            case "Reedsburg town":
              sortCode = "S-REE-T";
              break;
            case "Rock Springs village":
              sortCode = "S-RS-V";
              break;
            case "Sauk City village":
              sortCode = "S-SC-V";
              break;
            case "Spring Green town":
              sortCode = "S-SGE-T";
              break;
            case "Spring Green village":
              sortCode = "S-SGE-V";
              break;
            case "Sumpter town":
              sortCode = "S-SUM-T";
              break;
            case "Troy town":
              sortCode = "S-TRO-T";
              break;
            case "Washington town":
              sortCode = "S-WAS-TS";
              break;
            case "West Baraboo village":
              sortCode = "S-WB-V";
              break;
            case "Wisconsin Dells city":
              sortCode = "S-WD-CS";
              break;
            case "Westfield town":
              sortCode = "S-WESF-T";
              break;
            case "Winfield town":
              sortCode = "S-WIN-T2";
              break;
            case "Woodland town":
              sortCode = "S-WOO-T";
              break;
          }
          break;
        case "Wood":
          switch (message.countySub) {
            case "Arpin town":
              sortCode = "W-ARP-T";
              break;
            case "Arpin village":
              sortCode = "W-ARP-V";
              break;
            case "Auburndale town":
              sortCode = "W-AUB-T";
              break;
            case "Auburndale village":
              sortCode = "W-AUB-V";
              break;
            case "Biron village":
              sortCode = "W-BIR-V";
              break;
            case "Cameron town":
              sortCode = "W-CAM-T";
              break;
            case "Cary town":
              sortCode = "W-CAR-T";
              break;
            case "Cranmoor town":
              sortCode = "W-CRAN-T";
              break;
            case "Dexter town":
              sortCode = "W-DEX-T";
              break;
            case "Grand Rapids town":
              sortCode = "W-GRAP-T";
              break;
            case "Hansen town":
              sortCode = "W-HAN-T";
              break;
            case "Hewitt village":
              sortCode = "W-HEW-V";
              break;
            case "Hiles town":
              sortCode = "W-HIL-T";
              break;
            case "Lincoln town":
              sortCode = "W-LIN-T";
              break;
            case "Marshfield city":
              sortCode = "W-MAR-C";
              break;
            case "Marshfield town":
              sortCode = "W-MAR-T";
              break;
            case "Milladore town":
              sortCode = "W-MILL-T";
              break;
            case "Milladore village":
              sortCode = "W-MILL-V";
              break;
            case "Nekoosa city":
              sortCode = "W-NEK-C";
              break;
            case "Port Edwards town":
              sortCode = "W-PE-T";
              break;
            case "Port Edwards village":
              sortCode = "W-PE-V";
              break;
            case "Pittsville city":
              sortCode = "W-PIT-C";
              break;
            case "Richfield town":
              sortCode = "W-RCH-T";
              break;
            case "Remington town":
              sortCode = "W-REM-T";
              break;
            case "Rock town":
              sortCode = "W-ROC-T";
              break;
            case "Rudolph town":
              sortCode = "W-RUD-T";
              break;
            case "Rudolph village":
              sortCode = "W-RUD-V";
              break;
            case "Saratoga town":
              sortCode = "W-SARA-T";
              break;
            case "Seneca town":
              sortCode = "W-SENE-T";
              break;
            case "Sherry town":
              sortCode = "W-SHR-T";
              break;
            case "Sigel town":
              sortCode = "W-SIG-T";
              break;
            case "Vesper village":
              sortCode = "W-VESP-V";
              break;
            case "Wisconsin Rapids city":
              sortCode = "W-WSRP-C";
              break;
            case "Wood town":
              sortCode = "W-WOD-T";
              break;
          }
          break;
          
        // REMOVE THE SECTION BELOW WHEN THE PSTAT CHANGES GO LIVE //
        /*** ARROWHEAD LIBRARY SYSTEM ***/
        case "Rock":
          // Has with/without library option
          switch (message.countySub) {
            case "Beloit city":
              sortCode = "O-ALS-BEL-C";
              break;
            case "Brodhead city":
              sortCode = "O-ALS-BRD-C";
              break;
            case "Clinton village":
              sortCode = "O-ALS-CLI-V";
              break;
            case "Edgerton city":
              sortCode = "O-ALS-EDG-C";
              break;
            case "Evansville city":
              sortCode = "O-ALS-EVA-C";
              break;
            case "Janesville city":
              sortCode = "O-ALS-JAN-C";
              break;
            case "Milton city":
              sortCode = "O-ALS-MIL-C";
              break;
            case "Orfordville city":
              sortCode = "O-ALS-ORF-C";
              break;
            default:
              showMsg('[FAILED: Manually select sort option "Rock County" with or w/out library.]');
              break;
          }
          break;

          /*** EASTERN SHORES LIBRARY SYSTEM ***/
        case "Ozaukee":
        case "Sheboygan":
          sortCode = "O-ESLS";
          break;

          /*** INDIANHEAD FEDERATED LIBRARY SYSTEM ***/
        case "Barron":
        case "Chippewa":
        case "Dunn":
        case "Eau Claire":
        case "Pepin":
        case "Pierce":
        case "Polk":
        case "Prince":
        case "Rusk":
        case "St Croix":
          sortCode = "O-IFLS";
          break;

          /*** KENOSHA COUNTY LIBRARY SYSTEM ***/
        case "Kenosha":
          sortCode = "O-KCLS";
          break;

          /*** LAKESHORES LIBRARY SYSTEM ***/
        case "Racine":
        case "Walworth":
          sortCode = "O-LLS";
          break;

          /*** MANITOWOC-CALUMET LIBRARY SYSTEM ***/
        case "Calumet":
        case "Manitowoc":
          sortCode = "O-MCLS";
          break;

          /*** MILWAUKEE COUNTY FEDERATED LIBRARY SYSTEM ***/
        case "Milwaukee":
          showMsg('[FAILED: Do NOT issue a library card to Milwaukee County patrons.]');
          break;

          /*** MID-WISCONSIN FEDERATED LIBRARY SYSTEM ***/
        case "Dodge":
          // Has with/without library option
          switch (message.countySub) {
            case "Ashippun town":
              sortCode = "O-MWFLS-ASH";
              break;
            case "Beaver Dam city":
              sortCode = "O-MWFLS-BVC";
              break;
            case "Beaver Dam town":
              sortCode = "O-MWFLS-BVT";
              break;
            case "Brownsville village":
              sortCode = "O-MWFLS-BRV";
              break;
            case "Burnett town":
              sortCode = "O-MWFLS-BRT";
              break;
            case "Calamus town":
              sortCode = "O-MWFLS-CALT";
              break;
            case "Chester town":
              sortCode = "O-MWFLS-CHE";
              break;
            case "Clyman town":
              sortCode = "O-MWFLS-CLYT";
              break;
            case "Clyman village":
              sortCode = "O-MWFLS-CLYV";
              break;
            case "Elba town":
              sortCode = "O-MWFLS-ELBT";
              break;
            case "Emmet town":
              sortCode = "O-MWFLS-EMM";
              break;
            case "Fox Lake city":
              sortCode = "O-MWFLS-FXC";
              break;
            case "Fox Lake town":
              sortCode = "O-MWFLS-FXT";
              break;
            case "Hartford city":
              sortCode = "O-MWFLS-HAR";
              break;
            case "Herman town":
              sortCode = "O-MWFLS-HRT";
              break;
            case "Horicon city":
              sortCode = "O-MWFLS-HORC";
              break;
            case "Hubbard town":
              sortCode = "O-MWFLS-HBT";
              break;
            case "Hustisford town":
              sortCode = "O-MWFLS-HUST";
              break;
            case "Hustisford village":
              sortCode = "O-MWFLS-HUSV";
              break;
            case "Iron Ridge village":
              sortCode = "O-MWFLS-IRV";
              break;
            case "Juneau city":
              sortCode = "O-MWFLS-JUNC";
              break;
            case "Kekoskee village":
              sortCode = "O-MWFLS-KEK";
              break;
            case "Lebanon town":
              sortCode = "O-MWFLS-LBT";
              break;
            case "Leroy town":
              sortCode = "O-MWFLS-LER";
              break;
            case "Lomira town":
              sortCode = "O-MWFLS-LOMT";
              break;
            case "Lomira village":
              sortCode = "O-MWFLS-LOMV";
              break;
            case "Lowell town":
              sortCode = "O-MWFLS-LOWT";
              break;
            case "Lowell village":
              sortCode = "O-MWFLS-LOWV";
              break;
            case "Mayville city":
              sortCode = "O-MWFLS-MYC";
              break;
            case "Neosho village":
              sortCode = "O-MWFLS-NEO";
              break;
            case "Oak Grove town":
              sortCode = "O-MWFLS-OGT";
              break;
            case "Portland town":
              sortCode = "O-MWFLS-PRT";
              break;
            case "Randolph village":
              sortCode = "O-MWFLS-RANV";
              break;
            case "Reeseville village":
              sortCode = "O-MWFLS-RESV";
              break;
            case "Rubicon town":
              sortCode = "O-MWFLS-RUB";
              break;
            case "Shields town":
              sortCode = "O-MWFLS-SHT";
              break;
            case "Theresa town":
              sortCode = "O-MWFLS-THE";
              break;
            case "Theresa village":
              sortCode = "O-MWFLS-THV";
              break;
            case "Trenton town":
              sortCode = "O-MWFLS-TRE";
              break;
            case "Watertown city":
              sortCode = "O-MWFLS-WD";
              break;
            case "Waupun city":
              sortCode = "O-MWFLS-WP";
              break;
            case "Westford town":
              sortCode = "O-MWFLS-WSTT";
              break;
            case "Williamstown town":
              sortCode = "O-MWFLS-WIL";
              break;
            default:
              showMsg('[FAILED: Manually select sort option "Dodge County" with or w/out library.]');
              break;
          }
          break;
        case "Jefferson":
          // Has with/without library option
          switch (message.countySub) {
            case "Aztalan town":
              sortCode = "O-MWFLS-AZT";
              break;
            case "Cambridge village":
              sortCode = "O-MWFLS-CV";
              break;
            case "Cold Spring town":
              sortCode = "O-MWFLS-CSP";
              break;
            case "Concord town":
              sortCode = "O-MWFLS-CON";
              break;
            case "Farmington town":
              sortCode = "O-MWFLS-FAR";
              break;
            case "Fort Atkinson city":
              sortCode = "O-MWFLS-FC";
              break;
            case "Hebron Town":
              sortCode = "O-MWFLS-HEB";
              break;
            case "Helenville town":
              sortCode = "O-MWFLS-HLV";
              break;
            case "Ixonia town":
              sortCode = "O-MWFLS-IXT";
              break;
            case "Jefferson city":
              sortCode = "O-MWFLS-JC";
              break;
            case "Jefferson town":
              sortCode = "O-MWFLS-JFT";
              break;
            case "Johnson Creek village":
              sortCode = "O-MWFLS-JO";
              break;
            case "Koshkonong town":
              sortCode = "O-MWFLS-KOS";
              break;
            case "Lac La Belle village":
              sortCode = "O-MWFLS-LLB";
              break;
            case "Lake Mills city":
              sortCode = "O-MWFLS-LC";
              break;
            case "Lake Mills town":
              sortCode = "O-MWFLS-LT";
              break;
            case "Milford town":
              sortCode = "O-MWFLS-MIL";
              break;
            case "Oakland town":
              sortCode = "O-MWFLS-OT";
              break;
            case "Palmyra town":
              sortCode = "O-MWFLS-PAL";
              break;
            case "Palmyra village":
              sortCode = "O-MWFLS-PA";
              break;
            case "Sullivan town":
              sortCode = "O-MWFLS-SLT";
              break;
            case "Sullivan village":
              sortCode = "O-MWFLS-SLV";
              break;
            case "Sumner town":
              sortCode = "O-MWFLS-ST";
              break;
            case "Waterloo city":
              sortCode = "O-MWFLS-WC";
              break;
            case "Waterloo town":
              sortCode = "O-MWFLS-WL";
              break;
            case "Watertown city":
              sortCode = "O-MWFLS-WT";
              break;
            case "Watertown town":
              sortCode = "O-MWFLS-WATT";
              break;
            case "Whitewater city":
              sortCode = "O-MWFLS-WW";
              break;
            default:
              showMsg('[FAILED: Manually select sort option "Jefferson County" with or w/out library.]');
              break;
          }
          break;
        case "Washington":
          sortCode = "O-MWFLS";
          break;

          /*** NICOLET FEDERATED LIBRARY SYSTEM ***/
        case "Brown":
        case "Door":
        case "Florence":
        case "Kewaunee":
        case "Marinette":
        case "Menominee":
        case "Oconto":
        case "Shawano":
          sortCode = "O-NFLS";
          break;

          /*** NORTHERN WATERS LIBRARY SYSTEM ***/
        case "Ashland":
        case "Bayfield":
        case "Burnett":
        case "Douglas":
        case "Iron":
        case "Sawyer":
        case "Vilas":
        case "Washburn":
          sortCode = "O-NWLS";
          break;

          /*** OUTAGAMIE-WAUPACA LIBRARY SYSTEM ***/
          // Has with/without library option
        case "Outagamie":
          sortCode = "O-OWLS";
          break;
        case "Waupaca":
          showMsg('[FAILED: Manually select sort option "Waupaca County" with or w/out library.]');
          break;

          /*** SOUTH WEST LIBRARY SYSTEM ***/
        case "Iowa":
          // Has with/without library option
          switch (message.countySub) {
            case "Arena town":
              sortCode = "O-SWLS-ART";
              break;
            case "Arena village":
              sortCode = "O-SWLS-ARV";
              break;
            case "Avoca village":
              sortCode = "O-SWLS-AVV";
              break;
            case "Barneveld village":
              sortCode = "O-SWLS-BAV";
              break;
            case "Blanchardville village":
              sortCode = "O-SWLS-BLA";
              break;
            case "Brigham town":
              sortCode = "O-SWLS-BRT";
              break;
            case "Clyde town":
              sortCode = "O-SWLS-CLT";
              break;
            case "Dodgeville City":
              sortCode = "O-SWLS-DOC";
              break;
            case "Dodgeville town":
              sortCode = "O-SWLS-DOT";
              break;
            case "Hollandale village":
              sortCode = "O-SWLS-HOV";
              break;
            case "Highland town":
              sortCode = "O-SWLS-HIT";
              break;
            case "Mineral Point city":
              sortCode = "O-SWLS-MPC";
              break;
            case "Mineral Point town":
              sortCode = "O-SWLS-MPT";
              break;
            case "Moscow town":
              sortCode = "O-SWLS-MOT";
              break;
            case "Pulaksi town":
              sortCode = "O-SWLS-PUT";
              break;
            case "Ridgeway town":
              sortCode = "O-SWLS-RID";
              break;
            case "Ridgeway village":
              sortCode = "O-SWLS-RIDV";
              break;
            case "Waldwick town":
              sortCode = "O-SWLS-WLT";
              break;
            case "Wyoming town":
              sortCode = "O-SWLS-WYT";
              break;
            default:
              showMsg('[FAILED: Manually select sort option "Iowa County" with or w/out library.]');
              break;
          }
          break;
        case "Lafayette":
          // Has with/without library option
          switch (message.countySub) {
            case "Blanchardville village":
              sortCode = "O-SWLS-BLA";
              break;
            default:
              showMsg('[FAILED: Manually select sort option "Lafayette County" with or w/out library.]');
              break;
          }
          break;
        case "Richland":
          // Has with/without library option
          switch (message.countySub) {
            case "Buena Vista town":
              sortCode = "O-WLS-BUFT";
              break;
            case "Cazenovia village":
              sortCode = "O-SWLS-CAV";
              break;
            case "Ithaca town":
              sortCode = "O-SWLS-ITT";
              break;
            case "Lone Rock village":
              sortCode = "O-SWLS-LRV";
              break;
            case "Orion town":
              sortCode = "O-SWLS-ORT";
              break;
            case "Richland Center city":
              sortCode = "O-SWLS";
              break;
            case "Richland town":
              sortCode = "O-SWLS-RIT";
              break;
            case "Westford town":
              sortCode = "O-SWLS-WET";
              break;
            case "Willow town":
              sortCode = "O-SWLS-WIT";
              break;
            default:
              showMsg('[FAILED: Manually select sort option "Richland County" with or w/out library.]');
              break;
          }
          break;
        case "Crawford":
        case "Grant":
          sortCode = "O-SWLS";
          break;

          /*** WAUKESHA COUNTY FEDERATED LIBRARY SYSTEM ***/
        case "Waukesha":
          sortCode = "O-WCFLS";
          break;

          /*** WINNEFOX LIBRARY SYSTEM ***/
        case "Green Lake":
          // Has with/without library option
          switch (message.countySub) {
            case "Berlin city":
              sortCode = "O-WLS-BLC";
              break;
            case "Green Lake city":
              sortCode = "O-WLS-GLC";
              break;
            case "Kingston town":
              sortCode = "O-WLS-KNGT";
              break;
            case "Kingston village":
              sortCode = "O-WLS-KNGV";
              break;
            case "Mackford town":
              sortCode = "O-WLS-MCKT";
              break;
            case "Manchester town":
              sortCode = "O-WLS-MANT";
              break;
            case "Markesan city":
              sortCode = "O-WLS-MKC";
              break;
            case "Princeton city":
              sortCode = "O-WLS-PRC";
              break;
            default:
              showMsg('[FAILED: Manually select sort option "Green Lake County" with or w/out library.]');
              break;
          }
          break;
        case "Marquette":
          // Has with/without library option
          switch (message.countySub) {
            case "Buffalo town":
              sortCode = "O-WLS-BUFT";
              break;
            case "Douglas town":
              sortCode = "O-WLS-DUGT";
              break;
            case "Endeavor village":
              sortCode = "O-WLS-ENV";
              break;
            case "Montello city":
              sortCode = "O-WLS-MONV";
              break;
            case "Montello town":
              sortCode = "O-WLS-MONT";
              break;
            case "Moundville town":
              sortCode = "O-WLS-MOUT";
              break;
            case "Neshkoro village":
              sortCode = "O-WLS-NSKV";
              break;
            case "Oxford town":
              sortCode = "O-WLS-OXT";
              break;
            case "Oxford village":
              sortCode = "O-WLS-OXV";
              break;
            case "Packwaukee town":
              sortCode = "O-WLS-PCKT";
              break;
            case "Westfield village":
              sortCode = "O-WLS-WSFV";
              break;
            default:
              showMsg('[FAILED: Manually select sort option "Marquette County" with or w/out library.]');
              break;
          }
          break;
          // Has with/without library option
        case "Waushara":
          showMsg('[FAILED: Manually select sort option "Waushara County" with or w/out library.]');
          break;
        case "Fond du Lac":
        case "Winnebago":
          sortCode = "O-WLS";
          break;

          /*** WINDING RIVERS LIBRARY SYSTEM ***/
        case "Juneau":
          // Has with/without library option
          switch (message.countySub) {
            case "Elroy city":
              sortCode = "O-WRLS-ELC";
              break;
            case "Kildare town":
              sortCode = "O-WRLS-KILDT";
              break;
            case "Lyndon town":
              sortCode = "O-WRLS-LYNT";
              break;
            case "Mauston city":
              sortCode = "O-WRLS-MAUC";
              break;
            case "Necedah Village":
              sortCode = "O-WRLS-NECV";
              break;
            case "New Lisbon city":
              sortCode = "O-WRLS-NLC";
              break;
            case "Seven Mile Creek town":
              sortCode = "O-WRLS-7MCT";
              break;
            case "Wonewoc village":
              sortCode = "O-WRLS-WWV";
              break;
            default:
              showMsg('[FAILED: Manually select sort option "Juneau County" with or w/out library.]');
              break;
          }
          break;
          // Has with/without library option
        case "Jackson":
          showMsg('[FAILED: Manually select sort option "Jackson County" with or w/out library.]');
          break;
          // Has with/without library option
        case "Vernon":
          showMsg('[FAILED: Manually select sort option "Vernon County" with or w/out library.]');
          break;
        case "Buffalo":
        case "La Crosse":
        case "Monroe":
        case "Trempealeau":
          sortCode = "O-WRLS";
          break;

          /*** WISCONSIN VALLEY LIBRARY SYSTEM ***/
        case "Marathon":
          sortCode = "O-WVLS-MNLI";
          break;
          // Has with/without library option
        case "Clark":
          showMsg('[FAILED: Manually select sort option "Clark County" with or w/out library.]');
          break;
        case "Forest":
        case "Langlade":
        case "Lincoln":
        case "Oneida":
        case "Taylor":
          sortCode = "O-WVLS";
          break;
        // REMOVE THE SECTION ABOVE WHEN THE PSTAT CHANGES GO LIVE //
        
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
            case "Colby city":
              sortCode = "CL-COL-C";
              break;
            case "Dorchester village":
              sortCode = "CL-DOR-V";
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
            case "Berlin town":
              sortCode = "GL-BER-T";
              break;
            case "Brooklyn town":
              sortCode = "GL-BRO-T";
              break;
            case "Green Lake city":
              sortCode = "GL-GLK-C";
              break;
            case "Green Lake town":
              sortCode = "GL-GLK-T";
              break;
            case "Kingston town":
              sortCode = "GL-KIN-T";
              break;
            case "Kingston village":
              sortCode = "GL-KIN-V";
              break;
            case "Mackford town":
              sortCode = "GL-MAC-T";
              break;
            case "Manchester town":
              sortCode = "GL-MAN-T";
              break;
            case "Markesan city":
              sortCode = "GL-MKN-C";
              break;
            case "Marquette town":
              sortCode = "GL-MRQ-T";
              break;
            case "Marquette village":
              sortCode = "GL-MRQ-V";
              break;
            case "Princeton city":
              sortCode = "GL-PRI-C";
              break;
            case "Princeton town":
              sortCode = "GL-PRI-T";
              break;
            case "Seneca town":
              sortCode = "GL-SEN-T";
              break;
            case "St. Marie town":
              sortCode = "GL-STM-T";
              break;
            // Green Lake + Waushara counties
            case "Berlin city":
              sortCode = "GL-BER-C";
              break;
          }
          break;
        case "Iowa":
          switch (message.countySub) {
            case "Arena town":
              sortCode = "IO-ART-T";
              break;
            case "Arena village":
              sortCode = "IO-ARE-V";
              break;
            case "Avoca village":
              sortCode = "IO-AVO-V";
              break;
            case "Barneveld village":
              sortCode = "IO-BAR-V";
              break;
            case "Brigham town":
              sortCode = "IO-BRI-T";
              break;
            case "Clyde town":
              sortCode = "IO-CLY-T";
              break;
            case "Cobb village":
              sortCode = "IO-COB-T";
              break;
            case "Dodgeville city":
              sortCode = "IO-DGV-C";
              break;
            case "Dodgeville town":
              sortCode = "IO-DGV-T";
              break;
            case "Eden town":
              sortCode = "IO-EDN-T";
              break;
            case "Highland town":
              sortCode = "IO-HGH-T";
              break;
            case "Highland village":
              sortCode = "IO-HGH-V";
              break;
            case "Hollandale village":
              sortCode = "IO-HOL-V";
              break;
            case "Linden town":
              sortCode = "IO-LIN-T";
              break;
            case "Linden village":
              sortCode = "IO-LIN-V";
              break;
            case "Mifflin town":
              sortCode = "IO-MIF-T";
              break;
            case "Mineral Point city":
              sortCode = "IO-MNP-C";
              break;
            case "Mineral Point town":
              sortCode = "IO-MNP-T";
              break;
            case "Moscow town":
              sortCode = "IO-MOS-T";
              break;
            case "Pulaski town":
              sortCode = "IO-PUL-T";
              break;
            case "Rewey village":
              sortCode = "IO-REW-V";
              break;
            case "Ridgeway town":
              sortCode = "IO-RDG-T";
              break;
            case "Ridgeway village":
              sortCode = "IO-RDG-V";
              break;
            case "Waldwick town":
              sortCode = "IO-WAL-T";
              break;
            case "Wyoming town":
              sortCode = "IO-WYO-T";
              break;
            // Iowa + Grant counties
            case "Livingston village":
              sortCode = "IO-LIV-V";
              break;
            case "Montfort village":
              sortCode = "IO-MON-V";
              break;
            case "Muscoda village":
              sortCode = "IO-MUS-V";
              break;
            // Iowa + Lafayette counties
            case "Blanchardville village":
              sortCode = "IO-BLA-V";
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
            case "Adams town":
              sortCode = "JK-ADA-T";
              break;
            case "Albion town":
              sortCode = "JK-ALB-T";
              break;
            case "Alma Center village":
              sortCode = "JK-ACT-T";
              break;
            case "Alma town":
              sortCode = "JK-ALM-T";
              break;
            case "Bear Bluff town":
              sortCode = "JK-BBF-T";
              break;
            case "Black River Falls city":
              sortCode = "JK-BRF-C";
              break;
            case "Brockway town":
              sortCode = "JK-BRO-T";
              break;
            case "City Point town":
              sortCode = "JK-CPT-T";
              break;
            case "Cleveland town":
              sortCode = "JK-CLE-T";
              break;
            case "Curran town":
              sortCode = "JK-CUR-T";
              break;
            case "Franklin town":
              sortCode = "JK-FRA-T";
              break;
            case "Garden Valley town":
              sortCode = "JK-GVA-T";
              break;
            case "Garfield town":
              sortCode = "JK-GAR-T";
              break;
            case "Hixton town":
              sortCode = "JK-HIX-T";
              break;
            case "Hixton village":
              sortCode = "JK-HIX-V";
              break;
            case "Irving town":
              sortCode = "JK-IRV-T";
              break;
            case "Knapp town":
              sortCode = "JK-KNA-T";
              break;
            case "Komensky town":
              sortCode = "JK-KOM-T";
              break;
            case "Manchester town":
              sortCode = "JK-MAN-T";
              break;
            case "Melrose town":
              sortCode = "JK-MEL-T";
              break;
            case "Melrose village":
              sortCode = "JK-MEL-V";
              break;
            case "Merrillan village":
              sortCode = "JK-MER-V";
              break;
            case "Millston town":
              sortCode = "JK-MIL-T";
              break;
            case "North Bend town":
              sortCode = "JK-NBD-T";
              break;
            case "Northfield town":
              sortCode = "JK-NOR-T";
              break;
            case "Springfield town":
              sortCode = "JK-SPR-T";
              break;
            case "Taylor village":
              sortCode = "JK-TAY-V";
              break;
          }
          break;
        case "Jefferson":
          switch (message.countySub) {
            case "Aztalan town":
              sortCode = "JF-AZT-T";
              break;
            case "Cold Spring town":
              sortCode = "JF-COS-T";
              break;
            case "Concord town":
              sortCode = "JF-CON-T";
              break;
            case "Farmington town":
              sortCode = "JF-FAR-T";
              break;
            case "Fort Atkinson city":
              sortCode = "JF-FTA-C";
              break;
            case "Hebron town":
              sortCode = "JF-HEB-T";
              break;
            case "Ixonia town":
              sortCode = "JF-IXO-T";
              break;
            case "Jefferson city":
              sortCode = "JF-JEF-C";
              break;
            case "Jefferson town":
              sortCode = "JF-JEF-T";
              break;
            case "Johnson Creek village":
              sortCode = "JF-JOC-V";
              break;
            case "Koshkonong town":
              sortCode = "JF-KOS-T";
              break;
            case "Lake Mills city":
              sortCode = "JF-LKM-C";
              break;
            case "Lake Mills town":
              sortCode = "JF-LKM-T";
              break;
            case "Milford town":
              sortCode = "JF-MIL-T";
              break;
            case "Oakland town":
              sortCode = "JF-OAK-T";
              break;
            case "Palmyra town":
              sortCode = "JF-PAL-T";
              break;
            case "Palmyra village":
              sortCode = "JF-PAL-V";
              break;
            case "Sullivan town":
              sortCode = "JF-SUL-T";
              break;
            case "Sullivan village":
              sortCode = "JF-SUL-V";
              break;
            case "Sumner town":
              sortCode = "JF-SUM-T";
              break;
            case "Waterloo city":
              sortCode = "JF-WTL-C";
              break;
            case "Waterloo town":
              sortCode = "JF-WTL-T";
              break;
            case "Watertown town":
              sortCode = "JF-WAT-T";
              break;
            // Jefferson + Dane counties
            case "Cambridge village":
              sortCode = "JF-CAM-V";
              break;
            // Jefferson + Dodge counties
            case "Watertown city":
              sortCode = "JF-WAT-C";
              break;
            // Jefferson + Walworth counties
            case "Whitewater city":
              sortCode = "JF-WHI-C";
              break;
            // Jefferson + Waukesha counties
            case "Lac La Belle village":
              sortCode = "JF-LLB-V";
              break;
          }
          break;
        case "Juneau":
          switch (message.countySub) {
            case "Armenia town":
              sortCode = "JU-ARM-T";
              break;
            case "Camp Douglas village":
              sortCode = "JU-CAD-V";
              break;
            case "Clearfield town":
              sortCode = "JU-CLR-T";
              break;
            case "Cutler town":
              sortCode = "JU-CUT-T";
              break;
            case "Elroy city":
              sortCode = "JU-ELR-C";
              break;
            case "Finley town":
              sortCode = "JU-FIN-T";
              break;
            case "Fountain town":
              sortCode = "JU-FOU-T";
              break;
            case "Germantown town":
              sortCode = "JU-GER-T";
              break;
            case "Hustler village":
              sortCode = "JU-HUS-V";
              break;
            case "Kildare town":
              sortCode = "JU-KIL-T";
              break;
            case "Kingston town":
              sortCode = "JU-KNG-T";
              break;
            case "Lemonweir town":
              sortCode = "JU-LEM-T";
              break;
            case "Lindina town":
              sortCode = "JU-LIN-T";
              break;
            case "Lisbon town":
              sortCode = "JU-LIS-T";
              break;
            case "Lyndon Station village":
              sortCode = "JU-LST-V";
              break;
            case "Lyndon town":
              sortCode = "JU-LYN-T";
              break;
            case "Marion town":
              sortCode = "JU-MAR-T";
              break;
            case "Mauston city":
              sortCode = "JU-MAU-C";
              break;
            case "Necedah town":
              sortCode = "JU-NEC-T";
              break;
            case "Necedah village":
              sortCode = "JU-NEC-V";
              break;
            case "New Lisbon city":
              sortCode = "JU-NLI-C";
              break;
            case "Orange town":
              sortCode = "JU-ORA-T";
              break;
            case "Plymouth town":
              sortCode = "JU-PLY-T";
              break;
            case "Seven Mile Creek town":
              sortCode = "JU-7MC-T";
              break;
            case "Summit town":
              sortCode = "JU-SUM-T";
              break;
            case "Union Center village":
              sortCode = "JU-UNC-V";
              break;
            case "Wisconsin Dells city":
              sortCode = "JU-WID-C";
              break;
            case "Wonewoc town":
              sortCode = "JU-WON-T";
              break;
            case "Wonewoc village":
              sortCode = "JU-WON-V";
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
            case "Argyle town":
              sortCode = "LF-ARG-T";
              break;
            case "Argyle village":
              sortCode = "LF-ARG-V";
              break;
            case "Belmont town":
              sortCode = "LF-BEL-T";
              break;
            case "Belmont village":
              sortCode = "LF-BEL-V";
              break;
            case "Benton town":
              sortCode = "LF-BEN-T";
              break;
            case "Benton village":
              sortCode = "LF-BEN-V";
              break;
            case "Blanchard town":
              sortCode = "LF-BLA-T";
              break;
            case "Darlington city":
              sortCode = "LF-DAR-C";
              break;
            case "Darlington town":
              sortCode = "LF-DAR-T";
              break;
            case "Elk Grove town":
              sortCode = "LF-ELK-T";
              break;
            case "Fayette town":
              sortCode = "LF-FAY-T";
              break;
            case "Gratiot town":
              sortCode = "LF-GRA-T";
              break;
            case "Gratiot village":
              sortCode = "LF-GRA-V";
              break;
            case "Kendall town":
              sortCode = "LF-KEN-T";
              break;
            case "Lamont town":
              sortCode = "LF-LAM-T";
              break;
            case "Monticello town":
              sortCode = "LF-MON-T";
              break;
            case "New Diggings town":
              sortCode = "LF-NDG-T";
              break;
            case "Seymour town":
              sortCode = "LF-SEY-T";
              break;
            case "Shullsburg city":
              sortCode = "LF-SHU-C";
              break;
            case "Shullsburg town":
              sortCode = "LF-SHU-T";
              break;
            case "South Wayne village":
              sortCode = "LF-SWY-V";
              break;
            case "Wayne town":
              sortCode = "LF-WYN-T";
              break;
            case "White Oak Springs town":
              sortCode = "LF-WOS-T";
              break;
            case "Willow Springs town":
              sortCode = "LF-WSP-T";
              break;
            case "Wiota town":
              sortCode = "LF-WIO-T";
              break;
            // Lafayette + Grant counties
            case "Cuba City village":
              sortCode = "LF-CUB-V";
              break;
            case "Hazel Green village":
              sortCode = "LF-HZG-V";
              break;
            // Lafayette + Iowa counties
            case "Blanchardville village":
              sortCode = "LF-BLA-V";
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
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
            case "":
              sortCode = "";
              break;
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
          showMsg("[FAILED] Library cards MAY NOT be issued to Milwaukee County residents.");
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
      if (sortCode) {
        selectPSTAT(sortCode, message.matchAddr);
      } else {
        selectUND();
      }
      break;
    case "receivedMAD":
      selectPSTAT(message.value, message.matchAddr);
      zipElt.value = message.zip;
      break;
    case "receivedMidPSTAT":
    case "receivedMooPSTAT":
    case "receivedSunPSTAT":
    case "receivedVerPSTAT":
      selectPSTAT(message.value, message.matchAddr);
      break;
  }
});

/*** RUNTIME MESSAGE LISTENERS : END ***/
