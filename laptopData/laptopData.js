browser.runtime.sendMessage({"key": "getAllLaptopData"}).then(res => {
  let tableBody = document.getElementById('laptopDataBody');

  for (let row of res) {
    let tr = document.createElement('tr');
    let issueDate = document.createElement('td');
    let patronBC = document.createElement('td');
    let laptopID = document.createElement('td');
    let acc = document.createElement('td');
    let notes = document.createElement('td');
    let returnDate = document.createElement('td');

    issueDate.textContent = row.issueDate;
    patronBC.textContent = row.patronBarcode;
    laptopID.textContent = row.laptopID;
    acc.textContent = row.numAccesories;
    notes.textContent = row.notes;
    returnDate.textContent = row.returnDate;

    tr.appendChild(issueDate);
    tr.appendChild(patronBC);
    tr.appendChild(laptopID);
    tr.appendChild(acc);
    tr.appendChild(notes);
    tr.appendChild(returnDate);

    tableBody.appendChild(tr);
  }
});
