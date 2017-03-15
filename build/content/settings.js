"use strict";

function Prefs() {
    return React.createElement(WehParams, null, React.createElement(WehVersion, null), React.createElement(WehParamSet, { wehPrefs: ["skin", "patronMsg", "validAddr", "autoUserId", "selectPSTAT", "forceDigest", "restrictNotificationOptions", "middleName", "updateAccountType", "receiptFont", "disableDropbox"] }, React.createElement(WehParam, null)));
}

ReactDOM.render(React.createElement("div", null, React.createElement("h1", { className: "text-center" }, weh._("settings")), React.createElement("br", null), React.createElement(Prefs, null)), document.getElementById('root'));

weh.setPageTitle(weh._("settings"));