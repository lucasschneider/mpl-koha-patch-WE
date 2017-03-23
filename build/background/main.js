"use strict";

var d = new Date(),
    day = d.getUTCDay(),
    setIcon = function setIcon() {
  switch (weh.prefs.skin) {
    case "MID":
      browser.browserAction.setIcon({ path: {
          16: "content/images/mid-icon-16.png",
          32: "content/images/mid-icon-32.png",
          48: "content/images/mid-icon-48.png",
          64: "content/images/mid-icon-64.png",
          128: "content/images/mid-icon-128.png"
        } });
      break;
    case "SCLS":
      browser.browserAction.setIcon({ path: {
          16: "content/images/scls-icon-16.png",
          32: "content/images/scls-icon-32.png",
          48: "content/images/scls-icon-48.png",
          64: "content/images/scls-icon-64.png",
          128: "content/images/scls-icon-128.png"
        } });
      break;
    default:
      browser.browserAction.setIcon({ path: {
          16: "content/images/mpl-icon-16.png",
          32: "content/images/mpl-icon-32.png",
          48: "content/images/mpl-icon-48.png",
          64: "content/images/mpl-icon-64.png",
          128: "content/images/mpl-icon-128.png"
        } });
  }
};

setIcon();
weh.prefs.on("skin", setIcon);

// Load preference-selected function files
function handleUpdated(tabId, changeInfo, tabInfo) {
  if (weh.prefs.patronMsg) {
    browser.tabs.executeScript({
      file: "content/scripts/patronMessages.js"
    });
  }
  if (weh.prefs.validAddr) {
    browser.tabs.executeScript({
      file: "content/scripts/validateAddresses.js"
    });
  }
  if (weh.prefs.autoUserId) {
    browser.tabs.executeScript({
      file: "content/scripts/autofillUserId.js"
    });
  }
  if (weh.prefs.selectPSTAT) {
    browser.tabs.executeScript({
      file: "content/scripts/selectPSTAT.js"
    });
  }
  if (weh.prefs.forceDigest) {
    browser.tabs.executeScript({
      file: "content/scripts/forceDigest.js"
    });
  }
  if (weh.prefs.restrictNotificationOptions) {
    browser.tabs.executeScript({
      file: "content/scripts/restrictNotificationOptions.js"
    });
  }
  if (weh.prefs.middleName) {
    browser.tabs.executeScript({
      file: "content/scripts/middleName.js"
    });
  }
  if (weh.prefs.updateAccountType) {
    browser.tabs.executeScript({
      file: "content/scripts/updateAccountType.js"
    });
  }
  if (weh.prefs.collegeExp) {
    browser.tabs.executeScript({
      file: "content/scripts/collegeExp.js"
    });
  }
  if (weh.prefs.disableDropbox) {
    browser.tabs.executeScript({
      file: "content/scripts/disableDropbox.js"
    });
  } else if (day === 0) {
    browser.tabs.executeScript({
      file: "content/scripts/sundayDropbox.js"
    });
  }
}

browser.tabs.onUpdated.addListener(handleUpdated);

weh.ui.update("default", {
  type: "popup",
  onMessage: function onMessage(message) {
    switch (message.type) {
      case "open-settings":
        weh.ui.close("default");
        weh.ui.open("settings");
        break;
      case "addNote":
        weh.ui.close("default");
        browser.tabs.executeScript({
          file: "content/popup-tools/addPaymentPlanNote.js"
        });
        break;
      case "addLostCardNote":
        weh.ui.close("default");
        browser.tabs.executeScript({
          file: "content/popup-tools/addLostCardNote.js"
        });
        break;
      case "addr2PSTAT":
        weh.ui.close("default");
        break;
      case "calendarAnnouncements":
        weh.ui.close("default");
        browser.tabs.create({
          url: "http://host.evanced.info/madison/evanced/eventspr.asp"
        }).then(function (tab) {
          browser.tabs.executeScript({
            file: "/content/popup-tools/calendarAnnouncements.js"
          });
        });
        break;
    }
  }
});

// Handle messages form content pages
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.key) {
    case "printBarcode":
      browser.tabs.create({
        active: false,
        url: "/printBarcode" + weh.prefs.receiptFont + ".html"
      }).then(function (tab) {
        browser.tabs.sendMessage(tab.id, {
          key: "printBarcode",
          data: request.data
        });
        setTimeout(function () {
          browser.tabs.remove(tab.id);
        }, 1000);
      });
      break;
  }
});

weh.ui.update("settings", {
  type: "tab",
  contentURL: "content/settings.html"
});

/* if you don't need to activate the addon from the browser context menu,
    - remove section below
*/
browser.contextMenus.create({
  "title": weh._("title"),
  "type": "normal",
  "contexts": ["page"],
  "id": "weh-skeleton"
});

browser.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId == "weh-skeleton") {
    /* do something here */
  }
});