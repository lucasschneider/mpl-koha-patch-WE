var onHoldTable = document.getElementById('holdst'),
  onHoldHead,
  onHoldBody,
  rankTH,
  newRankTH,
  expiresIdx,
  titleColIdx,
  rankColIdx,
  waitingHolds = [],
  transitHolds = [],
  notTfrYet = [],
  emptyRank = [],
  numericRank = [];
  
if (onHoldTable) {
  onHoldHead = onHoldTable.children[0];
  onHoldBody = onHoldTable.children[1];
  
  // Identify the "Rank" header
  for (var i = 0; i < onHoldHead.children[0].children.length; i++) {
    if (onHoldHead.children[0].children[i].textContent.trim() == "Rank") {
      rankColIdx = i;
      rankTH = onHoldHead.children[0].children[i];
    } else {
      // Setr expires column index
      if (onHoldHead.children[0].children[i].textContent.trim() == "Expires") {
        expiresIdx = i;
      }
    
      // Set title column index
      if (onHoldHead.children[0].children[i].textContent.trim() == "Title") {
        titleColIdx = i;
      }
      
      // Clear sort icons for the Rank column when others are clicked
      onHoldHead.children[0].children[i].addEventListener('click', function() {
        newRankTH.classList.remove('headerSortUp');
        newRankTH.classList.remove('headerSortDown');
      });
    }
  }
  
  if (rankTH && rankColIdx > -1) {
    newRankTH = rankTH.cloneNode(true);
    
    // Compile section arrays (waiting, in transit, blank, and numeric
    for (var i = 0; i < onHoldBody.children.length; i++) {
      var value = onHoldBody.children[i].children[rankColIdx].textContent.trim();
      
      if (/^Item is waiting/.test(value)) {
        waitingHolds.push(onHoldBody.children[i]);
      } else if (/^Item in transit/.test(value)) {
        transitHolds.push(onHoldBody.children[i]);
      } else if (/^Item hasn't been transfered yet/.test(value)) {
        notTfrYet.push(onHoldBody.children[i]);
      } else if (value === "") {
        emptyRank.push(onHoldBody.children[i]);
      } else if (/^\d+$/.test(value)) {
        numericRank.push(onHoldBody.children[i]);
      }
    }
    
    // Sort waiting holds by expiration, ASC
    waitingHolds.sort(function(a, b) {
      if (new Date(a.children[expiresIdx].textContent.trim()) < new Date(b.children[expiresIdx].textContent.trim())) {
        return -1;
      } else if (new Date(b.children[expiresIdx].textContent.trim()) < new Date(a.children[expiresIdx].textContent.trim())) {
        return 1;
      } else if (a.children[titleColIdx].textContent.trim() < b.children[titleColIdx].textContent.trim()) {
        return -1;
      } else if (b.children[titleColIdx].textContent.trim() < a.children[titleColIdx].textContent.trim()) {
        return 1;
      } else {
        return 0;
      }
    });
    
    // Sort in transit holds by date since, ASC
    transitHolds.sort(function(a, b) {
      if (new Date(a.children[rankColIdx].textContent.trim().match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/)[0]) < new Date(b.children[rankColIdx].textContent.trim().match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/)[0])) {
        return -1;
      } else if (new Date(b.children[rankColIdx].textContent.trim().match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/)[0]) < new Date(a.children[rankColIdx].textContent.trim().match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/)[0])) {
        return 1;
      } else if (a.children[titleColIdx].textContent.trim() < b.children[titleColIdx].textContent.trim()) {
        return -1;
      } else if (b.children[titleColIdx].textContent.trim() < a.children[titleColIdx].textContent.trim()) {
        return 1;
      } else {
        return 0;
      }
    });
    
    // Sort not transferred yet by rank, ASC
    notTfrYet.sort(function(a, b) {
      var aRank = parseInt(a.children[rankColIdx].textContent.match(/\d+/)[0]),
        bRank = parseInt(b.children[rankColIdx].textContent.match(/\d+/)[0]);
        
      if (aRank < bRank) {
        return -1;
      } else if (bRank < aRank) {
        return 1;
      } else if (a.children[titleColIdx].textContent.trim() < b.children[titleColIdx].textContent.trim()) {
        return -1;
      } else if (b.children[titleColIdx].textContent.trim() < a.children[titleColIdx].textContent.trim()) {
        return 1;
      } else {
        return 0;
      }
    });
    
    // Sort empty rank by title, ASC
    emptyRank.sort(function(a, b) {
      if (a.children[titleColIdx].textContent < b.children[titleColIdx].textContent.trim()) {
        return -1;
      } else if (b.children[titleColIdx].textContent < a.children[titleColIdx].textContent.trim()) {
        return 1;
      } else {
        return 0;
      }
    });
    
    // Sort numeric rank, ASC
    numericRank.sort(function(a, b) {
      if (parseInt(a.children[rankColIdx].textContent) < parseInt(b.children[rankColIdx].textContent.trim())) {
        return -1;
      } else if (parseInt(b.children[rankColIdx].textContent) < parseInt(a.children[rankColIdx].textContent.trim())) {
        return 1;
      } else if (a.children[titleColIdx].textContent < b.children[titleColIdx].textContent.trim()) {
        return -1;
      } else if (b.children[titleColIdx].textContent < a.children[titleColIdx].textContent.trim()) {
        return 1;
      } else {
        return 0;
      }
    });
    
    newRankTH.addEventListener('click', function() {
      // Remove sort icons from other columns
      for (var i = 0; i < onHoldHead.children[0].children.length; i++) {
        if (onHoldHead.children[0].children[i].textContent.trim() != "Rank") {
          onHoldHead.children[0].children[i].classList.remove('headerSortUp');
          onHoldHead.children[0].children[i].classList.remove('headerSortDown');
        }
      }
      
      // Apply appropriate sort icons to Rank column and sort
      if (newRankTH.classList.contains('headerSortDown')) {
        newRankTH.classList.remove('headerSortDown');
        newRankTH.classList.add('headerSortUp');
        
        // Sort by Rank, DESC
        // // Clear table
        while (onHoldBody.firstChild) {
          onHoldBody.removeChild(onHoldBody.firstChild);
        }
        
        for (var i = numericRank.length-1; i > -1; i--) {
          onHoldBody.appendChild(numericRank[i]);
        }
        for (var i = emptyRank.length-1; i > -1; i--) {
          onHoldBody.appendChild(emptyRank[i]);
        }
        for (var i = notTfrYet.length-1; i > -1; i--) {
          onHoldBody.appendChild(notTfrYet[i]);
        }
        for (var i = transitHolds.length-1; i > -1; i--) {
          onHoldBody.appendChild(transitHolds[i]);
        }
        for (var i = waitingHolds.length-1; i > -1; i--) {
          onHoldBody.appendChild(waitingHolds[i]);
        }
      } else {
        newRankTH.classList.remove('headerSortUp');
        newRankTH.classList.add('headerSortDown');
        
        // Sort by Rank, ASC:
        // // Clear table
        while (onHoldBody.firstChild) {
          onHoldBody.removeChild(onHoldBody.firstChild);
        }
        
        for (var i = 0; i < waitingHolds.length; i++) {
          onHoldBody.appendChild(waitingHolds[i]);
        }
        for (var i = 0; i < transitHolds.length; i++) {
          onHoldBody.appendChild(transitHolds[i]);
        }
        for (var i = 0; i < notTfrYet.length; i++) {
          onHoldBody.appendChild(notTfrYet[i]);
        }
        for (var i = 0; i < emptyRank.length; i++) {
          onHoldBody.appendChild(emptyRank[i]);
        }
        for (var i = 0; i < numericRank.length; i++) {
          onHoldBody.appendChild(numericRank[i]);
        }
      }
    });

    rankTH.parentNode.replaceChild(newRankTH, rankTH);
  }
}