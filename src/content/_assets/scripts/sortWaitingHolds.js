"use strict";

/** Define global variables **/
var holdTable = document.getElementById('holdst'),
  holdTableHead = holdTable.tHead,
  holdTableBody = holdTable.tBodies[0],
  trArray = holdTableBody.children,
  newTBody = document.createElement('tbody'),
  waitingHolds = [],
  numWaitingHolds = 0;

// Create expiration date header
var expirationDateTH = document.createElement('th');
expirationDateTH.textContent = "Item held through";
  
/** Define function to add days to date **/
Date.prototype.addDays = function(days) {
  this.setDate(this.getDate() + days);
}

function getExpiration(date) {
  date.addDays(8);
  var days = "" + date.getUTCDate(),
    month = "" + date.getUTCMonth(),
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
function sortWaitingHolds(waitingHolds, sortCode, limitType, limitDate) {
  numWaitingHolds = 0;
  // Extract table data
  if (holdTable && trArray) {
    for (var i = 0; i < trArray.length; i++) {
      waitingHolds.push(new WaitingHold(trArray[i]));
      numWaitingHolds++;
    }
  }
  
  switch(sortCode) {
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
    if (limitDate && limitDate === waitingHolds[i].expirationDate) {
      var expirationDate = document.createElement('td');
      expirationDate.textContent = waitingHolds[i].expirationDate;
    
      waitingHolds[i].html.insertBefore(expirationDate, waitingHolds[i].html.children[1]);
      newTBody.appendChild(waitingHolds[i].html);
	} else if (!limitDate) {
	  var expirationDate = document.createElement('td');
      expirationDate.textContent = waitingHolds[i].expirationDate;
    
      waitingHolds[i].html.insertBefore(expirationDate, waitingHolds[i].html.children[1]);
      newTBody.appendChild(waitingHolds[i].html);
	}
  }
  
  holdTable.children[1].remove();
  holdTable.appendChild(newTBody);
}

// Gather table data
holdTableHead.children[0].insertBefore(expirationDateTH, holdTableHead.children[0].children[1]);

// Extract table data
if (holdTable && trArray) {
  sortWaitingHolds(waitingHolds, "", "", "09/14/2017");
}

// Generate sort options
var sortWrapper = document.createElement('div'),
  title = document.createElement('span'),
  dateTypeWrapper = document.createElement('span'),
  availableSinceLabel = document.createElement('label'),
  availableSince = document.createElement('input'),
  br = document.createElement('br'),
  heldThroughLabel = document.createElement('label'),
  heldThrough = document.createElement('input'),
  dateFilterLabel = document.createElement('label'),
  dateFilter = document.createElement('input');
  
// Define input fields
availableSince.name = "dateType";
availableSince.value = "availableSince";
availableSince.id = "availableSince";
availableSince.type = "radio";

heldThrough.name = "dateType";
heldThrough.value = "heldThrough";
heldThrough.id = "heldThrough";
heldThrough.type = "radio";
heldThrough.checked = true;

dateFilter.id = "dateFilter";
dateFilter.type = "text";
dateFilter.placeholder = "MM/DD/YYYY";
dateFilter.addEventListener('input', function (e) {
  var df = document.getElementById('dateFilter');
  if (df.value.length == 10) {
    sortWaitingHolds(waitingHolds, "", "", df.value);
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

dateFilterLabel.setAttribute("for","dateFilter");
dateFilterLabel.setAttribute("style","margin-left:2.5em;");
dateFilterLabel.textContent = "Date: ";
dateFilterLabel.appendChild(dateFilter);

// Append lables to wrapper elements
sortWrapper.id = "sortWrapper";
sortWrapper.setAttribute("style","margin:1em;");

title.setAttribute("style","font-weight:bold;margin-right:2.5em;");
title.textContent = "Limit by Date: ";

dateTypeWrapper.setAttribute("style","display:inline-block;vertical-align:middle;text-align:right;");
dateTypeWrapper.appendChild(availableSinceLabel);
dateTypeWrapper.appendChild(br);
dateTypeWrapper.appendChild(heldThroughLabel);

// Compile sort wrapper
sortWrapper.appendChild(title);
sortWrapper.appendChild(dateTypeWrapper);
sortWrapper.appendChild(dateFilterLabel);

document.getElementsByClassName('yui-g')[0].insertBefore(sortWrapper,document.getElementsByClassName('yui-g')[0].children[1]);
