"use strict";

/**
 * This script is used to look up the proper PSTAT (sort1) value
 * for a patron's record based on their address, using the US
 * Census Geocoder
 */
 
var isPatronEditScn = /https:\/\/scls-staff\.kohalibrary\.com\/cgi-bin\/koha\/members\/memberentry\.pl/.test(window.location);

if (isPatronEditScn) {

  /*** INITIALIZATION : START ***/

  // Declare global variables
  var addrElt = document.getElementById('address'),
    addrEltAlt = document.getElementById('B_address'),
    targetAddr,
    cityElt = document.getElementById('city'),
    cityEltAlt = document.getElementById('B_city'),
    cityEltAltContact = document.getElementById('altcontactaddress3'),
    targetCity,
    zipElt = document.getElementById('zipcode'),
    zipEltAlt = document.getElementById('B_zipcode'),
    targetZip,
    selectList = document.getElementsByName('sort1'),
    noticeElt = document.createElement('div'),
    noticeEltAlt = document.createElement('div'),
    timerElt = document.createElement('span'),
    timerEltAlt = document.createElement('span'),
    timerListener,
    timerListenerAlt,
    useSecondaryElt = false,

    // The following variables are used in generating the geographically closest
    // library location to the patron.
    mapRegionList,
    matchAddr4DistQuery,
    branchList = document.getElementById('branchcode'),
    nearestMPL = document.createElement('span'),
    mapRegionListOld = document.getElementById('mapRegionList'),
    lnBreak1 = document.createElement('br'),
    lnBreak2 = document.createElement('br');

  // Give ids to br elements so we only add them once
  lnBreak1.id = "nearestMPLbreak1";
  lnBreak2.id = "nearestMPLbreak2";

  // Set selectList to reference the element
  selectList = (selectList.length > 0) ? selectList[0] : null;

  // Initialize the notice and result messages for communicating success/failure
  // and place them underneath the address field

  // Primary address field
  noticeElt.id = 'tractNotice';
  noticeElt.setAttribute('style', 'margin-top:.2em;margin-left:118px;font-style:italic;color:#c00;');
  timerElt.setAttribute('id', 'timerElt');

  if (addrElt) {
    addrElt.parentElement.appendChild(noticeElt);
  }

  // Secondary address field
  noticeEltAlt.id = 'tractNoticeAlt';
  noticeEltAlt.setAttribute('style', 'margin-top:.2em;margin-left:118px;font-style:italic;color:#c00;');
  timerEltAlt.setAttribute('id', 'timerEltAlt');

  if (addrElt) {
    addrEltAlt.parentElement.appendChild(noticeEltAlt);
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

      if (/^(\#|apt|bldg|fl(oor)?|ste|unit|r(oo)?m|dept)[0-9]+$/.test(addrParts[addrParts.length - 1])) {
        addrParts.pop();
      } else if (addrParts.length > 2 &&
        /^(\#|apt|bldg|fl(oor)?|ste|unit|r(oo)?m|dept)$/.test(addrParts[addrParts.length - 2]) &&
        /^[0-9]+$/.test(addrParts[addrParts.length - 1])) {
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
        if (useSecondaryElt) {
          noticeEltAlt.style.color = "#00c000";
          noticeEltAlt.textContent = ' [MATCH: ' + matchAddr + ']';
        } else {
          noticeElt.style.color = "#00c000";
          noticeElt.textContent = ' [MATCH: ' + matchAddr + ']';
        }

        // Add option to select geographically closest library location
        matchAddr4DistQuery = matchAddr.replace(/ /g, '+');

        if (!document.getElementById('nearestMPLbreak1') && !document.getElementById('nearestMPLbreak2')) {
          branchList.parentElement.appendChild(lnBreak1);
          branchList.parentElement.appendChild(lnBreak2);
        }
        nearestMPL.id = "nearestMPL";
        nearestMPL.textContent = "Set home library to geographically closest location within...";
        nearestMPL.style = "display: inline-block;cursor:pointer;color:#00c;text-decoration:underline;margin-left:118px;";
        nearestMPL.onmouseover = function() {
          document.getElementById('nearestMPL').style = "display: inline-block;cursor:pointer;color:#669acc;text-decoration:underline;margin-left:118px;";
        };
        nearestMPL.onmouseout = function() {
          document.getElementById('nearestMPL').style = "display: inline-block;cursor:pointer;color:#00c;text-decoration:underline;margin-left:118px;";
        };

        if (!mapRegionList) {
          mapRegionList = document.createElement('select');
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

          nearestMPL.onclick = function() {
            var selected = document.getElementById('mapRegionList').selectedOptions[0].value;

            browser.runtime.sendMessage({
              key: "findNearestLib",
              matchAddr4DistQuery: matchAddr4DistQuery,
              selected: selected
            });
          };

          branchList.parentElement.appendChild(nearestMPL);
          branchList.parentElement.appendChild(mapRegionList);
        }
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
  function showMsg(msg, c) {
    var color = c ? c : "#c00c00";
  
    if (useSecondaryElt) {
      clearInterval(timerListenerAlt);
      noticeEltAlt.style.color = color;
      noticeEltAlt.textContent = msg;
    } else {
      clearInterval(timerListener);
      noticeElt.style.color = color;
      noticeElt.textContent = msg;
    }
  }

  /**
   * This is the main function used to send a data query to the US
   * Census Geocoder. The data returned determines the way in which
   * the PSTAT is selected (i.e. Census Tract Number for MPL, Voting
   * district for SUN, MOO, MID, and VER, or the County Subdivision
   * for everywhere else.
   *
   * secondaryAddrQuery: if true, the query should
   * be performed with the alternate address field rather than the
   * primary address field.
   *
   */
  function queryPSTAT(secondaryAddrQuery) {
    // Set global vars
    useSecondaryElt = secondaryAddrQuery ? true : false;
    targetAddr = secondaryAddrQuery ? addrEltAlt : addrElt;
    targetCity = secondaryAddrQuery ? cityEltAlt : cityElt;
    targetZip = secondaryAddrQuery ? zipEltAlt : zipElt;

    if (targetAddr.value !== "" && targetCity.value !== "" && selectList) {
      // Generate loading message
      if (useSecondaryElt) {
        noticeEltAlt.style.color = "#c00c00";
        noticeEltAlt.textContent = "Searching, please wait: ";
        timerEltAlt.textContent = '16';
        noticeEltAlt.appendChild(timerEltAlt);

        clearInterval(timerListenerAlt);
        timerListenerAlt = self.setInterval(() => {
          timer()
        }, 1000);

        function timer() {
          if (!isNaN(timerEltAlt.textContent) && parseInt(timerEltAlt.textContent) > 1) {
            timerEltAlt.textContent = parseInt(timerEltAlt.textContent) - 1;
          } else {
            clearInterval(timerListenerAlt);
            if (!/MATCH/.test(noticeEltAlt.textContent)) {
              showMsg("[FAILED] Please search for PSTAT manually.");
            }
          }
        }
      } else {
        noticeElt.style.color = "#c00c00";
        noticeElt.textContent = "Searching, please wait: ";
        timerElt.textContent = '16';
        noticeElt.appendChild(timerElt);

        clearInterval(timerListener);
        timerListener = self.setInterval(() => {
          timer()
        }, 1000);

        function timer() {
          if (!isNaN(timerElt.textContent) && parseInt(timerElt.textContent) > 1) {
            timerElt.textContent = parseInt(timerElt.textContent) - 1;
          } else {
            clearInterval(timerListener);
            if (!/MATCH/.test(noticeElt.textContent)) {
              showMsg("[FAILED] Please search for PSTAT manually.");
            }
          }
        }
      }

      // Send Geocoder Query
      browser.runtime.sendMessage({
        key: "queryGeocoder",
        URIencodedAddress: cleanAddr(targetAddr),
        address: targetAddr.value,
        city: pullCity(targetCity.value)
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
        queryPSTAT(false);
      }
    });

    // Parse the city value for "MADISON WI"
    cityElt.addEventListener('blur', function() {
      parseMadisonWI(cityElt);
      queryPSTAT(false);
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
        switch (message.county) {
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
                sortCode = "D-MON-C1";
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
              case "Eau Pleine town":
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

            // Other Counties
          case "Ashland":
            switch (message.countySub) {
              case "La Pointe town":
              case "Mellen city":
              case "Ashland city":
                //TODO: Add Odanah tribal lands
                sortCode = "AS-LIB";
                break;
              case "Agenda town":
              case "Ashland town":
              case "Butternut town":
              case "Chippewa town":
              case "Gingles town":
              case "Gordon town":
              case "Jacobs town":
              case "Marengo town":
              case "Morse town":
              case "Peeksville town":
              case "Sanborn town":
              case "Shanagolden town":
              case "White River town":
                sortCode = "AS-NOLIB";
                break;
            }
            break;
          case "Barron":
            sortCode = "BA-LIB";
            break;
          case "Bayfield":
            switch (message.countySub) {
              case "Bayfield city":
              case "Cable town":
              case "Drummond town":
              case "Iron River town":
              case "Washburn city":
              case "Ashland city":
                //TODO: Add Bayfield tribal lands
                sortCode = "BY-LIB";
                break;
              case "Barksdale town":
              case "Barnes town":
              case "Bayfield town":
              case "Bayview town":
              case "Bell town":
              case "Clover town":
              case "Delta town":
              case "Eileen town":
              case "Grand View town":
              case "Hughes town":
              case "Kelly town":
              case "Keystone town":
              case "Lincoln town":
              case "Mason town":
              case "Mason village":
              case "Namakagon town":
              case "Orienta town":
              case "Oulu town":
              case "Pilsen town":
              case "Port Wing town":
              case "Russell town":
              case "Tripp town":
                sortCode = "BY-NOLIB";
                break;
            }
            break;
          case "Brown":
            sortCode = "BR-LIB";
            break;
          case "Buffalo":
            switch (message.countySub) {
              case "Alma city":
              case "Mondovi city":
                sortCode = "BU-NOLIB";
                break;
              case "Alma town":
              case "Belvidere town":
              case "Buffalo city":
              case "Buffalo town":
              case "Canton town":
              case "Cochrane village":
              case "Cross town":
              case "Dover town":
              case "Fountain City city":
              case "Gilmanton town":
              case "Glencoe town":
              case "Lincoln town":
              case "Maxville town":
              case "Milton town":
              case "Modena town":
              case "Mondovi town":
              case "Montana town":
              case "Naples town":
              case "Nelson town":
              case "Nelson village":
              case "Waumandee town":
                sortCode = "BU-NOLIB";
                break;
            }
            break;
          case "Burnett":
            switch (message.countySub) {
              case "Grantsburg village":
              case "Webster village":
                sortCode = "BT-LIB";
                break;
              case "Anderson town":
              case "Blaine town":
              case "Daniels town":
              case "Dewey town":
              case "Grantsburg town":
              case "Jackson town":
              case "La Follette town":
              case "Lincoln town":
              case "Meenon town":
              case "Oakland town":
              case "Roosevelt town":
              case "Rusk town":
              case "Sand Lake town":
              case "Scott town":
              case "Siren town":
              case "Siren village":
              case "Swiss town":
              case "Trade Lake town":
              case "Union town":
              case "Webb Lake town":
              case "West Marshland town":
              case "Wood River town":
                sortCode = "BT-NOLIB";
                break;
            }
            break;
          case "Calumet":
            switch (message.countySub) {
              case "Appleton city":
              case "Brillion city":
              case "Chilton city":
              case "Menasha city":
              case "New Holstein city":
                sortCode = "CA-LIB";
                break;
              default:
                sortCode = "CA-NOLIB";
                break;
            }
            break;
          case "Chippewa":
            switch (message.countySub) {
              case "Bloomer city":
              case "Cadott village":
              case "Chippewa Falls city":
              case "Cornell city":
              case "Stanley city":
                sortCode = "CH-LIB";
                break;
              default:
                sortCode = "CH-NOLIB";
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
              case "Gays Mills village":
              case "Prairie du Chien city":
              case "Soldiers Grove village":
                sortCode = "CR-LIB";
                break;
              default:
                sortCode = "CR-NOLIB";
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
            sortCode = "DO-LIB";
            break;
          case "Douglas":
            switch (message.countySub) {
              case "Solon Springs town":
              case "Superior city":
                sortCode = "DS-LIB";
                break;
              default:
                sortCode = "DS-NOLIB";
                break;
            }
            break;
          case "Dunn":
            switch (message.countySub) {
              case "Boyceville village":
              case "Colfax town":
              case "Menomonie city":
              case "Sand Creek town":
                sortCode = "DU-LIB";
                break;
              default:
                sortCode = "DU-NOLIB";
                break;
            }
            break;
          case "Eau Claire":
            switch (message.countySub) {
              case "Altoona city":
              case "Augusta city":
              case "Eau Claire city":
              case "Fairchild town":
              case "Fall Creek village":
                sortCode = "EC-LIB";
                break;
              default:
                sortCode = "EC-NOLIB";
                break;
            }
            break;
          case "Florence":
            sortCode = "FL-LIB";
            break;
          case "Fond du Lac":
            switch (message.countySub) {
              case "Brandon village":
              case "Campbellsport village":
              case "Fond du Lac city":
              case "North Fond du Lac village":
              case "Oakfield town":
              case "Ripon city":
              case "Waupun city":
                sortCode = "FO-LIB";
                break;
              default:
                sortCode = "FO-NOLIB";
            }
            break;
          case "Forest":
            switch (message.countySub) {
              case "Crandon city":
              case "Laona town":
              case "Wabeno town":
                sortCode = "FR-LIB";
                break;
              default:
                sortCode = "FR-NOLIB";
                break;
            }
            break;
          case "Grant":
            switch (message.countySub) {
              case "Bloomington town":
              case "Boscobel city":
              case "Cassville town":
              case "Cuba city":
              case "Dickeyville village":
              case "Fennimore city":
              case "Hazel Green town":
              case "Lancaster city":
              case "Livingston village":
              case "Montfort village":
              case "Muscoda village":
                sortCode = "GR-LIB";
                break;
              default:
                sortCode = "GR-NOLIB";
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
                sortCode = "IO-ARE-T";
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
              case "Hurley city":
              case "Mercer town":
              case "Montreal city":
                sortCode = "IR-LIB";
                break;
              default:
                sortCode = "IR-NOLIB";
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
              case "Paddock Lake village":
              case "Randall town":
                sortCode = "KE-NOLIB";
                break;
              default:
                sortCode = "KE-LIB";
                break;
            }
            break;
          case "Kewaunee":
            switch (message.countySub) {
              case "Algoma city":
              case "Kewaunee city":
                sortCode = "KW-LIB";
                break;
              default:
                sortCode = "KW-NOLIB";
                break;
            }
            break;
          case "La Crosse":
            sortCode = "LC-LIB";
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
              case "Antigo city":
              case "Elcho town":
              case "White Lake village":
                sortCode = "LN-LIB";
                break;
              default:
                sortCode = "LN-NOLIB";
            }
            break;
          case "Lincoln":
            switch (message.countySub) {
              case "Merrill city":
              case "Tomahawk city":
                sortCode = "LI-LIB";
                break;
              default:
                sortCode = "LI-NOLIB";
                break;
            }
            break;
          case "Manitowoc":
            switch (message.countySub) {
              case "Kiel city":
              case "Manitowoc city":
              case "Two Rivers city":
                sortCode = "MA-LIB";
                break;
              default:
                sortCode = "MA-NOLIB";
            }
            break;
          case "Marathon":
            switch (message.countySub) {
              case "Athens village":
                sortCode = "MN-ATH-V";
                break;
              case "Bergen town":
                sortCode = "MN-BRG-T";
                break;
              case "Berlin town":
                sortCode = "MN-BER-T";
                break;
              case "Bern town":
                sortCode = "MN-BRN-T";
                break;
              case "Bevent town":
                sortCode = "MN-BEV-T";
                break;
              case "Brighton town":
                sortCode = "MN-BRI-T";
                break;
              case "Brokaw village":
                sortCode = "MN-BRO-V";
                break;
              case "Cassel town":
                sortCode = "MN-CAS-T";
                break;
              case "Cleveland town":
                sortCode = "MN-CLE-T";
                break;
              case "Day town":
                sortCode = "MN-DAY-T";
                break;
              case "Easton town":
                sortCode = "MN-EAS-T";
                break;
              case "Eau Pleine town":
                sortCode = "MN-EAU-T";
                break;
              case "Edgar village":
                sortCode = "MN-EDG-V";
                break;
              case "Elderon town":
                sortCode = "MN-ELD-T";
                break;
              case "Elderon village":
                sortCode = "MN-ELD-V";
                break;
              case "Emmet town":
                sortCode = "MN-EMM-T";
                break;
              case "Fenwood village":
                sortCode = "MN-FEN-V";
                break;
              case "Frankfort town":
                sortCode = "MN-FRK-T";
                break;
              case "Franzen town":
                sortCode = "MN-FRZ-T";
                break;
              case "Green Valley town":
                sortCode = "MN-GRV-T";
                break;
              case "Guenther town":
                sortCode = "MN-GUE-T";
                break;
              case "Halsey town":
                sortCode = "MN-HAL-T";
                break;
              case "Hamburg town":
                sortCode = "MN-HAM-T";
                break;
              case "Harrison town":
                sortCode = "MN-HAR-T";
                break;
              case "Hatley village":
                sortCode = "MN-HAT-V";
                break;
              case "Hewitt town":
                sortCode = "MN-HEW-T";
                break;
              case "Holton town":
                sortCode = "MN-HOL-T";
                break;
              case "Hull town":
                sortCode = "MN-HUL-T";
                break;
              case "Johnson town":
                sortCode = "MN-JOH-T";
                break;
              case "Knowlton town":
                sortCode = "MN-KNW-T";
                break;
              case "Kronenwetter village":
                sortCode = "MN-KNN-V";
                break;
              case "Maine town":
                sortCode = "MN-MAI-T";
                break;
              case "Marathon City village":
                sortCode = "MN-MAR-V";
                break;
              case "Marathon town":
                sortCode = "MN-MAR-T";
                break;
              case "Marshfield city":
                sortCode = "MN-MFD-C";
                break;
              case "McMillan town":
                sortCode = "MN-MCM-T";
                break;
              case "Mosinee city":
                sortCode = "MN-MOS-C";
                break;
              case "Mosinee town":
                sortCode = "MN-MOS-T";
                break;
              case "Norrie town":
                sortCode = "MN-NOR-T";
                break;
              case "Plover town":
                sortCode = "MN-PLO-T";
                break;
              case "Reid town":
                sortCode = "MN-REI-T";
                break;
              case "Rib Falls town":
                sortCode = "MN-RIB-T";
                break;
              case "Rib Mountain town":
                sortCode = "MN-RBM-T";
                break;
              case "Rietbrock town":
                sortCode = "MN-RTB-T";
                break;
              case "Ringle town":
                sortCode = "MN-RIN-T";
                break;
              case "Rothschild village":
                sortCode = "MN-ROT-V";
                break;
              case "Schofield city":
                sortCode = "MN-SCH-C";
                break;
              case "Spencer town":
                sortCode = "MN-SPE-T";
                break;
              case "Spencer village":
                sortCode = "MN-SPE-V";
                break;
              case "Stettin town":
                sortCode = "MN-STE-T";
                break;
              case "Stratford village":
                sortCode = "MN-STR-V";
                break;
              case "Texas town":
                sortCode = "MN-TEX-T";
                break;
              case "Wausau city":
                sortCode = "MN-WAU-C";
                break;
              case "Wausau town":
                sortCode = "MN-WAU-T";
                break;
              case "Weston town":
                sortCode = "MN-WES-T";
                break;
              case "Weston village":
                sortCode = "MN-WES-V";
                break;
              case "Wien town":
                sortCode = "MN-WIE-T";
                break;
                // Marathon + Clark counties
              case "Abbotsford city":
                sortCode = "MN-ABB-C";
                break;
              case "Colby city":
                sortCode = "MN-COL-C";
                break;
              case "Dorchester village":
                sortCode = "MN-DOR-V";
                break;
              case "Unity village":
                sortCode = "MN-UNI-V";
                break;
                // Marathon + Shawano counties
              case "Birnamwood village":
                sortCode = "MN-BIR-V";
                break;
            }
            break;
          case "Marinette":
            sortCode = "MT-LIB";
            break;
          case "Marquette":
            switch (message.countySub) {
              case "Buffalo town":
                sortCode = "MQ-BUF-T";
                break;
              case "Crystal Lake town":
                sortCode = "MQ-CRL-T";
                break;
              case "Douglas town":
                sortCode = "MQ-DGS-T";
                break;
              case "Endeavor village":
                sortCode = "MQ-END-V";
                break;
              case "Harris town":
                sortCode = "MQ-HAR-T";
                break;
              case "Mecan town":
                sortCode = "MQ-MEC-T";
                break;
              case "Montello city":
                sortCode = "MQ-MON-C";
                break;
              case "Montello town":
                sortCode = "MQ-MON-T";
                break;
              case "Moundville town":
                sortCode = "MQ-MND-T";
                break;
              case "Neshkoro town":
                sortCode = "MQ-NES-T";
                break;
              case "Neshkoro village":
                sortCode = "MQ-NES-V";
                break;
              case "Newton town":
                sortCode = "MQ-NEW-T";
                break;
              case "Oxford town":
                sortCode = "MQ-OXF-T";
                break;
              case "Oxford village":
                sortCode = "MQ-OXF-V";
                break;
              case "Packwaukee town":
                sortCode = "MQ-PCK-T";
                break;
              case "Shields town":
                sortCode = "MQ-SHI-T";
                break;
              case "Springfield town":
                sortCode = "MQ-SPR-T";
                break;
              case "Westfield town":
                sortCode = "MQ-WST-T";
                break;
              case "Westfield village":
                sortCode = "MQ-WST-V";
                break;
            }
            break;
          case "Menominee":
            sortCode = "ME-LIB";
            break;
          case "Milwaukee":
            sortCode = "MI-LIB";
            break;
          case "Monroe":
            switch (message.countySub) {
              case "Cashton village":
              case "Kendall village":
              case "Norwalk village":
              case "Sparta city":
              case "Sparta town":
              case "Wilton town":
                sortCode = "MO-LIB";
                break;
              default:
                sortCode = "MO-NOLIB";
            }
            break;
          case "Oconto":
            switch (message.countySub) {
              case "Bagley town":
              case "Breed town":
              case "Gillett town":
              case "How town":
              case "Lakewood town":
              case "Lena town":
              case "Maple Valley town":
              case "Oconto Falls city":
              case "Oconto city":
              case "Suring village":
                sortCode = "OC-LIB";
                break;
              default:
                sortCode = "OC-NOLIB";
                break;
            }
            break;
          case "Oneida":
            switch (message.countySub) {
              case "Crescent town":
              case "Minocqua town":
              case "Newbold town":
              case "Pelican town":
              case "Pine Lake town":
              case "Rhinelander city":
              case "Three Lakes town":
                sortCode = "ON-LIB";
                break;
              default:
                sortCode = "ON-NOLIB";
            }
            break;
          case "Outagamie":
            switch (message.countySub) {
              case "Appleton city":
              case "Black Creek town":
              case "Hortonville village":
              case "Kaukauna city":
              case "Kimberly village":
              case "Little Chute village":
              case "New London city":
              case "Seymour city":
              case "Shiocton village":
                sortCode = "OU-LIB";
                break;
              default:
                sortCode = "OU-NOLIB";
                break;
            }
            break;
          case "Ozaukee":
            switch (message.countySub) {
              case "Bayside village":
              case "Belgium town":
              case "Belgium village":
              case "Fredonia town":
              case "Fredonia village":
              case "Newburg village":
                sortCode = "OZ-NOLIB";
                break;
              default:
                sortCode = "OZ-LIB";
                break;
            }
            break;
          case "Pepin":
            switch (message.countySub) {
              case "Durand city":
              case "Pepin town":
                sortCode = "PE-LIB";
                break;
              default:
                sortCode = "PE-NOLIB";
            }
            break;
          case "Pierce":
            sortCode = "PI-LIB";
            break;
          case "Polk":
            sortCode = "PO-LIB";
            break;
          case "Price":
            sortCode = "PR-LIB";
            break;
          case "Racine":
            switch (message.countySub) {
              case "Burlington city":
              case "Racine city":
              case "Rochester village":
              case "Union Grove village":
              case "Waterford town":
                sortCode = "RA-LIB";
                break;
            }
            break;
          case "Richland":
            switch (message.countySub) {
              case "Akan town":
                sortCode = "RI-AKA-T";
                break;
              case "Bloom town":
                sortCode = "RI-BLO-T";
                break;
              case "Boaz village":
                sortCode = "RI-BOA-V";
                break;
              case "Buena Vista town":
                sortCode = "RI-BUV-T";
                break;
              case "Dayton town":
                sortCode = "RI-DAY-T";
                break;
              case "Eagle town":
                sortCode = "RI-EAG-T";
                break;
              case "Forest town":
                sortCode = "RI-FOR-T";
                break;
              case "Henrietta town":
                sortCode = "RI-HEN-T";
                break;
              case "Ithaca town":
                sortCode = "RI-ITH-T";
                break;
              case "Lone Rock village":
                sortCode = "RI-LOR-V";
                break;
              case "Marshall town":
                sortCode = "RI-MAR-T";
                break;
              case "Orion town":
                sortCode = "RI-ORI-T";
                break;
              case "Richland Center city":
                sortCode = "RI-RCC-C";
                break;
              case "Richland town":
                sortCode = "RI-RIC-T";
                break;
              case "Richwood town":
                sortCode = "RI-RCH-T";
                break;
              case "Rockbridge town":
                sortCode = "RI-ROC-T";
                break;
              case "Sylvan town":
                sortCode = "RI-SYL-T";
                break;
              case "Westford town":
                sortCode = "RI-WES-T";
                break;
              case "Willow town":
                sortCode = "RI-WIL-T";
                break;
              case "Yuba village":
                sortCode = "RI-YUB-V";
                break;
                // Richland + Sauk counties
              case "Cazenovia village":
                sortCode = "RI-CAZ-V";
                break;
                // Richland + Vernon counties
              case "Viola village":
                sortCode = "RI-VIO-V";
                break;
            }
            break;
          case "Rock":
            switch (message.countySub) {
              case "Avon town":
                sortCode = "RO-AVON-T";
                break;
              case "Beloit city":
                sortCode = "RO-BEL-C";
                break;
              case "Beloit town":
                sortCode = "RO-BEL-T";
                break;
              case "Bradford town":
                sortCode = "RO-BRA-T";
                break;
              case "Center town":
                sortCode = "RO-CEN-T";
                break;
              case "Clinton town":
                sortCode = "RO-CLI-T";
                break;
              case "Clinton village":
                sortCode = "RO-CLI-V";
                break;
              case "Evansville city":
                sortCode = "RO-EVA-C";
                break;
              case "Footville village":
                sortCode = "RO-FOO-V";
                break;
              case "Fulton village":
                sortCode = "RO-FUL-V";
                break;
              case "Harmony town":
                sortCode = "RO-HAR-T";
                break;
              case "Janesville city":
                sortCode = "RO-JAN-C";
                break;
              case "Janesville town":
                sortCode = "RO-JAN-T";
                break;
              case "Johnstown town":
                sortCode = "RO-JOH-T";
                break;
              case "La Prairie town":
                sortCode = "RO-LAP-T";
                break;
              case "Lima town":
                sortCode = "RO-LIM-T";
                break;
              case "Magnolia town":
                sortCode = "RO-MAG-T";
                break;
              case "Milton city":
                sortCode = "RO-MIL-C";
                break;
              case "Milton town":
                sortCode = "RO-MIL-T";
                break;
              case "Newark town":
                sortCode = "RO-NEW-T";
                break;
              case "Orfordville village":
                sortCode = "RO-ORF-V";
                break;
              case "Plymouth town":
                sortCode = "RO-PLY-T";
                break;
              case "Porter town":
                sortCode = "RO-POR-T";
                break;
              case "Rock town":
                sortCode = "RO-ROC-T";
                break;
              case "Spring Valley town":
                sortCode = "RO-SPV-T";
                break;
              case "Turtle town":
                sortCode = "RO-TUR-T";
                break;
              case "Union town":
                sortCode = "RO-UNI-T";
                break;
                // Rock + Dane counties
              case "Edgerton city":
                sortCode = "RO-EDG-C";
                break;
                // Rock + Green counties
              case "Brodhead city":
                sortCode = "RO-BRD-C";
                break;
            }
            break;
          case "Rusk":
            switch (message.countySub) {
              case "Bruce village":
              case "Hawkins town":
              case "Ladysmith city":
                sortCode = "RU-LIB";
                break;
              default:
                sortCode = "RU-NOLIB";
            }
            break;
          case "Sawyer":
            switch (message.countySub) {
              case "Hayward city":
              case "Winter town":
              case "Winter village":
                //TODO: Include Hayward tribal land
                sortCode = "SA-LIB";
                break;
              default:
                sortCode = "SA-NOLIB";
                break;
            }
            break;
          case "Shawano":
            switch (message.countySub) {
              case "Almon town":
                sortCode = "SH-ALM-T";
                break;
              case "Angelica town":
                sortCode = "SH-ANG-T";
                break;
              case "Aniwa town":
                sortCode = "SH-ANI-T";
                break;
              case "Aniwa village":
                sortCode = "SH-ANI-V";
                break;
              case "Bartelme town":
                sortCode = "SH-BAT-T";
                break;
              case "Belle Plaine town":
                sortCode = "SH-BPL-T";
                break;
              case "Birnamwood town":
                sortCode = "SH-BIR-T";
                break;
              case "Bonduel village":
                sortCode = "SH-BON-V";
                break;
              case "Bowler village":
                sortCode = "SH-BOW-V";
                break;
              case "Cecil village":
                sortCode = "SH-CEC-V";
                break;
              case "Eland village":
                sortCode = "SH-ELA-V";
                break;
              case "Fairbanks town":
                sortCode = "SH-FRB-T";
                break;
              case "Germania town":
                sortCode = "SH-GER-T";
                break;
              case "Grant town":
                sortCode = "SH-GNT-T";
                break;
              case "Green Valley town":
                sortCode = "SH-GVY-V";
                break;
              case "Gresham village":
                sortCode = "SH-GRE-V";
                break;
              case "Hartland town":
                sortCode = "SH-HAR-T";
                break;
              case "Herman town":
                sortCode = "SH-HER-T";
                break;
              case "Hutchins town":
                sortCode = "SH-HUT-T";
                break;
              case "Lessor town":
                sortCode = "SH-LES-T";
                break;
              case "Maple Grove town":
                sortCode = "SH-MGR-T";
                break;
              case "Mattoon village":
                sortCode = "SH-MAT-V";
                break;
              case "Morris town":
                sortCode = "SH-MOR-T";
                break;
              case "Navarino town":
                sortCode = "SH-NAV-T";
                break;
              case "Pella town":
                sortCode = "SH-PEL-T";
                break;
              case "Red Springs town":
                sortCode = "SH-RSP-T";
                break;
              case "Richmond town":
                sortCode = "SH-RCH-T";
                break;
              case "Seneca town":
                sortCode = "SH-SEN-T";
                break;
              case "Shawano city":
                sortCode = "SH-SHW-C";
                break;
              case "Tigerton village":
                sortCode = "SH-TIG-V";
                break;
              case "Washington town":
                sortCode = "SH-WSH-T";
                break;
              case "Waukechon town":
                sortCode = "SH-WKN-T";
                break;
              case "Wescott town":
                sortCode = "SH-WES-T";
                break;
              case "Wittenberg town":
                sortCode = "SH-WIT-T";
                break;
              case "Wittenberg village":
                sortCode = "SH-WIT-V";
                break;
                // Shawano + Marathon counties
              case "Birnamwood village":
                sortCode = "SH-BIR-V";
                break;
                // Shawano + Oconto + Brown counties
              case "Pulaski village":
                sortCode = "SH-PUL-V";
                break;
                // Shawano + Waupaca counties
              case "Marion city":
                sortCode = "SH-MAR-C";
                break;
            }
            break;
          case "Sheboygan":
            switch (message.countySub) {
              case "Adell village":
              case "Cedar Grove village":
              case "Elkhart Lake village":
              case "Kohler village":
              case "Oostburg village":
              case "Plymouth city":
              case "Random Lake village":
              case "Scott town":
              case "Sheboygan Falls city":
              case "Sheboygan city":
              case "Sherman town":
                sortCode = "SA-LIB";
                break;
              default:
                sortCode = "SA-NOLIB";
            }
            break;
          case "St. Croix":
            switch (message.countySub) {
              case "Baldwin town":
              case "Deer Park village":
              case "Glenwood City city":
              case "Hammond town":
              case "Hudson city":
              case "New Richmond city":
              case "Roberts village":
              case "Somerset town":
              case "Woodville village":
                sortCode = "SC-LIB";
                break;
              default:
                sortCode = "SC-NOLIB";
                break;
            }
            break;
          case "Taylor":
            switch (message.countySub) {
              case "Gilman village":
              case "Medford city":
              case "Rib Lake town":
              case "Stetsonville village":
              case "Westboro town":
                sortCode = "TA-LIB";
                break;
              default:
                sortCode = "TA-NOLIB";
                break;
            }
            break;
          case "Trempealeau":
            switch (message.countySub) {
              case "Arcadia city":
              case "Blair city":
              case "Ettrick town":
              case "Galesville city":
              case "Independence city":
              case "Osseo city":
              case "Strum village":
              case "Trempealeau town":
              case "Whitehall city":
                sortCode = "TR-LIB";
                break;
              default:
                sortCode = "TR-NOLIB";
                break;
            }
            break;
          case "Vernon":
            switch (message.countySub) {
              case "Bergen town":
                sortCode = "VE-BRG-T";
                break;
              case "Chaseburg village":
                sortCode = "VE-CHA-V";
                break;
              case "Christiana town":
                sortCode = "VE-CHR-T";
                break;
              case "Clinton town":
                sortCode = "VE-CLI-T";
                break;
              case "Coon Valley village":
                sortCode = "VE-CVY-V";
                break;
              case "Coon town":
                sortCode = "VE-COO-T";
                break;
              case "Forest town":
                sortCode = "VE-FOR-T";
                break;
              case "Franklin town":
                sortCode = "VE-FRA-T";
                break;
              case "Genoa town":
                sortCode = "VE-GEN-T";
                break;
              case "Genoa village":
                sortCode = "VE-GEN-V";
                break;
              case "Greenwood town":
                sortCode = "VE-GRE-T";
                break;
              case "Hamburg town":
                sortCode = "VE-HAM-T";
                break;
              case "Harmony town":
                sortCode = "VE-HAR-T";
                break;
              case "Hillsboro city":
                sortCode = "VE-HIL-C";
                break;
              case "Hillsboro town":
                sortCode = "VE-HIL-T";
                break;
              case "Jefferson town":
                sortCode = "VE-JEF-T";
                break;
              case "Kickapoo town":
                sortCode = "VE-KIK-T";
                break;
              case "La Farge village":
                sortCode = "VE-LAF-V";
                break;
              case "Liberty town":
                sortCode = "VE-LIB-T";
                break;
              case "Ontario village":
                sortCode = "VE-ONT-V";
                break;
              case "Readstown village":
                sortCode = "VE-REA-V";
                break;
              case "Stark town":
                sortCode = "VE-STK-T";
                break;
              case "Sterling town":
                sortCode = "VE-STE-T";
                break;
              case "Stoddard village":
                sortCode = "VE-STO-V";
                break;
              case "Union town":
                sortCode = "VE-UNI-T";
                break;
              case "Viroqua city":
                sortCode = "VE-VIR-C";
                break;
              case "Viroqua town":
                sortCode = "VE-VIR-T";
                break;
              case "Webster town":
                sortCode = "VE-WEB-T";
                break;
              case "Westby city":
                sortCode = "VE-WES-C";
                break;
              case "Wheatland town":
                sortCode = "VE-WHE-T";
                break;
              case "Whitetown town":
                sortCode = "VE-WHI-T";
                break;
                // Vernon + Crawford counties
              case "De Soto village":
                sortCode = "VE-DSO-V";
                break;
                // Vernon + Richland counties
              case "Viola village":
                sortCode = "VE-VIO-V";
                break;
            }
            break;
          case "Vilas":
            switch (message.countySub) {
              case "Arbor Vitae":
                sortCode = "VI-NOLIB";
                break;
              default:
                sortCode = "VI-LIB";
            }
            break;
          case "Walworth":
            switch (message.countySub) {
              case "Darien town":
              case "Delavan city":
              case "East Troy town":
              case "Elkhorn city":
              case "Fontana on Geneva Lake village":
              case "Genoa City village":
              case "Lake Geneva city":
              case "Sharon town":
              case "Walworth town":
              case "Williams Bay village":
                sortCode = "WA-LIB";
                break;
              default:
                sortCode = "WA-NOLIB";
                break;
            }
            break;
          case "Washburn":
            break;
            switch (message.countySub) {
              case "Shell Lake city":
              case "Spooner city":
                sortCode = "WB-LIB";
                break;
              default:
                sortCode = "WB-NOLIB";
            }
          case "Washington":
            switch (message.countySub) {
              case "Germantown town":
              case "Hartford city":
              case "Kewaskum town":
              case "Milwaukee city":
              case "Slinger village":
              case "West Bend city":
                sortCode = "WG-LIB";
                break;
              default:
                sortCode = "WG-NOLIB";
                break;
            }
            break;
          case "Waukesha":
            switch (message.countySub) {
              case "Big Bend village":
              case "Brookfield city":
              case "Butler village":
              case "Delafield city":
              case "Eagle town":
              case "Eagle village":
              case "Elm Grove village":
              case "Hartland village":
              case "Lisbon town":
              case "Menomonee Falls village":
              case "Merton town":
              case "Milwaukee city":
              case "Mukwonago town":
              case "Muskego city":
              case "New Berlin city":
              case "Oconomowoc city":
              case "Pewaukee city":
              case "Sussex village":
              case "Waukesha city":
                sortCode = "WK-LIB";
                break;
              default:
                sortCode = "WK-NOLIB";
                break;
            }
            break;
          case "Waupaca":
            switch (message.countySub) {
              case "Bear Creek town":
                sortCode = "WP-BCR-T";
                break;
              case "Big Falls village":
                sortCode = "WP-BIF-V";
                break;
              case "Caledonia town":
                sortCode = "WP-CAL-T";
                break;
              case "Clintonville city":
                sortCode = "WP-CLI-C";
                break;
              case "Dayton town":
                sortCode = "WP-DAY-T";
                break;
              case "Dupont town":
                sortCode = "WP-DUP-T";
                break;
              case "Embarrass village":
                sortCode = "WP-EMB-V";
                break;
              case "Farmington town":
                sortCode = "WP-FAR-T";
                break;
              case "Fremont town":
                sortCode = "WP-FRE-T";
                break;
              case "Fremont village":
                sortCode = "WP-FRE-V";
                break;
              case "Harrison town":
                sortCode = "WP-HAR-T";
                break;
              case "Helvetia town":
                sortCode = "WP-HEL-T";
                break;
              case "Iola town":
                sortCode = "WP-IOL-T";
                break;
              case "Iola village":
                sortCode = "WP-IOL-V";
                break;
              case "Larrabee town":
                sortCode = "WP-LAR-T";
                break;
              case "Lebanon town":
                sortCode = "WP-LEB-T";
                break;
              case "Lind town":
                sortCode = "WP-LIN-T";
                break;
              case "Little Wolf town":
                sortCode = "WP-LWO-T";
                break;
              case "Manawa city":
                sortCode = "WP-MAN-C";
                break;
              case "Matteson town":
                sortCode = "WP-MAT-T";
                break;
              case "Mukwa town":
                sortCode = "WP-MUK-T";
                break;
              case "Ogdensburg village":
                sortCode = "WP-OGD-V";
                break;
              case "Royalton town":
                sortCode = "WP-ROY-T";
                break;
              case "Scandinavia town":
                sortCode = "WP-SCA-T";
                break;
              case "Scandinavia village":
                sortCode = "WP-SCA-V";
                break;
              case "St. Lawrence town":
                sortCode = "WP-STL-T";
                break;
              case "Union town":
                sortCode = "WP-UNI-T";
                break;
              case "Waupaca city":
                sortCode = "WP-WAU-C";
                break;
              case "Waupaca town":
                sortCode = "WP-WAU-T";
                break;
              case "Weyauwega city":
                sortCode = "WP-WEY-C";
                break;
              case "Weyauwega town":
                sortCode = "WP-WEY-T";
                break;
              case "Wyoming town":
                sortCode = "WP-WYO-T";
                break;
                // Waupaca + Outagamie counties
              case "New London city":
                sortCode = "WP-NLO-C";
                break;
                // Waupaca + Shawano counties
              case "Marion city":
                sortCode = "WP-MAR-C";
                break;
            }
            break;
          case "Waushara":
            switch (message.countySub) {
              case "Aurora town":
                sortCode = "WS-AUR-T";
                break;
              case "Bloomfield town":
                sortCode = "WS-BLO-T";
                break;
              case "Coloma town":
                sortCode = "WS-COL-T";
                break;
              case "Coloma village":
                sortCode = "WS-COL-V";
                break;
              case "Dakota town":
                sortCode = "WS-DAK-T";
                break;
              case "Deerfield town":
                sortCode = "WS-DEE-T";
                break;
              case "Hancock town":
                sortCode = "WS-HAN-T";
                break;
              case "Hancock village":
                sortCode = "WS-HAN-V";
                break;
              case "Leon town":
                sortCode = "WS-LEO-T";
                break;
              case "Lohrville village":
                sortCode = "WS-LOH-V";
                break;
              case "Marion town":
                sortCode = "WS-MAR-T";
                break;
              case "Mount Morris town":
                sortCode = "WS-MMO-T";
                break;
              case "Oasis town":
                sortCode = "WS-OAS-T";
                break;
              case "Plainfield town":
                sortCode = "WS-PLA-T";
                break;
              case "Plainfield village":
                sortCode = "WS-PLA-V";
                break;
              case "Poy Sippi town":
                sortCode = "WS-PSI-T";
                break;
              case "Redgranite village":
                sortCode = "WS-RED-V";
                break;
              case "Richford town":
                sortCode = "WS-RIC-T";
                break;
              case "Rose town":
                sortCode = "WS-ROS-T";
                break;
              case "Saxeville town":
                sortCode = "WS-SAX-T";
                break;
              case "Springwater town":
                sortCode = "WS-SPR-T";
                break;
              case "Warren town":
                sortCode = "WS-WAR-T";
                break;
              case "Wautoma city":
                sortCode = "WS-WAU-C";
                break;
              case "Wautoma town":
                sortCode = "WS-WAU-T";
                break;
              case "Wild Rose village":
                sortCode = "WS-WRO-V";
                break;
                // Waushara + Green Lake counties
              case "Berlin city":
                sortCode = "WS-BER-C";
                break;
            }
            break;
          case "Winnebago":
            switch (message.countySub) {
              case "Menasha city":
              case "Neenah city":
              case "Omro city":
              case "Oshkosh city":
              case "Winneconne town":
                sortCode = "WI-LIB";
                break;
              default:
                sortCode = "WI-NOLIB";
                break;
            }
            break;
            // If no data was returned, test against the Madison exceptional addresses, Middleton, Monona, Sun Prairie, and Verona
          default:
            if (/madison wi/i.test(targetCity.value)) {
              browser.runtime.sendMessage({
                key: "getPstatByDist",
                matchAddr: targetAddr.value,
                lib: "Mad"
              });
            } else if (/middleton wi/i.test(targetCity.value)) {
              browser.runtime.sendMessage({
                key: "getPstatByDist",
                matchAddr: targetAddr.value,
                lib: "Mid"
              });
            } else if (/sun prairie wi/i.test(targetCity.value)) {
              browser.runtime.sendMessage({
                key: "getPstatByDist",
                matchAddr: targetAddr.value,
                lib: "Sun"
              });
            } else if (/verona wi/i.test(targetCity.value)) {
              browser.runtime.sendMessage({
                key: "getPstatByDist",
                matchAddr: targetAddr.value,
                lib: "Ver"
              });
            }
        }

        // Set Zip code
        if (message.zip) {
          targetZip.value = message.zip;
        }

        // Set PSTAT 
        if (sortCode) {
          selectPSTAT(sortCode, message.matchAddr);
        } else {
          selectUND();
        }
        break;
      case "receivedMAD":
        selectPSTAT(message.value, targetAddr.value);
        targetZip.value = message.zip;
        break;
      case "receivedMidPSTAT":
      case "receivedSunPSTAT":
      case "receivedVerPSTAT":
        selectPSTAT(message.value, message.matchAddr);
        break;
      case "querySecondaryPSTAT":
        if (addrEltAlt && addrEltAlt.value !== "" && cityEltAlt && cityEltAlt.value !== "") {
          queryPSTAT(true);
        } else {
          alert('Please ensure that you have put the residential address in the "Alternate Address" field and not the "Alternate Contact" field.');
        }
        break;
      case "querySecondaryPSTATFail":
        break;
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
  });

  /*** RUNTIME MESSAGE LISTENERS : END ***/
}