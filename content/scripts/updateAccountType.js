(function () {"use strict"; /*jslint browser:true regexp: true indent: 2 devel: true plusplus: true*/
  function calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime(),
      ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  var birthdayField = document.getElementById('dateofbirth'),
    birthday = null,
    patronCategory = document.getElementsByName('categorycode')[0],
    saveButtonWrapper = document.getElementsByClassName('action')[0],
    saveButton = document.getElementsByName('save')[0],
    updateButton = document.createElement('input');

  updateButton.id = "updateAndSave";
  updateButton.type = "button";
  updateButton.value = "Save & update patron type";
  updateButton.style = "cursor:pointer; margin-right: 20px;";
  updateButton.addEventListener('click', function () {
    if (patronCategory.value === 'JU') {
      patronCategory.value = 'AD';
    } else if (patronCategory.value === 'LUJ') {
      patronCategory.value = 'LU';
    }
    saveButton.click();
  });

  if (birthdayField && birthdayField.value && patronCategory && (patronCategory.value === 'LUJ' || patronCategory.value === 'JU')) {
    birthday = new Date(birthdayField.value);
    if (saveButtonWrapper && calculateAge(birthday) >= 16) {
      saveButtonWrapper.insertBefore(updateButton, saveButtonWrapper.children[0]);
    }
  }
  }()); //end use strict
