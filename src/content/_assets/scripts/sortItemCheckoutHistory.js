(function () {"use strict"; /*jslint browser:true regexp: true indent: 2 devel: true plusplus: true*/
  /*global self*/
  
  var historyTable = document.getElementById('checkouthistt'),
    h1Elts = document.getElementsByTagName('h1'),
    groupItems,
    h1Parent,
    h1Sibling,
    itemRowArray,
    itemHistoryEntries = [],
    wrapper,
    lastSortCode,
    resetTable = false;

  function ItemHistoryEntry(htmlTR) {
    this.html = htmlTR;
    this.name = "";
    this.barcode = "";
    this.date = "";
    this.dueDate = "";
    this.returnDate = "";
    this.owningLibrary = "";

    if (htmlTR.children.length > 7) {
      this.date = htmlTR.children[0].textContent.replace(/\s/g, "") !== "" ? new Date(htmlTR.children[0].textContent.replace(/\s/g, "")) : new Date();
      this.name = htmlTR.children[1].textContent.trim();
      this.barcode = htmlTR.children[2].textContent.trim();
      this.owningLibrary = htmlTR.children[3].textContent.trim();
      this.dueDate = htmlTR.children[6].textContent.replace(/\s/g, "") !== "" ? new Date(htmlTR.children[6].textContent.replace(/\s/g, "")) : new Date();
      this.returnDate = htmlTR.children[7].textContent.replace(/\s/g, "") !== "" ? new Date(htmlTR.children[7].textContent.replace(/\s/g, "")) : new Date();
    }
  }

  function sortTable(itemHistoryEntries, sortCode, limitBarcode) {
    lastSortCode = sortCode;
    var groupItems = document.getElementById('groupItems'),
      libCode = document.getElementsByClassName('loggedinusername')[0].textContent.trim().substr(0,3).toUpperCase();

    switch(sortCode) {
      // Due date, ASC
      case "dueASC":
        itemHistoryEntries.sort(function(a, b) {
          if (groupItems && groupItems.checked) {
            if (a.owningLibrary < b.owningLibrary) return -1;
            else if (a.owningLibrary > b.owningLibrary) return 1;
            else if (a.barcode < b.barcode) return -1;
            else if (a.barcode > b.barcode) return 1;
          }
          if (a.dueDate < b.dueDate) return -1;
          else if (a.dueDate > b.dueDate) return 1;
          else if (a.name < b.name) return -1;
          else if (a.name > b.name) return 1;
          else return 0;
        });
        break;
      // Due date, DESC
      case "dueDESC":
        itemHistoryEntries.sort(function(a, b) {
          if (groupItems && groupItems.checked) {
            if (a.owningLibrary < b.owningLibrary) return -1;
            else if (a.owningLibrary > b.owningLibrary) return 1;
            else if (a.barcode < b.barcode) return -1;
            else if (a.barcode > b.barcode) return 1;
          }
          if (b.dueDate < a.dueDate) return -1;
          else if (b.dueDate > a.dueDate) return 1;
          else if (a.name < b.name) return -1;
          else if (a.name > b.name) return 1;
          else return 0;
        });
        break;
      // Return date, ASC
      case "returnASC":
        itemHistoryEntries.sort(function(a, b) {
          if (groupItems && groupItems.checked) {
            if (a.owningLibrary < b.owningLibrary) return -1;
            else if (a.owningLibrary > b.owningLibrary) return 1;
            else if (a.barcode < b.barcode) return -1;
            else if (a.barcode > b.barcode) return 1;
          }
          if (a.returnDate < b.returnDate) return -1;
          else if (a.returnDate > b.returnDate) return 1;
          else if (a.name < b.name) return -1;
          else if (a.name > b.name) return 1;
          else return 0;
        });
        break;
      // Return date, DESC
      case "returnDESC":
        itemHistoryEntries.sort(function(a, b) {
          if (groupItems && groupItems.checked) {
            if (a.owningLibrary < b.owningLibrary) return -1;
            else if (a.owningLibrary > b.owningLibrary) return 1;
            else if (a.barcode < b.barcode) return -1;
            else if (a.barcode > b.barcode) return 1;
          }
          if (b.returnDate < a.returnDate) return -1;
          else if (b.returnDate > a.returnDate) return 1;
          else if (a.name < b.name) return -1;
          else if (a.name > b.name) return 1;
          else return 0;
        });
        break;
      // Checkout date, ASC
      case "checkoutASC":
        itemHistoryEntries.sort(function(a, b) {
          if (groupItems && groupItems.checked) {
            if (a.owningLibrary < b.owningLibrary) return -1;
            else if (a.owningLibrary > b.owningLibrary) return 1;
            else if (a.barcode < b.barcode) return -1;
            else if (a.barcode > b.barcode) return 1;
          }
          if (a.date < b.date) return -1;
          else if (a.date > b.date) return 1;
          else if (a.name < b.name) return -1;
          else if (a.name > b.name) return 1;
          else return 0;
        });
        break;
      // Checkout date, DESC
      case "checkoutDESC":
      default:
        itemHistoryEntries.sort(function(a, b) {
          if (groupItems && groupItems.checked) {
            if (a.owningLibrary < b.owningLibrary) return -1;
            else if (a.owningLibrary > b.owningLibrary) return 1;
            else if (a.barcode < b.barcode) return -1;
            else if (a.barcode > b.barcode) return 1;
          }
          if (b.date < a.date) return -1;
          else if (b.date > a.date) return 1;
          else if (a.name < b.name) return -1;
          else if (a.name > b.name) return 1;
          else return 0;
        });
    }

    if (groupItems && groupItems.checked && limitBarcode.length !== 14) {
      itemHistoryEntries.sort(function(a, b) {
        if (a.owningLibrary === libCode && b.owningLibrary !== libCode) return -1;
        if (b.owningLibrary === libCode && a.owningLibrary !== libCode) return 1;
        else return 0;
      });
    }

    var tbody = document.createElement('tbody');

    for (var trObj of itemHistoryEntries) {
      if (limitBarcode && limitBarcode.length === 14) {
        if (trObj.barcode === limitBarcode) {
          trObj.html.style = "display: table-row;";
        } else {
          trObj.html.style = "display: none;";
        }
        tbody.appendChild(trObj.html);
      } else {
        trObj.html.style = "display: table-row;";
        tbody.appendChild(trObj.html);
      }
    }

    var historyTable = document.getElementById('checkouthistt'),
    historyTbody;

    if (historyTable) {
      historyTbody = historyTable.children[1];
      if (historyTbody) {
        historyTable.replaceChild(tbody, historyTbody);
      }
    }
  }

  if (historyTable && h1Elts) {

    itemRowArray = historyTable.children[1].children;
    if (itemRowArray && itemRowArray.length > 1) {
      for (var tr of itemRowArray) {
        itemHistoryEntries.push(new ItemHistoryEntry(tr));
      }
      sortTable(itemHistoryEntries,"checkoutDESC","");
    }

    var sheet = window.document.styleSheets[1];
    sheet.insertRule('#sortSelectTable thead { font-weight: bold; }', sheet.cssRules.length);
    sheet.insertRule('#sortSelectTable tbody { cursor: pointer; }', sheet.cssRules.length);
    sheet.insertRule('#sortSelectTable td { text-align: center; }', sheet.cssRules.length);
    sheet.insertRule('.selectedSort { background: #99B7EE; cursor: default; }', sheet.cssRules.length);

    wrapper = document.createElement('div');
    wrapper.id = "sortWrapper";
    wrapper.style = "padding-left:50px;";
    
    var h3 = document.createElement("h3"),
      table = document.createElement("table"),
      thead = document.createElement("thead"),
      tbody = document.createElement("tbody"),
      tr1 = document.createElement("tr"),
      tr2 = document.createElement("tr"),
      td1 = document.createElement("td"),
      td2 = document.createElement("td"),
      td3 = document.createElement("td"),
      td4 = document.createElement("td"),
      td5 = document.createElement("td"),
      td6 = document.createElement("td"),
      td7 = document.createElement("td"),
      td8 = document.createElement("td"),
      td9 = document.createElement("td"),
      div1 = document.createElement("div"),
      input1 = document.createElement("input"),
      input2 = document.createElement("input"),
      span1 = document.createElement("span"),
      span2 = document.createElement("span");
    
    h3.textContent = "Sort by...";
    wrapper.appendChild(h3);
    
    table.id = "sortSelectTable";
    td1.colSpan = "2";
    td1.textContent = "Checkout Date";
    tr1.appendChild(td1);
    td2.colSpan = "2";
    td2.textContent = "Due Date";
    tr1.appendChild(td2);
    td3.colSpan = "2";
    td3.textContent = "Return Date";
    tr1.appendChild(td3);
    thead.appendChild(tr1);
    table.appendChild(thead);
    
    wrapper.appendChild(h3);
    tr1.appendChild(td1);
    tr1.appendChild(td2);
    tr1.appendChild(td3);
    thead.appendChild(tr1)
    
    tr2.id = "sortOptions";
    td4.id = "checkoutASC";
    td4.textContent = "ASC";
    td5.id = "checkoutDESC";
    td5.className = "selectedSort";
    td5.textContent = "DESC";
    td6.id = "dueASC";
    td6.textContent = "ASC";
    td7.id = "dueDESC";
    td7.textContent = "DESC";
    td8.id = "returnASC";
    td8.textContent = "ASC";
    td9.id = "returnDESC";
    td9.textContent = "DESC";
    
    tr2.appendChild(td4);
    tr2.appendChild(td5);
    tr2.appendChild(td6);
    tr2.appendChild(td7);
    tr2.appendChild(td8);
    tr2.appendChild(td9);
    tbody.appendChild(tr2);
    table.appendChild(tbody);
    wrapper.appendChild(table);
    
    div1.style = "margin-top: 10px;";
    input1.id = "groupItems";
    input1.type = "checkbox";
    input1.style = "cursor: pointer;";
    span1.textContent = "Group by barcode: ";

    div1.appendChild(span1);
    div1.appendChild(input1);
    wrapper.appendChild(div1);

    input2.id = "limitBarcode";
    input2.type = "text";
    input2.maxLength = "14";
    input2.placeholder = "<enter full barcode>";
    input2.addEventListener('input', function (e) {
      var lb = document.getElementById('limitBarcode');
      if (lb && lb.value.length === 14) {
        resetTable = true;
        sortTable(itemHistoryEntries, lastSortCode, lb.value);
		var circRows = document.getElementById('checkouthistt').children[1].children,
          bcCount = 0;
        for (var i = 0; i < circRows.length; i++) {
          if (circRows[i].style.display != "none") {
            bcCount++;
          }
        }
		document.getElementsByClassName('searchresults')[0].children[0].children[0].textContent = "Item with barcode " + lb.value + " has been checked out " + bcCount + " times";
      } else if (resetTable) {
        resetTable = false;
        sortTable(itemHistoryEntries, lastSortCode, "");
        var circRows = document.getElementById('checkouthistt').children[1].children,
          bcCount = 0;
        for (var i = 0; i < circRows.length; i++) {
          if (circRows[i].style.display != "none") {
            bcCount++;
          }
        }
		document.getElementsByClassName('searchresults')[0].children[0].children[0].textContent = "Has been checked out " + bcCount + " times";
      }
    });
    span2.textContent = " Restrict to: ";

    div1.appendChild(span2);
    div1.appendChild(input2);

    h1Parent = h1Elts[h1Elts.length-1].parentElement;
    h1Sibling = h1Parent.children[1];

    h1Parent.insertBefore(wrapper, h1Sibling);

    groupItems = document.getElementById('groupItems');

    for (var td of document.getElementById('sortOptions').children) {
      td.addEventListener('click', function () {
        var lb = document.getElementById('limitBarcode');
        if (this.className !== "selectedSort") {
          for (var td of document.getElementById('sortOptions').children) {
            td.className = "";
          }
          this.className = "selectedSort";
          if (lb && lb.value.length === 14) {
            sortTable(itemHistoryEntries, this.id, lb.value);
          } else {
            sortTable(itemHistoryEntries, this.id, "");
          }
        }
      });
      groupItems.addEventListener('click', function () {
        var lb = document.getElementById('limitBarcode');
        if (lb && lb.value.length === 14) {
          sortTable(itemHistoryEntries, lastSortCode, lb.value);
        } else {
          sortTable(itemHistoryEntries, lastSortCode, "");
        }
      });
    }
  }
  }()); //end use strict
