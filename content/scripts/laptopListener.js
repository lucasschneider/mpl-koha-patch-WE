//Creating a map of all the laptops and corresponing barcodes
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

//Creating a map of all the ipads and corresponing barcodes
const ipadMap = {
  "39078083354804": "IPAD-A7",
  "39078083354929": "IPAD-A8",
  "39078083354986": "IPAD-4986", // 2019-05-08 Laptop not found in cabinet
  "39078083355041": "IPAD-5041", // 2019-05-08 Laptop not found in cabinet
  "39078083355108": "IPAD-5108", // 2019-05-08 Laptop not found in cabinet
  "39078083355165": "IPAD-B6",
  "39078083355280": "IPAD-A10",
  "39078083355348": "IPAD-A9"
};

//Creating map of accessories
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
    "39078086196947",
    "39078083265414",
    "39078086196764",
    "39078083264821",
    "39078083264888",
    "39078086196798",
    "39078086196871",
    "39078086196921",
    "39078083265182",
    "39078083265307",
    "39078086196988",
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

//listening for laptop/iPad checkout and storing values
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
          (itemTitle.includes("IPAD") && Object.keys(ipadMap).includes(itemBC))) {
        let itemID = (laptopMap[itemBC] || ipadMap[itemBC]);

        browser.runtime.sendMessage({
          "key": "issueItem",
          "type": "laptop",
          "patronBC": patronBC,
          "itemID": itemID
        });
      } else if (itemTitle.includes("POWER SUPPLY") && accessories.powersupply.includes(itemBC)) {
        browser.runtime.sendMessage({
          "key": "issueItem",
          "type": "powersupply",
          "patronBC": patronBC,
          "itemID": itemBC
        });
      } else if (itemTitle.includes("MOUSE") && accessories.mouse.includes(itemBC)) {
        browser.runtime.sendMessage({
          "key": "issueItem",
          "type": "mouse",
          "patronBC": patronBC,
          "itemID": itemBC
        });
      } else if (itemTitle.includes("HEADPHONES") && accessories.headphones.includes(itemBC)) {
        browser.runtime.sendMessage({
          "key": "issueItem",
          "type": "headphones",
          "patronBC": patronBC,
          "itemID": itemBC
        });
      } else if (itemTitle.includes("DVD PLAYER") && accessories.dvdplayer.includes(itemBC)) {
        browser.runtime.sendMessage({
          "key": "issueItem",
          "type": "dvdplayer",
          "patronBC": patronBC,
          "itemID": itemBC
        });
      }
    }
  }
//Listening for returns
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
