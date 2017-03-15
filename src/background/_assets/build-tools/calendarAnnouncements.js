var dRange = document.getElementsByName('drSel')[11],
  dr1Month = document.getElementById('dr1Month'),
  dr1Day = document.getElementById('dr1Day'),
  dr1Year = document.getElementById('dr1Year'),
  dr2Month = document.getElementById('dr2Month'),
  dr2Day = document.getElementById('dr2Day'),
  dr2Year = document.getElementById('dr2Year'),
  startDate,
  endDate,
  eventTypeIndex = [0,1,2,3,4,5,6,7,9,10,11,12,13,15,16,17,20,21,24,30,31,32,36,37,38],
  reportdisplayColVals = [true,true,false,true,true,true,false,false,true,false,true,false,false,false,false,false,true,true,false,false,true,false,false,false,true,false,false];
  
// Check date range radio button
document.getElementsByName('drSel')[10].checked = true;

// Prompt user for date range
do {
  startDate = prompt("Enter the BEGINNING of the report's date range in the format MM/DD/YYYY:");
} while (!/(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d/.test(startDate));
do {
  endDate = prompt("Enter the END of the report's date range in the format MM/DD/YYYY:");
} while (!/(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d/.test(endDate));

switch(startDate.split("/")[0]) {
	case "01": dr1Month.value = "1"; break;
	case "02": dr1Month.value = "2"; break;
	case "03": dr1Month.value = "3"; break;
	case "04": dr1Month.value = "4"; break;
	case "05": dr1Month.value = "5"; break;
	case "06": dr1Month.value = "6"; break;
	case "07": dr1Month.value = "7"; break;
	case "08": dr1Month.value = "8"; break;
	case "09": dr1Month.value = "9"; break;
	default: dr1Month.value = startDate.split("/")[0]; break;
}

switch(startDate.split("/")[1]) {
	case "01": dr1Day.value = "1"; break;
	case "02": dr1Day.value = "2"; break;
	case "03": dr1Day.value = "3"; break;
	case "04": dr1Day.value = "4"; break;
	case "05": dr1Day.value = "5"; break;
	case "06": dr1Day.value = "6"; break;
	case "07": dr1Day.value = "7"; break;
	case "08": dr1Day.value = "8"; break;
	case "09": dr1Day.value = "9"; break;
	default: dr1Day.value = startDate.split("/")[1]; break;
}

dr1Year.value = startDate.split("/")[2];

switch(endDate.split("/")[0]) {
	case "01": dr2Month.value = "1"; break;
	case "02": dr2Month.value = "2"; break;
	case "03": dr2Month.value = "3"; break;
	case "04": dr2Month.value = "4"; break;
	case "05": dr2Month.value = "5"; break;
	case "06": dr2Month.value = "6"; break;
	case "07": dr2Month.value = "7"; break;
	case "08": dr2Month.value = "8"; break;
	case "09": dr2Month.value = "9"; break;
	default: dr2Month.value = endDate.split("/")[0]; break;
}

switch(endDate.split("/")[1]) {
	case "01": dr2Day.value = "1"; break;
	case "02": dr2Day.value = "2"; break;
	case "03": dr2Day.value = "3"; break;
	case "04": dr2Day.value = "4"; break;
	case "05": dr2Day.value = "5"; break;
	case "06": dr2Day.value = "6"; break;
	case "07": dr2Day.value = "7"; break;
	case "08": dr2Day.value = "8"; break;
	case "09": dr2Day.value = "9"; break;
	default: dr2Day.value = endDate.split("/")[1]; break;
}

dr2Year.value = endDate.split("/")[2];

// Include both ongoing and standard events
document.getElementsByName('OngoingSel')[1].checked = true;

// Check all age groups
for (var i = 0; i < 7; i++) {
	document.getElementsByName('AgeGroup')[i].checked = true;
}

// Check all libraries
for (var i = 0; i < 9; i++) {
	document.getElementsByName('Branch')[i].checked = true;
}

// Check relevant event types
for  (var i = 0; i < eventTypeIndex.length; i++) {
	document.getElementsByName('EventType')[eventTypeIndex[i]].checked = true;
}

// Set display format to table
document.getElementsByName('df')[1].click();


// Set output format to table
document.getElementsByName('dt')[2].checked = true;

// Combine recurring events
document.getElementsByName('collapseRecurr')[0].click();

// Check revelant report display columns
for (var i = 0; i < reportdisplayColVals.length; i++) {
	document.getElementsByName('DisplayCol')[i].checked = reportdisplayColVals[i];
}