"use strict";

weh.prefs.declare([{
    name: "skin",
    type: "choice",
    defaultValue: "MPL",
    choices: [{
        name: "MID",
        value: "MID"
    }, {
        name: "MPL",
        value: "MPL"
    }, {
        name: "SCLS",
        value: "SCLS"
    }]
}, {
    name: "patronMsg",
    type: "boolean",
    defaultValue: true
}, {
    name: "validAddr",
    type: "boolean",
    defaultValue: false
}, {
    name: "autoUserId",
    type: "boolean",
    defaultValue: true
}, {
    name: "selectPSTAT",
    type: "boolean",
    defaultValue: true
}, {
    name: "forceDigest",
    type: "boolean",
    defaultValue: true
}, {
    name: "restrictNotificationOptions",
    type: "boolean",
    defaultValue: true
}, {
    name: "middleName",
    type: "boolean",
    defaultValue: true
}, {
    name: "updateAccountType",
    type: "boolean",
    defaultValue: true
}, {
    name: "receiptFont",
    type: "choice",
    defaultValue: "MPL",
    choices: [{
        name: "MPL (36px)",
        value: "MPL"
    }, {
        name: "MOO (28px)",
        value: "MOO"
    }]
}, {
    name: "disableDropbox",
    type: "boolean",
    defaultValue: false
}]);