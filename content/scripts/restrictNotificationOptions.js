var email1 = document.getElementById('email1'),
  digest1 = document.getElementById('digest1'),
  email2 = document.getElementById('email2'),
  digest2 = document.getElementById('digest2'),
  messagingPrefs,
  messagingPrefsTable,
  messagingPrefsTbody,
  messagingPrefsRows;

function toggleDueDate(email1, digest1, email2, digest2) {
  var notice = document.getElementsByName('2-DAYS');
  if (notice !== null) notice = notice[0];
  if (email1 !== null && digest1 !== null && email2 !== null && digest2 !== null) {
    if (email1.checked) {
      digest1.checked = true;
      email2.checked = false;
      digest2.checked = false;
      if (notice !== null) {
        notice.children[0].selected = true;
      }
    }
    else {
      digest1.checked = false;
    }
  }
}

function toggleAdvancedNotice(email1, digest1, email2, digest2) {
  var notice = document.getElementsByName('2-DAYS');
  if (notice !== null) notice = notice[0];
  if (email1 !== null && digest1 !== null && email2 !== null && digest2 !== null) {
    if (email2.checked) {
      digest2.checked = true;
      email1.checked = false;
      digest1.checked = false;
      if (notice !== null) {
        notice.children[2].selected = true;
      }
    }
    else {
      digest2.checked = false;
    }
  }
}

if (email1 !== null && digest1 !== null && email2 !== null && digest2 !== null) {
  email1.addEventListener('click', function() {toggleDueDate(email1, digest1, email2, digest2)});
  email2.addEventListener('click', function() {toggleAdvancedNotice(email1, digest1, email2, digest2);});
}
