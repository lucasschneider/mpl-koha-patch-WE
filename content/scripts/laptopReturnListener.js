if (window.location.toString().includes("/cgi-bin/koha/circ/returns.pl")) {
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

  let returnCells = document.querySelectorAll('#bd td');

  if (returnCells.length > 0 && returnCells[5].textContent.trim() !== "Not checked out") {
    let returnBC = returnCells[3].textContent.trim();

    if (Object.keys(laptopMap).includes(returnBC)) {
      let d = new Date();
      d.setHours(d.getHours() - (d.getTimezoneOffset()/60));
      
      browser.runtime.sendMessage({
        "key": "returnLaptop",
        "laptopID": laptopMap[returnBC],
        "retDate": d
      });
    }
  }
}
