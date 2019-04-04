(function(){
  'use strict';
  const data = {};
  const copiesWrap = document.querySelector('#catalogue_detail_biblio ol li:last-of-type');
  const cCodeCell = document.querySelector('.yui-g .listgroup:first-of-type .bibliodetails tbody tr:nth-child(3) td:last-of-type');
  const ckoHistCell = document.querySelector('.yui-g .listgroup:nth-child(4) .bibliodetails tbody tr:nth-child(3) td:last-of-type');
  const itemStatus = document.querySelector(".bibliodetails .itemstatus");

  data.bibNum = window.location.toString().match(/biblionumber=\d+/)[0].match(/\d+/)[0];
  data.itemNum = document.querySelector('.yui-g h3').id.match(/\d+/)[0];

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
    data.copies = copiesWrap.textContent.match(/\d+/)[0];
  }

  if (cCodeCell) {
    data.cCode = cCodeCell.textContent.trim();
  }

  if (ckoHistCell) {
    data.ckoHist = ckoHistCell.textContent.match(/\d+/)[0];
  }

  return data;
})();
