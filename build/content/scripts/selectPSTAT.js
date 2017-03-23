"use strict";

var addrElt = document.getElementById('address'),
    cityElt = document.getElementById('city'),
    notice = document.createElement('div'),
    result = document.createElement('span'),
    userEnteredAddress,
    userEnteredCity,
    matchAddr4DistQuery,
    selected;
notice.id = 'tractNotice';
notice.setAttribute('style', 'margin-top:.2em;margin-left:118px;font-style:italic;color:#c00;');
result.setAttribute('id', 'tractResult');

if (addrElt && cityElt) {
  addrElt.addEventListener('blur', function () {
    userEnteredAddress = this.value;
    if (addrElt.value && cityElt.value) {
      userEnteredCity = cityElt.value;
      queryPSTATPrep();
    }
  });

  cityElt.addEventListener('blur', function () {
    parseMadisonWI(this);
    userEnteredCity = pullCity(cityElt.value);
    if (addrElt.value && cityElt.value) {
      userEnteredAddress = addrElt.value;
      queryPSTATPrep();
    }
  });

  addr.parentElement.appendChild(notice);
}

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

function pullCity(city) {
  var cty = '',
      ctyArr,
      i;
  if (city !== null) {
    ctyArr = city.replace(/[^a-zA-Z 0-9]+/g, '').toLowerCase().split(' ');
    for (i = 0; i < ctyArr.length - 1; i++) {
      if (i === 0) {
        cty += ctyArr[i];
      } else {
        cty += " " + ctyArr[i];
      }
    }
  }
  return cty;
}

function selectUND(selectList) {
  var addr = document.getElementById('address');
  if (addr && selectList && selectList.children[selectList.selectedIndex].value === '') {
    selectList.value = "X-UND";
  }
}

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

function queryPSTAT(addr, city, queryB, secondPass) {
  var entryForm = document.forms.entryform,
      selectList = entryForm ? entryForm.elements.sort1 : null,
      notice = document.getElementById('tractNotice'),
      zipElt = document.getElementById('zipcode'),
      zipEltB = document.getElementById('B_zipcode');

  if (addr.value !== "" && city.value !== "" && selectList) {
    var handleResponse = function handleResponse(message) {
      switch (message.key) {
        case "receivedGeocoderQuery":
          if (message.hasData) {
            var matchAddr = message.matchAddr.split(',')[0].toUpperCase(),
                sortID = "X-UND",
                generatedZip = message.zip,


            // Add button to allow staff to select the geographically closest MPL location
            matchAddr4DistQuery = message.matchAddr.replace(/ /g, "+"),
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
                    if (/.*(arrowhead d|baskerville a|clear spring c|(6[01][13579]|61[7-9]|6[2-9][0-9]|[7-9][0-0]{2}) w(est)? dean a|ferchland p|(707|80[57]) greenway r|grove s|joyce r|mathys r|4[0-9]{2}[13579] mckenna r|mesa r|4[5-6][0-9][13579] midmoor r|(3[7-9][0-9]{2}|4[0-2][0-9]{2}) monona d|monona r|11(19|20|22) nichols r|(44[0-9]{2}|4810) outlook s|10[35] parkway d|progressive l|roigan t|rothman p|schultz p|thunderbird l|tonyawatha t|vogts l|waterman w|winnequah d|(4[23][0-9][13579]|44[0-2][13579]|54[01][02468]|4[5-9][0-9]{2}|5[0-3][0-9]{2}|540[13]) winnequah r|[0-9]?[0-9]{2}[13579] winnequah t|wyldhaven a).*/i.test(matchAddr)) {
                      sortID = "D-MON-C1";
                    } else if (/.*(w(est)? coldspring a|([1-5][0-9]{2}|6(0[02468]|1[0246])) w(est)? dean a|gordon a|greenway r|healy l|lamboley a|lofty a|maywood r|(500[579]|51[0-9][13579]|520[13579]) mckenna r|(47[1-9][13579]|4[89][0-9][13579]|5[01][0-9][13579]|52[01][13579]|44(08|[1-9][02468])|4[5-9][0-9][02468]|5[01][0-9][02468]|52(0[02468]|1[02])) midmoor r|(4[2-9][0-9]{2}|5[0-2][0-9]{2}) monona d|navajo t|([1-7][0-9][13579]|80[13579]|81[13]) nichols r|oak c|450[0-9] outlook s|10[46] parkway d|s(ain)?t teresa t|schluter r|schofield (a|s)|shore acres r|sioux t|spring h(aven)?|starry a|valorie l|wallace a|(4[2-4][0-9][02468]|551[35]|55[1-9][02468]|561[024]) winnequah r|woodridge r).*/i.test(matchAddr)) {
                      // NOTE: 707, 805, 807 Greenway Rd => D-MON-C1
                      sortID = "D-MON-C2";
                      if (/5(3[0-9][02468]|4[0-9][02468]|50[246]) maywood r/i.test(matchAddr)) {
                        sortID = "D-MON-C3";
                      }
                    } else if (/.*(anthony p|birch haven c|brant p|(5[7-9][0-9][13579]|6[0-3][0-9][13579]) bridge r|cardinal c|cove c|dellwood c|ela t|engel s|flamingo r|frost ?woods r|garden c|goucher l|graham a|greenwood s|henuah c|kelly p|5[3-6][0-9]{2} mckenna r|5[3-7][0-9]{2} midmoor r|midwood a|5[3-9][0-9]{2} monona d|monona p|moygara r|neponset t|[3-9][0-9][02468] nichols r|(n(orth )?e(ast)? )?nishishin t|owen r|panther t|pheasant hill r|pocohontas d|ridgewood a|squaw c|stone t|tecumseh a|(55[0-9][13579]|5618|6[34][0-9]{2}) winnequah r|[0-9]?[0-9]{2}[02468] winnequah t).*/i.test(matchAddr)) {
                      // NOTE: 5506-5202 [EVEN] Maywood Rd addressed in previous conditional
                      sortID = "D-MON-C3";
                      if (/((2(0[6-9]|[1-9][0-9])|3[0-9]{2}|4(0[0-9]|1[0-2])) frost ?woods r|4[0-9]{2} greenwood s|63(0[4-9]|1[0-4]) midwood a).*/i.test(matchAddr)) {
                        sortID = "D-MON-C4";
                      }
                    } else if (/.*(acacia l|admiral d|asher c|bartels s|bjelde l|(5[7-9][0-9]{2}|6[0-4][0-9]{2}) bridge r|(e(ast)?|w(est)?) broadway|broadway (e(ast)?|w(est)?)| columbia c|copps a|crestview d|e(ast)? ?gate r|falcon c|femrite d|ford s|gateway g|gisholt d|industrial d|interlake d|jeffrey c|kathryn s|kings r|kristi c|labelle l|mangrove l|midland l|6[0-9]{3} monona d|pflaum r|pirate island r|queens w|raywood r|river p|roselawn a|royal a|sethne c|shato l|sleepy lagoon d|southern c|sylvan l|taylor s|tompkins d|water ?front d|w(est)? ?gate r|whispering waters c|6[3-9][0-9]{2} winnequah r|woodstock c|woody l).*/i.test(matchAddr)) {
                      // NOTE: 206-412 [EVEN] Frost Woods Rd addressed in previous conditional
                      // NOTE: 400s Greenwood St addressed in previous conditional
                      // NOTE: 6304-6314 Midwood Ave addressed in previous conditional
                      sortID = "D-MON-C4";
                    }
                    break;
                  case "Madison city":
                    /*** NOTE: MUST MATCH WITH CONDITIONALS AT BOTTOM OF PAGE ***/
                    if (/81(01|19) mayo d.*/i.test(userEnteredAddress) && /madison/i.test(userEnteredCity)) {
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
                    } else {
                      sortID = "D-" + message.censusTract;
                    }
                    break;
                  case "Madison town":
                    sortID = "D-MAD-T";
                    break;
                  case "Middleton city":
                    if (/.*(aspen c|aurora s|blackhawk r|blackwood c|1(8(09|[1-9][0-9])|9[0-9]{2}) bristol s|cayuga s|cobblestone c|1(2[6-9][0-9]|[3-9][0-9]{2}) deming w|elderwood c|7([0-7][0-9]{2}|800) elmwood ave|foxridge c|greenway b|grosse point d|hambrecht r|henry c|henry s|(1[2-7][0-9][02468]|1[4-7][0-9][13579]) n(orth)? high point r|hillcrest a|7([0-5][0-9]{2}|600) hubbard a|john q\.? hammons d|77[0-9]{2} kenyon d|market s|meadow c|1[7-9][0-9][02468] middleton s|1[7-9][0-9]{2} park s|(1[4-6][0-9][02468]|1[7-9][0-9]{2}) parmenter s|(1322|1[4-9][0-9]{2}) pleasant view r|quarry r|research w|reservoir r|7[0-4][0-9][02468] south a|stratford c|sunset c|terrace a|[78][0-9]{3} university a).*/i.test(matchAddr)) {
                      sortID = "D-MID-C1";
                    } else if (/.*(boundary r|briarcliff l|camberwell c|canterbury c|clovernook c|clovernook r|club c|devonshire c|falcon c|fargo c|fortune d|n(orth)? gammon rd|granite c|(e(ast)?|w(est)?) hampstead ct|1[23][0-9][13579] n(orth)? high point r|hunter's c|7[4-6][0-9]{2} kenyon d|knights c|lannon stone c|1[2-6][0-9]{2} middleton s|muirfield c|park shores c|15[0-9]{2} park s|1[4-6][0-9][13579] parmenter s|pond view c|pond view r|quartz c|red oak c|rooster r|sandstone c|sellery s|shirley (c|s)|sleepy hollow c|7[2-4][0-9][13579] south a|squire c|stone glen d|stonefield c|6[3-7][0-9]{2} stonefield r|sweeny d|voss p|westchester d|n(orth)? westfield rd|windfield w|woodgate r|wydown c).*/i.test(matchAddr)) {
                      sortID = "D-MID-C2";
                    } else if (/.*(anderson a|beechwood c|boulder l|[0-9]{3}[02468] branch s|2[0-2][0-9]{2} bristol s|clark s|columbus d|coolidge c|cooper (a|c)|countryside d|cypress t|dohse c|(6[2-5][0-9][13579]|6[6-9][0-9]{2}) elmwood a|franklin a|s(outh)? gateway|6[3-9][0-9]{2} hubbard a|lee s|maple (c|s)|mayflower d|(6[6-9][0-9]{2}|7[0-2][0-9]{2}) maywood a|meadowcrest l|2[01][0-9]{2} middleton s|nina c|north a|orchid l|park lawn p|(16[0-9]{2}|1[7-9][0-9][13579]|2[0-4][0-9]{2}) park s|2[0-4][0-9][13579] parmenter s|pinta c|santa maria c|shady oak c|(6[3-9][0-9]{2}|7[01][0-9][13579]) south a|62[0-9]{2} stonefield r|(6[6-9][0-9][13579]|6(6[5-9][02468]|[7-9][0-9][02468])|7[0-4][0-9][02468]) university a|violet p|walnut c|willow t|(e(ast)?|w(est)?) wood cir|wood r).*/i.test(matchAddr)) {
                      sortID = "D-MID-C3";
                    } else if (/.*(adler c|allen b|amherst r|[0-9]{3}[13579] branch s|butler c|6[1-5][0-9][13579] century a|century harbor r|charing cross l|countryside l|dewey c|6[2-5][0-9]{2} elmwood a|n(orth)? gateway|lake s|lakefield c|lakeview (a|b)|6[2-5][0-9]{2} maywood a|maywood c|mendota a|middleton beach r|middleton springs d|mound d|oakwood p|overlook p|paske c|pheasant l|(6([1-5][0-9]{2}|6([01][0-9]|2[0-2]))|6(2(5[1-9]|[6-9][0-9])|[3-5][0-9][13579])|63[0-9]{2}) university a).*/i.test(matchAddr)) {
                      sortID = "D-MID-C4";
                    } else if (/.*(airport r|alpha l|bauer c|belle fontaine b|black opal a|bravo l|calla p|caneel t|capitol view r|cardinal d|(6[89][0-9]{2}|[789][0-9]{3}) century a|century p|charis t|charlie l|companion l|delta l|[23][0-9]{3} deming w|discovery d|(6[89][0-9][02468]|7[0-6][0-9]{2}) donna d|eagle d|echo l|evergreen r|fairway p|feather l|flagstone c|forsythia (c|s)|7[0-4][0-9]{2} friendship l|glenn l|glenview c|graber r|(n(orth)?|s(outh)?|w(est)?) greenview dr|3[3-9][0-9][02468] high r|kasten c|knoll c|laura l|lily l|lisa l|lynn (c|s)|29[0-9]{2} meadowbrook r|misty valley d|mockingbird l|montclair d|murphy d|newton c|niebler l|nightingale c|nightingale l|northbrook d|nursery d|park c|(2[6-8][0-9][02468]|(29[0-9]{2}|3[0-2][0-9]{2})|3[3-7][0-9]{2}) park s|(2[0-4][0-9][02468]|(2[5-9][0-9]{2}|[34][0-9]{3})) parmenter s|parview r|patty l|peak view w|pinehurst d|(2[0-9]{3}|3[0-2][0-9]{2}) pleasant view r|prairie d|ravine c|ravine d|red beryl d|rohlich c|sand pearl t|selleck l|shower c|spring hill c|7[0-9]{3} spring hill d|sunstone l|tribeca d|7[5-9][0-9]{2} university a|university g|uw health c|webber r|white coral w|yukon w).*/i.test(matchAddr)) {
                      sortID = "D-MID-C5";
                    } else if (/.*(aldo leopold w|algonquin d|apprentice p|associates w|black cherry l|brookdale d|(6[1-589][0-9][02468]|6[67][0-9]{2}) century a|(n(orth)?|s(outh)?) chickahauk t|conservancy l|diversity r|6[89][0-9][13579] donna d|erdman b|fellowship r|forest glade c|frank lloyd wright a|69[0-9]{2} friendship l|gaylord nelson r|glacier ridge r|harmony w|3[3-9][0-9][13579] high r|john muir d|mandimus c|mantino c|marina d|28[0-9]{2} meadowbrook r|old creek r|(2[6-8]|3[3-8])[0-9][13579] park s|pheasant branch r|phil lewis w|prairie glade r|ramse r|river birch l|spring grove c|3[67][0-9]{2} spring hill d|strawberry l|whittlesey r).*/i.test(matchAddr)) {
                      sortID = "D-MID-C6";
                    } else if (/.*(anna l|aster c|baskerville (a|w)|cedar c|cedar ridge r|cedar t|(5[12][0-9][13579]|(5[3-9][0-9]{2}|6[0-9]{3})) century a|clarewood c|connie l|creekview d|dahlia c|dianne d|elm l|harbor village r|heather (c|r)|hedden r|highland (c|t|w)|jennifer l|jonquil c|5[34][0-9][13579] larkspur r|lincoln s|marigold c|mathews r|mendota d|(3([6-8][0-9][02468]|90[0246])|3[6-9][0-9][13579]) rolling hill d|roosevelt s|sarah l|south ridge w|sunrise c|taft s|tomahawk c|valley creek c|valley ridge p|3[4-9][0-9]{2} valley ridge r|waconica l|woodcreek l|woodland t).*/i.test(matchAddr)) {
                      sortID = "D-MID-C7";
                    } else if (/.*(brindisi c|bunker h|5[12][0-9][02468] century a|churchil l|c(ou)?nty h(igh)?wa?y q|concord d|conservancy d|flyway c|frisco c|goldfinch c|grassland t|heron t|hilltop c|indigo w|iris c|lakespur c|54[0-9][02468] larkspur r|lexington (c|d)|marino c|milano c|mirandy rose c|monarch c|napoli l|nappe d|nathan hale c|park t|patrick henry w|prairie rose c|redtail p|rock crest r|39[1-9][0-9] rolling hill d|roma l|salerno c|sandhill d|savannah c|sedgemeadow r|shorecrest d|signature d|teal c|torino c|upland (c|t)|4[0-9]{3} valley ridge r|wenlock rose c).*/i.test(matchAddr)) {
                      sortID = "D-MID-C8";
                    }
                    break;
                  case "Middleton town":
                    sortID = "D-MID-T";
                    break;
                  case "Sun Prairie city":
                    if (/.*(allen a|angell s|arrowhead c|baneberry d|barbara s|benz c|birchwood t|(12[13579]|1[3-9][13579]|2([0-7][13579]|8[1357])) n(orth)? bird s|[1-9][0-9][13579] s(outh)? bird s|blankenheim l|bluestem c|(1[4-9][13579]|[2-5][0-9][13579]|6[0-3][13579]|1[0-9][02468]|2([0-5][02468]|6[02])) n(orth)? bristol s|s(outh) bristol s|camp ?fire d|cannery (p|s)|cardinal crest d|carriage d|cattail c|chase b|church s|clara s|clardell d|clements a|cliff s|([1-7][0-9]{2}|8([0-3][02468]|4[02])[89][0-9][13579]) columbus s|crescent c|cypress c|(7[01][13579]|72[13]) daniel s|derby d|dewey s|elizabeth c|elizabeth l|e(ast)? elm s|featherwood p|flint s|foxglove d|frances c|[5-7][0-9]{2} frederick s|galena c|gary c|gas light d|gerald a|glenview l|[12][0-9][12579] e(ast)? goodland s|granite w|grove s|hanley d|harvest l|hawthorn d|hickory c|hill(crest)? (s|c|d)|hummingbird c|jackson s|james c|jeanne c|jones s|joyce c|katherine d|kelly s|king s|kingston ci|3[0-9][13579] e(ast)? kohler s|kroncke d|(e(ast)?|w(est)?) lane s|larkspur c|laura s|[3-7][0-9]{2} linnerud d|e(ast)? main s|[1-6][0-9]{2} w(est)? main s|maple s|market s|marshview d|martin s|meadow(lark d|sweet c)|mockingbird l|(n(orth)?|s(outh)?) musket ridge( d)?|[12][0-9]{2} north s|oak s|old indian mound t|oriole c|pelican l|pilgrim t|powder horn r|prairie clover c|prairie rose d|railroad s|remington w|robin d|roland s|sandpiper c|sandstone t|sanibel l|scheuerell l|schuster r|shirley w|south s|spoke c|stagecoach c|stonecress c|sumter c|sunnyview l|sunset c|surrey (c|d)|sweet grass d|swordleaf l|talon p|thomas d|thunderbird l|timber r|town hall d|([12][0-9]{2}|3[0-2][0-9]) union s|valley ridge d|vernig r|vine s|walbridge c|wellington c|westend c|westover c|westridge d|white tail d|williamson a|willow brook t|[4-7][0-9]{2} wilson s|[1-7][0-9][13579] windsor s|wood violet l|woodgrove w|woodview d).*/i.test(userEnteredAddress)) {
                      sortID = "D-SP-C1";
                    } else if (/.*(allison s|andrews d|arabian c|aspen p|athletic w|baitinger c|barrington d|betty lee c|(6(1[79]|[2-9][13579])|7(0[13579]|13)|9(2[79]|[3-9][13579])|1([0-3][0-9][13579]|4([01][13579]|21))|5(3[468]|[4-9][02468])|[6-8][0-9][02468]|9([0-2][02468]|3[02])) n(orth)? bird s|birkinbine d|blaser c|boulder w|([89][0-9][13579]|10[0-4][13579]|[3-8][0-9][02468]) n(orth)? bristol s|([6-9][0-9]{2}|1([0-3][0-9][13579])|4([01][13579]|2[1357])) broadway d|broome s|bruce s|bunker hilll d|calico (c|l)|cardinal w|carrington d|1[2-6[0-9]{2} chadsworth d|8[0-9]{2} chalfont d|chandler l|chicory w|chipper l|circle d|cobblestone c|columbus c|(8[6-9][02468]|9[0-9][02468]|1[0-3][0-9][02468]|1203) columbus s|continental w|crossing ridge (c|t)|daniel s|7(1[68]|[2-9][02468])|[89][0-9]{2}|1[01][0-9]{2} daniel s|dickson d|donald d|(6[3-9]|[78][0-9])[13579] eddington d|w(est)? elm s|18[0-9]{2} essex d|fairchild s|fitness r|gayle c|[12][0-9][02468] e(ast)? goodland s|w(est)? goodland s|grandview c|grandview d|harmon c|harwood c|16[0-9]{2} hidden valley t|homestead d|hoover s|huntwick c|independence w|jenifer c|jerico l|juniper s|(e(ast)?|w(est)?) klubertanz d|knorr s|(1[0-9][13579]|[1-3][0-9][02468]) e(ast)? kohler s|w(est)? kohler s|kuhle d|lewis c|liberty b|liberty d|lincoln (c|d)|lois d|lori (c|l)|luther d|(e(ast)?|w(est)?) macarthur s|maynard d|miller s|millrun c|north pine s|[3-9][0-9]{2} north s|old glory w|park view d|patriot w|paul s|pebblebrook t|pine s|pony l|robert (c|d)|ruxton ridge d|sandridge t|sawyer w|scenic c|scenic ridge p|schiller s|school s|schumann s|s(ain)?t albert the great c|(([89]|1[0-8])[0-9][13579]|([89]|1[0-6])[0-9][02468]) s(ain)?t albert the great d|([89]|1[0-8])[0-9]{2} steven s|stone quarry r|([1-9][0-9]|[0-9]{3}|1[0-2][0-9]{2}) stonehaven d|stonewood (c|x)|stull s|summit a|taft s|tara d|terrace c|tower d|trapp s|(3[3-9][0-9]|[45][0-9]{2}) union s|vandenburg s|village l|wagner c|wallinford d|werner c|william d|windemere c|([1-7][0-9][02468]|1[45][0-9][02468]) windsor s|woodland d|woodsend c).*/i.test(userEnteredAddress)) {
                      sortID = "D-SP-C2";
                    } else if (/.*(amber t|andaman s|apple d|audley d|bailey r|beech (c|s)|(1(1[2468]|[2-9][02468])|2([0-7][02468]|80)) n(orth)? bird s|(1[2-9][02468]|[23][0-9][02468]|4[0-4][02468]|7(4[68]|5[02])) s(outh)? bird s|blazingstar l|blue aster b|briar l|(2[0-8][13579]) broadway d|brown bear w|buena vista d|castle d|celebration b|clarmar d|colony c|[1-9][0-9]{2}[13579] colorado a|compass plant b|coral d|cornwall c|covey s|covington trl|crystal l|davison d|diamond c|don simon d|dover w|echo d|emerald t|emerson s|enterprise l|field c|fireside s|fountain d|foxdale d|([8-9]|10)[0-9]{2} frederick s|garden d|garnet d|s(outh)? goldenrod d|n(orth)? grand a|greenfield c|harmony s|hart r|harvard d|hazelnut t|heath c|heritage (c|l)|hunters t|huntington d|irish c|ivory d|jade c|jasper c|jenny wren t|joshua c|koshkonong w|s(outh)? legacy w|leopold w|linnerud c|1[3-7][0-9]{2} linnerud d|s(outh)? longfield d|lothe s|1[0-1][0-9][13579] w(est)? main s|major w|new town d|o'?keeffe a|oconto d|olymipic s|oneida c|park c|pasque s|pearl l|percheron t|pleasant s|prairie dog d|prairie r|prospect (c|d)|providence (c|s)|queens s|rickel r|ring s|ruby l|rustic d|sapphire w|severson d|shane c|silverado d|sky blue d|smith'?s (c|x)|smithfield d|spahn c|sun c|sunfield s|sweet sparrow p|tall grass t|thoreau d|triumph d|us h(igh)?wa?y 151|villa c|walker c|(n(orth)?|s(outh)?) walker w|[1-9][0-9] walmar d|wild iris s|[89][0-9]{2} wilson s|winding stream w|wyoming a).*/i.test(userEnteredAddress)) {
                      sortID = "D-SP-C3";
                    } else if (/.*(abbington c|abbott l|amberson d|armagh l|atcheson a|bainbridge c|barrington c|bella w|berwick d|bethany c|black wolf t|blue heron b|bookham d|box hill r|brantford l|brighton d|([23][0-9][02468]|1[0-4][[0-9][02468]) broadway d|bull r|burnham c|camden l|1[78][0-9]{2} chadsworth d|9[0-9]{2} chalfont d|cobham l|collingwood d|[1-9][0-9]{2}[02468] colorado a|concord d|corinth d|cottage c|delaware d|dolan d|duncannon w|durham d|dynes w|eddington d|edgemore d|edmonton d|effingham w|(19[0-9]{2}|2[0-3][0-9]{2}) essex d|frawley d|gray hawk w|greenbriar d|hawaii l|(n(orth)?|s(outh)?) heatherstone d|17[0-9]{2} hidden valley t|huntsville r|innsbrooke d|invermere d|ironwood d|jo ann c|kelvington d|kentville d|kerry d|kimberton c|kings forest c|lynwood d|3[0-9]{3} w(est)? main s|n(orth)? mallard d|marcella c|margaret c|mccoomsky l|mcmahon d|michigan a|monaghan w|montana a|moorland p|newhaven c|normandin c|norridge d|oakland a|overlook p|peacock c|pennsylvania a|pinncale c|quail c|rebel d|richmond c|selkirk d|sherbrooke d|(1[78][0-9][13579]|(19|2[0-9])[0-9][02468]) s(ain)?t albert the great d|s(aint)?t patrick w|(19|2[0-3])[0-9]{2}|steward (c|d)|(1[7-9]|2[0-6])[0-9]{2} stonehaven d|summerton c|n(orth)? thompson r|token r|trenton d|troon d|virdon d|waldorf c|wallinford c|[1-9][0-9]{2} walmar d|walnut hill l|(n(orth)?|s(outh)?) westmount dr|weybridge d|wickersham c|2110 windsor s|wisconsin a|woodward d|wyndham d).*/i.test(userEnteredAddress)) {
                      sortID = "D-SP-C4";
                    } else {
                      sortID = "D-X-SUN";
                      result.textContent = "[FAILED: cannot determine sort value for Sun Prairie; please enter PSTAT manually.]";
                    }
                    break;
                  /*** UNDETERMINABLE COUNTY SUBDIVISIONS ***/
                  case "Verona city":
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
              if (queryB) {
                if (zipEltB !== null) {
                  zipEltB.value = generatedZip;
                }
              } else {
                if (zipElt !== null) {
                  zipElt.value = generatedZip;
                }
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
            if (queryB) {
              if (zipEltB !== null) {
                zipEltB.value = generatedZip;
              }
            } else {
              if (zipElt !== null) {
                zipElt.value = generatedZip;
              }
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
    };

    var handleError = function handleError(error) {
      console.log('Error: ' + error);
    };

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

    var geocoder = browser.runtime.sendMessage({
      key: "queryGeocoder",
      URIencodedAddress: cleanAddr(addr),
      city: pullCity(city.value),
      addrElement: addr,
      isSecondPass: secondPass
    });
    geocoder.then(handleResponse, handleError);
  }
}

function queryPSTATPrep() {
  var addr = document.getElementById('address'),
      city = document.getElementById('city');
  if (addr && city) {
    queryPSTAT(addr, city, false, false);
  }
}

function parseMadisonWI(elt) {
  if (/madison(,? wi(sconsin)?)?|mad/i.test(elt.value)) {
    elt.value = "MADISON WI";
  }
  elt.value = elt.value.replace(/,/, '');
}

browser.runtime.onMessage.addListener(function (request) {
  if (request.key = "querySecondaryPSTAT") {
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
  } else if (request.key = "querySecondaryPSTATFail") {
    var qspFailElt = document.getElementById('querySecondaryPSTATFail');
    if (qspFailElt) {
      alert("You must be currently editing a patron\'s record to generate the PSTAT value from their alternate address");
      qspFailElt.remove();
    }
  }
});

/*** CORRECT CITY FORMAT ***/
var city2 = document.getElementById('B_city'),
    city3 = document.getElementById('altcontactaddress3');

if (city2) {
  city2.addEventListener('blur', function () {
    parseMadisonWI(this);
  });
}

if (city3) {
  city3.addEventListener('blur', function () {
    parseMadisonWI(this);
  });
}