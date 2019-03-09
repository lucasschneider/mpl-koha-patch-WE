(function() {
  'use strict';
  if(/\/cgi-bin\/koha\/reports\/holdsaction\.pl/.test(window.location)) {
    var table = document.getElementById('myf'),
      holdsTable = document.getElementById("mytab"),
      holdsBody,
      avCodes = ["cdams", "cdamsid", "cdjms", "cdyms","dbrafe", "dbraff", "dbraid", "dbranf", "dbrarn", "dbratv", "dbrj", "dvdafe", "dvdaff", "dvdaid", "dvdanf", "dvdarn", "dvdatv", "dvdawl", "dvdjfe", "dvdjhl", "dvdjnf", "dvdjwl", "dvdyfe","vga", "vgj", "vgy", "soa", "soawl", "soj"],
      codesToFilter = "",
      allArray = [],
      avArray = [],
      otherArray = [],
      box = document.createElement('input'),
      boxLabel = document.createElement('label'),
      labelText = document.createElement('span'),
      parentWrapper = document.getElementById('yui-main'),
      tableNotLoaded = document.getElementById('outputscreen');

    if (!tableNotLoaded && table && table.textContent.trim() !== "No results found.") {
      parentWrapper = !!parentWrapper ? parentWrapper.children[0] : null;
      box.type = "checkbox";
      box.checked = false;
      box.style.verticalAlign = "middle";
      box.style.cursor = "pointer";
      box.style.margin = "0 1em 0 1.5em";
      boxLabel.style.cursor = "pointer";
      boxLabel.style.margin = "1em 0";
      boxLabel.appendChild(box);
      labelText.textContent = "Separate AV from other hold items. (Default: CDs only, may be customized in the extension preferences.)";
      boxLabel.appendChild(labelText);
      // Insert to breaks to space checkbox and text from table.
      parentWrapper.insertBefore(document.createElement('br'), parentWrapper.children[1]);
      parentWrapper.insertBefore(document.createElement('br'), parentWrapper.children[1]);

      parentWrapper.insertBefore(boxLabel, parentWrapper.children[1]);

      holdsBody = holdsTable.tBodies[0];

      for (var i = 0; i < holdsBody.children.length; i++) {
        allArray.push(holdsBody.children[i]);
      }

      allArray.sort(sortHoldTRs);

      browser.storage.sync.get(avCodes).then((res) => {
        for (var i = 0; i < avCodes.length; i++) {
          if (res[avCodes[i]] === true) codesToFilter += avCodes[i] + "|";
        }

        codesToFilter = new RegExp(codesToFilter.slice(0,-1),"i");

        // Separate array of all items
        for (let row of allArray) {
          if (codesToFilter.test(row.children[2].textContent.trim().substring(0,7))) {
            avArray.push(row);
          } else {
            otherArray.push(row);
          }
        }
      });

      function sortHoldTRs(a,b) {
        if (a.children[3].textContent.replace(/\s\s+/g, ' ') < b.children[3].textContent.replace(/\s\s+/g, ' '))
          return -1
        else if (a.children[3].textContent.replace(/\s\s+/g, ' ') > b.children[3].textContent.replace(/\s\s+/g, ' '))
          return 1;
        else return 0;
      }

      function filterHolds() {

        if (box.checked) {
          // Append sorted arrays
          holdsBody.textContent = "";

          for (let row of avArray.sort(sortHoldTRs)) {
            holdsBody.appendChild(row);
          }

          for (let row of otherArray.sort(sortHoldTRs)) {
            holdsBody.appendChild(row);
          }
        } else {
          holdsBody.textContent = "";

          for (let row of allArray) {
            holdsBody.appendChild(row);
          }
        }
      }

      box.addEventListener('change', filterHolds);

      // Sort alphabetically by patron's last name
      filterHolds();
    }
  }
})();
