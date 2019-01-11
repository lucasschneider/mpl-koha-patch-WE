var d = new Date(),
  day = d.getUTCDay(),
  setIcon = function() {
    browser.storage.sync.get('skin').then((res) => {
      var skin = res.hasOwnProperty('skin') ? res.skin : 'mad'

      switch (skin) {
        case "MID":
          browser.browserAction.setIcon({
            path: {
              16: "content/img/mid-icon-16.png",
              32: "content/img/mid-icon-32.png",
              48: "content/img/mid-icon-48.png",
              64: "content/img/mid-icon-64.png",
              128: "content/img/mid-icon-128.png"
            }
          });
          break;
        case "SCLS":
          browser.browserAction.setIcon({
            path: {
              16: "content/img/scls-icon-16.png",
              32: "content/img/scls-icon-32.png",
              48: "content/img/scls-icon-48.png",
              64: "content/img/scls-icon-64.png",
              128: "content/img/scls-icon-128.png"
            }
          });
          break;
        case "SUN":
          browser.browserAction.setIcon({
            path: {
              16: "content/img/sun-icon2-16.png",
              32: "content/img/sun-icon2-32.png",
              48: "content/img/sun-icon2-48.png",
              64: "content/img/sun-icon2-64.png",
              128: "content/img/sun-icon2-128.png"
            }
          });
          break;
        default:
          browser.browserAction.setIcon({
            path: {
              16: "content/img/mpl-icon-16.png",
              32: "content/img/mpl-icon-32.png",
              48: "content/img/mpl-icon-48.png",
              64: "content/img/mpl-icon-64.png",
              128: "content/img/mpl-icon-128.png"
            }
          });
      }
    });
  },
  /** The addresses below are for querying Google Maps
   * when a patron wants to know the geographically
   * closest library to their residential address */
  libraryAddresses = [
    // MPL  [0-8]
    ["HPB", "733+N+High+Point+Rd,+Madison,+WI+53717"],
    ["MAD", "201+W+Mifflin+St,+Madison,+WI+53703"],
    ["HAW", "2707+E+Washington+Ave,+Madison,+WI+53704"],
    ["LAK", "2845+N+Sherman+Ave,+Madison,+WI+53704"],
    ["MEA", "5726+Raymond+Rd,+Madison,+WI+53711"],
    ["MSB", "1705+Monroe+St,+Madison,+WI+53711"],
    ["PIN", "204+Cottage+Grove+Rd,+Madison,+WI+53716"],
    ["SEQ", "4340+Tokay+Blvd,+Madison,+WI+53711"],
    ["SMB", "2222+S+Park+St,+Madison,+WI+53713"],

    // OTHER DANE COUNTY [9-26]
    ["BLV", "130+S+Vine+St,+Belleville,+WI+53508"],
    ["BER", "1210+Mills+St,+Black+Earth,+WI+53515"],
    ["CBR", "101+Spring+Water+Alley,+Cambridge,+WI+53523"],
    ["CSP", "2107+Julius+St,+Cross+Plains,+WI+53528"],
    /*DCL NOT INCLUDED*/
    ["DEE", "12+W+Nelson+St,+Deerfield,+WI+53531"],
    ["DFT", "203+Library+St,+DeForest,+WI+53532"],
    ["FCH", "5530+Lacy+Rd,+Fitchburg,+WI+53711"],
    ["MAR", "605+Waterloo+Rd,+Marshall,+WI+53559"],
    ["MAZ", "102+Brodhead+St,+Mazomanie,+WI+53560"],
    ["MCF", "5920+Milwaukee+St,+McFarland,+WI+53558"],
    ["MID", "7425+Hubbard+Ave,+Middleton,+WI+53562"],
    ["MOO", "1000+Nichols+Rd,+Monona,+WI+53716"],
    ["MTH", "105+Perimeter+Rd,+Mount+Horeb,+WI+53572"],
    ["ORE", "256+Brook+St,+Oregon,+WI+53575"],
    ["STO", "304+S+4th+St,+Stoughton,+WI+53589"],
    ["SUN", "1350+Linnerud+Dr,+Sun+Prairie,+WI+53590"],
    ["VER", "500+Silent+St,+Verona,+WI+53593"],
    ["WAU", "710+South+St,+Waunakee,+WI+53597"],

    // ADAMS COUNTY [27-28]
    ["ACL", "569+N+Cedar+St,+Adams,+WI+53910"],
    ["ROM", "1157+Rome+Center+Dr,+Nekoosa,+WI+54457"],

    // COLUMBIA COUNTY [29-37]
    ["CIA", "109+W+Edgewater+St,+Cambria,+WI+53923"],
    ["COL", "223+W+James+St,+Columbus,+WI+53925"],
    ["LDI", "130+Lodi+St,+Lodi,+WI+53555"],
    ["PAR", "119+N+Main+St,+Pardeeville,+WI+53954"],
    ["POR", "253+W+Edgewater+St,+Portage,+WI+53901"],
    ["POY", "118+N+Main+St,+Poynette,+WI+53955"],
    ["RAN", "228+N+High+St+Randolph,+WI+53956"],
    //["RIO","324+W+Lyons+St,+Rio,+WI+53960"], ** NON LINK LIBRARY ***
    ["WID", "620+Elm+St,+Wisconsin+Dells,+WI+53965"],
    ["WYO", "165+E+Dodge+St,+Wyocena,+WI+53969"],

    // GREEN COUNTY [38-40]
    //["ALB","200+N+Water+St,+Albany,+WI+53502"], ** NON LINK LIBRARY ***
    ["BRD", "1207+25th+St,+Brodhead,+WI+53520"],
    ["MRO", "925+16th+Ave,+Monroe,+WI+53566"],
    //["MNT","512+E+Lake+Ave,+Monticello,+WI+53570"], ** NON LINK LIBRARY ***
    ["NGL", "319+Second+St,+New+Glarus,+WI+53574"],

    // PORTAGE COUNTY [41-44]
    ["ALM", "122+Main+St,+Almond,+WI+54909"],
    //["AMH","278+N+Main+St,+Amherst,+WI+54406"], ** NON LINK LIBRARY ***
    ["PLO", "2151+Roosevelt+Dr,+Plover,+WI+54467"],
    ["ROS", "137+N+Main+St,+Rosholt,+WI+54473"],
    ["STP", "1001+Main+St,+Stevens+Point,+WI+54481"],

    // SAUK COUNTY [45-53]
    ["BAR", "230+Fourth+Ave,+Baraboo,+WI+53913"],
    ["LAV", "101+W+Main+St,+La+Valle,+WI+53941"],
    ["NOF", "105+N+Maple+St,+North+Freedom,+WI+53951"],
    ["PLA", "910+Main+St,+Plain,+WI+53577"],
    ["PDS", "540+Water+St,+Prairie+du+Sac,+WI+53578"],
    ["REE", "370+Vine+St,+Reedsburg,+WI+53959"],
    ["RKS", "101+First+St,+Rock+Springs,+WI+53961"],
    ["SKC", "515+Water+St,+Sauk+City,+WI+53583"],
    ["SGR", "230+E+Monroe+St,+Spring+Green,+WI+53588"],

    // WOOD  [54-56]
    ["ARP", "8091+County+E,+Arpin,+WI+54410"],
    ["MCM", "490+E+Grand+Ave,+Wisconsin+Rapids,+WI+54494"],
    //["MFD","211+E+Second+St,+Marshfield,+WI+54449"], ** NON LINK LIBRARY ***
    ["NEK","100+Park+St,+Nekoosa,+WI+54457"],
    //["PIT","5291+Third+Ave,+Pittsville,+WI+54466"], ** NON LINK LIBRARY ***
    //["VES","6550+Virginia+St,+Vesper,+WI+54489"] ** NON LINK LIBRARY ***
  ],
  geocoderAPI,
  match,
  matchAddr,
  county,
  countySub,
  censusTract,
  zip,
  closestLib = "",
  value = "",
  problemItemFormTID; // The tab ID for the most recent instance of the problem item form

setIcon();

// Load preference-selected function files
function handleUpdated(details) {
  if (details.frameId == 0) { // 0 indicates the navigation happens in the tab content window;
    // A positive value indicates navigation in a subframe.

    browser.storage.sync.get().then((res) => {
      if (!res.hasOwnProperty('patronMsg') || (res.hasOwnProperty('patronMsg') && res.patronMsg)) {
        browser.tabs.executeScript(details.tabId, {
          file: "/content/scripts/patronMessages.js"
        });
      }

      if (!res.hasOwnProperty('validAddr') || (res.hasOwnProperty('validAddr') && res.validAddr)) {
        browser.tabs.executeScript(details.tabId, {
          file: "/content/scripts/validateAddresses.js"
        });
      }

      if (!res.hasOwnProperty('autoBarcode') || (res.hasOwnProperty('autoBarcode') && res.autoBarcode)) {
        browser.tabs.executeScript(details.tabId, {
          file: "/content/scripts/autofillUserId.js"
        });
      }

      if (!res.hasOwnProperty('lookupPSTAT') || (res.hasOwnProperty('lookupPSTAT') && res.lookupPSTAT)) {
        browser.tabs.executeScript(details.tabId, {
          file: "/content/scripts/selectPSTAT.js"
        });
      }

      if (!res.hasOwnProperty('digestOnly') || (res.hasOwnProperty('digestOnly') && res.digestOnly)) {
        browser.tabs.executeScript(details.tabId, {
          file: "/content/scripts/forceDigest.js"
        });
      }

      if (!res.hasOwnProperty('dueDateToggle') || (res.hasOwnProperty('dueDateToggle') && res.dueDateToggle)) {
        browser.tabs.executeScript(details.tabId, {
          file: "/content/scripts/restrictNotificationOptions.js"
        });
      }

      if (!res.hasOwnProperty('middleInitials') || (res.hasOwnProperty('middleInitials') && res.middleInitials)) {
        browser.tabs.executeScript(details.tabId, {
          file: "/content/scripts/middleName.js"
        });
      }

      if (!res.hasOwnProperty('updateAccountType') || (res.hasOwnProperty('updateAccountType') && res.updateAccountType)) {
        browser.tabs.executeScript(details.tabId, {
          file: "/content/scripts/updateAccountType.js"
        });
      }

      // If the Sunday dropbox option is enabled...
      if (res.hasOwnProperty('sundayDropbox') && res.sundayDropbox && day === 0) {
        // If sundayDropbox is not paused
        if (res.hasOwnProperty('sundayDropboxPaused') && !res.sundayDropboxPaused) {
          browser.tabs.executeScript(details.tabId, {
            file: "/content/scripts/sundayDropbox.js"
          });
        }
      } else {
        if (res.hasOwnProperty('sundayDropboxPaused') && res.sundayDropboxPaused) {
          browser.storage.sync.set({sundayDropboxPaused: false});
        }
      }
    });
  }
}

browser.webNavigation.onCompleted.addListener(handleUpdated);

// Create and handle context menu item for problem item form
browser.contextMenus.create({
  id: "start-pi-form",
  title: "Use Barcode in Problem Item Form",
  contexts: ["link", "selection"]
});
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "start-pi-form") {
    var barcode;

    function sendErrorMsg(msg) {
      browser.tabs.query({
        currentWindow: true,
        active: true
      }).then((tabs) => {
        for (let tab of tabs) {
          browser.tabs.executeScript(tab.id, {
            code: "alert('" + msg + "');"
          });
        }
      });
    }

    // Populate barcode based on the particular context type
    if (info.selectionText) {
      barcode = info.selectionText;
    } else if (info.linkText) { // Only works in Firefox 58.*
      barcode = info.linkText;
    } else {
      sendErrorMsg("ERROR: Failed to extract text data.");
      return;
    }

    if (barcode.match(/[0-9]{14}/g)) {
      if (barcode.match(/[0-9]{14}/g).length === 1) {
        barcode = /[0-9]{14}/.exec(barcode);

        if (barcode) barcode = barcode[0];

        switch (barcode.substr(0, 1)) {
          case "2":
            browser.tabs.create({
              url: browser.runtime.getURL("../problemItemForm/problemItemForm.html") + "?patron=" + barcode
            });
            break;
          case "3":
            browser.tabs.create({
              url: browser.runtime.getURL("../problemItemForm/problemItemForm.html") + "?item=" + barcode
            });
            break;
          default:
            sendErrorMsg("ERROR: Unable to determine barcode type.");
            break;
        }
      } else {
        sendErrorMsg("ERROR: Multiple barcodes found in selection.");
      }
    } else {
      sendErrorMsg("ERROR: Barcode not found in selection or link.");
    }
  }
});

// Handle messages from content pages
function handleMessages(request, sender, sendResponse) {
  switch (request.key) {
    /**
     * Query the Census website for data simultaneously in two different ways:
     * 
     * 1) A JSON request is made using the Census Geocoder API.
     * 2) An American FactFinder tab is silently opened, a search is performed based on the
     *    address, and the results table is scrapped for data.
     *
     * The data from whichever method returns (positively) first, is used. The page-scrapping
     * method was added due to the often unreliability of the Geocoder.
     */
    case "queryGeocoder":
      // Method 1: Census Geocoder
      var countyURL = "https://geocoding.geo.census.gov/geocoder/geographies/address?street=" + request.URIencodedAddress + "&city=" + request.city + "&state=wi&benchmark=Public_AR_Current&vintage=Current_Current&layers=Counties&format=json",
        countySubdivisionURL = "https://geocoding.geo.census.gov/geocoder/geographies/address?street=" + request.URIencodedAddress + "&city=" + request.city + "&state=wi&benchmark=Public_AR_Current&vintage=Current_Current&layers=County+Subdivisions&format=json",
        censusTractURL = "https://geocoding.geo.census.gov/geocoder/geographies/address?street=" + request.URIencodedAddress + "&city=" + request.city + "&state=wi&benchmark=Public_AR_Current&vintage=Current_Current&layers=Census Tracts&format=json",
        factFinderTabId,
        matchAddr,
        county,
        countySub,
        censusTract,
        zip;

      $.getJSON(countyURL).done(function(countyResponse) {
        if (countyResponse && countyResponse.result && countyResponse.result.addressMatches.length > 0) {
          try {
            // Select the last match if multiple are found
            // I'm not sure if this works for all cases of multiple addresses,
            // But it does for a particular address in Monona
            lastAddrMatch = countyResponse.result.addressMatches.length - 1;

            matchAddr = countyResponse.result.addressMatches[lastAddrMatch].matchedAddress.split(',')[0].toUpperCase();
            county = countyResponse.result.addressMatches[lastAddrMatch].geographies['Counties'][0].BASENAME;
            zip = countyResponse.result.addressMatches[lastAddrMatch].addressComponents.zip;

            $.getJSON(countySubdivisionURL).done(function(countySubResponse) {
              if (countySubResponse && countySubResponse.result) {
                try {
                  countySub = countySubResponse.result.addressMatches[lastAddrMatch].geographies['County Subdivisions'][0].NAME;

                  $.getJSON(censusTractURL).done(function(tractResponse) {
                    if (tractResponse && tractResponse.result) {
                      try {
                        censusTract = tractResponse.result.addressMatches[lastAddrMatch].geographies['Census Tracts'];
                        censusTract = (censusTract) ? censusTract[0] : null;
                        censusTract = (censusTract) ? censusTract.BASENAME : null;

                        if (matchAddr && county && countySub && censusTract && zip) {
                          browser.tabs.query({
                            currentWindow: true,
                            active: true
                          }).then((tabs) => {
                            for (let tab of tabs) {
                              browser.tabs.sendMessage(tab.id, {
                                "key": "returnCensusData",
                                "matchAddr": matchAddr,
                                "county": county,
                                "countySub": countySub,
                                "censusTract": censusTract,
                                "zip": zip
                              });
                            }
                          });

                          // Remove the FactFinder Tab
                          if (factFinderTabId) browser.tabs.remove(factFinderTabId);
                        } else {
                          // Handle error
                        }
                      } catch (tractErr) {
                        console.debug(tractErr);
                      }
                    }
                  });
                } catch (countySubErr) {
                  console.debug(countySubErr);
                }
              }
            });

          } catch (countyErr) {
            console.debug(countyErr);
          }

          if (matchAddr && county && countySub && censusTract && zip) {}
        } else {
          // Send empty response
          browser.tabs.query({
            currentWindow: true,
            active: true
          }).then((tabs) => {
            for (let tab of tabs) {
              browser.tabs.sendMessage(tab.id, {
                "key": "returnCensusData",
                "matchAddr": null,
                "county": null,
                "countySub": null,
                "censusTract": null,
                "zip": null
              });
            }
          });
        }
      });

      // Method 2: American FactFinder page scrapping
      browser.tabs.create({
        active: false,
        url: "https://factfinder.census.gov/faces/nav/jsf/pages/searchresults.xhtml" + "?addr=" + request.URIencodedAddress + "&city=" + request.city
      }).then((tab) => {
        factFinderTabId = tab.id;
        browser.tabs.executeScript(tab.id, {
          file: "/content/scripts/scrapFactFinder.js"
        }).then(() => {
          setTimeout(() => {
            browser.tabs.remove(tab.id)
          }, 15000);
        });
      });
      break;
    case "returnCensusData":
      browser.tabs.query({
        currentWindow: true,
        active: true
      }).then((tabs) => {
        for (let tab of tabs) {
          browser.tabs.sendMessage(tab.id, {
            "key": "returnCensusData",
            "matchAddr": request.matchAddr,
            "county": request.county,
            "countySub": request.countySub,
            "censusTract": request.censusTract,
            "zip": request.zip
          });
        }
      });
      break;
    case "findNearestLib":
      var patronAddr = request.matchAddr4DistQuery,
        region = request.selected,
        mapURL = "https://maps.googleapis.com/maps/api/distancematrix/json?key=AIzaSyAAYcV9I6AAd4EQphC4Ynai5dmOScYBggA&origins=" + request.matchAddr4DistQuery + "&destinations=";
      switch (region) {
        case "MPL":
          for (var idx = 0; idx < 8; idx++) {
            mapURL += libraryAddresses[idx][1] + "|";
          }
          mapURL += libraryAddresses[8][1];
          break;
        case "DANE":
          for (var idx = 0; idx < 26; idx++) {
            mapURL += libraryAddresses[idx][1] + "|";
          }
          mapURL += libraryAddresses[26][1];
          break;
        case "ADAMS":
          mapURL += libraryAddresses[27][1] + "|" + libraryAddresses[28][1];
          break;
        case "COLUMBIA":
          for (var idx = 29; idx < 37; idx++) {
            mapURL += libraryAddresses[idx][1] + "|";
          }
          mapURL += libraryAddresses[37][1];
          break;
        case "GREEN":
          for (var idx = 38; idx < 40; idx++) {
            mapURL += libraryAddresses[idx][1] + "|";
          }
          mapURL += libraryAddresses[40][1];
          break;
        case "PORTAGE":
          for (var idx = 41; idx < 44; idx++) {
            mapURL += libraryAddresses[idx][1] + "|";
          }
          mapURL += libraryAddresses[44][1];
          break;
        case "SAUK":
          for (var idx = 45; idx < 53; idx++) {
            mapURL += libraryAddresses[idx][1] + "|";
          }
          mapURL += libraryAddresses[53][1];
          break;
        case "WOOD":
          mapURL += libraryAddresses[54][1] + "|" + libraryAddresses[55][1] + "|" + libraryAddresses[56][1];
          break;
        case "SCLS":
          for (var idx = 0; idx < 56; idx++) {
            mapURL += libraryAddresses[idx][1] + "|";
          }
          mapURL += libraryAddresses[56][1];
          break;
        default:
          break;
      }
      $.getJSON(mapURL).done(function(response) {
        if (response) {
          
          // If error occurs
          if (response.error_message) {
            browser.tabs.query({
              currentWindow: true,
              active: true
            }).then((tabs) => {
              for (let tab of tabs) {
                browser.tabs.sendMessage(tab.id, {
                  key: "failedNearestLib",
                  error: response.error_message
                });
              }
            }).catch(onError);
            return;
          }
          
          var elements = response.rows[0].elements;
          if (elements) {
            switch (region) {
              case "MPL":
                var HPBdist = elements[0].distance.value,
                  MADdist = elements[1].distance.value,
                  HAWdist = elements[2].distance.value,
                  LAKdist = elements[3].distance.value,
                  MEAdist = elements[4].distance.value,
                  MSBdist = elements[5].distance.value,
                  PINdist = elements[6].distance.value,
                  SEQdist = elements[7].distance.value,
                  SMBdist = elements[8].distance.value,
                  minDist = Math.min(HPBdist, MADdist, HAWdist, LAKdist, MEAdist, MSBdist, PINdist, SEQdist, SMBdist);

                switch (minDist) {
                  case HPBdist:
                    closestLib = "HPB";
                    break;
                  case MADdist:
                    closestLib = "MAD";
                    break;
                  case HAWdist:
                    closestLib = "HAW";
                    break;
                  case LAKdist:
                    closestLib = "LAK";
                    break;
                  case MEAdist:
                    closestLib = "MEA";
                    break;
                  case MSBdist:
                    closestLib = "MSB";
                    break;
                  case PINdist:
                    closestLib = "PIN";
                    break;
                  case SEQdist:
                    closestLib = "SEQ";
                    break;
                  case SMBdist:
                    closestLib = "SMB";
                    break;
                  default:
                    break;
                }
                break;
              case "ADAMS":
                var ACLdist = elements[0].distance.value,
                  ROMdist = elements[1].distance.value,
                  minDist = Math.min(ACLdist, ROMdist);
                switch (minDist) {
                  case ACLdist:
                    closestLib = "ACL";
                    break;
                  case ROMdist:
                    closestLib = "ROM";
                    break;
                  default:
                    break;
                }
                break;
              case "COLUMBIA":
                var CIAdist = elements[0].distance.value,
                  COLdist = elements[1].distance.value,
                  LDIdist = elements[2].distance.value,
                  PARdist = elements[3].distance.value,
                  PORdist = elements[4].distance.value,
                  POYdist = elements[5].distance.value,
                  RANdist = elements[6].distance.value,
                  WIDdist = elements[7].distance.value,
                  WYOdist = elements[8].distance.value,
                  minDist = Math.min(CIAdist, COLdist, LDIdist, PARdist, PORdist, POYdist, RANdist, WIDdist, WYOdist);
                switch (minDist) {
                  case CIAdist:
                    closestLib = "CIA";
                    break;
                  case COLdist:
                    closestLib = "COL";
                    break;
                  case LDIdist:
                    closestLib = "LDI";
                    break;
                  case PARdist:
                    closestLib = "PAR";
                    break;
                  case PORdist:
                    closestLib = "POR";
                    break;
                  case POYdist:
                    closestLib = "POY";
                    break;
                  case RANdist:
                    closestLib = "RAN";
                    break;
                  case WIDdist:
                    closestLib = "WID";
                    break;
                  case WYOdist:
                    closestLib = "WYO";
                    break;
                  default:
                    break;
                }
                break;
              case "DANE":
                var HPBdist = elements[0].distance.value,
                  MADdist = elements[1].distance.value,
                  HAWdist = elements[2].distance.value,
                  LAKdist = elements[3].distance.value,
                  MEAdist = elements[4].distance.value,
                  MSBdist = elements[5].distance.value,
                  PINdist = elements[6].distance.value,
                  SEQdist = elements[7].distance.value,
                  SMBdist = elements[8].distance.value,
                  BLVdist = elements[9].distance.value,
                  BERdist = elements[10].distance.value,
                  CBRdist = elements[11].distance.value,
                  CSPdist = elements[12].distance.value,
                  DEEdist = elements[13].distance.value,
                  DFTdist = elements[14].distance.value,
                  FCHdist = elements[15].distance.value,
                  MARdist = elements[16].distance.value,
                  MAZdist = elements[17].distance.value,
                  MCFdist = elements[18].distance.value,
                  MIDdist = elements[19].distance.value,
                  MOOdist = elements[20].distance.value,
                  MTHdist = elements[21].distance.value,
                  OREdist = elements[22].distance.value,
                  STOdist = elements[23].distance.value,
                  SUNdist = elements[24].distance.value,
                  VERdist = elements[25].distance.value,
                  WAUdist = elements[26].distance.value,
                  minDist = Math.min(HPBdist, MADdist, HAWdist, LAKdist, MEAdist, MSBdist, PINdist, SEQdist, SMBdist, BLVdist, BERdist, CBRdist, CSPdist, DEEdist, DFTdist, FCHdist, MARdist, MAZdist, MCFdist, MIDdist, MOOdist, MTHdist, OREdist, STOdist, SUNdist, VERdist, WAUdist);

                switch (minDist) {
                  case HPBdist:
                    closestLib = "HPB";
                    break;
                  case MADdist:
                    closestLib = "MAD";
                    break;
                  case HAWdist:
                    closestLib = "HAW";
                    break;
                  case LAKdist:
                    closestLib = "LAK";
                    break;
                  case MEAdist:
                    closestLib = "MEA";
                    break;
                  case MSBdist:
                    closestLib = "MSB";
                    break;
                  case PINdist:
                    closestLib = "PIN";
                    break;
                  case SEQdist:
                    closestLib = "SEQ";
                    break;
                  case SMBdist:
                    closestLib = "SMB";
                    break;
                  case BLVdist:
                    closestLib = "BLV";
                    break;
                  case BERdist:
                    closestLib = "BER";
                    break;
                  case CBRdist:
                    closestLib = "CBR";
                    break;
                  case CSPdist:
                    closestLib = "CSP";
                    break;
                  case DEEdist:
                    closestLib = "DEE";
                    break;
                  case DFTdist:
                    closestLib = "DFT";
                    break;
                  case FCHdist:
                    closestLib = "FCH";
                    break;
                  case MARdist:
                    closestLib = "MAR";
                    break;
                  case MAZdist:
                    closestLib = "MAZ";
                    break;
                  case MCFdist:
                    closestLib = "MCF";
                    break;
                  case MIDdist:
                    closestLib = "MID";
                    break;
                  case MOOdist:
                    closestLib = "MOO";
                    break;
                  case MTHdist:
                    closestLib = "MTH";
                    break;
                  case OREdist:
                    closestLib = "ORE";
                    break;
                  case STOdist:
                    closestLib = "STO";
                    break;
                  case SUNdist:
                    closestLib = "SUN";
                    break;
                  case VERdist:
                    closestLib = "VER";
                    break;
                  case WAUdist:
                    closestLib = "WAU";
                    break;
                  default:
                    break;
                }
                break;
              case "GREEN":
                var BRDdist = elements[0].distance.value,
                  MROdist = elements[1].distance.value,
                  NGLdist = elements[2].distance.value,
                  minDist = Math.min(BRDdist, MROdist, NGLdist);
                switch (minDist) {
                  case BRDdist:
                    closestLib = "BRD";
                    break;
                  case MROdist:
                    closestLib = "MRO";
                    break;
                  case NGLdist:
                    closestLib = "NGL";
                    break;
                  default:
                    break;
                }
                break;
              case "PORTAGE":
                var ALMdist = elements[0].distance.value,
                  PLOdist = elements[1].distance.value,
                  ROSdist = elements[2].distance.value,
                  STPdist = elements[3].distance.value,
                  minDist = Math.min(ALMdist, PLOdist, ROSdist, STPdist);
                switch (minDist) {
                  case ALMdist:
                    closestLib = "ALM";
                    break;
                  case PLOdist:
                    closestLib = "PLO";
                    break;
                  case ROSdist:
                    closestLib = "ROS";
                    break;
                  case STPdist:
                    closestLib = "STP";
                    break;
                  default:
                    break;
                }
                break;
              case "SAUK":
                var BARdist = elements[0].distance.value,
                  LAVdist = elements[1].distance.value,
                  NOFdist = elements[2].distance.value,
                  PLAdist = elements[3].distance.value,
                  PDSdist = elements[4].distance.value,
                  REEdist = elements[5].distance.value,
                  RKSdist = elements[6].distance.value,
                  SKCdist = elements[7].distance.value,
                  SGRdist = elements[8].distance.value,
                  minDist = Math.min(BARdist, LAVdist, NOFdist, PLAdist, PDSdist, REEdist, RKSdist, SKCdist, SGRdist);
                switch (minDist) {
                  case BARdist:
                    closestLib = "BAR";
                    break;
                  case LAVdist:
                    closestLib = "LAV";
                    break;
                  case NOFdist:
                    closestLib = "NOF";
                    break;
                  case PLAdist:
                    closestLib = "PLA";
                    break;
                  case PDSdist:
                    closestLib = "PDS";
                    break;
                  case REEdist:
                    closestLib = "REE";
                    break;
                  case RKSdist:
                    closestLib = "RKS";
                    break;
                  case SKCdist:
                    closestLib = "SKC";
                    break;
                  case SGRdist:
                    closestLib = "SGR";
                    break;
                  default:
                    break;
                }
                break;
              case "WOOD":
                var ARPdist = elements[0].distance.value,
                  MCMdist = elements[1].distance.value,
                  NEKdist = elements[2].distance.value,
                  minDist = Math.min(ARPdist, MCMdist, NEKdist);
                switch (minDist) {
                  case ARPdist:
                    closestLib = "ARP";
                    break;
                  case MCMdist:
                    closestLib = "MCM";
                    break;
                  case NEKdist:
                    closestLib = "NEK";
                    break;
                  default:
                    break;
                }
                break;
              case "SCLS":
                var HPBdist = elements[0].distance.value,
                  MADdist = elements[1].distance.value,
                  HAWdist = elements[2].distance.value,
                  LAKdist = elements[3].distance.value,
                  MEAdist = elements[4].distance.value,
                  MSBdist = elements[5].distance.value,
                  PINdist = elements[6].distance.value,
                  SEQdist = elements[7].distance.value,
                  SMBdist = elements[8].distance.value,
                  BLVdist = elements[9].distance.value,
                  BERdist = elements[10].distance.value,
                  CBRdist = elements[11].distance.value,
                  CSPdist = elements[12].distance.value,
                  DEEdist = elements[13].distance.value,
                  DFTdist = elements[14].distance.value,
                  FCHdist = elements[15].distance.value,
                  MARdist = elements[16].distance.value,
                  MAZdist = elements[17].distance.value,
                  MCFdist = elements[18].distance.value,
                  MIDdist = elements[19].distance.value,
                  MOOdist = elements[20].distance.value,
                  MTHdist = elements[21].distance.value,
                  OREdist = elements[22].distance.value,
                  STOdist = elements[23].distance.value,
                  SUNdist = elements[24].distance.value,
                  VERdist = elements[25].distance.value,
                  WAUdist = elements[26].distance.value,
                  ACLdist = elements[27].distance.value,
                  ROMdist = elements[28].distance.value,
                  CIAdist = elements[29].distance.value,
                  COLdist = elements[30].distance.value,
                  LDIdist = elements[31].distance.value,
                  PARdist = elements[32].distance.value,
                  PORdist = elements[33].distance.value,
                  POYdist = elements[34].distance.value,
                  RANdist = elements[35].distance.value,
                  WIDdist = elements[36].distance.value,
                  WYOdist = elements[37].distance.value,
                  BRDdist = elements[38].distance.value,
                  MROdist = elements[39].distance.value,
                  NGLdist = elements[40].distance.value,
                  ALMdist = elements[41].distance.value,
                  PLOdist = elements[42].distance.value,
                  ROSdist = elements[43].distance.value,
                  STPdist = elements[44].distance.value,
                  BARdist = elements[45].distance.value,
                  LAVdist = elements[46].distance.value,
                  NOFdist = elements[47].distance.value,
                  PLAdist = elements[48].distance.value,
                  PDSdist = elements[49].distance.value,
                  REEdist = elements[50].distance.value,
                  RKSdist = elements[51].distance.value,
                  SKCdist = elements[52].distance.value,
                  SGRdist = elements[53].distance.value,
                  ARPdist = elements[54].distance.value,
                  MCMdist = elements[55].distance.value,
                  NEKdist = elements[56].distance.value,
                  minDist = Math.min(HPBdist, MADdist, HAWdist, LAKdist, MEAdist, MSBdist, PINdist, SEQdist, SMBdist, BLVdist, BERdist, CBRdist, CSPdist, DEEdist, DFTdist, FCHdist, MARdist, MAZdist, MCFdist, MIDdist, MOOdist, MTHdist, OREdist, STOdist, SUNdist, VERdist, WAUdist, ACLdist, ROMdist, CIAdist, COLdist, LDIdist, PARdist, PORdist, POYdist, RANdist, WIDdist, WYOdist, BRDdist, MROdist, NGLdist, ALMdist, PLOdist, ROSdist, STPdist, BARdist, LAVdist, NOFdist, PLAdist, PDSdist, REEdist, RKSdist, SKCdist, SGRdist, ARPdist, MCMdist, NEKdist);

                switch (minDist) {
                  case HPBdist:
                    closestLib = "HPB";
                    break;
                  case MADdist:
                    closestLib = "MAD";
                    break;
                  case HAWdist:
                    closestLib = "HAW";
                    break;
                  case LAKdist:
                    closestLib = "LAK";
                    break;
                  case MEAdist:
                    closestLib = "MEA";
                    break;
                  case MSBdist:
                    closestLib = "MSB";
                    break;
                  case PINdist:
                    closestLib = "PIN";
                    break;
                  case SEQdist:
                    closestLib = "SEQ";
                    break;
                  case SMBdist:
                    closestLib = "SMB";
                    break;
                  case BLVdist:
                    closestLib = "BLV";
                    break;
                  case BERdist:
                    closestLib = "BER";
                    break;
                  case CBRdist:
                    closestLib = "CBR";
                    break;
                  case CSPdist:
                    closestLib = "CSP";
                    break;
                  case DEEdist:
                    closestLib = "DEE";
                    break;
                  case DFTdist:
                    closestLib = "DFT";
                    break;
                  case FCHdist:
                    closestLib = "FCH";
                    break;
                  case MARdist:
                    closestLib = "MAR";
                    break;
                  case MAZdist:
                    closestLib = "MAZ";
                    break;
                  case MCFdist:
                    closestLib = "MCF";
                    break;
                  case MIDdist:
                    closestLib = "MID";
                    break;
                  case MOOdist:
                    closestLib = "MOO";
                    break;
                  case MTHdist:
                    closestLib = "MTH";
                    break;
                  case OREdist:
                    closestLib = "ORE";
                    break;
                  case STOdist:
                    closestLib = "STO";
                    break;
                  case SUNdist:
                    closestLib = "SUN";
                    break;
                  case VERdist:
                    closestLib = "VER";
                    break;
                  case WAUdist:
                    closestLib = "WAU";
                    break;
                  case ACLdist:
                    closestLib = "ACL";
                    break;
                  case ROMdist:
                    closestLib = "ROM";
                    break;
                  case CIAdist:
                    closestLib = "CIA";
                    break;
                  case COLdist:
                    closestLib = "COL";
                    break;
                  case LDIdist:
                    closestLib = "LDI";
                    break;
                  case PARdist:
                    closestLib = "PAR";
                    break;
                  case PORdist:
                    closestLib = "POR";
                    break;
                  case POYdist:
                    closestLib = "POY";
                    break;
                  case RANdist:
                    closestLib = "RAN";
                    break;
                  case WIDdist:
                    closestLib = "WID";
                    break;
                  case WYOdist:
                    closestLib = "WYO";
                    break;
                  case BRDdist:
                    closestLib = "BRD";
                    break;
                  case MROdist:
                    closestLib = "MRO";
                    break;
                  case NGLdist:
                    closestLib = "NGL";
                    break;
                  case ALMdist:
                    closestLib = "ALM";
                    break;
                  case PLOdist:
                    closestLib = "PLO";
                    break;
                  case ROSdist:
                    closestLib = "ROS";
                    break;
                  case STPdist:
                    closestLib = "STP";
                    break;
                  case BARdist:
                    closestLib = "BAR";
                    break;
                  case LAVdist:
                    closestLib = "LAV";
                    break;
                  case NOFdist:
                    closestLib = "NOF";
                    break;
                  case PLAdist:
                    closestLib = "PLA";
                    break;
                  case PDSdist:
                    closestLib = "PDS";
                    break;
                  case REEdist:
                    closestLib = "REE";
                    break;
                  case RKSdist:
                    closestLib = "RKS";
                    break;
                  case SKCdist:
                    closestLib = "SKC";
                    break;
                  case SGRdist:
                    closestLib = "SGR";
                    break;
                  case ARPdist:
                    closestLib = "ARP";
                    break;
                  case MCMdist:
                    closestLib = "MCM";
                    break;
                  case NEKdist:
                    closestLib = "NEK";
                    break;
                  default:
                    break;
                }
                break;
              default:
                break;
            }
          }

          function onError(error) {
            console.error(`Error: ${error}`);
          }

          function sendMapResponse(tabs) {
            for (let tab of tabs) {
              if (closestLib && closestLib != "") {
                browser.tabs.sendMessage(tab.id, {
                  key: "receivedNearestLib",
                  closestLib: closestLib
                });
              } else {
                browser.tabs.sendMessage(tab.id, {
                  key: "failedNearestLib"
                });
              }
            }
          }

          browser.tabs.query({
            currentWindow: true,
            active: true
          }).then(sendMapResponse).catch(onError);

        }
      });
      break;
    case "printBarcode":
      browser.storage.sync.get().then((res) => {
        var barcodeLib = res.hasOwnProperty('receiptFont') ? res.receiptFont : "MPL";

        browser.tabs.create({
          active: false,
          url: "/printBarcode.html?barcode=" + request.data + "&lib=" + barcodeLib
        }).then((tab) => {
          setTimeout(() => {
            browser.tabs.remove(tab.id)
          }, 1000);
        });
      });
      break;
    case "getDormData":
      $.getJSON("https://mpl-koha-patch.lrschneider.com/dormAddr").done(function(response) {
        var dormName;

        for (var i = 0; i < response.length; i++) {
          var regex = new RegExp(response[i].regex, "i");
          if (regex.test(request.addrVal)) {
            dormName = response[i].name;
            break;
          }
        }

        function onError(error) {
          console.error(`Error: ${error}`);
        }

        function sendMapResponse(tabs) {
          for (let tab of tabs) {
            if (dormName && dormName != "") {
              browser.tabs.sendMessage(tab.id, {
                key: "receivedMatchDorm",
                dormName: dormName
              });
            } else {
              browser.tabs.sendMessage(tab.id, {
                key: "failedMatchDorm"
              });
            }
          }
        }

        browser.tabs.query({
          currentWindow: true,
          active: true
        }).then(sendMapResponse).catch(onError);
      });
      break;
    case "getBadAddrs":
      $.getJSON("https://mpl-koha-patch.lrschneider.com/badAddr").done(function(response) {
        var name,
          type,
          address,
          note;

        for (var i = 0; i < response.length; i++) {
          var regex = new RegExp(response[i].regex, "i");
          if (regex.test(request.addrVal)) {
            name = response[i].name;
            type = response[i].type;
            address = response[i].address;
            note = response[i].note;
            break;
          }
        }

        function onError(error) {
          console.error(`Error: ${error}`);
        }

        function sendBadAddrs(tabs) {
          for (let tab of tabs) {
            if (name && type && address) {
              browser.tabs.sendMessage(tab.id, {
                key: "receivedBadAddrs",
                name: name,
                type: type,
                address: address,
                note: note
              });
            } else {
              browser.tabs.sendMessage(tab.id, {
                key: "noBadAddrs"
              });
            }
          }
        }

        browser.tabs.query({
          currentWindow: true,
          active: true
        }).then(sendBadAddrs).catch(onError);
      });
      break;
    case "getPstatByDist":
      var pstatURL = "https://mpl-koha-patch.lrschneider.com/pstats/";
      switch (request.lib) {
        case "Mad":
          pstatURL += "madExceptions";
          break;
        case "Mid":
          pstatURL += "mid";
          break;
        case "Sun":
          pstatURL += "sun";
          break;
        case "Ver":
          pstatURL += "ver";
          break;
      }
      pstatURL += "?val=all&regex=true";

      $.getJSON(pstatURL).done(function(response) {
        var value, zip;
        for (var i = 0; i < response.length; i++) {
          var regex = new RegExp(response[i].regex, "i");
          if (regex.test(request.matchAddr)) {
            value = response[i].value;
            if (response[i].zip) {
              zip = response[i].zip;
            }
            break;
          }
        }

        function onError(error) {
          console.error(`Error: ${error}`);
        }

        function sendPSTAT(tabs) {
          for (let tab of tabs) {
            if (value && request.lib === "Mad") {
              browser.tabs.sendMessage(tab.id, {
                key: "receivedMAD",
                value: value,
                zip: zip
              });
            } else if (value && /^(mid|ver|sun)$/i.test(request.lib)) {
              browser.tabs.sendMessage(tab.id, {
                key: "received" + request.lib + "PSTAT",
                value: value,
                matchAddr: request.matchAddr
              });
            } else {
              browser.tabs.sendMessage(tab.id, {
                key: "noPstatByDist"
              });
            }
          }
        }

        browser.tabs.query({
          currentWindow: true,
          active: true
        }).then(sendPSTAT).catch(onError);
      });
      break;
    case "updateExtensionIcon":
      setIcon();
      break;
    case "pauseSundayDropbox":
        browser.storage.sync.set({sundayDropboxPaused: true});
      setTimeout(function(){
        browser.storage.sync.set({sundayDropboxPaused: false});
      }, 180000); // 3min
      break;
    case "resumeSundayDropbox":
        browser.storage.sync.set({sundayDropboxPaused: false});
      break;
    case "addNote":
      browser.tabs.executeScript({
        file: "/browserAction/scripts/addPaymentPlanNote.js"
      });
      break;
    case "addLostCardNote":
      browser.tabs.executeScript({
        file: "/browserAction/scripts/addLostCardNote.js"
      });
      break;
    case "addr2PSTAT":
      var querying = browser.tabs.query({
        currentWindow: true,
        active: true
      });
      querying.then((tabs) => {
        for (let tab of tabs) {
          if (/^https?\:\/\/scls-staff\.kohalibrary\.com\/cgi-bin\/koha\/members\/memberentry\.pl.*/.test(tab.url)) {
            browser.tabs.sendMessage(tab.id, {
              key: "querySecondaryPSTAT"
            });
          } else {
            browser.tabs.sendMessage(tab.id, {
              key: "querySecondaryPSTATFail"
            });
          }
        }
      });
      break;
    case "calendarAnnouncements":
      browser.tabs.create({
        url: "http://host.evanced.info/madison/evanced/eventspr.asp"
      }).then((tab) => {
        browser.tabs.executeScript({
          file: "/browserAction/scripts/calendarAnnouncements.js"
        });
      });
      break;
    case "printProblemForm":
      browser.tabs.create({
        active: false,
        url: browser.runtime.getURL("../problemItemForm/printProblemForm.html")
      }).then((tab) => {
        browser.tabs.sendMessage(tab.id, {
          key: "printProblemForm",
          data: request.data
        });
        setTimeout(() => {
          //browser.tabs.remove(tab.id)
        }, 1000);
      });
      break;
    case "prepareItemData":
      browser.tabs.create({
        active: false,
        url: browser.runtime.getURL("https://scls-staff.kohalibrary.com/cgi-bin/koha/circ/circulation-home.pl?mkpItemBarcode=" + request.itemBarcode + "#tabs-catalog_search")
      }).then((tab) => {
        browser.tabs.executeScript(tab.id, {
          file: "/problemItemForm/prepareItemData.js"
        }).then(() => {
          setTimeout(() => {
            browser.tabs.executeScript(tab.id, {
              file: "/problemItemForm/getItemData.js"
            });
          }, 7000);
          setTimeout(() => {
            browser.tabs.remove(tab.id)
          }, 8000);
        });
      });
      break;
    case "returnItemData":
    case "failedItemData":
      var querying = browser.tabs.query({
        currentWindow: true,
        active: true
      });
      querying.then((tabs) => {
        for (let tab of tabs) {
          if (request.key === "returnItemData") {
            browser.tabs.sendMessage(tab.id, {
              "key": "returnItemData",
              "bibNum": request.bibNum,
              "itemNum": request.itemNum,
              "itemTitle": request.itemTitle,
              "copies": request.copies,
              "cCode": request.cCode
            });

            //Get Holds Data
            browser.tabs.create({
              active: false,
              url: "https://scls-staff.kohalibrary.com/cgi-bin/koha/catalogue/detail.pl?biblionumber=" + request.bibNum
            }).then((holdsTab) => {
              setTimeout(() => {
                browser.tabs.executeScript(holdsTab.id, {
                  file: "/problemItemForm/getItemHolds.js"
                }).then(() => {
                  setTimeout(() => {
                    browser.tabs.remove(holdsTab.id);
                  }, 1000);
                });
              }, 7000);
            });
          } else { // Failed
            browser.tabs.sendMessage(tab.id, {
              "key": "failedItemData"
            });
          }
        }
      });
      break;
    case "getPatronData":
      browser.tabs.create({
        active: false,
        url: browser.runtime.getURL("https://scls-staff.kohalibrary.com/cgi-bin/koha/circ/circulation.pl?findborrower=" + request.patronBarcode)
      }).then((tab) => {
        browser.tabs.executeScript(tab.id, {
          file: "/problemItemForm/getPatronData.js"
        }).then(() => {
          setTimeout(() => {
            browser.tabs.remove(tab.id)
          }, 2500);
        });
      });
      break;
    case "getPatronFromURL":
      browser.tabs.create({
        active: false,
        url: browser.runtime.getURL("https://scls-staff.kohalibrary.com" + request.url)
      }).then((tab) => {
        browser.tabs.executeScript(tab.id, {
          file: "/problemItemForm/getPatronData.js"
        }).then(() => {
          setTimeout(() => {
            browser.tabs.remove(tab.id)
          }, 2500);
        });
      });
      break;
    case "returnPatronData":
    case "failedPatronData":
      var querying = browser.tabs.query({
        currentWindow: true,
        active: true
      });
      querying.then((tabs) => {
        for (let tab of tabs) {
          if (request.key === "returnPatronData") {
            browser.tabs.sendMessage(tab.id, {
              "key": "returnPatronData",
              "patronName": request.patronName,
              "patronBarcode": request.patronBarcode,
              "patronPhone": request.patronPhone,
              "patronEmail": request.patronEmail
            });
          } else { // Failed
            browser.tabs.sendMessage(tab.id, {
              "key": "failedPatronData"
            });
          }
        }
      });
      break;
    case "returnItemHolds":
    case "failedItemHolds":
      var querying = browser.tabs.query({
        currentWindow: true,
        active: true
      });
      querying.then((tabs) => {
        for (let tab of tabs) {
          if (request.key === "returnItemHolds") {
            browser.tabs.sendMessage(tab.id, {
              "key": "returnItemHolds",
              "holds": request.holds,
              "itemTitle": request.itemTitle
            });
          } else { // Failed
            browser.tabs.sendMessage(tab.id, {
              "key": "failedItemHolds"
            });
          }
        }
      });
      break;
  }
}

browser.runtime.onMessage.addListener(handleMessages);
