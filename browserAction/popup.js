var paymentPlan = document.getElementById('paymentPlan'),
  lostcard = document.getElementById('lostCard'),
  PSTAT2 = document.getElementById('PSTAT2'),
  calendarAnnouncements = document.getElementById('calendarAnnouncements'),
  problemItem = document.getElementById('problemItem');

if (paymentPlan) paymentPlan.addEventListener('click', function() {
  browser.runtime.sendMessage({key: "addNote"});
});

if (lostcard) lostcard.addEventListener('click', function() {
  browser.runtime.sendMessage({key: "addLostCardNote"});
});

if (PSTAT2) PSTAT2.addEventListener('click', function() {
  browser.runtime.sendMessage({key: "addr2PSTAT"});
});

if (calendarAnnouncements) calendarAnnouncements.addEventListener('click', function() {
  browser.runtime.sendMessage({key: "calendarAnnouncements"});
});

if (problemItem) problemItem.addEventListener('click', function() {
  browser.tabs.create({
    url: browser.runtime.getURL("../problemItemForm/problemItemForm.html")
  });
});
