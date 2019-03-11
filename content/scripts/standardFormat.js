(function(){
  'use strict';
  var inputs = document.querySelectorAll("input[type=text]"),
    address = document.getElementById('address'),
    bAddress = document.getElementById('B_address'),
    altAddress = document.getElementById('altcontactaddress1'),
    city = document.getElementById('city'),
    city2 = document.getElementById('B_city'),
    city3 = document.getElementById('altcontactaddress3'),
    unusedFields = ['streetnumber',
      'address2',
      'select_city',
      'country',
      'mobile',
      'fax',
      'B_country',
      'B_address2',
      'altcontactcountry',
      'altcontactaddress2',
      'sort2',
      'email6', // Item checkout notification
      'email7', // Hold canceled notification
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
      'emailpro', // Secondary email address
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
  if (usr) usr = usr[0].textContent.trim();
  if (sortElts) sortElts = sortElts[0];

  HTMLInputElement.prototype.correctTextCase = function () {
    if (/email|emailpro|B_email/.test(this.id)) {
      this.value = this.value.toLowerCase().trim().replace(/\s{2,}/g, ' ');
    } else {
      this.value = this.value.toUpperCase().replace(/\s{2,}/g, ' ');
      if (/^[ 	]+$/.test(this.value)) {
        this.value = ' ';
      } else {
        this.value = this.value.trim();
      }
    }
  }

  HTMLInputElement.prototype.parseMadisonAddress = function () {
    if (/madison(,? wi(sconsin)?)?|mad/i.test(this.value)) {
      this.value = "MADISON WI";
    }
    this.value = this.value.replace(/,/, '');
  }

  if (/^https?\:\/\/scls-staff\.kohalibrary\.com\/cgi-bin\/koha\/members\/memberentry\.pl.*/.test(location.href)) {
    /*** CORRECT TEXT CASE ***/
    if (inputs) {
      for (var i = 3; i < inputs.length; i++) {
        inputs[i].correctTextCase();
        inputs[i].addEventListener('blur', HTMLInputElement.prototype.correctTextCase);
      }
    }

    /*** Parse Madison Addresses ***/
    if (city) {
      city.parseMadisonAddress();
      city.addEventListener('blur', HTMLInputElement.prototype.parseMadisonAddress);
    }

    if (city2) {
      city2.parseMadisonAddress();
      city2.addEventListener('blur', HTMLInputElement.prototype.parseMadisonAddress);
    }

    if (city3) {
      city3.parseMadisonAddress();
      city3.addEventListener('blur', HTMLInputElement.prototype.parseMadisonAddress);
    }

    /*** DISABLE RARELY USED FIELDS ***/
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
          if (categorycode && categorycode.value === "WEB" && /(mad|hpb|seq|smb|msb|pin|haw|lak|mea)/i.test(usr)) {
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
          if (categorycode && categorycode.value === "WEB" && /(mad|hpb|seq|smb|msb|pin|haw|lak|mea)/i.test(usr)) {
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

    /* Toggle disabled Web-Use only fields */
    if (categorycode && /(mad|hpb|seq|smb|msb|pin|haw|lak|mea)/i.test(usr)) {
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
    }

    /* Add text notification checkbox ONLY for PCPLs */
    if (/(stp|plo|alm|ros)/.test(usr)) {
      var phoneElt = document.getElementById('phone'),
        email = document.getElementById('email'),
        email2 = document.getElementById('emailpro'),
        emailAlt = document.getElementById('B_email'),
        optionUL,
        textNoteWrapper = document.createElement('li'),
        textNoteLabel = document.createElement('label'),
        textNote = document.createElement('input'),
        textNoteText = document.createElement('span');

      if (phoneElt) {
        optionUL = phoneElt.parentElement.parentElement;
      }

      textNoteText.textContent = " Receive text notifications";
      textNote.id = "textNote";
      textNote.type = "checkbox";
      textNoteLabel.textContent = "SMS:";

      textNoteWrapper.appendChild(textNoteLabel);
      textNoteWrapper.appendChild(textNote);
      textNoteWrapper.appendChild(textNoteText);

      optionUL.insertBefore(textNoteWrapper, optionUL.children[1]);

      var receiveTextNotifications = function() {
        // If there is a primary email address and no alternate email address
        if (email && email.value && emailAlt && !emailAlt.value) {
          // and if there is a secondary email address
          if (email2 && email2.value) {
            email2.value = "";
          }

          emailAlt.value = email.value;
          email.value = "";
        }

        if (!/^(T1-)/.test(phoneElt.value)) {
          phoneElt.value = "T1-" + phoneElt.value;
        }
      };

      var removeTextNotifications = function() {
        if (/^(T1-)/.test(phoneElt.value)) {
          phoneElt.value = phoneElt.value.substring(3);
        }

        if (email && !email.value) {
          if (emailAlt && emailAlt.value) {
            email.value = emailAlt.value;
            emailAlt.value = "";
          } else if (email2 && email2.value) {
            email.value = email2.value;
            email2.value = "";
          }
        }
      }

      textNote.addEventListener('click', function() {
        if (this.checked) {
          receiveTextNotifications();
        } else {
          removeTextNotifications();
        }
      });

      if (/^(T1-)/.test(phoneElt.value)) {
        textNote.checked = true;
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
  }
})();
