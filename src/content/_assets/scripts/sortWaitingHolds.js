"use strict";

/** Define global variables **/
var holdTable = document.getElementById('holdst'),
  trArray,
  waitingHolds = [];
  
/** Define function to add days to date **/
Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

Date.prototype.getExpiration = function(date) {
  var d = (new Date(date)).addDays(8),
    days = "" + d.getUTCDate(),
    month = "" + d.getUTCMonth(),
    year = d.getUTCYear();
    
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
  this.html = htmlTR;
  this.availableSince = htmlTR.children[0].textContent.trim();
  this.title = htmlTR.children[1].children[0].textContent.replace(":","").trim();
  this.titleElt = htmlTR.children[1];
  this.type = "("+htmlTR.children[1].children[1].textContent.trim()+")";
  this.barcode = htmlTR.children[1].textContent.trim().substr(-14,14);
  this.patronFirst = htmlTR.children[2].children[0].textContent.split(", ")[1]
  this.patronLast = htmlTR.children[2].children[0].textContent.split(", ")[0];;
  this.callnumber = htmlTR.children[3].textContent.trim();
  this.actionElt = htmlTR.children[4];
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
}

/** Main script **/
if (holdTable) {
  trArray = holdTable.tBodies[0].children;
  
  for (var tr of trArray) {
    waitingHolds.push(new WaitingHold(tr));
  }
}