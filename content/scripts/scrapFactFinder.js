function sendFailMsg() {
}

setTimeout(() => {
   var geographies = document.getElementById('geo-overlay-btn');
   if (geographies) {
     geographies.click();
     setTimeout(() => {
       var addrTab = document.getElementById('geoaddress_tab');
       if (addrTab) {
         addrTab.click();
         setTimeout(() => {
           var street = document.getElementById('geostreet'),
             city = document.getElementById('geocity'),
             state = document.getElementById('geostateAddress'),
             submit = document.getElementById('as_submit'),
             uri = location.search.substr(1).split('&'),
             queryAddr,
             queryCity;
             
             if (street && city && state && submit && uri.length == 2) {
               queryAddr = decodeURIComponent(uri[0].substr(5));
               queryCity = decodeURIComponent(uri[1].substr(5));
               
               street.value = queryAddr;
               city.value = queryCity;
               state.value = "Wisconsin";
               submit.click();
               
               // Scrap relevant data after the page probably had enough time to load
               setTimeout(() => {
                 var tableRows = document.querySelectorAll('#geoaddrresulttable table tbody tr'),
                   matchAddrParts,
                   matchAddr,
                   county,
                   countySub,
                   censusTract,
                   zip;
                 
                 if (tableRows.length > 0) {
                   matchAddrParts = document.querySelector('#addressSearch_msg .bd b');
                   if (matchAddrParts) {
                     matchAddrParts = matchAddrParts.textContent.split(", ");
                     if (matchAddrParts.length > 1) {
                       matchAddr = matchAddrParts[0].toUpperCase();
                     }
                   }

                   for (var i = 0; i < tableRows.length; i++) {
                     if (tableRows[i].children.length > 1) {
                       if (tableRows[i].children[1].textContent.trim() == "County") {
                         var countyParts;
                         county = tableRows[i].children[0].textContent.trim();
                         if (county) countyParts = county.split(', ')[0].split(' ');
                         for (var j = 0; j < countyParts.length - 1; j++) {
                           if (j == 0) {
                             county = countyParts[j];
                           } else {
                             county += " " + countyParts[j];
                           }
                         }
                       } else if (tableRows[i].children[1].textContent.trim() == "County Subdivision") {
                         countySub = tableRows[i].children[0].textContent.trim();
                         if (countySub) countySub = countySub.split(', ')[0];
                       } else if (tableRows[i].children[1].textContent.trim() == "Census Tract") {
                         censusTract = tableRows[i].children[0].textContent.trim();
                         if (censusTract) censusTract = /[0-9]+\.[0-9]+|[0-9]+/.exec(censusTract);
                         if (censusTract) censusTract = censusTract[0];
                       } else if (tableRows[i].children[1].textContent.trim() == "5-Digit ZIP Code") {
                         zip = tableRows[i].children[0].textContent.trim();
                         if (zip) zip = /[0-9]{5}/.exec(zip);
                         if (zip) zip = zip[0];
                       }
                     }
                   }

                   browser.runtime.sendMessage({
                     "key": "returnCensusData",
                     "matchAddr": matchAddr,
                     "county": county,
                     "countySub": countySub,
                     "censusTract": censusTract,
                     "zip": zip
                   });
                 } else {
                   sendFailMsg();    
                 }
               }, 7500);
             } else {
               sendFailMsg();
             }
         }, 500);
       } else {
         sendFailMsg();
      }
     }, 300);
   } else {
     sendFailMsg();
  }
}, 1000);
