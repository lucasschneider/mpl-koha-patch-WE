const laptopMap = {
  "39078083272006": "PC1-A1",
  "39078083272014": "PC1-A2",
  "39078083272071": "PC1-A3",
  "39078091512427": "PC1-A4",
  "39078083272246": "PC1-A5",
  "39078091512484": "PC1-B1",
  "39078083272121": "PC1-B2",
  "39078083272063": "PC1-B3",
  "39078083272667": "PC2-A1",
  "39078083272600": "PC2-A2",
  "39078091512369": "PC2-A3",
  //"390780XXXXXXXX": "PC2-A4",
  "39078083272428": "PC2-A5",
  "39078086196814": "PC2-B1",
  "39078091512245": "PC2-B2",
  "39078091512302": "PC2-B3"
};

const ipads = [
  "39078083354804",
  "39078083354929",
  "39078083354986",
  "39078083355041",
  "39078083355108",
  "39078083355165",
  "39078083355280",
  "39078083355348"
];

const accessories = {
  "headphones": [
    "39078083378563",
    "39078083378621",
    "39078083378688",
    "39078083378746",
    "39078083378803",
    "39078083378860",
    "39078086197051",
    "39078083378985",
    "39078083379041",
    "39078083379108",
    "39078083265299",
    "39078083265356",
    "39078083265414",
    "39078086196764",
    "39078083264821",
    "39078083264888",
    "39078086196798",
    "39078083265000",
    "39078083265067",
    "39078083265182",
    "39078083265307",
    "39078083265364",
    "39078083265422"
  ],
  "powersupply": [
    "39078091512732",
    "39078091512674",
    "39078091512559",
    "39078091512492",
    "39078091512617",
    "39078083272196",
    "39078083272253",
    "39078083272378",
    "39078083272436",
    "39078083272493",
    "39078083272618",
    "39078083272147",
    "39078083272204",
    "39078083272261",
    "39078083272329",
  ],
  "mouse": [
    "39078086197994",
    "39078083265109",
    "39078083265166",
    "39078083265224",
    "39078083265281",
    "39078083265349",
    "39078083265406",
    "39078086197101",
    "39078083264813",
    "39078083264870",
    "39078083264938",
    "39078083264995",
    "39078083265059",
    "39078083265117",
    "39078083265174",
    "39078083265232",
    "39078083265240"
  ],
  "dvdplayer": [
    "39078091201906",
    "39078091202144",
    "39078091202201",
    "39078091402611"
  ]
};

if (window.location.toString().includes("/cgi-bin/koha/circ/circulation.pl")) {
  let patronBC = document.querySelector('.patroninfo h5');
  let itemTitle = document.querySelector("#recent-issues li:first-of-type .booktitle");
  let itemBC = document.querySelector("#recent-issues li:first-of-type .itembarcode");

  if (itemTitle && patronBC && itemBC) {
    itemTitle = itemTitle.textContent;
    patronBC = patronBC.textContent.match(/2\d{13}/)[0];
    itemBC = itemBC.textContent.match(/3\d{13}/)[0];

    if (itemTitle.includes("GENERIC EQUIPMENT")) {
      if ((itemTitle.includes("LAPTOP") && Object.keys(laptopMap).includes(itemBC)) ||
          (itemTitle.includes("IPAD") && ipads.includes(itemBC))) {
        let itemID;

        if (laptopMap[itemBC]) {
          itemID = laptopMap[itemBC];
        } else if (ipads.includes(itemBC)) {
          itemID = "IPAD-" + itemBC.slice(-4);
        }

        browser.runtime.sendMessage({
          "key": "issueLaptop",
          "patronBC": patronBC,
          "itemID": itemID
        });
      } else if (itemTitle.includes("POWER SUPPLY") && accessories.powersupply.includes(itemBC)) {
        browser.runtime.sendMessage({
          "key": "issuePowerSupply",
          "patronBC": patronBC,
          "itemBC": itemBC
        });
      } else if (itemTitle.includes("MOUSE") && accessories.mouse.includes(itemBC)) {
        browser.runtime.sendMessage({
          "key": "issueMouse",
          "patronBC": patronBC,
          "itemBC": itemBC
        });
      } else if (itemTitle.includes("HEADPHONES") && accessories.headphones.includes(itemBC)) {
        browser.runtime.sendMessage({
          "key": "issueHeadphones",
          "patronBC": patronBC,
          "itemBC": itemBC
        });
      } else if (itemTitle.includes("DVD PLAYER") && accessories.dvdplayer.includes(itemBC)) {
        browser.runtime.sendMessage({
          "key": "issueDVDPlayer",
          "patronBC": patronBC,
          "itemBC": itemBC
        });
      }
    }
  }

} else if (window.location.toString().includes("/cgi-bin/koha/circ/returns.pl")) {
  let returnCells = document.querySelectorAll('#bd td');

  if (returnCells.length > 0 && returnCells[5].textContent.trim() !== "Not checked out") {
    let returnBC = returnCells[3].textContent.trim();

    if (Object.keys(laptopMap).includes(returnBC) || ipads.includes(returnBC)) {
      let d = new Date();

      let itemTitle = document.querySelector('#doc td:nth-of-type(2)');

      if (returnCells[1].textContent.includes("IPAD")) {
          browser.runtime.sendMessage({
            "key": "returnLaptop",
            "itemID": "IPAD-" + returnBC.slice(-4),
            "returnDate": d
          });
      } else if (returnCells[1].textContent.includes("LAPTOP")) {
        browser.runtime.sendMessage({
          "key": "returnLaptop",
          "itemID": laptopMap[returnBC],
          "returnDate": d
        });
      }
    } else if (accessories.headphones.includes(returnBC)) {
      browser.runtime.sendMessage({
        "key": "removeRow",
        "type": "headphones",
        "itemID": returnBC
      });
    } else if (accessories.powersupply.includes(returnBC)) {
      browser.runtime.sendMessage({
        "key": "removeRow",
        "type": "powersupply",
        "itemID": returnBC
      });
    } else if (accessories.mouse.includes(returnBC)) {
      browser.runtime.sendMessage({
        "key": "removeRow",
        "type": "mouse",
        "itemID": returnBC
      });
    } else if (accessories.dvdplayer.includes(returnBC)) {
      browser.runtime.sendMessage({
        "key": "removeRow",
        "type": "dvdplayer",
        "itemID": returnBC
      });
    }
  }
}
