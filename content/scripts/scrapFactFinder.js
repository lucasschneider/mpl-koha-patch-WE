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
             } else {
               sendFailMsg();
             }
         }, 300);
       } else {
         sendFailMsg();
      }
     }, 300);
   } else {
     sendFailMsg();
  }
}, 1000);