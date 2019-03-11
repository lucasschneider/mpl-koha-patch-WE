(function(){
  'use strict';
  ﻿var copiesTable = document.getElementById('requestspecific'),
    homeLibIdx,
    callNumIdx,
    tableBody,
    tableRows = [];

  if (copiesTable) {
    tableBody = copiesTable.tBodies[0];

    for (var i = 0; i < tableBody.children[0].children.length; i++) {
      if (tableBody.children[0].children[i].textContent.trim() === "Home Library") {
        homeLibIdx = i;
      } else if (tableBody.children[0].children[i].textContent.trim() === "Call no.") {
        callNumIdx = i;
      }
    }

    for (var i = 1; i < tableBody.children.length; i++) {
      tableBody.children[i].style.height = "35px";
      tableRows.push(tableBody.children[i]);
    }

    tableRows.sort(function(a, b) {
      if (a.children[homeLibIdx].textContent.trim() < b.children[homeLibIdx].textContent.trim()) {
        return -1;
      } else if (b.children[homeLibIdx].textContent.trim() < a.children[homeLibIdx].textContent.trim()) {
        return 1;
      } else  if (a.children[callNumIdx].textContent.trim() < b.children[callNumIdx].textContent.trim()) {
        return -1;
      } else if (b.children[callNumIdx].textContent.trim() < a.children[callNumIdx].textContent.trim()) {
        return 1;
      } else return 0;
    });

    for (var i = 0; i < tableRows.length; i++) {
      tableBody.appendChild(tableRows[i]);
    }
  }
})();
