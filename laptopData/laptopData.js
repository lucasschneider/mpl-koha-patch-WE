browser.runtime.sendMessage({"key": "getAllLaptopData"}).then(res => {
  let tableBody = document.getElementById('laptopDataBody');

  for (let i = res.length-1; i >= 0; i--) {
    let tr = document.createElement('tr');
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
    let notes = document.createElement('td');
    let returnDate = document.createElement('td');

    function preventDefault(e){e.preventDefault()};

    if (i % 2 === 1) {
      tr.style.background = "#ebf5fc";
    }

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
    issueDate.textContent = res[i].issueDate.toLocaleString();
    patronBC.textContent = res[i].patronBarcode;
    itemID.textContent = res[i].itemID;
    notes.textContent = res[i].notes;
    power.checked = res[i].powersupply;
    mouse.checked = res[i].mouse;
    headphones.checked = res[i].headphones;
    dvd.checked = res[i].dvdplayer;
    if (res[i].returnDate) {
      returnDate.textContent = res[i].returnDate.toLocaleString();
    }

    powerTD.appendChild(power);
    mouseTD.appendChild(mouse);
    headphonesTD.appendChild(headphones);
    dvdTD.appendChild(dvd);

    tr.appendChild(issueDate);
    tr.appendChild(patronBC);
    tr.appendChild(itemID);
    tr.appendChild(powerTD);
    tr.appendChild(mouseTD);
    tr.appendChild(headphonesTD);
    tr.appendChild(dvdTD);
    tr.appendChild(notes);
    tr.appendChild(returnDate);

    tableBody.appendChild(tr);
  }
});
