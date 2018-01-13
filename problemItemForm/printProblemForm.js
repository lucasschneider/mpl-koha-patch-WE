var d = new Date(),
  fieldsTmp = location.search.substr(1).split('&'),
  fields = [];
  
document.getElementById('date').textContent = (d.getMonth()+1) + "/" + d.getDay() + "/" + d.getFullYear().toString().substr(2);

for (var i = 0; i < fieldsTmp.length; i++) {
  fields[i] = fieldsTmp[i].split('=');
}

for (var i = 0; i < fields.length; i++) {
  var target = document.getElementById(decodeURIComponent(fields[i][0]));

  if (target) {
    target.textContent = decodeURIComponent(fields[i][1]);
  }
}

window.print();