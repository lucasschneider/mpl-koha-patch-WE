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
    selected,
    matchAddr,
    sortID = "X-UND",
    generatedZip;

// Initialize the notice and result messages for communicating success/failure
// and place them underneath the address field
notice.id = 'tractNotice';
notice.setAttribute('style', 'margin-top:.2em;margin-left:118px;font-style:italic;color:#c00;');
result.setAttribute('id', 'tractResult');
if (addrElt) {
  addrElt.parentElement.appendChild(notice);
}

// Query PSTAT if the address and city fields contain values
if (addrElt && cityElt) {
  addrElt.addEventListener('blur', function () {
    if (addrElt.value && cityElt.value) {
      userEnteredAddress = addrElt.value;
      parseMadisonWI(cityElt);
      userEnteredCity = cityElt.value;
      queryPSTAT(addrElt, cityElt, false, false);
    }
  });

  cityElt.addEventListener('blur', function () {
    if (addrElt.value && cityElt.value) {
      userEnteredAddress = addrElt.value;
      parseMadisonWI(cityElt);
      userEnteredCity = cityElt.value;
      queryPSTAT(addrElt, cityElt, false, false);
    }
  });
}

// Parse the secondary city field for "MADISON WI"
if (cityElt2) {
  cityElt2.addEventListener('blur', function () {
    parseMadisonWI(this);
  });
}

// Parse the alternate city field for "MADISON WI"
if (cityElt3) {
  cityElt3.addEventListener('blur', function () {
    parseMadisonWI(this);
  });
}

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
        addrTrim += "+" + encodeURIComponent(addrParts[i]);
      }
    } else {
      addrTrim += "+" + encodeURIComponent(addrParts[i]);
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
  * This funciton automatically selects the PSTAT value given the
  * select list element, the Value of the PSTAT option, the result
  * element and the matching address returned by the Geocoder.
  *
  * selectList: The html select element containing the list of
  *             possible PSTAT values
  * value:      The plaintext PSTAT value that would match the
  *             target option in the select list
  * result:     The result element
  * matchAddr:  The matching address returned by the Geocoder
  */
function selectPSTAT(selectList, value, result, matchAddr) {
  if (selectList && value && result && matchAddr) {
    if (value == "D-X-SUN" || value == "X-UND") {
      if (selectList.value == '') {
        selectList.value = value;
      }
    } else {
      selectList.value = value;
      result.setAttribute('style', 'display:inline-block;color:#00c000;');
      result.textContent = ' [MATCH: ' + matchAddr + ']';
    }
  }
}

/**
  * This function selects the "Undetermined: PSTAT value for a
  * patron's library record.
  * 
  * selectList: The html select element containing the list of
  *             possible PSTAT values
  */
function selectUND(selectList) {
  var addr = document.getElementById('address');
  if (addr && selectList && selectList.children[selectList.selectedIndex].value === '') {
    selectList.value = "X-UND";
  }
}

/**
  * This is the main function used to send a data query to the US
  * Census Geocoder. The data returned determines the way in which
  * the PSTAT is selected (i.e. Census Tract Number for MPL, Voting
  * district for SUN, MOO, and MID, non-SCLS library system, or
  * the census tract number for everywhere else. Currently, the
  * PSTAT cannot be automatically selected for VER.
  * 
  * addr:       The html input field containing an address
  * city:       The html input field containing a city and
  *             state abbreviation.
  * queryB:     A boolean value representing whether the
  *             secondary address should be used in the
  *             query rather than the primary address
  * secondPass: A boolean value representing wether the
  *             Geocoder should be queried specifying
  *             current data (false) or 2010 data (true)
  */
function queryPSTAT(addr, city, queryB, secondPass) {
  var entryForm = document.forms.entryform,
      selectList = entryForm ? entryForm.elements.sort1 : null,
      notice = document.getElementById('tractNotice'),
      zipElt = document.getElementById('zipcode'),
      zipEltB = document.getElementById('B_zipcode');

  if (addr.value !== "" && city.value !== "" && selectList) {

    addr.parentElement.appendChild(notice);

    // Generate loading message
    notice.textContent = "Searching for sort value and zipcode... ";
    result.textContent = '';
    notice.appendChild(result);
    setTimeout(function () {
      if (result !== null && result.textContent === '') {
        result.setAttribute('style', 'display:inline-block;color:#a5a500;');
        result.textContent = '[NOTE: Server slow to respond—please enter zipcode and sort field manually]';
      }
    }, 12000);

    browser.runtime.onMessage.addListener(function (message) {
      if (message && message.key === "receivedGeocoderQuery") {
        if (message.hasData) {
          matchAddr = message.matchAddr.split(',')[0].toUpperCase(), sortID = "X-UND", generatedZip = message.zip;

          // Add button to allow staff to select the geographically closest MPL location
          var matchAddr4DistQuery = message.matchAddr.replace(/ /g, "+"),
              branchList = document.getElementById('branchcode'),
              nearestMPL = document.createElement('span'),
              nearestMPLold = document.getElementById('nearestMPL'),
              mapRegionListOld = document.getElementById('mapRegionList'),
              lnBreak1 = document.createElement('br'),
              lnBreak2 = document.createElement('br');

          lnBreak1.id = "nearestMPLbreak1";
          lnBreak2.id = "nearestMPLbreak2";

          if (nearestMPLold) {
            nearestMPLold.remove();
          }

          if (mapRegionListOld) {
            mapRegionListOld.remove();
          }

          if (!secondPass) {
            if (!document.getElementById('nearestMPLbreak1') && !document.getElementById('nearestMPLbreak2')) {
              branchList.parentElement.appendChild(lnBreak1);
              branchList.parentElement.appendChild(lnBreak2);
            }
            nearestMPL.id = "nearestMPL";
            nearestMPL.textContent = "Set home library to geographically closest location within...";
            nearestMPL.style = "display: inline-block;cursor:pointer;color:#00c;text-decoration:underline;margin-left:118px;";
            nearestMPL.onmouseover = function () {
              document.getElementById('nearestMPL').style = "display: inline-block;cursor:pointer;color:#669acc;text-decoration:underline;margin-left:118px;";
            };
            nearestMPL.onmouseout = function () {
              document.getElementById('nearestMPL').style = "display: inline-block;cursor:pointer;color:#00c;text-decoration:underline;margin-left:118px;";
            };

            var mapRegionList = document.createElement('select');
            mapRegionList.id = "mapRegionList";
            mapRegionList.style = "margin-left: 25px;";

            var madison = document.createElement('option');
            madison.textContent = "Madison";
            madison.value = "MPL";
            madison.selected = true;
            mapRegionList.appendChild(madison);

            var counties = document.createElement('optgroup');
            counties.label = "Counties";

            var adams = document.createElement('option');
            adams.textContent = "Adams County";
            adams.value = "ADAMS";
            counties.appendChild(adams);

            var columbia = document.createElement('option');
            columbia.textContent = "Columbia County";
            columbia.value = "COLUMBIA";
            counties.appendChild(columbia);

            var dane = document.createElement('option');
            dane.textContent = "Dane County";
            dane.value = "DANE";
            counties.appendChild(dane);

            var green = document.createElement('option');
            green.textContent = "Green County";
            green.value = "GREEN";
            counties.appendChild(green);

            var portage = document.createElement('option');
            portage.textContent = "Portage County";
            portage.value = "PORTAGE";
            counties.appendChild(portage);

            var sauk = document.createElement('option');
            sauk.textContent = "Sauk County";
            sauk.value = "SAUK";
            counties.appendChild(sauk);

            var wood = document.createElement('option');
            wood.textContent = "Wood County";
            wood.value = "WOOD";
            counties.appendChild(wood);

            mapRegionList.appendChild(counties);

            var scls = document.createElement('option');
            scls.textContent = "SCLS (Excludes MSB)";
            scls.value = "SCLS";
            mapRegionList.appendChild(scls);

            nearestMPL.onclick = function () {
              var selected = document.getElementById('mapRegionList').selectedOptions[0].value,
                  nearestLib = browser.runtime.sendMessage({
                key: "findNearestLib",
                matchAddr4DistQuery: matchAddr4DistQuery,
                selected: selected
              });
              nearestLib.then(handleResponse, handleError);
            };

            branchList.parentElement.appendChild(nearestMPL);
            branchList.parentElement.appendChild(mapRegionList);
          }

          // Set sort value
          switch (message.county) {
            /*** SOUTH CENTRAL LIBRARY SYSTEM ***/
            case "Adams":
            case "Columbia":
            case "Dane":
            case "Green":
            case "Portage":
            case "Sauk":
            case "Wood":
              switch (message.countySub) {
                /*** FREQUENTLY USED PSTATS ***/
                case "Blooming Grove town":
                  sortID = "D-BG-T";
                  break;
                case "Cottage Grove town":
                  sortID = "D-CG-T";
                  break;
                case "Cottage Grove village":
                  sortID = "D-CG-V";
                  break;
                case "Fitchburg city":
                  sortID = "D-FIT-T";
                  break;
                case "Monona city":
                  browser.runtime.sendMessage({
                    key: "getPstatByDist",
                    addrVal: matchAddr,
                    lib: "Moo"
                  });
                  break;
                case "Madison city":
                  p;
                  browser.runtime.sendMessage({
                    key: "getPstatByDist",
                    addrVal: matchAddr,
                    lib: "Mad",
                    tract: message.censusTract
                  });
                  break;
                case "Madison town":
                  sortID = "D-MAD-T";
                  break;
                case "Middleton city":
                  console.log("Sending getPstatByDist");
                  browser.runtime.sendMessage({
                    key: "getPstatByDist",
                    addrVal: matchAddr,
                    lib: "Mid"
                  });
                  break;
                case "Middleton town":
                  sortID = "D-MID-T";
                  break;
                case "Sun Prairie city":
                  browser.runtime.sendMessage({
                    key: "getPstatByDist",
                    addrVal: matchAddr,
                    lib: "Sun"
                  });
                  break;
                /*** UNDETERMINABLE COUNTY SUBDIVISIONS ***/
                case "Verona city":
                  /*browser.runtime.sendMessage({
                    key: "getPstatByDist",
                    addrVal: matchAddr,
                    lib: "Ver"
                  });*/
                  result.textContent = "[FAILED: cannot determine sort value for Verona; please enter PSTAT manually.]";
                  break;

                /*** MAIN LIST ***/
                case "Adams city":
                  sortID = "A-ADM-C";
                  break;
                case "Adams town":
                  if (message.county === 'Adams') {
                    sortID = "A-ADM-T";
                  } else if (message.county === 'Green') {
                    sortID = "G-ADA-T";
                  }
                  break;
                case "Alban town":
                  sortID = "P-ALB-T";
                  break;
                case "Albany town":
                  sortID = "G-ALB-T2";
                  break;
                case "Albany village":
                  sortID = "G-ALB-V";
                  break;
                case "Albion town":
                  sortID = "D-ALB-T";
                  break;
                case "Almond town":
                  sortID = "P-ALM-T";
                  break;
                case "Almond village":
                  sortID = "P-ALM-V";
                  break;
                case "Amherst Junction village":
                  sortID = "P-AMJ-V";
                  break;
                case "Amherst town":
                  sortID = "P-AMH-T";
                  break;
                case "Amherst village":
                  sortID = "P-AMH-V";
                  break;
                case "Arlington town":
                  sortID = "C-ARL-T";
                  break;
                case "Arlington village":
                  sortID = "C-ARL-V";
                  break;
                case "Arpin town":
                  sortID = "W-ARP-T";
                  break;
                case "Arpin village":
                  sortID = "W-ARP-V";
                  break;
                case "Auburndale town":
                  sortID = "W-AUB-T";
                  break;
                case "Auburndale village":
                  sortID = "W-AUB-V";
                  break;
                case "Baraboo city":
                  sortID = "S-BAR-C1";
                  break;
                case "Baraboo town":
                  sortID = "S-BAR-T";
                  break;
                case "Bear Creek town":
                  sortID = "S-BC-T";
                  break;
                case "Belleville village":
                  if (message.county === 'Dane') {
                    sortID = "D-BEL-VD";
                  } else if (message.county === 'Green') {
                    sortID = "G-BEL-VG";
                  }
                  break;
                case "Belmont town":
                  sortID = "P-BEL-T";
                  break;
                case "Berry town":
                  sortID = "D-BERR-T";
                  break;
                case "Big Flats town":
                  sortID = "D-BIG-T";
                  break;
                case "Biron village":
                  sortID = "W-BIR-V";
                  break;
                case "Black Earth town":
                  sortID = "D-BE-T";
                  break;
                case "Black Earth village":
                  sortID = "B-BE-V";
                  break;
                case "Blue Mounds town":
                  sortID = "D-BM-T";
                  break;
                case "Blue Mounds village":
                  sortID = "D-BM-V";
                  break;
                case "Bristol town":
                  sortID = "D-BRI-T";
                  break;
                case "Brodhead city":
                  sortID = "G-BROD-C";
                  break;
                case "Brooklyn town":
                  sortID = "G-BRO-T";
                  break;
                case "Brooklyn village":
                  if (message.county === 'Dane') {
                    sortID = "D-BRO-VD";
                  } else if (message.county === 'Green') {
                    sortID = "G-BRO-GD";
                  }
                  break;
                case "Browntown village":
                  sortID = "G-BROW-V";
                  break;
                case "Buena Vista town":
                  sortID = "P-BUV-T";
                  break;
                case "Burke town":
                  sortID = "D-BUR-T";
                  break;
                case "Cadiz town":
                  sortID = "G-CAD-T";
                  break;
                case "Caledonia town":
                  sortID = "C-CAL-T";
                  break;
                case "Cambria village":
                  sortID = "C-CAM-V";
                  break;
                case "Cambridge village":
                  sortID = "D-CAM-VD";
                  break;
                case "Cameron town":
                  sortID = "W-CAM-T";
                  break;
                case "Carson town":
                  sortID = "P-CAR-T";
                  break;
                case "Cary town":
                  sortID = "W-CAR-T";
                  break;
                case "Cazenovia village":
                  sortID = "S-CAZ-V";
                  break;
                case "Christiana town":
                  sortID = "D-CHR-T";
                  break;
                case "Clarno town":
                  sortID = "G-CLA-T";
                  break;
                case "Colburn town":
                  sortID = "A-COL-T";
                  break;
                case "Columbus city":
                  if (message.county === 'Columbia') {
                    sortID = "C-COL-C";
                  } else if (message.county === 'Dodge') {
                    sortID = "O-MWFLS-COLC";
                  }
                  break;
                case "Columbus town":
                  sortID = "C-COL-T";
                  break;
                case "Courtland town":
                  sortID = "C-COU-T";
                  break;
                case "Cranmoor town":
                  sortID = "W-CRAN-T";
                  break;
                case "Cross Plains town":
                  sortID = "D-CP-T";
                  break;
                case "Cross Plains village":
                  sortID = "D-CP-V";
                  break;
                case "Dane town":
                  sortID = "D-DAN-T";
                  break;
                case "Dane village":
                  sortID = "D-DAN-V";
                  break;
                case "Decatur town":
                  sortID = "D-DEC-T";
                  break;
                case "Deerfield town":
                  sortID = "D-DEE-T";
                  break;
                case "Deerfield village":
                  sortID = "D-DEE-V";
                  break;
                case "DeForest village":
                  sortID = "D-DF-V";
                  break;
                case "Dekorra town":
                  sortID = "C-DEK-T";
                  break;
                case "Dell Prairie town":
                  sortID = "A-DEL-T";
                  break;
                case "Dellona town":
                  sortID = "S-DELL-T";
                  break;
                case "Delton town":
                  sortID = "S-DELT-T";
                  break;
                case "Dewey town":
                  sortID = "P-DEW-T";
                  break;
                case "Dexter town":
                  sortID = "W-DEX-T";
                  break;
                case "Doylestown village":
                  sortID = "C-DOY-V";
                  break;
                case "Dunkirk Town":
                  sortID = "D-DUNK-T";
                  break;
                case "Dunn town":
                  sortID = "D-DUNN-T";
                  break;
                case "Easton town":
                  sortID = "A-EST-T";
                  break;
                case "Eau Pleine town":
                  sortID = "P-EPL-T";
                  break;
                case "Excelsior town":
                  sortID = "S-EXC-T";
                  break;
                case "Exeter town":
                  sortID = "G-EXE-T";
                  break;
                case "Fairfield town":
                  sortID = "S-FAI-T";
                  break;
                case "Fall River village":
                  sortID = "C-FR-V";
                  break;
                case "Fort Winnebago town":
                  sortID = "C-FW-T";
                  break;
                case "Fountain Prairie town":
                  sortID = "C-FP-T";
                  break;
                case "Franklin town":
                  sortID = "S-FRA-T";
                  break;
                case "Freedom town":
                  sortID = "S-FRE-T";
                  break;
                case "Friendship village":
                  sortID = "A-FRN-V";
                  break;
                case "Friesland village":
                  sortID = "C-FRI-V";
                  break;
                case "Grand Rapids town":
                  sortID = "W-GRAP-T";
                  break;
                case "Grant town":
                  sortID = "P-GRT-T";
                  break;
                case "Greenfield town":
                  sortID = "S-GRE-T";
                  break;
                case "Hampden town":
                  sortID = "C-HAM-T";
                  break;
                case "Hansen Town":
                  sortID = "W-HAN-T";
                  break;
                case "Hewitt village":
                  sortID = "W-HEW-V";
                  break;
                case "Hiles town":
                  sortID = "W-HIL-T";
                  break;
                case "Hillpoint village":
                  sortID = "S-HILL-V";
                  break;
                case "Honey Creek town":
                  sortID = "S-HC-T";
                  break;
                case "Hull town":
                  sortID = "P-HUL-T";
                  break;
                case "Ironton town":
                  sortID = "S-IRO-T";
                  break;
                case "Ironton village":
                  sortID = "S-IRO-V";
                  break;
                case "Jackson town":
                  sortID = "A-JAK-T";
                  break;
                case "Jefferson town":
                  sortID = "G-JEF-T";
                  break;
                case "Jordan town":
                  sortID = "G-JOR-T";
                  break;
                case "Junction City village":
                  sortID = "P-JNC-V";
                  break;
                case "Lake Delton village":
                  sortID = "S-LD-V";
                  break;
                case "Lanark town":
                  sortID = "P-LAN-T";
                  break;
                case "Lavalle town":
                  sortID = "S-LV-T";
                  break;
                case "Lavalle village":
                  sortID = "S-LV-V";
                  break;
                case "Leeds town":
                  sortID = "C-LEE-T";
                  break;
                case "Leola town":
                  sortID = "A-LEO-T";
                  break;
                case "Lewiston town":
                  sortID = "C-LEW-T";
                  break;
                case "Lime Ridge village":
                  sortID = "S-LR-V";
                  break;
                case "Lincoln town":
                  if (message.county === 'Adams') {
                    sortID = "A-LIN-T";
                  } else if (message.county === 'Wood') {
                    sortID = "W-LIN-T";
                  }
                  break;
                case "Linwood town":
                  sortID = "P-LIN-T";
                  break;
                case "Lodi city":
                  sortID = "C-LOD-C";
                  break;
                case "Lodi town":
                  sortID = "C-LOD-T";
                  break;
                case "Loganville village":
                  sortID = "S-LOG-V";
                  break;
                case "Lowville town":
                  sortID = "C-LOW-T";
                  break;
                case "Maple Bluff village":
                  sortID = "D-MB-V";
                  break;
                case "Marcellon town":
                  sortID = "C-MARC-T";
                  break;
                case "Marshall village":
                  sortID = "D-MARS-V";
                  break;
                case "Marshfield city":
                  sortID = "W-MAR-C";
                  break;
                case "Marshfield town":
                  sortID = "W-MAR-T";
                  break;
                case "Mazomanie town":
                  sortID = "D-MAZ-T";
                  break;
                case "Mazomanie village":
                  sortID = "D-MAZ-V";
                  break;
                case "Mcfarland village":
                  sortID = "D-MCF-V";
                  break;
                case "Medina town":
                  sortID = "D-MED-T";
                  break;
                case "Merrimac town":
                  sortID = "S-MER-T";
                  break;
                case "Merrimac village":
                  sortID = "S-MER-V";
                  break;
                case "Milladore town":
                  sortID = "W-MILL-T";
                  break;
                case "Milladore village":
                  sortID = "W-MILL-V";
                  break;
                case "Monroe City":
                  sortID = "G-MONR-C";
                  break;
                case "Monroe town":
                  if (message.county === 'Adams') {
                    sortID = "A-MON-T";
                  } else if (message.county === 'Green') {
                    sortID = "G-MONR-T";
                  }
                  break;
                case "Monticello village":
                  sortID = "G-MONT-V";
                  break;
                case "Montrose town":
                  sortID = "D-MONT-T";
                  break;
                case "Mount Horeb village":
                  sortID = "D-MH-V";
                  break;
                case "Mount Pleasant town":
                  sortID = "G-MP-T";
                  break;
                case "Nekoosa city":
                  sortID = "W-NEK-C";
                  break;
                case "Nelsonville village":
                  sortID = "P-NEL-V";
                  break;
                case "New Chester town":
                  sortID = "A-NCH-T";
                  break;
                case "New Glarus town":
                  sortID = "G-NG-T";
                  break;
                case "New Glarus village":
                  sortID = "G-NG-V";
                  break;
                case "New Haven town":
                  sortID = "A-NHV-T";
                  break;
                case "New Hope town":
                  sortID = "P-NHP-T";
                  break;
                case "Newport town":
                  sortID = "C-NEW-T";
                  break;
                case "North Freedom village":
                  sortID = "S-NF-V";
                  break;
                case "Oregon town":
                  sortID = "D-ORE-T";
                  break;
                case "Oregon village":
                  sortID = "D-ORE-V";
                  break;
                case "Otsego town":
                  sortID = "C-OTS-T";
                  break;
                case "Pacific town":
                  sortID = "C-PAC-T";
                  break;
                case "Pardeeville village":
                  sortID = "C-PAR-V";
                  break;
                case "Park Ridge village":
                  sortID = "P-PKR-V";
                  break;
                case "Perry town":
                  sortID = "D-PER-T";
                  break;
                case "Pine Grove town":
                  sortID = "P-PIN-T";
                  break;
                case "Pittsville city":
                  sortID = "W-PIT-C";
                  break;
                case "Plain village":
                  sortID = "S-PLA-V";
                  break;
                case "Pleasant Springs town":
                  sortID = "D-PS-T";
                  break;
                case "Plover town":
                  sortID = "P-PLO-T";
                  break;
                case "Plover village":
                  sortID = "P-PLO-V";
                  break;
                case "Port Edwards town":
                  sortID = "W-PE-T";
                  break;
                case "Port Edwards village":
                  sortID = "W-PE-V";
                  break;
                case "Portage city":
                  sortID = "C-POR-C";
                  break;
                case "Poynette village":
                  sortID = "C-POY-V";
                  break;
                case "Prairie Du Sac town":
                  sortID = "S-PDS-T";
                  break;
                case "Prairie Du Sac village":
                  sortID = "S-PDS-V";
                  break;
                case "Preston town":
                  sortID = "A-PRS-T";
                  break;
                case "Primrose town":
                  sortID = "D-PRI-T";
                  break;
                case "Quincy town":
                  sortID = "A-QUI-T";
                  break;
                case "Randolph town":
                  sortID = "C-RAN-T";
                  break;
                case "Randolph village":
                  sortID = "C-RAN-VC";
                  break;
                case "Reedsburg city":
                  sortID = "S-REE-C";
                  break;
                case "Reedsburg town":
                  sortID = "S-REE-T";
                  break;
                case "Remington town":
                  sortID = "W-REM-T";
                  break;
                case "Richfield town":
                  if (message.county === 'Adams') {
                    sortID = "A-RCH-T";
                  } else if (message.county === 'Wood') {
                    sortID = "W-RCH-T";
                  }
                  break;
                case "Rio village":
                  sortID = "C-RIO-V";
                  break;
                case "Rock Springs village":
                  sortID = "S-RS-V";
                  break;
                case "Rock town":
                  sortID = "W-ROC-T";
                  break;
                case "Rockdale village":
                  sortID = "D-ROC-V";
                  break;
                case "Rome town":
                  sortID = "A-ROM-T";
                  break;
                case "Rosholt village":
                  sortID = "P-ROS-V";
                  break;
                case "Roxbury town":
                  sortID = "D-ROX-T";
                  break;
                case "Rudolph town":
                  sortID = "W-RUD-T";
                  break;
                case "Rudolph village":
                  sortID = "W-RUD-V";
                  break;
                case "Rutland town":
                  sortID = "D-RUT-T";
                  break;
                case "Saratoga town":
                  sortID = "W-SARA-T";
                  break;
                case "Sauk City village":
                  sortID = "S-SC-V";
                  break;
                case "Scott town":
                  sortID = "C-SCO-T";
                  break;
                case "Seneca town":
                  sortID = "W-SENE-T";
                  break;
                case "Sharon town":
                  sortID = "P-SHA-T";
                  break;
                case "Sherry town":
                  sortID = "W-SHR-T";
                  break;
                case "Shorewood Hills village":
                  sortID = "D-SH-V";
                  break;
                case "Sigel town":
                  sortID = "W-SIG-T";
                  break;
                case "Spring Green town":
                  sortID = "S-SGE-T";
                  break;
                case "Spring Green village":
                  sortID = "S-SGE-V";
                  break;
                case "Spring Grove town":
                  sortID = "G-SGO-T";
                  break;
                case "Springdale town":
                  sortID = "D-SPD-T";
                  break;
                case "Springfield town":
                  sortID = "D-SPF-T";
                  break;
                case "Springvale town":
                  sortID = "C-SPV-T";
                  break;
                case "Springville town":
                  sortID = "A-SPV-T";
                  break;
                case "Stevens Point city":
                  sortID = "P-STP-C";
                  break;
                case "Stockton town":
                  sortID = "P-STO-T";
                  break;
                case "Stoughton city":
                  sortID = "D-STO-C1";
                  break;
                case "Strongs Prairie town":
                  sortID = "A-STP-T";
                  break;
                case "Sumpter town":
                  sortID = "S-SUM-T";
                  break;
                case "Sun Prairie town":
                  sortID = "D-SP-T";
                  break;
                case "Sylvester town":
                  sortID = "G-SYL-T";
                  break;
                case "Troy town":
                  sortID = "S-TRO-T";
                  break;
                case "Vermont town":
                  sortID = "D-VERM-T";
                  break;
                case "Verona town":
                  sortID = "D-VERO-T";
                  break;
                case "Vesper village":
                  sortID = "W-VESP-V";
                  break;
                case "Vienna town":
                  sortID = "D-VIE-T";
                  break;
                case "Washington town":
                  if (message.county === 'Green') {
                    sortID = "G-WAS-TG";
                  } else if (message.county === 'Sauk') {
                    sortID = "S-WAS-TS";
                  }
                  break;
                case "Waunakee village":
                  sortID = "D-WAU-V";
                  break;
                case "West Baraboo village":
                  sortID = "S-WB-V";
                  break;
                case "West Point town":
                  sortID = "C-WP-T";
                  break;
                case "Westfield town":
                  sortID = "S-WESF-T";
                  break;
                case "Westport town":
                  sortID = "D-WESP-T";
                  break;
                case "Whiting village":
                  sortID = "P-WHI-V";
                  break;
                case "Windsor town":
                  sortID = "D-WIN-T";
                  break;
                case "Winfield town":
                  sortID = "S-WIN-T2";
                  break;
                case "Wisconsin Dells city":
                  if (message.county === 'Adams') {
                    sortID = "A-WID-C";
                  } else if (message.county === 'Columbia') {
                    sortID = "C-WD-CC";
                  } else if (message.county === 'Sauk') {
                    sortID = "S-WD-CS";
                  }
                  break;
                case "Wisconsin Rapids city":
                  sortID = "W-WSRP-C";
                  break;
                case "Wood town":
                  sortID = "W-WOD-T";
                  break;
                case "Woodland town":
                  sortID = "S-WOO-T";
                  break;
                case "Wyocena town":
                  sortID = "C-WYO-T";
                  break;
                case "Wyocena village":
                  sortID = "C-WYO-V";
                  break;
                case "York town":
                  if (message.county === 'Dane') {
                    sortID = "D-YOR-TD";
                  } else if (message.county === 'Green') {
                    sortID = "G-YOR-TG";
                  }
                  break;
                default:
                  break;
              }
              break;

            /*** ARROWHEAD LIBRARY SYSTEM ***/
            case "Rock":
              // Has with/without library option
              switch (message.countySub) {
                case "Beloit city":
                  sortID = "O-ALS-BEL-C";
                  break;
                case "Brodhead city":
                  sortID = "O-ALS-BRD-C";
                  break;
                case "Clinton village":
                  sortID = "O-ALS-CLI-V";
                  break;
                case "Edgerton city":
                  sortID = "O-ALS-EDG-C";
                  break;
                case "Evansville city":
                  sortID = "O-ALS-EVA-C";
                  break;
                case "Janesville city":
                  sortID = "O-ALS-JAN-C";
                  break;
                case "Milton city":
                  sortID = "O-ALS-MIL-C";
                  break;
                case "Orfordville city":
                  sortID = "O-ALS-ORF-C";
                  break;
                default:
                  result.textContent = '[FAILED: Manually select sort option "Rock County" with or w/out library.]';
                  break;
              }
              break;

            /*** EASTERN SHORES LIBRARY SYSTEM ***/
            case "Ozaukee":
            case "Sheboygan":
              sortID = "O-ESLS";
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
              sortID = "O-IFLS";
              break;

            /*** KENOSHA COUNTY LIBRARY SYSTEM ***/
            case "Kenosha":
              sortID = "O-KCLS";
              break;

            /*** LAKESHORES LIBRARY SYSTEM ***/
            case "Racine":
            case "Walworth":
              sortID = "O-LLS";
              break;

            /*** MANITOWOC-CALUMET LIBRARY SYSTEM ***/
            case "Calumet":
            case "Manitowoc":
              sortID = "O-MCLS";
              break;

            /*** MILWAUKEE COUNTY FEDERATED LIBRARY SYSTEM ***/
            case "Milwaukee":
              result.textContent = '[FAILED: Do NOT issue a library card to Milwaukee County patrons.]';
              break;

            /*** MID-WISCONSIN FEDERATED LIBRARY SYSTEM ***/
            case "Dodge":
              // Has with/without library option
              switch (message.countySub) {
                case "Ashippun town":
                  sortID = "O-MWFLS-ASH";
                  break;
                case "Beaver Dam city":
                  sortID = "O-MWFLS-BVC";
                  break;
                case "Beaver Dam town":
                  sortID = "O-MWFLS-BVT";
                  break;
                case "Brownsville village":
                  sortID = "O-MWFLS-BRV";
                  break;
                case "Burnett town":
                  sortID = "O-MWFLS-BRT";
                  break;
                case "Calamus town":
                  sortID = "O-MWFLS-CALT";
                  break;
                case "Chester town":
                  sortID = "O-MWFLS-CHE";
                  break;
                case "Clyman town":
                  sortID = "O-MWFLS-CLYT";
                  break;
                case "Clyman village":
                  sortID = "O-MWFLS-CLYV";
                  break;
                case "Elba town":
                  sortID = "O-MWFLS-ELBT";
                  break;
                case "Emmet town":
                  sortID = "O-MWFLS-EMM";
                  break;
                case "Fox Lake city":
                  sortID = "O-MWFLS-FXC";
                  break;
                case "Fox Lake town":
                  sortID = "O-MWFLS-FXT";
                  break;
                case "Hartford city":
                  sortID = "O-MWFLS-HAR";
                  break;
                case "Herman town":
                  sortID = "O-MWFLS-HRT";
                  break;
                case "Horicon city":
                  sortID = "O-MWFLS-HORC";
                  break;
                case "Hubbard town":
                  sortID = "O-MWFLS-HBT";
                  break;
                case "Hustisford town":
                  sortID = "O-MWFLS-HUST";
                  break;
                case "Hustisford village":
                  sortID = "O-MWFLS-HUSV";
                  break;
                case "Iron Ridge village":
                  sortID = "O-MWFLS-IRV";
                  break;
                case "Juneau city":
                  sortID = "O-MWFLS-JUNC";
                  break;
                case "Kekoskee village":
                  sortID = "O-MWFLS-KEK";
                  break;
                case "Lebanon town":
                  sortID = "O-MWFLS-LBT";
                  break;
                case "Leroy town":
                  sortID = "O-MWFLS-LER";
                  break;
                case "Lomira town":
                  sortID = "O-MWFLS-LOMT";
                  break;
                case "Lomira village":
                  sortID = "O-MWFLS-LOMV";
                  break;
                case "Lowell town":
                  sortID = "O-MWFLS-LOWT";
                  break;
                case "Lowell village":
                  sortID = "O-MWFLS-LOWV";
                  break;
                case "Mayville city":
                  sortID = "O-MWFLS-MYC";
                  break;
                case "Neosho village":
                  sortID = "O-MWFLS-NEO";
                  break;
                case "Oak Grove town":
                  sortID = "O-MWFLS-OGT";
                  break;
                case "Portland town":
                  sortID = "O-MWFLS-PRT";
                  break;
                case "Randolph village":
                  sortID = "O-MWFLS-RANV";
                  break;
                case "Reeseville village":
                  sortID = "O-MWFLS-RESV";
                  break;
                case "Rubicon town":
                  sortID = "O-MWFLS-RUB";
                  break;
                case "Shields town":
                  sortID = "O-MWFLS-SHT";
                  break;
                case "Theresa town":
                  sortID = "O-MWFLS-THE";
                  break;
                case "Theresa village":
                  sortID = "O-MWFLS-THV";
                  break;
                case "Trenton town":
                  sortID = "O-MWFLS-TRE";
                  break;
                case "Watertown city":
                  sortID = "O-MWFLS-WD";
                  break;
                case "Waupun city":
                  sortID = "O-MWFLS-WP";
                  break;
                case "Westford town":
                  sortID = "O-MWFLS-WSTT";
                  break;
                case "Williamstown town":
                  sortID = "O-MWFLS-WIL";
                  break;
                default:
                  result.textContent = '[FAILED: Manually select sort option "Dodge County" with or w/out library.]';
                  break;
              }
              break;
            case "Jefferson":
              // Has with/without library option
              switch (message.countySub) {
                case "Aztalan town":
                  sortID = "O-MWFLS-AZT";
                  break;
                case "Cambridge village":
                  sortID = "O-MWFLS-CV";
                  break;
                case "Cold Spring town":
                  sortID = "O-MWFLS-CSP";
                  break;
                case "Concord town":
                  sortID = "O-MWFLS-CON";
                  break;
                case "Farmington town":
                  sortID = "O-MWFLS-FAR";
                  break;
                case "Fort Atkinson city":
                  sortID = "O-MWFLS-FC";
                  break;
                case "Hebron Town":
                  sortID = "O-MWFLS-HEB";
                  break;
                case "Helenville town":
                  sortID = "O-MWFLS-HLV";
                  break;
                case "Ixonia town":
                  sortID = "O-MWFLS-IXT";
                  break;
                case "Jefferson city":
                  sortID = "O-MWFLS-JC";
                  break;
                case "Jefferson town":
                  sortID = "O-MWFLS-JFT";
                  break;
                case "Johnson Creek village":
                  sortID = "O-MWFLS-JO";
                  break;
                case "Koshkonong town":
                  sortID = "O-MWFLS-KOS";
                  break;
                case "Lac La Belle village":
                  sortID = "O-MWFLS-LLB";
                  break;
                case "Lake Mills city":
                  sortID = "O-MWFLS-LC";
                  break;
                case "Lake Mills town":
                  sortID = "O-MWFLS-LT";
                  break;
                case "Milford town":
                  sortID = "O-MWFLS-MIL";
                  break;
                case "Oakland town":
                  sortID = "O-MWFLS-OT";
                  break;
                case "Palmyra town":
                  sortID = "O-MWFLS-PAL";
                  break;
                case "Palmyra village":
                  sortID = "O-MWFLS-PA";
                  break;
                case "Sullivan town":
                  sortID = "O-MWFLS-SLT";
                  break;
                case "Sullivan village":
                  sortID = "O-MWFLS-SLV";
                  break;
                case "Sumner town":
                  sortID = "O-MWFLS-ST";
                  break;
                case "Waterloo city":
                  sortID = "O-MWFLS-WC";
                  break;
                case "Waterloo town":
                  sortID = "O-MWFLS-WL";
                  break;
                case "Watertown city":
                  sortID = "O-MWFLS-WT";
                  break;
                case "Watertown town":
                  sortID = "O-MWFLS-WATT";
                  break;
                case "Whitewater city":
                  sortID = "O-MWFLS-WW";
                  break;
                default:
                  result.textContent = '[FAILED: Manually select sort option "Jefferson County" with or w/out library.]';
                  break;
              }
              break;
            case "Washington":
              sortID = "O-MWFLS";
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
              sortID = "O-NFLS";
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
              sortID = "O-NWLS";
              break;

            /*** OUTAGAMIE-WAUPACA LIBRARY SYSTEM ***/
            // Has with/without library option
            case "Outagamie":
              sortID = "O-OWLS";
              break;
            case "Waupaca":
              result.textContent = '[FAILED: Manually select sort option "Waupaca County" with or w/out library.]';
              break;

            /*** SOUTH WEST LIBRARY SYSTEM ***/
            case "Iowa":
              // Has with/without library option
              switch (message.countySub) {
                case "Arena town":
                  sortID = "O-SWLS-ART";
                  break;
                case "Arena village":
                  sortID = "O-SWLS-ARV";
                  break;
                case "Avoca village":
                  sortID = "O-SWLS-AVV";
                  break;
                case "Barneveld village":
                  sortID = "O-SWLS-BAV";
                  break;
                case "Blanchardville village":
                  sortID = "O-SWLS-BLA";
                  break;
                case "Brigham town":
                  sortID = "O-SWLS-BRT";
                  break;
                case "Clyde town":
                  sortID = "O-SWLS-CLT";
                  break;
                case "Dodgeville City":
                  sortID = "O-SWLS-DOC";
                  break;
                case "Dodgeville town":
                  sortID = "O-SWLS-DOT";
                  break;
                case "Hollandale village":
                  sortID = "O-SWLS-HOV";
                  break;
                case "Highland town":
                  sortID = "O-SWLS-HIT";
                  break;
                case "Mineral Point city":
                  sortID = "O-SWLS-MPC";
                  break;
                case "Mineral Point town":
                  sortID = "O-SWLS-MPT";
                  break;
                case "Moscow town":
                  sortID = "O-SWLS-MOT";
                  break;
                case "Pulaksi town":
                  sortID = "O-SWLS-PUT";
                  break;
                case "Ridgeway town":
                  sortID = "O-SWLS-RID";
                  break;
                case "Ridgeway village":
                  sortID = "O-SWLS-RIDV";
                  break;
                case "Waldwick town":
                  sortID = "O-SWLS-WLT";
                  break;
                case "Wyoming town":
                  sortID = "O-SWLS-WYT";
                  break;
                default:
                  result.textContent = '[FAILED: Manually select sort option "Iowa County" with or w/out library.]';
                  break;
              }
              break;
            case "Lafayette":
              // Has with/without library option
              switch (message.countySub) {
                case "Blanchardville village":
                  sortID = "O-SWLS-BLA";
                  break;
                default:
                  result.textContent = '[FAILED: Manually select sort option "Lafayette County" with or w/out library.]';
                  break;
              }
              break;
            case "Richland":
              // Has with/without library option
              switch (message.countySub) {
                case "Buena Vista town":
                  sortID = "O-WLS-BUFT";
                  break;
                case "Cazenovia village":
                  sortID = "O-SWLS-CAV";
                  break;
                case "Ithaca town":
                  sortID = "O-SWLS-ITT";
                  break;
                case "Lone Rock village":
                  sortID = "O-SWLS-LRV";
                  break;
                case "Orion town":
                  sortID = "O-SWLS-ORT";
                  break;
                case "Richland Center city":
                  sortID = "O-SWLS";
                  break;
                case "Richland town":
                  sortID = "O-SWLS-RIT";
                  break;
                case "Westford town":
                  sortID = "O-SWLS-WET";
                  break;
                case "Willow town":
                  sortID = "O-SWLS-WIT";
                  break;
                default:
                  result.textContent = '[FAILED: Manually select sort option "Richland County" with or w/out library.]';
                  break;
              }
              break;
            case "Crawford":
            case "Grant":
              sortID = "O-SWLS";
              break;

            /*** WAUKESHA COUNTY FEDERATED LIBRARY SYSTEM ***/
            case "Waukesha":
              sortID = "O-WCFLS";
              break;

            /*** WINNEFOX LIBRARY SYSTEM ***/
            case "Green Lake":
              // Has with/without library option
              switch (message.countySub) {
                case "Berlin city":
                  sortID = "O-WLS-BLC";
                  break;
                case "Green Lake city":
                  sortID = "O-WLS-GLC";
                  break;
                case "Kingston town":
                  sortID = "O-WLS-KNGT";
                  break;
                case "Kingston village":
                  sortID = "O-WLS-KNGV";
                  break;
                case "Mackford town":
                  sortID = "O-WLS-MCKT";
                  break;
                case "Manchester town":
                  sortID = "O-WLS-MANT";
                  break;
                case "Markesan city":
                  sortID = "O-WLS-MKC";
                  break;
                case "Princeton city":
                  sortID = "O-WLS-PRC";
                  break;
                default:
                  result.textContent = '[FAILED: Manually select sort option "Green Lake County" with or w/out library.]';
                  break;
              }
              break;
            case "Marquette":
              // Has with/without library option
              switch (message.countySub) {
                case "Buffalo town":
                  sortID = "O-WLS-BUFT";
                  break;
                case "Douglas town":
                  sortID = "O-WLS-DUGT";
                  break;
                case "Endeavor village":
                  sortID = "O-WLS-ENV";
                  break;
                case "Montello city":
                  sortID = "O-WLS-MONV";
                  break;
                case "Montello town":
                  sortID = "O-WLS-MONT";
                  break;
                case "Moundville town":
                  sortID = "O-WLS-MOUT";
                  break;
                case "Neshkoro village":
                  sortID = "O-WLS-NSKV";
                  break;
                case "Oxford town":
                  sortID = "O-WLS-OXT";
                  break;
                case "Oxford village":
                  sortID = "O-WLS-OXV";
                  break;
                case "Packwaukee town":
                  sortID = "O-WLS-PCKT";
                  break;
                case "Westfield village":
                  sortID = "O-WLS-WSFV";
                  break;
                default:
                  result.textContent = '[FAILED: Manually select sort option "Marquette County" with or w/out library.]';
                  break;
              }
              break;
            // Has with/without library option
            case "Waushara":
              result.textContent = '[FAILED: Manually select sort option "Waushara County" with or w/out library.]';
              break;
            case "Fond du Lac":
            case "Winnebago":
              sortID = "O-WLS";
              break;

            /*** WINDING RIVERS LIBRARY SYSTEM ***/
            case "Juneau":
              // Has with/without library option
              switch (message.countySub) {
                case "Elroy city":
                  sortID = "O-WRLS-ELC";
                  break;
                case "Kildare town":
                  sortID = "O-WRLS-KILDT";
                  break;
                case "Lyndon town":
                  sortID = "O-WRLS-LYNT";
                  break;
                case "Mauston city":
                  sortID = "O-WRLS-MAUC";
                  break;
                case "Necedah Village":
                  sortID = "O-WRLS-NECV";
                  break;
                case "New Lisbon city":
                  sortID = "O-WRLS-NLC";
                  break;
                case "Seven Mile Creek town":
                  sortID = "O-WRLS-7MCT";
                  break;
                case "Wonewoc village":
                  sortID = "O-WRLS-WWV";
                  break;
                default:
                  result.textContent = '[FAILED: Manually select sort option "Juneau County" with or w/out library.]';
                  break;
              }
              break;
            // Has with/without library option
            case "Jackson":
              result.textContent = '[FAILED: Manually select sort option "Jackson County" with or w/out library.]';
              break;
            // Has with/without library option
            case "Vernon":
              result.textContent = '[FAILED: Manually select sort option "Vernon County" with or w/out library.]';
              break;
            case "Buffalo":
            case "La Crosse":
            case "Monroe":
            case "Trempealeau":
              sortID = "O-WRLS";
              break;

            /*** WISCONSIN VALLEY LIBRARY SYSTEM ***/
            case "Marathon":
              sortID = "O-WVLS-MNLI";
              break;
            // Has with/without library option
            case "Clark":
              result.textContent = '[FAILED: Manually select sort option "Clark County" with or w/out library.]';
              break;
            case "Forest":
            case "Langlade":
            case "Lincoln":
            case "Oneida":
            case "Taylor":
              sortID = "O-WVLS";
              break;

            /*** COUNTY SELECT DEFAULT ***/
            default:
              break;
          } //end county switch

          if (sortID) {
            selectPSTAT(selectList, sortID, result, matchAddr);
            // Set zip code
            if (queryB && zipEltB) {
              zipEltB.value = generatedZip;
            } else if (zipElt) {
              zipElt.value = generatedZip;
            }
          } else if (!secondPass) {
            queryPSTAT(addr, city, queryB, true);
          } else {
            selectUND(selectList);
            result.setAttribute('style', 'display:inline-block');
            if (result.textContent === '') {
              result.textContent = "[FAILED: unable to determine county subdivision; please enter PSTAT manually.]";
            }
          }
          /*** ADDRESS PSTAT EXCEPTIONS ***/
          /*** NOTE: MUST MATCH WITH CONDITIONALS AT TOP OF PAGE ***/
        } else if (/81(01|19) mayo d.*/i.test(userEnteredAddress) && /madison/i.test(userEnteredCity)) {
          sortID = "D-4.06";
          matchAddr = userEnteredAddress.toUpperCase();
          generatedZip = "53719";
        } else if (/7(02|2(5|7)|49|50) university r.*/i.test(userEnteredAddress) && /madison/i.test(userEnteredCity)) {
          sortID = "D-1";
          matchAddr = userEnteredAddress.toUpperCase();
          generatedZip = "53705";
        } else if (/.*brookside d.*/i.test(userEnteredAddress) && /madison/i.test(userEnteredCity)) {
          sortID = "D-114.02";
          matchAddr = userEnteredAddress.toUpperCase();
          generatedZip = "53718";
        } else if (/.*halley w.*/i.test(userEnteredAddress) && /madison/i.test(userEnteredCity)) {
          sortID = "D-114.01";
          matchAddr = userEnteredAddress.toUpperCase();
          generatedZip = "53718";
        } else if (/7(53(0|8)|6(02|10|26|34|42)) mid ?town r.*/i.test(userEnteredAddress) && /madison/i.test(userEnteredCity)) {
          sortID = "D-4.05";
          matchAddr = userEnteredAddress.toUpperCase();
          generatedZip = "53719";
        } else if (/720(1|3) mid ?town r.*/i.test(userEnteredAddress) && /madison/i.test(userEnteredCity)) {
          sortID = "D-5.04";
          matchAddr = userEnteredAddress.toUpperCase();
          generatedZip = "53719";
        } else if (/.*camino del sol/i.test(userEnteredAddress) && /madison/i.test(userEnteredCity)) {
          sortID = "D-23.01";
          matchAddr = userEnteredAddress.toUpperCase();
          generatedZip = "53704";
        }
        if (sortID) {
          selectPSTAT(selectList, sortID, result, matchAddr);
          // Set zip code
          if (queryB && zipEltB) {
            zipEltB.value = generatedZip;
          } else if (zipElt) {
            zipElt.value = generatedZip;
          }
          /*** END OF EXCEPTIONS ***/
        } else if (!secondPass) {
          queryPSTAT(addr, city, queryB, true);
        } else {
          // data === null
          selectUND(selectList);
          result.setAttribute('style', 'display:inline-block');
          if (result.textContent === '') {
            result.textContent = "[FAILED: unable to determine county; please enter PSTAT manually.]";
          }
        }
      }
    });

    browser.runtime.onMessage.addListener(function (message) {
      if (message) {
        switch (message.key) {
          case "receivedNearestLib":
            var branchList = document.getElementById('branchcode'),
                msg = document.getElementById("nearestMPL"),
                list = document.getElementById("mapRegionList");
            if (branchList) {
              branchList.value = message.closestLib;

              if (list) {
                list.remove();
              }

              if (msg) {
                msg.remove();
              }

              msg = document.createElement('span');
              msg.id = "nearestMPL";
              msg.style = "display: inline-block;color:#00c000;margin-left:118px;";
              msg.textContent = "< Success! >";
              branchList.parentElement.appendChild(msg);
            }
            break;
          case "failedNearestLib":
            var branchList = document.getElementById('branchcode'),
                msg = document.getElementById("nearestMPL"),
                list = document.getElementById("mapRegionList");

            if (branchList) {

              if (list) {
                list.remove();
              }

              if (msg) {
                msg.remove();
              }

              msg = document.createElement('span');
              msg.id = "nearestMPL";
              msg.style = "display: inline-block;color:#c00;margin-left:118px;";
              msg.textContent = "< Failed to retrieve map data >";
              branchList.parentElement.appendChild(msg);
            }
            break;
        }
      }
    });

    var geocoder = browser.runtime.sendMessage({
      key: "queryGeocoder",
      URIencodedAddress: cleanAddr(addr),
      city: pullCity(city.value),
      isSecondPass: secondPass
    });
  }
}

// Listener for selecting the PSTAT for the MAD exceptions, MID,
// MOO, SUN, and VER or for selecting the PSTAT value by a patron's
// secondary address rather than their primary address
browser.runtime.onMessage.addListener(function (request) {
  if (request.key === "receivedMadException") {
    selectPSTAT(selectList, request.value, result, matchAddr);
  } else if (/received(m(id|oo)|sun|ver)PSTAT/i.test(request.key)) {
    selectPSTAT(selectList, request.value, result, matchAddr);
  } else if (request.key === "querySecondaryPSTAT") {
    var qspElt = document.getElementById('querySecondaryPSTAT'),
        addrB = document.getElementById('B_address'),
        cityB = document.getElementById('B_city');
    if (qspElt && addrB && cityB && addrB.value !== '' && cityB.value !== '') {
      userEnteredAddress = addrB.value;
      userEnteredCity = pullCity(cityB.value);
      queryPSTAT(addrB, cityB, true, false);
    } else {
      alert('You may only generate the PSTAT value from the ALTERNATE ADDRESS section, NOT the alternate contact section underneath.');
    }
  } else if (request.key === "noPstatByDist") {
    selectUND(selectList);
    result.textContent = "[FAILED: unable to determine county; please enter PSTAT manually.]";
  } else if (request.key === "querySecondaryPSTATFail") {
    var qspFailElt = document.getElementById('querySecondaryPSTATFail');
    if (qspFailElt) {
      alert("You must be currently editing a patron\'s record to generate the PSTAT value from their alternate address");
      qspFailElt.remove();
    }
  }
});