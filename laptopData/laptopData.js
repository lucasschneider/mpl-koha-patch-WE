//Setting the current date
let getCurrYYYYMMDD = function() {
  var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

//Setting the current time
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

    let value = hr < 9 ? '0' + hr + ':' : hr + ':';
    value += min < 9 ? '0' + min + ':' : min + ':';
    value += sec < 9 ? '0' + sec + '.' + milliseconds : sec + '.' + milliseconds;

    return value;
  }
  return undefined;
}

browser.runtime.sendMessage({"key": "getAllLaptopData"}).then(res => {
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

    let tr = document.createElement('tr');
    this.htmlTR = tr;

    let issueDate = document.createElement('td');
    let patronBC = document.createElement('td');
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
    patronBC.textContent = this.patronBarcode;
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
    let csv = "Issue Date/Time, Patron Barcode, Laptop/iPad, Power Supply, Mouse, Headphones, DVD Player, Notes, Return Date/Time, Length of Use\r\n";

    //Iterating through data table and assigning values separted by commas
    for (let issue of data) {
      csv += issue.issueDate + ",";
      csv += issue.patronBarcode + ",";
      csv += issue.itemID + ",";
      csv += /^39078\d{9}$/.test(issue.powerSupply) + ",";
      csv += /^39078\d{9}$/.test(issue.mouse) + ",";
      csv += /^39078\d{9}$/.test(issue.headphones) + ",";
      csv += /^39078\d{9}$/.test(issue.dvdPlayer) + ",";
      csv += (issue.notes || '') + ',';
      csv += (issue.returnDate || '') + ",";
      csv += getHrMinSec((issue.returnDate || Date.now()) - issue.issueDate) + '\r\n';
    }

    return encodeURIComponent(csv);
  }

  let download = document.getElementById('downloadData');
  let noData = document.getElementById('noData');
  let table = document.getElementById('laptopData');
  let tableBody = document.getElementById('laptopDataBody');
  let data = [];
  let search = document.getElementById('searchBar');

  /* search.addEventListener('keyup', e => {
    for (let item of data) {
      if (item.patronBarcode.includes(search.value)) {
        table.style.display = 'none';
      }
    }
  }); */

  if (res.length === 0) {
    download.style.display = 'none';
    table.style.display = 'none';
    noData.style.display = 'block';
  } else {
    for (let i = res.length-1; i >= 0; i--) {
      data.push(new LaptopIssue(res[i]));
      tableBody.appendChild(data[data.length-1].htmlTR);
    }

    download.download = "laptop-data-" + getCurrYYYYMMDD() + ".csv";
    download.href = "data:text/csv;charset=utf-8," + getCSV();
  }
});
