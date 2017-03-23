/*** AUTOFILL OPAC LOGIN ***/
var fillOPACLogin = function() {
  var cardNum = document.getElementById('cardnumber');
  if (cardNum != null) cardNum = cardNum.value;
  if (cardNum.length === 14 && cardNum.substr(0,6) === "290780") {
    var userId = document.getElementById('userid');
    if (userId != null) userId.value = cardNum;
  }
}

var cardNum = document.getElementById('cardnumber');
if (cardNum != null) cardNum.onblur = fillOPACLogin;
