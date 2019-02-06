/*** AUTOFILL OPAC LOGIN ***/
var cardNum = document.getElementById('cardnumber');
if (cardNum != null) {
  cardNum.onblur = function() {
    if (this != null) {
	  cardNum = this.value;
      if (cardNum.length === 14 && cardNum.substr(0,6) === "290780") {
        var userId = document.getElementById('userid');
        if (userId != null) {
          userId.value = cardNum;
        }
      }
	  }
  }
}
undefined;
