var d = new Date(),
  fieldsTmp = location.search.substr(1).split('&'),
  fields = [];
  
document.getElementById('date').textContent = (d.getMonth()+1) + "/" + d.getDay() + "/" + d.getFullYear().toString().substr(2);

for (var i = 0; i < fieldsTmp.length; i++) {
  fields[i] = fieldsTmp[i].split('=');
}

for (var i = 0; i < fields.length; i++) {
  var key = decodeURIComponent(fields[i][0]),
    value = decodeURIComponent(fields[i][1]),
    element = document.getElementById(key);

  if (element) {
    if (key == "ckiBySorter") {
      if (value === "true") {
        element.classList.remove("hide");
      }
    } else {
      if (/cCode|holds|copies|use|patronPhone|patronEmail/.test(key) && value == "") {
        document.getElementById(key+"Wrap").classList.add("hide");
      } else {
        element.textContent = decodeURIComponent(value);
      }
    }
  }
}

window.print();