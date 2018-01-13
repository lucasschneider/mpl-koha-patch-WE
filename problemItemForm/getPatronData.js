if (/Checking out to/.test(document.title)) {
  var patronName = document.getElementsByClassName('patroninfo')[0].children[0].textContent.replace(/\s\s+/g, ' ').replace(/\./g,'').slice(0, -17).replace(/\w+/g, function(w){return w[0].toUpperCase() + w.slice(1).toLowerCase()}),
    phoneMatchArr = /(1-)?[0-9]{3}-[0-9]{3}-[0-9]{4}/.exec(document.querySelector(".patroninfo ul").textContent),
    patronPhone = "";
    
    if (phoneMatchArr && phoneMatchArr.length > 0) {
      patronPhone = phoneMatchArr[0];
    }
    
    browser.runtime.sendMessage({
      "key": "returnPatronData",
      "patronName": patronName,
      "patronPhone": patronPhone 
    });
} else {
  console.log("This is not a patron's record!");
}