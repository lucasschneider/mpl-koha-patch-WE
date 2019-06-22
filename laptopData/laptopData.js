/**
 * @returns {string} The current date in the format YYYY-MM-DD
 */
let getYYYYMMDD = function(d) {
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  let year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

/**
 * @param {number} milliseconds
 * @returns {string} Time in the format HH:MM:SS.mmm
 */
let getHrMinSec = function(milliseconds) {
  if (typeof milliseconds === 'number' && milliseconds >= 0) {
    let hr = 0;
    if (milliseconds >= 3600000) {
      hr = Math.floor(milliseconds / 3600000);
      milliseconds = milliseconds - (hr * 3600000);
    }
    let min = 0;
    if (milliseconds >= 60000) {
      min = Math.floor(milliseconds / 60000);
      milliseconds = milliseconds - (min * 60000);
    }
    let sec = 0;
    if (milliseconds >= 1000) {
      sec = Math.floor(milliseconds / 1000);
      milliseconds = milliseconds - (sec * 1000);
    }

    return hr + ' hr ' + min + ' min ' + sec + ' sec';
  }
  return '0';
}

browser.runtime.sendMessage({"key": "getAllLaptopData"}).then(res => {
  /**
   * Represents an issued laptop
   * @constructor
   * @param {object} obj - An object with laptop data
   */
  let LaptopIssue = function(obj) {
    this.primaryKey = obj.primaryKey;
    this.issueDate = obj.issueDate;
    this.patronBarcode = obj.patronBarcode;
    this.itemID = obj.itemID;
    this.notes = obj.notes;
    this.powerSupply = obj.powersupply;
    this.mouse = obj.mouse;
    this.headphones = obj.headphones;
    this.dvdPlayer = obj.dvdplayer;
    this.returnDate = obj.returnDate;
    this.visible = true;

    let tr = document.createElement('tr');
    this.htmlTR = tr;

    let issueDate = document.createElement('td');
    let patronBC = document.createElement('td');
    let patronBCLink = document.createElement('a');
    let itemID = document.createElement('td');
    let powerTD = document.createElement('td');
    let mouseTD = document.createElement('td');
    let headphonesTD = document.createElement('td');
    let dvdTD = document.createElement('td');
    let power = document.createElement('input');
    let mouse = document.createElement('input');
    let headphones = document.createElement('input');
    let dvd = document.createElement('input');
    let noteTD = document.createElement('td');
    let note = document.createElement('span');
    let addNote = document.createElement('a');
    let editDelWrapper = document.createElement('div');
    let editNote = document.createElement('a');
    let editDelSpacer = document.createElement('span');
    let delNote = document.createElement('a');
    let returnDate = document.createElement('td');
    let useLen = document.createElement('td');

    issueDate.textContent = this.issueDate.toLocaleString();
    patronBC.appendChild(patronBCLink);
    patronBCLink.target = "_blank";
    patronBCLink.href = "https://scls-staff.kohalibrary.com/cgi-bin/koha/circ/circulation.pl?findborrower=" + this.patronBarcode;
    patronBCLink.textContent = this.patronBarcode;
    itemID.textContent = this.itemID;
    note.id = "noteData";
    note.textContent = this.notes;
    power.checked = /^39078\d{9}$/.test(this.powerSupply);
    mouse.checked = /^39078\d{9}$/.test(this.mouse);
    headphones.checked = /^39078\d{9}$/.test(this.headphones);
    dvd.checked = /^39078\d{9}$/.test(this.dvdPlayer);
    if (this.returnDate) {
      returnDate.textContent = this.returnDate.toLocaleString();
    }
    useLen.textContent = getHrMinSec((obj.returnDate || Date.now()) - obj.issueDate);

    function preventDefault(e){e.preventDefault()};

    powerTD.classList.add('center');
    mouseTD.classList.add('center');
    headphonesTD.classList.add('center');
    dvdTD.classList.add('center');
    power.type = "checkbox";
    power.addEventListener('click', preventDefault);
    mouse.type = "checkbox";
    mouse.addEventListener('click', preventDefault);
    headphones.type = "checkbox";
    headphones.addEventListener('click', preventDefault);
    dvd.type = "checkbox";
    dvd.addEventListener('click', preventDefault);
    powerTD.appendChild(power);
    mouseTD.appendChild(mouse);
    headphonesTD.appendChild(headphones);
    dvdTD.appendChild(dvd);
    noteTD.appendChild(note);

    addNote.textContent = 'add note';
    addNote.href = '#';
    addNote.addEventListener('click', addEditNote);
    editNote.textContent = 'edit';
    editNote.href = '#';
    editNote.addEventListener('click', addEditNote);
    editDelSpacer.textContent = ' | ';
    delNote.textContent = 'delete';
    delNote.href = '#';

    //'Add note' field
    function addEditNote(e) {
      e.preventDefault();
      let n = prompt('Add a note:', note.textContent || '');
      if (n) {
        browser.runtime.sendMessage({
          "key": "addLaptopNote",
          "primaryKey": obj.primaryKey,
          "note": n
        }).then(resolve => {
          addNote.style.display = 'none';
          editDelWrapper.style.display = 'block';
          note.textContent = n;
        }, reject => {
          console.error(reject.message);
        });
      }
    };

    //'Delete note' field
    delNote.addEventListener('click', function(e) {
      e.preventDefault();
      let conf = confirm('Are you sure you want to delete the note "' + note.textContent + '"?');

      if (conf) {
        browser.runtime.sendMessage({
          "key": "addLaptopNote",
          "primaryKey": obj.primaryKey,
          "note": null
        }).then(resolve => {
          addNote.style.display = 'block';
          editDelWrapper.style.display = 'none';
          note.textContent = '';
        }, reject => {
          console.error(reject.message);
        });
      }
    });

    editDelWrapper.appendChild(editNote);
    editDelWrapper.appendChild(editDelSpacer);
    editDelWrapper.appendChild(delNote);

    if (obj.issueDate.toLocaleDateString() === (new Date()).toLocaleDateString()) {
      noteTD.appendChild(addNote);
      noteTD.appendChild(editDelWrapper);
      if (note.textContent === '') {
        addNote.style.display = 'block';
        editDelWrapper.style.display = 'none';
      } else {
        addNote.style.display = 'none';
        editDelWrapper.style.display = 'block';
      }
    }

    tr.appendChild(issueDate);
    tr.appendChild(patronBC);
    tr.appendChild(itemID);
    tr.appendChild(powerTD);
    tr.appendChild(mouseTD);
    tr.appendChild(headphonesTD);
    tr.appendChild(dvdTD);
    tr.appendChild(noteTD);
    tr.appendChild(returnDate);
    tr.appendChild(useLen);
  };

  //Creating the CSV file and Excel Spreadsheet
  function getCSV() {
    let csv = "Issue Date, Issue Time, Patron Barcode, Laptop/iPad, Power Supply, Mouse, Headphones, DVD Player, Notes, Return Date, Return Time, Length of Use (hrs)\r\n";

    //Iterating through data array and assigning values separted by commas
    for (let issue of data) {
      if (issue.visible) {
        csv += issue.issueDate.toLocaleString() + ",";
        csv += issue.patronBarcode + ",";
        csv += issue.itemID + ",";
        csv += /^39078\d{9}$/.test(issue.powerSupply) + ",";
        csv += /^39078\d{9}$/.test(issue.mouse) + ",";
        csv += /^39078\d{9}$/.test(issue.headphones) + ",";
        csv += /^39078\d{9}$/.test(issue.dvdPlayer) + ",";
        csv += (issue.notes || '') + ',';
        csv += issue.returnDate ? issue.returnDate.toLocaleString() + ',' : ',,';
        csv += ((issue.returnDate || Date.now()) - issue.issueDate)/3600000 + '\r\n';
      }
    }

    return encodeURIComponent(csv);
  }

  let download = document.getElementById('downloadData');
  let backupDB = document.getElementById('fullBackup');
  let noData = document.getElementById('noData');
  let table = document.getElementById('laptopData');
  let tableBody = document.getElementById('laptopDataBody');
  let data = [];
  let search = document.getElementById('searchBar');
  let found = false;
  let startDate = document.getElementById('startDate');
  let endDate = document.getElementById('endDate');

  let totalTimeUsed = document.getElementById('totalTime');
  let uniqCKO = document.getElementById('uniqCKO');
  let totalCKO = document.getElementById('totalCKO');
  let averageUse = document.getElementById('avgUse');

  function filterChange() {
    let totalTime = 0;
    let numVisible = 0;
    let numOutstanding = 0;

    function isOnOrAfterStartDate(sDate, issueDate) {
      return (sDate.getFullYear() === issueDate.getFullYear() &&
          sDate.getMonth() === issueDate.getMonth() &&
          sDate.getDate() <= issueDate.getDate()) ||
        (sDate.getFullYear() === issueDate.getFullYear() &&
          sDate.getMonth() < issueDate.getMonth()) ||
        (sDate.getFullYear() < issueDate.getFullYear());
    };

    function isOnOrBeforeEndDate(eDate, issueDate) {
      return (eDate.getFullYear() === issueDate.getFullYear() &&
          eDate.getMonth() === issueDate.getMonth() &&
          eDate.getDate() >= issueDate.getDate()) ||
        (eDate.getFullYear() === issueDate.getFullYear() &&
          eDate.getMonth() > issueDate.getMonth()) ||
        (eDate.getFullYear() > issueDate.getFullYear());
    };

    tableBody.innerHTML = '';

    let uniqPatrons = []; // Array of unique patron barcodess

    for (let item of data) {
      // Check for date filter
      if (startDate.value != '' || endDate.value != '') {
        let sDate = new Date(startDate.value + 'T00:00:00');
        let eDate = new Date(endDate.value + 'T00:00:00');

        if (startDate.value != '') {
          if (isOnOrAfterStartDate(sDate, item.issueDate)) {
            if (endDate.value != '') {
              // Start and end date
              if (isOnOrBeforeEndDate(eDate, item.issueDate)) {
                item.visible = true;
              } else {
                item.visible = false;
              }
            } else {
              item.visible = true;
            }
          } else {
            item.visible = false;
          }
        } else if (endDate.value != '') {
          // Only end date
          if (isOnOrBeforeEndDate(eDate, item.issueDate)) {
            item.visible = true;
          } else {
            item.visible = false;
          }
        } else {
          item.visible = true;
        }
      } else {
        item.visible = true;
      }

      if (item.visible) { // Only continue checking filters if the previous one passed
        // Check for search filter
        for (let td of item.htmlTR.children) {
          if (td.textContent.toLowerCase().includes(search.value.toLowerCase())) {
            found = true;
            break;
          }
        }

        if (found) {
          item.visible = true;
          found = false;
        } else {
          item.visible = false;
        }
      }

      // Append item if it matches all conditions
      if (item.visible) {
        if (!uniqPatrons.includes(item.patronBarcode)) {
          uniqPatrons.push(item.patronBarcode);
        }

        if (item.returnDate) {
          numVisible++;
          totalTime += item.returnDate - item.issueDate;
        } else {
          numOutstanding++;
        }

        tableBody.appendChild(item.htmlTR);
      }
    }

    // Set unique/total issues stat
    totalCKO.textContent = numVisible + numOutstanding;
    uniqCKO.textContent = uniqPatrons.length;

    // Set total time used
    totalTimeUsed.textContent = getHrMinSec(totalTime);

    // Set average use stat
    averageUse.textContent = getHrMinSec(Math.floor(totalTime / numVisible)) + " hrs/cko";
  }

  search.addEventListener('keyup', filterChange)
  startDate.addEventListener('change', filterChange);
  endDate.addEventListener('change', filterChange);

  if (res.length === 0) {
    download.style.display = 'none';
    table.style.display = 'none';
    noData.style.display = 'block';
  } else {
    for (let i = res.length-1; i >= 0; i--) {
      data.push(new LaptopIssue(res[i]));
      tableBody.appendChild(data[data.length-1].htmlTR);
    }
  }

  const today = new Date();

  const setRangeWeek = document.getElementById('setRangeWeek');
  const setRangeMonth = document.getElementById('setRangeMonth');
  const setRangeYear = document.getElementById('setRangeYear');

  setRangeWeek.addEventListener('click', e => {
    const firstOfWeek = new Date(today.getFullYear(),today.getMonth(),today.getDate()-today.getDay());
    const lastOfWeek = new Date(firstOfWeek.getFullYear(),firstOfWeek.getMonth(),firstOfWeek.getDate()+6);

    e.preventDefault();

    startDate.value = getYYYYMMDD(firstOfWeek);
    endDate.value = getYYYYMMDD(lastOfWeek);
    filterChange();
  });

  setRangeMonth.addEventListener('click', e => {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    e.preventDefault();

    startDate.value = getYYYYMMDD(firstOfMonth);
    endDate.value = getYYYYMMDD(lastOfMonth);
    filterChange();
  });

  setRangeYear.addEventListener('click', e => {
    e.preventDefault();

    startDate.value = today.getFullYear() + '-01-01';
    endDate.value = today.getFullYear() + '-12-31';
    filterChange();
  });

  download.href = "#";
  backupDB.href = "#";
  backupDB.addEventListener('click', function(e) {
    e.preventDefault();
    browser.runtime.sendMessage({'key': 'backupLaptopDB'}).then(res => {
      const dlNode = document.createElement('a');
      dlNode.download = 'laptop-database-backup-' + getYYYYMMDD(today) + '.txt';
      dlNode.href = "data:application/json;charset=utf-8," + res;
      document.body.appendChild(dlNode);
      dlNode.click();
      dlNode.remove();
    });
  });

  if (startDate.value === '') startDate.value = getYYYYMMDD(today);
  if (endDate.value === '') endDate.value = getYYYYMMDD(today);
  filterChange();

  download.addEventListener('click', function(e) {
    if (startDate.value === endDate.value) {
      download.download = "laptop-data-" + getYYYYMMDD(new Date(startDate.value+'T00:00:00')) + ".csv";
    } else {
      download.download = "laptop-data-" + getYYYYMMDD(new Date(startDate.value+'T00:00:00')) +
          "-to-" + getYYYYMMDD(new Date(endDate.value+'T00:00:00')) + ".csv";
    }
    download.href = "data:text/csv;charset=utf-8," + getCSV();
  });
});
