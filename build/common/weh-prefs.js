"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * weh - WebExtensions Help
 *
 * @summary workflow and base code for developing WebExtensions browser add-ons
 * @author Michel Gutierrez
 * @link https://github.com/mi-g/weh
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

(function () {

    function Prefs() {

        this.$specs = {};
        this.$values = null;
        if (!this.$values) this.$values = {};
        this.$listeners = {};
    }

    Prefs.prototype = {

        notify: function notify(p, val, oldVal, spec) {
            var self = this;
            var terms = p.split(".");
            var keys = [];
            for (var i = terms.length; i >= 0; i--) {
                keys.push(terms.slice(0, i).join("."));
            }keys.forEach(function (key) {
                var listeners = self.$listeners[key];
                if (listeners) listeners.forEach(function (listener) {
                    if (listener.specs != spec) return;
                    if (!listener.pack) try {
                        listener.callback(p, val, oldVal);
                    } catch (e) {} else {
                        listener.pack[p] = val;
                        if (typeof listener.old[p] == "undefined") listener.old[p] = oldVal;
                        if (listener.timer) clearTimeout(listener.timer);
                        listener.timer = setTimeout(function () {
                            delete listener.timer;
                            var pack = listener.pack;
                            var old = listener.old;
                            listener.pack = {};
                            listener.old = {};
                            try {
                                listener.callback(pack, old);
                            } catch (e) {}
                        }, 0);
                    }
                });
            });
        },

        declare: function declare(specs) {

            var self = this;

            if (!Array.isArray(specs)) specs = Object.keys(specs).map(function (prefName) {
                var spec = specs[prefName];
                spec.name = prefName;
                return spec;
            });

            specs.forEach(function (spec) {

                if (forbiddenKeys[spec.name]) throw new Error("Forbidden prefs key " + spec.name);

                var localeName = spec.name.replace(/[^0-9a-zA-Z_]/g, '_');
                spec.label = spec.label || weh._("weh_prefs_label_" + localeName) || spec.name;
                spec.description = spec.description || weh._("weh_prefs_description_" + localeName) || "";

                if (spec.type == "choice") spec.choices = (spec.choices || []).map(function (choice) {
                    if ((typeof choice === "undefined" ? "undefined" : _typeof(choice)) == "object") return choice;
                    var localeChoice = choice.replace(/[^0-9a-zA-Z_]/g, '_');
                    return {
                        value: choice,
                        name: weh._("weh_prefs_" + localeName + "_option_" + localeChoice) || choice
                    };
                });

                var prevValue = null;

                if (!self.$specs[spec.name]) (function (p) {
                    if (typeof self[spec.name] !== "undefined") prevValue = self[spec.name];
                    Object.defineProperty(self, p, {
                        set: function set(val) {
                            var oldVal = self.$values[p];
                            if (oldVal === val) return;
                            self.$values[p] = val;

                            self.notify(p, val, oldVal, false);
                        },
                        get: function get() {
                            return self.$values[p] !== undefined ? self.$values[p] : self.$specs[p] && self.$specs[p].defaultValue || undefined;
                        }
                    });
                })(spec.name);

                var oldSpecs = self.$specs[spec.name];
                self.$specs[spec.name] = spec;
                if (prevValue !== null) self.$values[spec.name] = prevValue;else if (typeof self.$values[spec.name] == "undefined") self.$values[spec.name] = spec.defaultValue;

                self.notify(spec.name, spec, oldSpecs, true);
            });
        },

        on: function on() {
            var pref = "",
                options = {},
                argIndex = 0;
            if (typeof arguments[argIndex] == "string") pref = arguments[argIndex++];
            if (_typeof(arguments[argIndex]) == "object") options = arguments[argIndex++];
            var callback = arguments[argIndex];
            var pack = !!options.pack;

            if (!this.$listeners[pref]) this.$listeners[pref] = [];
            var handler = {
                callback: callback,
                specs: !!options.specs
            };
            if (pack) {
                handler.pack = {};
                handler.old = {};
            }
            this.$listeners[pref].push(handler);
        },

        off: function off() {
            var pref = "",
                argIndex = 0;
            if (typeof arguments[argIndex] == "string") pref = arguments[argIndex++];
            var callback = arguments[argIndex];
            var listeners = this.$listeners[pref];
            if (!listeners) return;
            for (var i = listeners.length - 1; i >= 0; i--) {
                if (!callback || listeners[i] == callback) listeners.splice(i, 1);
            }
        },

        getAll: function getAll() {
            return Object.assign({}, this.$values);
        },

        getSpecs: function getSpecs() {
            return Object.assign({}, this.$specs);
        },

        assign: function assign(prefs) {
            for (var k in prefs) {
                this[k] = prefs[k];
            }
        },

        isValid: function isValid(prefName, value) {
            var spec = this.$specs[prefName];
            if (!spec) return undefined;
            switch (spec.type) {
                case "string":
                    if (spec.regexp && !new RegExp(spec.regexp).test(value)) return false;
                    break;
                case "integer":
                    if (!/^-?[0-9]+$/.test(value)) return false;
                    if (isNaN(parseInt(value))) return false;
                case "float":
                    if (spec.type == "float") {
                        if (!/^-?[0-9]+(\.[0-9]+)$/.test(value)) return false;
                        if (isNaN(parseFloat(value))) return false;
                    }
                    if (typeof spec.minimum != "undefined" && value < spec.minimum) return false;
                    if (typeof spec.maximum != "undefined" && value > spec.maximum) return false;
                    break;
                case "choice":
                    var ok = false;
                    (spec.choices || []).forEach(function (choice) {
                        if (value == choice.value) ok = true;
                    });
                    if (!ok) return false;
                    break;
            }
            return true;
        }
    };

    weh.prefs = new Prefs();

    var forbiddenKeys = {};
    for (var k in weh.prefs) {
        forbiddenKeys[k] = true;
    }
})();