"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * weh - WebExtensions Helper
 *
 * @summary workflow and base code for developing WebExtensions browser add-ons
 * @author Michel Gutierrez
 * @link https://github.com/mi-g/weh
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var WehParams = function (_React$Component) {
    _inherits(WehParams, _React$Component);

    function WehParams(props) {
        _classCallCheck(this, WehParams);

        var _this = _possibleConstructorReturn(this, (WehParams.__proto__ || Object.getPrototypeOf(WehParams)).call(this, props));

        _this.handleCancel = _this.handleCancel.bind(_this);
        _this.handleDefault = _this.handleDefault.bind(_this);
        _this.handleSave = _this.handleSave.bind(_this);
        _this.onPrefs = _this.onPrefs.bind(_this);
        _this.onPrefsSpecs = _this.onPrefsSpecs.bind(_this);
        _this.state = {
            canCancel: false,
            canDefault: false,
            canSave: false
        };
        _this.specs = {};
        _this.originalValues = {};
        _this.invalid = {};
        _this.values = {};
        return _this;
    }

    _createClass(WehParams, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            weh.prefs.on({ pack: true }, this.onPrefs);
            weh.prefs.on({ pack: true, specs: true }, this.onPrefsSpecs);
            Object.assign(this.originalValues, weh.prefs.getAll());
            Object.assign(this.values, weh.prefs.getAll());
            Object.assign(this.specs, weh.prefs.getSpecs());
            var prefs = {};
            Object.keys(this.values).forEach(function (prefName) {
                prefs[prefName] = 1;
            });
            weh.postLocal({
                type: "weh#reload-prefs",
                prefs: prefs
            });
            this.updateCan();
        }
    }, {
        key: "componentWillUnmoun",
        value: function componentWillUnmoun() {
            weh.prefs.off(this.onPrefs);
            weh.prefs.off(this.onPrefsSpecs);
        }
    }, {
        key: "onPrefs",
        value: function onPrefs() {
            this.originalValues = weh.prefs.getAll();
            var newPrefs = weh.prefs.getAll();
            var prefsKeys = {};
            for (var k in newPrefs) {
                prefsKeys[k] = 1;
                delete this.invalid[k];
                this.values[k] = this.originalValues[k];
            }
            this.values = newPrefs;
            weh.postLocal({
                type: "weh#reload-prefs",
                prefs: prefsKeys
            });
            this.updateCan();
        }
    }, {
        key: "onPrefsSpecs",
        value: function onPrefsSpecs() {
            var newSpecs = weh.prefs.getSpecs();
            var prefsKeys = {};
            for (var k in newSpecs) {
                prefsKeys[k] = 1;
                delete this.invalid[k];
                if (typeof this.originalValues[k] == "undefined") this.originalValues[k] = newSpecs[k].defaultValue;
                this.values[k] = this.originalValues[k];
            }
            this.specs = newSpecs;
            weh.postLocal({
                type: "weh#reload-prefs",
                prefs: prefsKeys
            });
        }
    }, {
        key: "getChildContext",
        value: function getChildContext() {
            return {
                setPref: this.setPref.bind(this),
                invalidPref: this.invalidPref.bind(this),
                getPref: this.getPref.bind(this),
                getOriginalPref: this.getOriginalPref.bind(this),
                getSpec: this.getSpec.bind(this)
            };
        }
    }, {
        key: "setPref",
        value: function setPref(name, value) {
            if (this.values[name] === value) return;
            this.values[name] = value;
            delete this.invalid[name];
            var prefs = {};
            prefs[name] = 1;
            weh.postLocal({
                type: "weh#reload-prefs",
                prefs: prefs
            });
            this.updateCan();
        }
    }, {
        key: "invalidPref",
        value: function invalidPref(name) {
            delete this.values[name];
            this.invalid[name] = 1;
            this.updateCan();
        }
    }, {
        key: "getPref",
        value: function getPref(name) {
            return this.values[name];
        }
    }, {
        key: "getOriginalPref",
        value: function getOriginalPref(name) {
            return this.originalValues[name];
        }
    }, {
        key: "getSpec",
        value: function getSpec(name) {
            return this.specs[name];
        }
    }, {
        key: "handleCancel",
        value: function handleCancel() {
            var prefs = {};
            for (var k in this.values) {
                if (this.values[k] !== this.originalValues[k]) prefs[k] = 1;
            }Object.assign(this.values, prefs, weh.prefs);
            weh.postLocal({
                type: "weh#reload-prefs",
                prefs: prefs
            });
            this.updateCan();
        }
    }, {
        key: "handleDefault",
        value: function handleDefault() {
            var prefs = {};
            for (var k in this.values) {
                if (this.specs[k] && this.specs[k].defaultValue !== this.values[k]) {
                    prefs[k] = 1;
                    this.values[k] = this.specs[k].defaultValue;
                }
            }weh.postLocal({
                type: "weh#reload-prefs",
                prefs: prefs
            });
            this.updateCan();
        }
    }, {
        key: "handleSave",
        value: function handleSave() {
            weh.prefs.assign(this.values);
        }
    }, {
        key: "updateCan",
        value: function updateCan() {
            var state = {
                canCancel: false,
                canDefault: false,
                canSave: false
            };
            for (var k in this.values) {
                if (this.originalValues[k] !== this.values[k]) {
                    state.canCancel = true;
                    state.canSave = true;
                }
                if (this.specs[k] && this.values[k] !== this.specs[k].defaultValue) {
                    state.canDefault = true;
                }
            }
            if (Object.keys(this.invalid).length > 0) state.canSave = false;
            this.setState(state);
        }
    }, {
        key: "render",
        value: function render() {
            var self = this;
            var children = React.Children.map(this.props.children, function (child) {
                return React.cloneElement(child, {
                    handlePref: self.handlePref
                });
            });
            return React.createElement("div", null, children, React.createElement("div", { className: "text-center" }, React.createElement("br", null), React.createElement("div", { className: "btn-toolbar", style: { display: "inline-block" } }, React.createElement("button", { type: "button",
                onClick: this.handleCancel,
                className: "btn btn-default " + (this.state.canCancel ? "" : "disabled") }, weh._("cancel")), React.createElement("button", { type: "button",
                onClick: this.handleDefault,
                className: "btn btn-warning " + (this.state.canDefault ? "" : "disabled") }, weh._("default")), React.createElement("button", { type: "button",
                onClick: this.handleSave,
                className: "btn btn-primary " + (this.state.canSave ? "" : "disabled") }, weh._("save")))));
        }
    }]);

    return WehParams;
}(React.Component);

WehParams.childContextTypes = {
    setPref: React.PropTypes.func,
    invalidPref: React.PropTypes.func,
    getPref: React.PropTypes.func,
    getOriginalPref: React.PropTypes.func,
    getSpec: React.PropTypes.func
};

var WehParamSet = function (_React$Component2) {
    _inherits(WehParamSet, _React$Component2);

    function WehParamSet(props) {
        _classCallCheck(this, WehParamSet);

        return _possibleConstructorReturn(this, (WehParamSet.__proto__ || Object.getPrototypeOf(WehParamSet)).call(this, props));
    }

    _createClass(WehParamSet, [{
        key: "render",
        value: function render() {
            var self = this;
            var prefElements = this.props.wehPrefs.map(function (pref) {
                return React.cloneElement(React.Children.only(self.props.children), {
                    key: pref,
                    wehPref: pref
                });
            });
            return React.createElement("form", { className: "form-horizontal", role: "form" }, prefElements);
        }
    }]);

    return WehParamSet;
}(React.Component);

var wehParamIndex = 1;

var WehParam = function (_React$Component3) {
    _inherits(WehParam, _React$Component3);

    function WehParam(props) {
        _classCallCheck(this, WehParam);

        var _this3 = _possibleConstructorReturn(this, (WehParam.__proto__ || Object.getPrototypeOf(WehParam)).call(this, props));

        _this3.prefName = props.wehPref;
        _this3.handleChange = _this3.handleChange.bind(_this3);
        weh.react.attach(_this3, _this3.onWehMessage);
        _this3.paramIndex = wehParamIndex++;
        _this3.originalValue = null;
        _this3.state = {
            spec: null,
            value: null
        };
        return _this3;
    }

    _createClass(WehParam, [{
        key: "update",
        value: function update() {
            var spec = this.context.getSpec(this.prefName);
            var value = this.context.getPref(this.prefName);
            if (typeof value == "undefined" && spec) value = spec.defaultValue;
            this.originalValue = this.context.getOriginalPref(this.prefName);
            this.setState({
                spec: spec,
                value: value
            });
            if (spec) this.notify(this.prefName, value);
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.update();
        }
    }, {
        key: "onWehMessage",
        value: function onWehMessage(message) {
            switch (message.type) {
                case "weh#reload-prefs":
                    if (message.prefs[this.prefName]) this.update();
                    break;
            }
        }
    }, {
        key: "getInputWidth",
        value: function getInputWidth() {
            switch (this.state.spec.type) {
                case "string":
                    return this.state.spec.width || "20em";
                case "integer":
                case "float":
                    return this.state.spec.width || "8em";
                case "boolean":
                    return "34px";
                case "choice":
                    return this.state.spec.width || "12em";
            }
        }
    }, {
        key: "notify",
        value: function notify(param, value) {
            if (value === null || typeof value == "undefined") return;
            if (this.isValid(value)) this.context.setPref(param, value);else this.context.invalidPref(param);
        }
    }, {
        key: "handleChange",
        value: function handleChange(event) {
            var value = this.state.spec.type == "boolean" ? event.target.checked : event.target.value;
            this.setState({
                value: value
            });
            if (this.state.spec.type == "integer") value = parseInt(value);
            if (this.state.spec.type == "float") value = parseFloat(value);
            this.notify(this.prefName, value, this.state.spec);
        }
    }, {
        key: "isValid",
        value: function isValid(value) {
            var spec = this.state.spec;
            if (arguments.length == 0) value = this.state.value;
            if (!spec) return false;
            return weh.prefs.isValid(this.prefName, value);
        }
    }, {
        key: "formGroupClass",
        value: function formGroupClass() {
            if (!this.isValid()) return "has-error";else if (this.state.value != this.originalValue) return "has-success";else if (this.state.value != this.state.spec.defaultValue) return "has-warning";else return "";
        }
    }, {
        key: "renderInput",
        value: function renderInput() {
            switch (this.state.spec.type) {
                case "string":
                case "integer":
                case "float":
                    return React.createElement("input", { className: "form-control",
                        value: this.state.value,
                        onChange: this.handleChange,
                        maxLength: this.state.spec.maxLength || -1,
                        id: "weh-param-" + this.paramIndex,
                        type: "text",
                        style: { width: this.getInputWidth() } });
                case "boolean":
                    return React.createElement("div", null, React.createElement("input", { className: "form-control",
                        checked: this.state.value,
                        onChange: this.handleChange,
                        id: "weh-param-" + this.paramIndex,
                        type: "checkbox",
                        style: { width: "34px" }
                    }));
                case "choice":
                    var options = (this.state.spec.choices || []).map(function (option) {
                        return React.createElement("option", { key: option.value, value: option.value }, option.name);
                    });
                    if (options.length == 0) return false;
                    return React.createElement("select", {
                        value: this.state.value,
                        onChange: this.handleChange,
                        className: "form-control",
                        id: "weh-param-" + this.paramIndex,
                        style: { width: this.getInputWidth() } }, options);

            }
        }
    }, {
        key: "render",
        value: function render() {
            if (!this.state.spec || this.state.value === null || typeof this.state.value == "undefined") return false;
            return React.createElement("div", { className: "form-group " + this.formGroupClass() }, React.createElement("label", { className: "col-sm-4 control-label", htmlFor: "weh-param-" + this.paramIndex }, this.state.spec.label), React.createElement("div", { className: "col-sm-8" }, this.renderInput(), this.state.spec.description && React.createElement("div", { className: "help-block" }, this.state.spec.description)));
        }
    }]);

    return WehParam;
}(React.Component);

WehParam.contextTypes = {
    setPref: React.PropTypes.func,
    invalidPref: React.PropTypes.func,
    getPref: React.PropTypes.func,
    getOriginalPref: React.PropTypes.func,
    getSpec: React.PropTypes.func
};

var WehVersion = function (_React$Component4) {
    _inherits(WehVersion, _React$Component4);

    function WehVersion() {
        _classCallCheck(this, WehVersion);

        return _possibleConstructorReturn(this, (WehVersion.__proto__ || Object.getPrototypeOf(WehVersion)).apply(this, arguments));
    }

    _createClass(WehVersion, [{
        key: "versionName",
        value: function versionName() {
            var manifest = browser.runtime.getManifest();
            var version = manifest.version;
            var version_name = manifest.version_name;
            if (version_name) {
                if (version && version != version_name) return version_name + " (" + version + ")";else return version_name;
            } else return version;
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement("form", { className: "form-horizontal" }, React.createElement("div", { className: "form-group" }, React.createElement("label", { className: "col-sm-4 control-label" }, weh._("version")), React.createElement("div", { className: "col-sm-8" }, React.createElement("p", { className: "form-control-static" }, this.versionName()))));
        }
    }]);

    return WehVersion;
}(React.Component);

Object.assign(window, {
    WehParams: WehParams,
    WehParamSet: WehParamSet,
    WehParam: WehParam,
    WehVersion: WehVersion
});