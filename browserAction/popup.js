document.getElementById('paymentPlan').addEventListener('click', function() {
  browser.runtime.sendMessage({key: "addNote"});
});

document.getElementById('lostCard').addEventListener('click', function() {
  browser.runtime.sendMessage({key: "addLostCardNote"});
});

document.getElementById('PSTAT2').addEventListener('click', function() {
  browser.runtime.sendMessage({key: "addr2PSTAT"});
});

document.getElementById('calendarAnnouncements').addEventListener('click', function() {
  browser.runtime.sendMessage({key: "calendarAnnouncements"});
});

document.getElementById('problemItem').addEventListener('click', function() {
  browser.tabs.create({
    url: browser.runtime.getURL("../problemItemForm/problemItemForm.html")
  });
});