"use strict";
/*** CUSTOM PREDEFINED MESSAGES ***/
var msgSelect = document.getElementById('type'),
  initials = "";

if(msgSelect && msgSelect.options) {
  if (msgSelect.options[4].value === "Special Note") {
    msgSelect.remove(4);
  }

  var cardAtNxtCko = document.createElement('option');
  cardAtNxtCko.value = "Patron must have library card at next checkout. ";
  cardAtNxtCko.textContent = "Have card at next CKO";
  msgSelect.insertBefore(cardAtNxtCko,msgSelect.options[1]);

  if (/mad|hpb|seq|pin|mea|smb|msb|haw|lak/i.test(document.getElementsByClassName('loggedinusername')[0].textContent.trim())) {
    var laptopAgreement = document.createElement('option');
    laptopAgreement.value = "Patron has signed Laptop/iPad Loan Agreement form. Form on file.";
    laptopAgreement.textContent = "Patron signed laptop agreement";
    msgSelect.insertBefore(laptopAgreement,msgSelect.options[2]);

	/* Margie doesn't want this as a predefined note as of June 5, 2017
    var lostPaymentNote = document.createElement('option');
    lostPaymentNote.value = "Check for $[X.XX] will be issued by Madison City Finance to [Owning Library] for [Item Title] ([barcode]). [Initials/Library]";
    lostPaymentNote.textContent = "Check for $[X.XX] will be issued by Madison City Finance..."
    msgSelect.insertBefore(lostPaymentNote,msgSelect.options[3]);
	*/
  }

  msgSelect.onchange = function () {
    this.form.borrower_message.value=this.options[this.selectedIndex].value;
    if (msgSelect.selectedOptions[0].value === "Patron has signed Laptop/iPad Loan Agreement form. Form on file.") {
      initials = prompt("Enter your initials and library location (e.g. LS/MAD)");
      document.getElementById('borrower_message').value += " (" + initials + ")";
    }
  }

  var addNotesLabel = document.createElement('label');
  addNotesLabel.setAttribute('for','addNotes');
  addNotesLabel.setAttribute('style','display: inline-block;');
  addNotesLabel.textContent = 'Include notes for returned mail and bad emails:';

  var addNotes = document.createElement('input');
  addNotes.id = "addNotes";
  addNotes.type = 'checkbox';
  addNotes.setAttribute('style','margin-left: 20px; display: inline-block;');
  addNotes.addEventListener('click', function () {
    if (this.checked) {
      returnedMailGroup.style.display = '';
      badEmailGroup.style.display = '';
    }
    else {
      returnedMailGroup.style.display = 'none';
      badEmailGroup.style.display = 'none';
    }
  });

  var addNotesContainer = document.createElement('li');
  addNotesContainer.appendChild(addNotesLabel);
  addNotesContainer.appendChild(addNotes);
  msgSelect.parentElement.parentElement.insertBefore(addNotesContainer,msgSelect.parentElement.parentElement.children[2]);


  var returnedMailGroup = document.createElement('optgroup');
  returnedMailGroup.label = 'Returned Mail';
  returnedMailGroup.style.display='none';
  msgSelect.appendChild(returnedMailGroup);

  var poRtd = document.createElement('option');
  poRtd.value = "Mail returned by PO. Holds, if any, are suspended and notices are deactivated";
  poRtd.textContent = "Mail returned by post office";
  returnedMailGroup.appendChild(poRtd);

  var cardRtd = document.createElement('option');
  cardRtd.value = "Card was mailed to patron to establish proof of address, but was ret'd by PO. Card is now at MAD. When patron provides new address, please contact MAD-CIRC so card can be mailed again. ";
  cardRtd.textContent = "Library card returned by post office";
  returnedMailGroup.appendChild(cardRtd);

  var badEmailGroup = document.createElement('optgroup');
  badEmailGroup.label = 'Bad Email Address';
  badEmailGroup.style.display='none';
  msgSelect.appendChild(badEmailGroup);

  var badEmail = document.createElement('option');
  badEmail.value = "Email address not recognized, unable to send notices. Verify that mailing address and phone are correct. Enter new email address. Holds, if any, are suspended. Previous email was: ";
  badEmail.textContent =  "Email address not recognized";
  badEmailGroup.appendChild(badEmail);

  var fullEmail = document.createElement('option');
  fullEmail.value = "Email box is full; unable to send notices by email. Holds, if any, are suspended. Email was: ";
  fullEmail.textContent =  "Email box is full";
  badEmailGroup.appendChild(fullEmail);
}
undefined;
