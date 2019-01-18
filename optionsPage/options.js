var skin = document.getElementById(""),
    patronMsg = document.getElementById("patronMsg"),
    validAddr = document.getElementById("validAddr"),
    autoBarcode = document.getElementById("autoBarcode"),
    lookupPSTAT = document.getElementById("lookupPSTAT"),
    digestOnly = document.getElementById("digestOnly"),
    dueDateToggle = document.getElementById("dueDateToggle"),
    middleInitials = document.getElementById("middleInitials"),
    updateAccountType = document.getElementById("updateAccountType"),
    cdams = document.getElementById("cdams"),
    cdamsid = document.getElementById("cdamsid"),
    cdjms = document.getElementById("cdjms"),
    cdyms = document.getElementById("cdyms"),
    dbrafe = document.getElementById("dbrafe"),
    dbraff = document.getElementById("dbraff"),
    dbraid = document.getElementById("dbraid"),
    dbranf = document.getElementById("dbranf"),
    dbrarn = document.getElementById("dbrarn"),
    dbratv = document.getElementById("dbratv"),
    dbrj = document.getElementById("dbrj"),
    dvdafe = document.getElementById("dvdafe"),
    dvdaff = document.getElementById("dvdaff"),
    dvdaid = document.getElementById("dvdaid"),
    dvdanf = document.getElementById("dvdanf"),
    dvdarn = document.getElementById("dvdarn"),
    dvdatv = document.getElementById("dvdatv"),
    dvdawl = document.getElementById("dvdawl"),
    dvdjfe = document.getElementById("dvdjfe"),
    dvdjhl = document.getElementById("dvdjhl"),
    dvdjnf = document.getElementById("dvdjnf"),
    dvdjwl = document.getElementById("dvdjwl"),
    dvdyfe = document.getElementById("dvdyfe"),
    vga = document.getElementById("vga"),
    vgj = document.getElementById("vgj"),
    vgy = document.getElementById("vgy"),
    soa = document.getElementById("soa"),
    soawl = document.getElementById("soawl"),
    soj = document.getElementById("soj"),
    sepAllCD = document.getElementById("sepAllCD"),
    sepAllDVD = document.getElementById("sepAllDVD"),
    sepOther = document.getElementById("sepOther"),
    receiptFont = document.getElementById("receiptFont"),
    sundayDropbox = document.getElementById("sundayDropbox"),
    sundayDropboxPaused = document.getElementById("sundayDropboxPaused"),
    shortcutText1 = document.getElementById("shortcutText1"),
    shortcutLink1 = document.getElementById("shortcutLink1"),
    shortcutText2 = document.getElementById("shortcutText2"),
    shortcutLink2 = document.getElementById("shortcutLink2"),
    shortcutText3 = document.getElementById("shortcutText3"),
    shortcutLink3 = document.getElementById("shortcutLink3"),
    shortcutText4 = document.getElementById("shortcutText4"),
    shortcutLink4 = document.getElementById("shortcutLink4"),
    shortcutText5 = document.getElementById("shortcutText5"),
    shortcutLink5 = document.getElementById("shortcutLink5"),
    shortcutText6 = document.getElementById("shortcutText6"),
    shortcutLink6 = document.getElementById("shortcutLink6");

function setDefaultOptions() {    
  browser.storage.sync.set({
    "skin": "MAD",
    "patronMsg": true,
    "validAddr": true,
    "autoBarcode": true,
    "lookupPSTAT": true,
    "digestOnly": true,
    "dueDateToggle": true,
    "middleInitials": true,
    "updateAccountType": true,
    "cdams": true,
    "cdamsid": true,
    "cdjms": true,
    "cdyms": true,
    "dbrafe": false,
    "dbraff": false,
    "dbraid": false,
    "dbranf": false,
    "dbrarn": false,
    "dbratv": false,
    "dbrj": false,
    "dvdafe": false,
    "dvdaff": false,
    "dvdaid": false,
    "dvdanf": false,
    "dvdarn": false,
    "dvdatv": false,
    "dvdawl": false,
    "dvdjfe": false,
    "dvdjhl": false,
    "dvdjnf": false,
    "dvdjwl": false,
    "dvdyfe": false,
    "vga": false,
    "vgj": false,
    "vgy": false,
    "soa": false,
    "soawl": false,
    "soj": false,
    "sepAllCD": true,
    "sepAllDVD": false,
    "sepOther": false,
    "receiptFont": "MPL",
    "sundayDropbox": true,
    "sundayDropboxPaused": false,
    "shortcutText1": "Koha—Checkin",
    "shortcutLink1": "http://scls-staff.kohalibrary.com/cgi-bin/koha/circ/returns.pl",
    "shortcutText2": "Koha—Checkout",
    "shortcutLink2": "http://scls-staff.kohalibrary.com/cgi-bin/koha/circ/circulation.pl",
    "shortcutText3": "American Fact Finder",
    "shortcutLink3": "http://factfinder.census.gov/faces/nav/jsf/pages/searchresults.xhtml?refresh=t",
    "shortcutText4": "MPL Home Page",
    "shortcutLink4": "http://madisonpubliclibrary.org",
    "shortcutText5": "MPLnet",
    "shortcutLink5": "http://www.mplnet.org",
    "shortcutText6": "MPL Reference Tools",
    "shortcutLink6": "http://www.madisonpubliclibrary.org/research/referenc2"
  });
  browser.runtime.sendMessage({key: "updateExtensionIcon"});
  restoreOptions();
}

function restoreOptions() {
  browser.storage.sync.get('skin').then((res) => {
    skin.value = res.skin;
  });
  
  browser.storage.sync.get('patronMsg').then((res) => {
    patronMsg.checked = res.patronMsg;
  });
  
  browser.storage.sync.get('validAddr').then((res) => {
    validAddr.checked = res.validAddr;
  });
  
  browser.storage.sync.get('autoBarcode').then((res) => {
    autoBarcode.checked = res.autoBarcode;
  });
  
  browser.storage.sync.get('lookupPSTAT').then((res) => {
    lookupPSTAT.checked = res.lookupPSTAT;
  });
  
  browser.storage.sync.get('digestOnly').then((res) => {
    digestOnly.checked = res.digestOnly;
  });
  
  browser.storage.sync.get('dueDateToggle').then((res) => {
    dueDateToggle.checked = res.dueDateToggle;
  });
  
  browser.storage.sync.get('middleInitials').then((res) => {
    middleInitials.checked = res.middleInitials;
  });
  
  browser.storage.sync.get('updateAccountType').then((res) => {
    updateAccountType.checked = res.updateAccountType;
  });
  
  browser.storage.sync.get('cdams').then((res) => {
    cdams.checked = res.cdams;
  });
  
  browser.storage.sync.get('cdamsid').then((res) => {
    cdamsid.checked = res.cdamsid;
  });
  
  browser.storage.sync.get('cdjms').then((res) => {
    cdjms.checked = res.cdjms;
  });
  
  browser.storage.sync.get('cdyms').then((res) => {
    cdyms.checked = res.cdyms;
  });
  
  browser.storage.sync.get('dbrafe').then((res) => {
    dbrafe.checked = res.dbrafe;
  });
  
  browser.storage.sync.get('dbraff').then((res) => {
    dbraff.checked = res.dbraff;
  });
  
  browser.storage.sync.get('dbraid').then((res) => {
    dbraid.checked = res.dbraid;
  });
  
  browser.storage.sync.get('dbranf').then((res) => {
    dbranf.checked = res.dbranf;
  });
  
  browser.storage.sync.get('dbrarn').then((res) => {
    dbrarn.checked = res.dbrarn;
  });
  
  browser.storage.sync.get('dbratv').then((res) => {
    dbratv.checked = res.dbratv;
  });
  
  browser.storage.sync.get('dbrj').then((res) => {
    dbrj.checked = res.dbrj;
  });
  
  browser.storage.sync.get('dvdafe').then((res) => {
    dvdafe.checked = res.dvdafe;
  });
  
  browser.storage.sync.get('dvdaff').then((res) => {
    dvdaff.checked = res.dvdaff;
  });
  
  browser.storage.sync.get('dvdaid').then((res) => {
    dvdaid.checked = res.dvdaid;
  });
  
  browser.storage.sync.get('dvdanf').then((res) => {
    dvdanf.checked = res.dvdanf;
  });
  
  browser.storage.sync.get('dvdarn').then((res) => {
    dvdarn.checked = res.dvdarn;
  });
  
  browser.storage.sync.get('dvdatv').then((res) => {
    dvdatv.checked = res.dvdatv;
  });
  
  browser.storage.sync.get('dvdawl').then((res) => {
    dvdawl.checked = res.dvdawl;
  });
  
  browser.storage.sync.get('dvdjfe').then((res) => {
    dvdjfe.checked = res.dvdjfe;
  });
  
  browser.storage.sync.get('dvdjhl').then((res) => {
    dvdjhl.checked = res.dvdjhl;
  });
  
  browser.storage.sync.get('dvdjnf').then((res) => {
    dvdjnf.checked = res.dvdjnf;
  });
  
  browser.storage.sync.get('dvdjwl').then((res) => {
    dvdjwl.checked = res.dvdjwl;
  });
  
  browser.storage.sync.get('dvdyfe').then((res) => {
    dvdyfe.checked = res.dvdyfe;
  });
  
  browser.storage.sync.get('vga').then((res) => {
    vga.checked = res.vga;
  });
  
  browser.storage.sync.get('vgj').then((res) => {
    vgj.checked = res.vgj;
  });
  
  browser.storage.sync.get('vgy').then((res) => {
    vgy.checked = res.vgy;
  });
  
  browser.storage.sync.get('soa').then((res) => {
    soa.checked = res.soa;
  });
  
  browser.storage.sync.get('soawl').then((res) => {
    soawl.checked = res.soawl;
  });
  
  browser.storage.sync.get('soj').then((res) => {
    soj.checked = res.soj;
  });
  
  browser.storage.sync.get('sepAllCD').then((res) => {
    sepAllCD.checked = res.sepAllCD;
  });
  
  browser.storage.sync.get('sepAllDVD').then((res) => {
    sepAllDVD.checked = res.sepAllDVD;
  });
  
  browser.storage.sync.get('sepOther').then((res) => {
    sepOther.checked = res.sepOther;
  });
  
  browser.storage.sync.get('receiptFont').then((res) => {
    receiptFont.value = res.receiptFont;
  });
  
  browser.storage.sync.get('sundayDropbox').then((res) => {
    sundayDropbox.checked = res.sundayDropbox;
  });
  
  browser.storage.sync.get('shortcutText1').then((res) => {
    shortcutText1.value = res.shortcutText1;
  });
  browser.storage.sync.get('shortcutLink1').then((res) => {
    shortcutLink1.value = res.shortcutLink1;
  });
  browser.storage.sync.get('shortcutText2').then((res) => {
    shortcutText2.value = res.shortcutText2;
  });
  browser.storage.sync.get('shortcutLink2').then((res) => {
    shortcutLink2.value = res.shortcutLink2;
  });
  browser.storage.sync.get('shortcutText3').then((res) => {
    shortcutText3.value = res.shortcutText3;
  });
  browser.storage.sync.get('shortcutLink3').then((res) => {
    shortcutLink3.value = res.shortcutLink3;
  });
  browser.storage.sync.get('shortcutText4').then((res) => {
    shortcutText4.value = res.shortcutText4;
  });
  browser.storage.sync.get('shortcutLink4').then((res) => {
    shortcutLink4.value = res.shortcutLink4;
  });
  browser.storage.sync.get('shortcutText5').then((res) => {
    shortcutText5.value = res.shortcutText5;
  });
  browser.storage.sync.get('shortcutLink5').then((res) => {
    shortcutLink5.value = res.shortcutLink5;
  });
  browser.storage.sync.get('shortcutText6').then((res) => {
    shortcutText6.value = res.shortcutText6;
  });
  browser.storage.sync.get('shortcutLink6').then((res) => {
    shortcutLink6.value = res.shortcutLink6;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  restoreOptions();
});

// Functions to see if all items of a collection category has been checked
function selectAllCD() {
}

function selectAllDVD()

// Listener for Set Default Options Button
document.getElementById("setDefault").addEventListener('click', setDefaultOptions);

// Option update listeners
document.getElementById("skin").addEventListener('change', function() {
  browser.storage.sync.set({skin: document.getElementById("skin").value}).then((res) => {
    browser.runtime.sendMessage({key: "updateExtensionIcon"});
  });
});
document.getElementById("patronMsgSwitch").addEventListener('click', function() {
   browser.storage.sync.set({patronMsg: document.getElementById("patronMsg").checked});
});
document.getElementById("validAddrSwitch").addEventListener('click', function() {
   browser.storage.sync.set({validAddr: document.getElementById("validAddr").checked});
});
document.getElementById("autoBarcodeSwitch").addEventListener('click', function() {
   browser.storage.sync.set({autoBarcode: document.getElementById("autoBarcode").checked});
});
document.getElementById("lookupPSTATSwitch").addEventListener('click', function() {
   browser.storage.sync.set({lookupPSTAT: document.getElementById("lookupPSTAT").checked});
});
document.getElementById("digestOnlySwitch").addEventListener('click', function() {
   browser.storage.sync.set({digestOnly: document.getElementById("digestOnly").checked});
});
document.getElementById("dueDateToggleSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dueDateToggle: document.getElementById("dueDateToggle").checked});
});
document.getElementById("middleInitialsSwitch").addEventListener('click', function() {
   browser.storage.sync.set({middleInitials: document.getElementById("middleInitials").checked});
});
document.getElementById("updateAccountTypeSwitch").addEventListener('click', function() {
   browser.storage.sync.set({updateAccountType: document.getElementById("updateAccountType").checked});
});
document.getElementById("cdamsSwitch").addEventListener('click', function() {
   browser.storage.sync.set({cdams: document.getElementById("cdams").checked});
});
document.getElementById("cdamsidSwitch").addEventListener('click', function() {
   browser.storage.sync.set({cdamsid: document.getElementById("cdamsid").checked});
});
document.getElementById("cdjmsSwitch").addEventListener('click', function() {
   browser.storage.sync.set({cdjms: document.getElementById("cdjms").checked});
});
document.getElementById("cdymsSwitch").addEventListener('click', function() {
   browser.storage.sync.set({cdyms: document.getElementById("cdyms").checked});
});
document.getElementById("dbrafeSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dbrafe: document.getElementById("dbrafe").checked});
});
document.getElementById("dbraffSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dbraff: document.getElementById("dbraff").checked});
});
document.getElementById("dbraidSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dbraid: document.getElementById("dbraid").checked});
});
document.getElementById("dbranfSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dbranf: document.getElementById("dbranf").checked});
});
document.getElementById("dbrarnSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dbrarn: document.getElementById("dbrarn").checked});
});
document.getElementById("dbratvSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dbratv: document.getElementById("dbratv").checked});
});
document.getElementById("dbrjSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dbrj: document.getElementById("dbrj").checked});
});
document.getElementById("dvdafeSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdafe: document.getElementById("dvdafe").checked});
});
document.getElementById("dvdaffSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdaff: document.getElementById("dvdaff").checked});
});
document.getElementById("dvdaidSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdaid: document.getElementById("dvdaid").checked});
});
document.getElementById("dvdanfSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdanf: document.getElementById("dvdanf").checked});
});
document.getElementById("dvdarnSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdarn: document.getElementById("dvdarn").checked});
});
document.getElementById("dvdatvSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdatv: document.getElementById("dvdatv").checked});
});
document.getElementById("dvdawlSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdawl: document.getElementById("dvdawl").checked});
});
document.getElementById("dvdjfeSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdjfe: document.getElementById("dvdjfe").checked});
});
document.getElementById("dvdjhlSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdjhl: document.getElementById("dvdjhl").checked});
});
document.getElementById("dvdjnfSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdjnf: document.getElementById("dvdjnf").checked});
});
document.getElementById("dvdjwlSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdjwl: document.getElementById("dvdjwl").checked});
});
document.getElementById("dvdyfeSwitch").addEventListener('click', function() {
   browser.storage.sync.set({dvdyfe: document.getElementById("dvdyfe").checked});
});
document.getElementById("vgaSwitch").addEventListener('click', function() {
   browser.storage.sync.set({vga: document.getElementById("vga").checked});
});
document.getElementById("vgjSwitch").addEventListener('click', function() {
   browser.storage.sync.set({vgj: document.getElementById("vgj").checked});
});
document.getElementById("vgySwitch").addEventListener('click', function() {
   browser.storage.sync.set({vgy: document.getElementById("vgy").checked});
});
document.getElementById("soaSwitch").addEventListener('click', function() {
   browser.storage.sync.set({soa: document.getElementById("soa").checked});
});
document.getElementById("soawlSwitch").addEventListener('click', function() {
   browser.storage.sync.set({soawl: document.getElementById("soawl").checked});
});
document.getElementById("sojSwitch").addEventListener('click', function() {
   browser.storage.sync.set({soj: document.getElementById("soj").checked});
});
document.getElementById("receiptFont").addEventListener('change', function() {
   browser.storage.sync.set({receiptFont: document.getElementById("receiptFont").value});
});
document.getElementById("sundayDropboxSwitch").addEventListener('click', function() {
   browser.storage.sync.set({sundayDropbox: document.getElementById("sundayDropbox").checked});
});
document.getElementById("shortcutText1").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutText1: document.getElementById("shortcutText1").value});
});
document.getElementById("shortcutLink1").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutLink1: document.getElementById("shortcutLink1").value});
});
document.getElementById("shortcutText2").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutText2: document.getElementById("shortcutText2").value});
});
document.getElementById("shortcutLink2").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutLink2: document.getElementById("shortcutLink2").value});
});
document.getElementById("shortcutText3").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutText3: document.getElementById("shortcutText3").value});
});
document.getElementById("shortcutLink3").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutLink3: document.getElementById("shortcutLink3").value});
});
document.getElementById("shortcutText4").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutText4: document.getElementById("shortcutText4").value});
});
document.getElementById("shortcutLink4").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutLink4: document.getElementById("shortcutLink4").value});
});
document.getElementById("shortcutText5").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutText5: document.getElementById("shortcutText5").value});
});
document.getElementById("shortcutLink5").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutLink5: document.getElementById("shortcutLink5").value});
});
document.getElementById("shortcutText6").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutText6: document.getElementById("shortcutText6").value});
});
document.getElementById("shortcutLink6").addEventListener('blur', function() {
  browser.storage.sync.set({shortcutLink6: document.getElementById("shortcutLink6").value});
});