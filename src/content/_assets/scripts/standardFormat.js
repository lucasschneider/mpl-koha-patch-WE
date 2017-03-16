(function () {"use strict"; /*jslint browser:true regexp: true indent: 2 devel: true plusplus: true*/
  /*** CORRECT TEXT CASE ***/
  var inputs = document.querySelectorAll("input[type=text]"),
    i;
  if (inputs !== null) {
    for (i = 3; i < inputs.length; i++) {
      if (/email|emailpro|B_email/.test(inputs[i].id)) {
        inputs[i].addEventListener('blur', function () {this.value = this.value.toLowerCase().trim().replace(/\s{2,}/g, ' '); });
      } else {
        inputs[i].addEventListener('blur', function () {
          this.value = this.value.toUpperCase().replace(/\s{2,}/g, ' ');
          if (/^[ 	]+$/.test(this.value)) {
            this.value = ' ';
          } else {
            this.value = this.value.trim();
          }
        });
      }
    }
  }

  /*** "APT " -> "#" ***/
  var address = document.getElementById('address'),
    bAddress = document.getElementById('B_address'),
    altAddress = document.getElementById('altcontactaddress1');

  function aptToNum() {
    this.value = this.value.replace(/( apt\.? #? ?| unit #? ?| # )/i, " #").replace(/\./g, '');
  }

  if (address) {
    address.addEventListener('blur', aptToNum);
  }

  if (bAddress) {
    bAddress.addEventListener('blur', aptToNum);
  }

  if (altAddress) {
    altAddress.addEventListener('blur', aptToNum);
  }

  /*** CORRECT CITY FORMAT ***/
  var city = document.getElementById('city'),
    city2 = document.getElementById('B_city'),
    city3 = document.getElementById('altcontactaddress3');

  function parseMadisonWI() {
    if (/madison(,? wi(sconsin)?)?|mad/i.test(this.value)) {
      this.value = "MADISON WI";
    }
    this.value = this.value.replace(/,/, '');
  }
    
  if (city) {
    city.addEventListener('blur', parseMadisonWI);
  }

  if (city2) {
    city2.addEventListener('blur', parseMadisonWI);
  }

  if (city3) {
    city3.addEventListener('blur', parseMadisonWI);
  }

  /*** DISABLE RARELY USED FIELDS ***/
  var unusedFields = ['streetnumber',
    'address2',
    'select_city',
    'country',
    'mobile',
    'emailpro', // Secondary email address
    'fax',
    'B_country',
    'B_address2',
    'altcontactcountry',
    'altcontactaddress2',
    'sort2',
    'email6', // Item checkout notification
    'email7', // Hold cancelled notification
    'email9', // Item lost notification
    'email5', // Item check-in notification
    // The following are the inputs for old dynix data
    'patron_attr_1',
    'patron_attr_2',
    'patron_attr_3',
    'patron_attr_4',
    'patron_attr_5',
    'patron_attr_6',
    'patron_attr_7',
    'patron_attr_8',
    'patron_attr_9',
    'patron_attr_10',
    'patron_attr_11'],
    unused4WebUse = ['phone',
    'phonepro',
    'email',
    'B_address',
    'B_city',
    'B_zipcode',
    'B_phone',
    'B_email',
    'altcontactsurname',
    'altcontactfirstname',
    'altcontactaddress1',
    'altcontactaddress3',
    'altcontactzipcode',
    'altcontactphone'
    ],
    parentElt = document.getElementById('entryform'),
    sibling,
    enableOptsLabel = document.createElement('label'),
    enableOpts = document.createElement('input'),
    enableOptsContainer = document.createElement('div'),
    elt,
    categorycode = document.getElementsByClassName('categorycode'),
    bn = document.getElementById('borrowernotes'),
    zip = document.getElementById('zipcode'),
    sortElts = document.getElementsByName('sort1'),
    usr = document.getElementsByClassName('loggedinusername');

  if (categorycode) categorycode = categorycode[0];
  if (usr) usr = usr[0];
  if (sortElts) sortElts = sortElts[0];
    
  if (parentElt !== null) {
    sibling = parentElt.children[0];

    enableOptsLabel.setAttribute('for', 'enableOpts');
    enableOptsLabel.setAttribute('style', 'display: inline-block; font-weight: bold;');
    enableOptsLabel.textContent = 'Enable rarely used input fields:';

    enableOpts.id = "enableOpts";
    enableOpts.type = 'checkbox';
    enableOpts.checked = 'true';
    enableOpts.setAttribute('style', 'margin-left: 20px; display: inline-block;');
    enableOpts.addEventListener('click', function () {
      var categorycode = document.getElementsByClassName('categorycode');
      if (categorycode) categorycode = categorycode[0];
      if (this.checked) {
        for (i = 0; i < unusedFields.length; i++) {
          elt = document.getElementById(unusedFields[i]);
          if (elt !== null) {
            elt.disabled = false;
            elt.style.backgroundColor = '';
          }
        }
        if (categorycode && categorycode.value === "WEB" && /(mad|hpb|seq|smb|msb|pin|haw|lak|mea)/i.test(usr.textContent.trim())) {
          for (i = 0; i < unused4WebUse.length; i++) {
            elt = document.getElementById(unused4WebUse[i]);
            if (elt !== null) {
              elt.disabled = false;
              elt.style.backgroundColor = '';
            }
          }
        }
      } else {
        for (i = 0; i < unusedFields.length; i++) {
          elt = document.getElementById(unusedFields[i]);
          if (elt !== null) {
            elt.disabled = true;
            elt.style.backgroundColor = '#cecece';
          }
        }
        if (categorycode && categorycode.value === "WEB" && /(mad|hpb|seq|smb|msb|pin|haw|lak|mea)/i.test(usr.textContent.trim())) {
          for (i = 0; i < unused4WebUse.length; i++) {
            elt = document.getElementById(unused4WebUse[i]);
            if (elt !== null) {
              elt.disabled = true;
              elt.style.backgroundColor = '#cecece';
            }
          }
        }
      }
    });

    enableOptsContainer.appendChild(enableOptsLabel);
    enableOptsContainer.appendChild(enableOpts);
    enableOptsContainer.style = "margin-left: 40px;";
    parentElt.insertBefore(enableOptsContainer, sibling);

    // Trigger event : disable fields
    enableOpts.click();
  }
  
  /*** Auto-complete web-use only fields ***/
  if (categorycode) {
    categorycode.addEventListener('change', function () {
      
      if (categorycode.value === "WEB") {
        for (i = 0; i < unused4WebUse.length; i++) {
          elt = document.getElementById(unused4WebUse[i]);
          if (elt !== null) {
            elt.disabled = true;
            elt.style.backgroundColor = '#cecece';
          }
        }
      } else if  (categorycode.value !== "WEB") {
        for (i = 0; i < unused4WebUse.length; i++) {
          elt = document.getElementById(unused4WebUse[i]);
          if (elt !== null) {
            elt.disabled = false;
            elt.style.backgroundColor = '';
          }
        }
      }
    });
    if (categorycode.value === "WEB" && /(mad|hpb|seq|smb|msb|pin|haw|lak|mea)/i.test(usr.textContent.trim())) {
      if (bn && bn.value === "") bn.value = "FOR INTERNET USE ONLY; NO CKO ALLOWED. jfk";
      if (address && address.value === "") address.value = "NA";
      if (city && city.value === "") city.value = "MADISON WI";
      if (zip && zip.value === "") zip.value = "00088";
      if (sortElts) sortElts.value = "D-17.04";
    }
  }

  /*** Control-space to save patron record ***/
  document.addEventListener("keydown", function (e) {
    if (e.keyCode === 32 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
      var updateAndSave = document.getElementById('updateAndSave'),
        saveButton = document.getElementsByClassName('action'); // Wrapping elt.
      if (updateAndSave) {
        updateAndSave.click();
      } else if (saveButton.length > 0) {
        saveButton = saveButton[0].children[0];
        if (saveButton) {
          saveButton.click();
        }
      }
    }
  }, false);

  /*** Escape to exit editing patron record ***/
  document.addEventListener("keydown", function (e) {
    if (e.keyCode === 27) {
      e.preventDefault();
      var cancelButton = document.getElementsByClassName('cancel');
      if (cancelButton.length > 0) {
        cancelButton[0].click();
      }
    }
  }, false);
  }()); //end use strict
