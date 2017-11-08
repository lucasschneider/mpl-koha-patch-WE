/*** Bring 'Session Checkouts' list to top ***/
var yuiG = document.getElementsByClassName('yui-g');
var recentIssues = document.getElementById('recent-issues');
if (yuiG !== null && yuiG.length > 0 && recentIssues !== null) {
  recentIssues.setAttribute('style','clear:left;');
  yuiG[yuiG.length-1].appendChild(recentIssues);
}
