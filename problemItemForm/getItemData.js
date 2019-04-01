var copiesWrap = document.querySelector('#catalogue_detail_biblio ol li:last-of-type'),
  cCodeCell = document.querySelector('.yui-g .listgroup:first-of-type .bibliodetails tbody tr:nth-child(3) td:last-of-type'),
  ckoHistCell = document.querySelector('.yui-g .listgroup:nth-child(4) .bibliodetails tbody tr:nth-child(3) td:last-of-type'),
  itemStatus = document.querySelector(".bibliodetails .itemstatus"),
  copies,
  cCode,
  ckoHist,
  bibNum = window.location.toString().match(/biblionumber=\d+/)[0].match(/\d+/)[0],
  itemNum = document.querySelector('.yui-g h3').id.match(/\d+/)[0];

  if (itemStatus.children.length > 0) {
    try {
      browser.runtime.sendMessage({
        "key": "getPatronFromURL",
        "url": itemStatus.children[0].children[0].getAttribute("href")
      });
    } catch (e) {
      console.log(e.message);
    }
  }


if (copiesWrap) {
  copies = copiesWrap.textContent.match(/\d+/)[0];
}

if (cCodeCell) {
  cCode = cCodeCell.textContent.trim();
}

if (ckoHistCell) {
  ckoHist = ckoHistCell.textContent.match(/\d+/)[0];
}

if (bibNum && itemNum && copies && cCode) {
  browser.runtime.sendMessage({
    "key": "returnItemData",
    "bibNum": bibNum,
    "itemNum": itemNum,
    "copies": copies,
    "cCode": cCode,
    "ckoHist": ckoHist
  });
}
