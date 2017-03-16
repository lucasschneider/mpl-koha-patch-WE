(function () {"use strict"; /*jslint browser:true regexp: true indent: 2 devel: true plusplus: true*/
  /*global self*/
  
  var Address = function (addrRegEx, place) {
    // addrRegEx formated to be inserted at a regex literal
    this.addrRegEx = addrRegEx;
    // The place/organization of the restricted address
    this.place = place;
    // The type of restricted address {unacceptable,restricted}
  };

  /*** CHECK FOR COLLEGE DORM ADDRESSES
     AND SET EXP DATE IF NECESSARY ***/
  function fillDormExp() {
    var addr = document.getElementById('address'),
      addr2 = document.getElementById('address2'),
      city = document.getElementById('city'),
      expiry = document.getElementById('dateexpiry'),
      bn = document.getElementById('borrowernotes'),
      dormAddr = [
        new Address("625 babcock", "Slichter Hall"),
        new Address("625 elm", "Cole Hall"),
        new Address("635 elm", "Sullivan Hall"),
        new Address("640 elm", "DeJope Hall"),
        new Address("650 elm", "Bradley Hall"),
        new Address("1635 kronshage", "Leopold Hall"),
        new Address("1650 kronshage", "Kronshage Hall"),
        new Address("420 n(orth)? park", "Chadbourne Residential College"),
        new Address("35 n(orth)? park", "Smith Hall"),
        new Address("1200 observatory", "Elizabeth Waters Hall"),
        new Address("1510 tripp", "Tripp Hall"),
        new Address("1520 tripp", "Adams Hall"),
        new Address("970 university", "Barnard Hall"),
        new Address("835 w(est)? dayton", "Ogg Hall"),
        new Address("9(1(7|9)|21) w(est)? dayton", "Merit House"),
        new Address("615 w(est)? johnson", "Witte Hall"),
        new Address("821 w(est)? johnson", "Sellery Hall"),
        new Address("917 w(est)? johnson", "Susan B. Davis"),
        new Address("1950 willow", "Phillips Hall")
      ],
      addrRegExFirst = /[ ]*/,
      addrRegExLast = /.*/,
      fullAddrRegEx = new RegExp(),
      addressVal,
      date = new Date(),
      year = date.getUTCFullYear();

    if (zip !== null && addr !== null && expiry !== null) {
      addressVal = addr2 !== null ? addr.value + " " + addr2.value : addr.value;
      if (/[ ]*mad(ison)?(,? wi)?/i.test(city.value)) {
        for (var i = 0; i < dormAddr.length; i++) {
          fullAddrRegEx = new RegExp(addrRegExFirst.source + dormAddr[i].addrRegEx + addrRegExLast.source, "i");
          if (fullAddrRegEx.test(addressVal)) {
            switch (parseInt(date.getUTCMonth(), 10)) {
            case 0:
            case 1:
            case 2:
            case 3:
              year = date.getUTCFullYear();
              break;
            case 4:
              if (parseInt(date.getUTCDate(), 10) < 15) {
                year = date.getUTCFullYear();
              } else {
				  year = (parseInt(date.getUTCFullYear(), 10) + 1).toString();
			  }
              break;
            default:
              year = (parseInt(date.getUTCFullYear(), 10) + 1).toString();
              break;
            }
            expiry.value = "05/15/" + year;

            var noteTest = new RegExp("Special expiration date of 05/15/" + year + " set due to residence at " + dormAddr[i].place + ", a university dorm");
            if (bn !== null && !noteTest.test(addrRegExFirst.source + bn.value + addrRegExLast.source)) {
	            if (bn.value !== "") {
	              bn.value += "\n\n";
              }
	            bn.value += "Special expiration date of 05/15/" + year + " set due to residence at " + dormAddr[i].place + ", a university dorm. Patron must verbally update address before account renewal (proof of address not necessary).";
              alert("Special expiration date of 05/15/" + year + " set due to residence at " + dormAddr[i].place + ", a university dorm. Patron must verbally update address before account renewal (proof of address not necessary).")
	          }
	          break;
          }
        }
      }
    }
  }

  var addr = document.getElementById('address'),
    city = document.getElementById('city'),
    zip = document.getElementById('zipcode');
  if (addr !== null) {
    addr.addEventListener('blur', fillDormExp);
  }
  if (city !== null) {
    city.addEventListener('blur', fillDormExp);
  }
  }()); //end use strict