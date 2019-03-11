(function(){
  'use strict';
  ﻿if (/^https?\:\/\/scls-staff\.kohalibrary\.com\/cgi-bin\/koha\/circ\/waitingreserves\.pl.*/.test(location.href)) {
    /** Define global variables **/
    var holdTable = document.getElementById('holdst'),
      holdTableHead = holdTable.tHead,
      holdTableBody = holdTable.tBodies[0],
      trArray = holdTableBody.children,
      newTBody,
      waitingHolds = [],
      numWaitingHolds = 0,
      sortCode = "patron",
      isDateFiltered = false,
      expirationDateTH = document.createElement('th');

    expirationDateTH.textContent = "Item held through";

    /** Define function to add days to date **/
    Date.prototype.addDays = function(days) {
      this.setDate(this.getDate() + days);
    }

    function getExpiration(date) {
      date.addDays(8);
      var days = "" + date.getUTCDate(),
        month = "" + (date.getUTCMonth()+1),
        year = date.getFullYear();

        if (days.length == 1) {
          days = "0" + days;
        }

        if (month.length == 1) {
          month = "0" + month;
        }

        return month + "/" + days + "/" + year;
    }

    /** Define waiting hold object **/
    function WaitingHold(htmlTR) {
      var i = 0;
      if (htmlTR.children.length > 5) i++
      this.html = htmlTR;
      this.availableSince = htmlTR.children[0].textContent.trim().substring(0,11);
      this.expirationDate = getExpiration(new Date(htmlTR.children[0].textContent.trim().substring(0,11)));
      this.title = htmlTR.children[i+1].children[0].textContent.replace(":","").trim();
      this.titleElt = htmlTR.children[i+1];
      this.type = "("+htmlTR.children[i+1].children[1].textContent.trim()+")";
      this.barcode = htmlTR.children[i+1].textContent.trim().substr(-14,14);
      this.patronElt - htmlTR.children[i+2];
      this.patronFirst = htmlTR.children[i+2].children[0].textContent.split(", ")[1];
      this.patronLast = htmlTR.children[i+2].children[0].textContent.split(", ")[0];
      this.callnumber = htmlTR.children[i+3].textContent.trim();
      this.actionElt = htmlTR.children[i+4];
    }

    /**
      * Define sort algorithm
      *
      * waitingHolds: An array of WaitingHold objects to be sorted and displayed
      * sortCode: The column by which to sort the objects
      * timitType: The type of date to filter (i.e. available since or expiration)
      * limitDate: The date to filter
      **/
    function sortWaitingHolds(waitingHolds, sortCode, dateType, limitDate) {
      newTBody = document.createElement('tbody');

      switch(sortCode) {
        case "dateAsc":
          waitingHolds.sort(function(a, b) {
            if (a.availableSince < b.availableSince) return -1;
            else if (a.availableSince > b.availableSince) return 1;
            else if (a.patronLast < b.patronLast) return -1;
            else if (a.patronLast > b.patronLast) return 1;
            else if (a.patronFirst < b.patronFirst) return -1;
            else if (a.patronFirst > b.patronFirst) return 1;
            else if (a.title < b.title) return -1;
            else if (a.title > b.title) return 1;
            else return 0;
          });
        break;
        case "dateDesc":
          waitingHolds.sort(function(a, b) {
            if (a.availableSince < b.availableSince) return 1;
            else if (a.availableSince > b.availableSince) return -1;
            else if (a.patronLast < b.patronLast) return 1;
            else if (a.patronLast > b.patronLast) return -1;
            else if (a.patronFirst < b.patronFirst) return 1;
            else if (a.patronFirst > b.patronFirst) return -1;
            else if (a.title < b.title) return 1;
            else if (a.title > b.title) return -1;
            else return 0;
          });
        break;
      case "patronDesc":
          waitingHolds.sort(function(a, b) {
            if (a.patronLast < b.patronLast) return 1;
            else if (a.patronLast > b.patronLast) return -1;
            else if (a.patronFirst < b.patronFirst) return 1;
            else if (a.patronFirst > b.patronFirst) return -1;
            else if (a.expirationDate < b.expirationDate) return 1;
            else if (a.expirationDate > b.expirationDate) return -1;
            else if (a.title < b.title) return 1;
            else if (a.title > b.title) return -1;
            else return 0;
          });
        break;
      case "patronAsc":
      default:
        waitingHolds.sort(function(a, b) {
          if (a.patronLast < b.patronLast) return -1;
          else if (a.patronLast > b.patronLast) return 1;
          else if (a.patronFirst < b.patronFirst) return -1;
          else if (a.patronFirst > b.patronFirst) return 1;
          else if (a.expirationDate < b.expirationDate) return -1;
          else if (a.expirationDate > b.expirationDate) return 1;
          else if (a.title < b.title) return -1;
          else if (a.title > b.title) return 1;
          else return 0;
        });
        break;
      }

      for (var i = 0; i < waitingHolds.length; i++) {
        /** If limitDate has a non-empty value, and either
          * 1) The avaialableSince filter is selected and matches the object's available date
          * 2) The heldThrough filter is selected and matches the object's exxpiration date
          * Or there is no filter selected, add teh object to the sorted table
          */
        if (!limitDate) {
          newTBody.appendChild(waitingHolds[i].html);
        } else if (limitDate && dateType && dateType === "heldThrough" && waitingHolds[i].expirationDate === limitDate) {
          newTBody.appendChild(waitingHolds[i].html);
        } else if (limitDate && dateType && dateType === "availableSince" && waitingHolds[i].availableSince === limitDate) {
          newTBody.appendChild(waitingHolds[i].html);
        }
      }

      holdTable.children[1].remove();
      holdTable.appendChild(newTBody);
    }

    /**
      * waitingHolds: An array of WaitingHold objects to be sorted and displayed
      */
    function updateHoldTable(waitingHolds) {
      var sortCodeVal = "",
        dateTypeVal = "",
        limitDateVal = "",
        patronSort = document.getElementById('patronSort'),
        dateSort = document.getElementById('dateSort'),
        asc = document.getElementById('Asc'),
        desc = document.getElementById('Desc'),
        dateFilter = document.getElementById('dateFilter'),
        availableSince = document.getElementById('availableSince'),
        heldThrough = document.getElementById('heldThrough');

      if (dateFilter) {
        limitDateVal = dateFilter.value;
      }

      if (patronSort && patronSort.checked == true) {
        sortCodeVal = "patron";
      } else if (dateSort && dateSort.checked == true) {
        sortCodeVal = "date";
      }

      if (asc && asc.checked) {
        sortCodeVal += "Asc";
      } else {
        sortCodeVal += "Desc";
      }

      if (availableSince && availableSince.checked == true) {
        dateTypeVal = "availableSince";
      } else if (heldThrough && heldThrough.checked == true) {
        dateTypeVal = "heldThrough";
      }

      sortWaitingHolds(waitingHolds, sortCodeVal, dateTypeVal, limitDateVal);
    }

    // Insert "Item held through" header
    holdTableHead.children[0].insertBefore(expirationDateTH, holdTableHead.children[0].children[1]);

    // Extract, sort, and display table data
    if (holdTable && trArray) {
      for (var i = 0; i < trArray.length; i++) {
        waitingHolds.push(new WaitingHold(trArray[i]));
        numWaitingHolds++;

        var expirationDate = document.createElement('td');
        expirationDate.textContent = waitingHolds[i].expirationDate;

        waitingHolds[i].html.insertBefore(expirationDate, waitingHolds[i].html.children[1]);
      }

      sortWaitingHolds(waitingHolds, sortCode, null, null);
    }

    // Generate sort options
    var sortWrapper = document.createElement('div'),
      title = document.createElement('span'),
      dateTypeWrapper = document.createElement('span'),
      sortTypeWrapper = document.createElement('span'),
      availableSinceLabel = document.createElement('label'),
      availableSince = document.createElement('input'),
      br = document.createElement('br'),
      br2 = document.createElement('br'),
      br3 = document.createElement('br'),
      heldThroughLabel = document.createElement('label'),
      heldThrough = document.createElement('input'),
      dateFilterLabel = document.createElement('label'),
      dateFilter = document.createElement('input'),
      sortDirectionWrapper = document.createElement('span'),
      ascLabel = document.createElement('label'),
      asc = document.createElement('input'),
      descLabel = document.createElement('label'),
      desc = document.createElement('input'),
      dateSortLabel = document.createElement('label'),
      dateSort = document.createElement('input'),
      patronSortLabel = document.createElement('label'),
      patronSort = document.createElement('input');

    // Define input fields
    availableSince.name = "dateType";
    availableSince.value = "availableSince";
    availableSince.id = "availableSince";
    availableSince.type = "radio";
    availableSince.setAttribute("style","cursor:pointer");
    availableSince.addEventListener('click',function() {var dateFilter = document.getElementById('dateFilter'); if (dateFilter && dateFilter.value) {updateHoldTable(waitingHolds);}});

    heldThrough.name = "dateType";
    heldThrough.value = "heldThrough";
    heldThrough.id = "heldThrough";
    heldThrough.type = "radio";
    heldThrough.setAttribute("style","cursor:pointer");
    heldThrough.checked = true;
    heldThrough.addEventListener('click',function() {var dateFilter = document.getElementById('dateFilter'); if (dateFilter && dateFilter.value) {updateHoldTable(waitingHolds);}});


    patronSort.name = "sortType";
    patronSort.value = "patronSort";
    patronSort.id = "patronSort";
    patronSort.type = "radio";
    patronSort.setAttribute("style","cursor:pointer");
    patronSort.checked = true;
    patronSort.addEventListener('click',function() {updateHoldTable(waitingHolds);});

    dateSort.name = "sortType";
    dateSort.value = "dateSort";
    dateSort.id = "dateSort";
    dateSort.type = "radio";
    dateSort.setAttribute("style","cursor:pointer");
    dateSort.addEventListener('click',function() {updateHoldTable(waitingHolds);});

    asc.name = "sortDirection";
    asc.value = "Asc";
    asc.id = "Asc";
    asc.type = "radio";
    asc.setAttribute("style","cursor:pointer");
    asc.checked = true;
    asc.addEventListener('click',function() {updateHoldTable(waitingHolds);});

    desc.name = "sortDirection";
    desc.value = "Desc";
    desc.id = "Desc";
    desc.type = "radio";
    desc.setAttribute("style","cursor:pointer");
    desc.addEventListener('click',function() {updateHoldTable(waitingHolds);});

    dateFilter.id = "dateFilter";
    dateFilter.type = "text";
    dateFilter.setAttribute("style","font-weight: normal;");
    dateFilter.placeholder = "MM/DD/YYYY";
    dateFilter.addEventListener('keyup', function (e) {
      var df = document.getElementById('dateFilter');

      switch(df.value.length) {
        case 1:
          if (!df.value.match(/[01]/)) {
            df.value = "";
          }
          break;
        case 2:
          if (!df.value.match(/0[1-9]|1[0-2]/)) {
            df.value = df.value.substring(0,1);
          } else if (e.keyCode !== 8 && e.keyCode !== 46) {
            df.value += "/";
          }
          break;
        case 3:
          if (!df.value.match(/(0[1-9]|1[0-2])\//)) {
            df.value = df.value.substring(0,2);
          }
          break;
        case 4:
          if (!df.value.match(/(0[1-9]|1[0-2])\/[0-3]/)) {
            df.value = df.value.substring(0,3);
          }
          break;
        case 5:
          if (!df.value.match(/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])/)) {
            df.value = df.value.substring(0,4);
          } else if (e.keyCode !== 8 && e.keyCode !== 46) {
            df.value += "/";
          }
          break;
        case 6:
          if (!df.value.match(/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\//)) {
            df.value = df.value.substring(0,5);
          }
          break;
        case 7:
          if (!df.value.match(/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/2/)) {
            df.value = df.value.substring(0,6);
          }
          break;
        case 8:
          if (!df.value.match(/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/2[01]/)) {
            df.value = df.value.substring(0,7);
          }
          break;
        case 9:
          if (!df.value.match(/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/2[01][0-9]/)) {
            df.value = df.value.substring(0,8);
          }
          break;
        case 10:
          if (!df.value.match(/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/2[01][0-9]{2}/)) {
            df.value = df.value.substring(0,9);
          }
          break;
        default:
          df.value = df.value.substring(0,10);
          break;
      }

      if (df.value.length < 10 && isDateFiltered) {
        isDateFiltered = false;
        updateHoldTable(waitingHolds);
      } else if (df.value.length === 10) {
        isDateFiltered = true;
        updateHoldTable(waitingHolds);
      }
    });

    // Append them to their labels
    availableSinceLabel.setAttribute("for","availableSince");
    availableSinceLabel.setAttribute("style","cursor:pointer");
    availableSinceLabel.textContent = "Available Since: ";
    availableSinceLabel.appendChild(availableSince);


    heldThroughLabel.setAttribute("for","heldThrough");
    heldThroughLabel.setAttribute("style","cursor:pointer");
    heldThroughLabel.textContent = "Held Through: ";
    heldThroughLabel.appendChild(heldThrough);

    dateSortLabel.setAttribute("for","dateSort");
    dateSortLabel.setAttribute("style","cursor:pointer");
    dateSortLabel.textContent = "Date: ";
    dateSortLabel.appendChild(dateSort);

    patronSortLabel.setAttribute("for","patronSort");
    patronSortLabel.setAttribute("style","cursor:pointer");
    patronSortLabel.textContent = "Patron: ";
    patronSortLabel.appendChild(patronSort);

    ascLabel.setAttribute("for", "Asc");
    ascLabel.setAttribute("style","cursor:pointer");
    ascLabel.textContent = "ASC: ";
    ascLabel.appendChild(asc);

    descLabel.setAttribute("for", "Desc");
    descLabel.setAttribute("style","cursor:pointer");
    descLabel.textContent = "DESC: ";
    descLabel.appendChild(desc);

    dateFilterLabel.setAttribute("for","dateFilter");
    dateFilterLabel.setAttribute("style","margin-left:2.5em;font-weight:bold;");
    dateFilterLabel.textContent = "Filter Date: ";
    dateFilterLabel.appendChild(dateFilter);

    // Append labels to wrapper elements
    sortWrapper.id = "sortWrapper";
    sortWrapper.setAttribute("style","margin:1em;width:950px;");

    title.setAttribute("style","font-weight:bold;margin-right:2.5em;");
    title.textContent = "Sort Options: ";

    dateTypeWrapper.setAttribute("style","display:inline-block;vertical-align:middle;text-align:right;margin-left:2.5em;");
    dateTypeWrapper.appendChild(availableSinceLabel);
    dateTypeWrapper.appendChild(br);
    dateTypeWrapper.appendChild(heldThroughLabel);

    sortDirectionWrapper.setAttribute("style","display:inline-block;vertical-align:middle;text-align:right;");
    sortDirectionWrapper.appendChild(ascLabel);
    sortDirectionWrapper.appendChild(br2);
    sortDirectionWrapper.appendChild(descLabel);

    sortTypeWrapper.setAttribute("style","display:inline-block;vertical-align:middle;text-align:right;margin-right:2.5em;");
    sortTypeWrapper.appendChild(patronSortLabel);
    sortTypeWrapper.appendChild(br3);
    sortTypeWrapper.appendChild(dateSortLabel);

    // Compile sort wrapper
    sortWrapper.appendChild(title);
    sortWrapper.appendChild(sortTypeWrapper);
    sortWrapper.appendChild(sortDirectionWrapper);
    sortWrapper.appendChild(dateFilterLabel);
    sortWrapper.appendChild(dateTypeWrapper);

    document.getElementsByClassName('yui-g')[0].insertBefore(sortWrapper,document.getElementsByClassName('yui-g')[0].children[1]);
  }
})();
