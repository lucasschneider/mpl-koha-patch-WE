let pastUse = document.querySelector('[id^="tag_952_subfield_Z_"');

if (pastUse) {
  pastUse = pastUse.value ? pastUse.value : 0;

  browser.runtime.sendMessage({
    "key": "returnItemPastUse",
    "pastUse": pastUse
  });
}
