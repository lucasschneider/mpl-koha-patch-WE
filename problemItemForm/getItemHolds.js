var holdsNotice = document.querySelector(".dialogue.alert b"),
  numHolds;

if (holdsNotice) {
  numHolds = holdsNotice.textContent.match(/\d+/)[0];
  
  if (numHolds) {
    browser.runtime.sendMessage({
      "key": "returnItemHolds",
      "holds": numHolds
    });
  } else {
    browser.runtime.sendMessage({
      "key": "failedItemHolds"
    });
  }
} else {
  browser.runtime.sendMessage({
    "key": "returnItemHolds",
    "holds": 0
  });
}