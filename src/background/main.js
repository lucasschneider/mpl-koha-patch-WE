// Load preference-selected function files
function handleUpdated(tabId, changeInfo, tabInfo) {
  if (weh.prefs.middleName) {
    browser.tabs.executeScript({
      file: "content/scripts/middleName.js"
    }); 
  }
}

browser.tabs.onUpdated.addListener(handleUpdated);

switch(weh.prefs.skin) {
  case "MID":
    browser.browserAction.setIcon({path: {
      16: "content/images/mid-icon-16.png",
      32: "content/images/mid-icon-32.png",
      48: "content/images/mid-icon-48.png",
      64: "content/images/mid-icon-64.png",
      128: "content/images/mid-icon-128.png"
    }});
    break;
  case "SCLS":
    browser.browserAction.setIcon({path: {
      16: "content/images/scls-icon-16.png",
      32: "content/images/scls-icon-32.png",
      48: "content/images/scls-icon-48.png",
      64: "content/images/scls-icon-64.png",
      128: "content/images/scls-icon-128.png"
    }});
    break;
  default:
    browser.browserAction.setIcon({path: {
      16: "content/images/mpl-icon-16.png",
      32: "content/images/mpl-icon-32.png",
      48: "content/images/mpl-icon-48.png",
      64: "content/images/mpl-icon-64.png",
      128: "content/images/mpl-icon-128.png"
    }});
  }

weh.ui.update("default",{
    type: "popup",
    onMessage: function(message) {
        switch(message.type) {
            case "open-settings":
                weh.ui.close("default");
                weh.ui.open("settings");
                break;
            case "addNote":
                weh.ui.close("default");
                browser.tabs.executeScript({
                   file: "/content/popup-tools/addPaymentPlanNote.js"
                }); 
                break;
            case "addLostCardNote":
                weh.ui.close("default");
                browser.tabs.executeScript({
                   file: "/content/popup-tools/addLostCardNote.js"
                }); 
                break;
            case "addr2PSTAT":
                weh.ui.close("default");
                break;
            case "calendarAnnouncements":
                weh.ui.close("default");
                browser.tabs.create({
                    url:"http://host.evanced.info/madison/evanced/eventspr.asp"
                }).then((tab) => {
                    browser.tabs.executeScript({
                        file: "/content/popup-tools/calendarAnnouncements.js"
                    }); 
                });
                break;
        }
    }
});

weh.ui.update("settings",{
    type: "tab",
    contentURL: "content/settings.html"
});

weh.prefs.on("skin",function () {
  switch(weh.prefs.skin) {
    case "MID":
      browser.browserAction.setIcon({path: {
        16: "content/images/mid-icon-16.png",
        32: "content/images/mid-icon-32.png",
        48: "content/images/mid-icon-48.png",
        64: "content/images/mid-icon-64.png",
        128: "content/images/mid-icon-128.png"
      }});
      break;
    case "SCLS":
      browser.browserAction.setIcon({path: {
        16: "content/images/scls-icon-16.png",
        32: "content/images/scls-icon-32.png",
        48: "content/images/scls-icon-48.png",
        64: "content/images/scls-icon-64.png",
        128: "content/images/scls-icon-128.png"
      }});
      break;
    default:
      browser.browserAction.setIcon({path: {
        16: "content/images/mpl-icon-16.png",
        32: "content/images/mpl-icon-32.png",
        48: "content/images/mpl-icon-48.png",
        64: "content/images/mpl-icon-64.png",
        128: "content/images/mpl-icon-128.png"
      }});
  }
});


/* if you don't need to activate the addon from the browser context menu,
    - remove section below
*/
browser.contextMenus.create({
    "title": weh._("title"),
    "type": "normal",
    "contexts":["page"],
    "id": "weh-skeleton"
});

browser.contextMenus.onClicked.addListener(function(info) {
    if(info.menuItemId == "weh-skeleton" ) {
        /* do something here */
    }
});
