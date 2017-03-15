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

var WehTranslationItem = function (_React$Component) {
    _inherits(WehTranslationItem, _React$Component);

    function WehTranslationItem(props) {
        _classCallCheck(this, WehTranslationItem);

        var _this = _possibleConstructorReturn(this, (WehTranslationItem.__proto__ || Object.getPrototypeOf(WehTranslationItem)).call(this, props));

        _this.handleChange = _this.handleChange.bind(_this);
        return _this;
    }

    _createClass(WehTranslationItem, [{
        key: "formGroupClass",
        value: function formGroupClass() {
            if (this.props.changed) return "has-success";
            if (this.props.custom.message !== "") return "has-warning";
            return "";
        }
    }, {
        key: "handleChange",
        value: function handleChange(event) {
            event.stopPropagation();
            var args = {};
            var str = event.target.value;
            var substRe = new RegExp("^(?:|.*?[^\\\\])(?:\\$)arg([1-9])(?:\\$)(.*)");
            do {
                var m = substRe.exec(str);
                if (m) {
                    args[m[1]] = 1;
                    str = m[2];
                }
            } while (m);
            var item = {
                message: event.target.value
            };
            if (Object.keys(args).length > 0) {
                item.placeholders = {};
                Object.keys(args).forEach(function (arg) {
                    item.placeholders["arg" + arg] = {
                        content: "$" + arg
                    };
                });
            }
            this.props.change(this.props.tkey, item);
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement("div", { className: "form-group " + this.formGroupClass() }, React.createElement("label", { className: "col-sm-4 control-label", htmlFor: "weh-" + this.props.tkey }, this.props.tkey), React.createElement("div", { className: "col-sm-8" }, React.createElement("input", { className: "form-control",
                onChange: this.handleChange,
                value: this.props.custom.message,
                type: "text",
                id: "weh-" + this.props.tkey
            }), React.createElement("div", { className: "help-block" }, this.props.original)));
        }
    }]);

    return WehTranslationItem;
}(React.Component);

var WehTranslation = function (_React$Component2) {
    _inherits(WehTranslation, _React$Component2);

    function WehTranslation(props) {
        _classCallCheck(this, WehTranslation);

        var _this2 = _possibleConstructorReturn(this, (WehTranslation.__proto__ || Object.getPrototypeOf(WehTranslation)).call(this, props));

        _this2.handleSave = _this2.handleSave.bind(_this2);
        _this2.handleChange = _this2.handleChange.bind(_this2);
        _this2.handleSearchChange = _this2.handleSearchChange.bind(_this2);
        var custom = {};
        try {
            custom = JSON.parse(window.localStorage.getItem("wehI18nCustom")) || {};
        } catch (e) {}
        _this2.state = {
            keys: [],
            custom: custom,
            customOrg: JSON.parse(JSON.stringify(custom)),
            search: ""
        };
        weh.react.attach(_this2, _this2.onWehMessage);
        return _this2;
    }

    _createClass(WehTranslation, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            weh.post({ type: "weh#get-i18n-keys" });
        }
    }, {
        key: "onWehMessage",
        value: function onWehMessage(message) {
            switch (message.type) {
                case "weh#i18n-keys":
                    this.setState({ keys: message.i18nKeys });
                    break;
            }
        }
    }, {
        key: "handleSave",
        value: function handleSave() {
            window.localStorage.setItem("wehI18nCustom", JSON.stringify(this.state.custom));
            this.setState(function (state0) {
                return {
                    customOrg: JSON.parse(JSON.stringify(state0.custom))
                };
            });
        }
    }, {
        key: "handleChange",
        value: function handleChange(key, value) {
            this.setState(function (state0) {
                state0.custom[key] = value;
                return {
                    custom: state0.custom
                };
            });
        }
    }, {
        key: "handleSearchChange",
        value: function handleSearchChange(event) {
            this.setState({
                search: event.target.value
            });
        }
    }, {
        key: "saveButtonClass",
        value: function saveButtonClass() {
            for (var key in this.state.custom) {
                if ((this.state.custom[key].message || "") !== (this.state.customOrg[key] && this.state.customOrg[key].message || "")) return "";
            }
            return "disabled";
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var self = this;
            var maxArgs = 4; // should be 9 but this is a bug in Edge
            var argPlaceHolders = new Array(maxArgs).fill("").map(function (v, i) {
                return "$arg" + (i + 1) + "$";
            });
            var originals = {};
            this.state.keys.forEach(function (key) {
                originals[key] = browser.i18n.getMessage(key, argPlaceHolders);
            });
            var items = this.state.keys.filter(function (key) {
                return self.state.search.length == 0 || key.indexOf(self.state.search) >= 0 || self.state.customOrg[key] && self.state.customOrg[key].message.indexOf(self.state.search) >= 0 || originals[key].indexOf(self.state.search) >= 0;
            }).sort().map(function (key) {
                var original = originals[key];
                var custom = self.state.custom[key] || { message: "" };
                return React.createElement(WehTranslationItem, {
                    key: key,
                    tkey: key,
                    custom: custom,
                    original: original,
                    changed: (_this3.state.custom[key] && _this3.state.custom[key].message) !== (_this3.state.customOrg[key] && _this3.state.customOrg[key].message),
                    change: _this3.handleChange
                });
            });
            return React.createElement("div", null, React.createElement("form", { className: "form-horizontal",
                onChange: this.handleChange,
                role: "form" }, React.createElement("div", { className: "form-group", style: { backgroundColor: "#eee", padding: "8px" } }, React.createElement("div", { className: "col-sm-4" }), React.createElement("div", { className: "col-sm-8" }, React.createElement("input", { className: "form-control",
                onChange: this.handleSearchChange,
                placeholder: "Search...",
                type: "text"
            }))), items), React.createElement("div", { className: "text-center" }, React.createElement("br", null), React.createElement("div", { className: "btn-toolbar", style: { display: "inline-block" } }, React.createElement("button", { type: "button",
                onClick: this.handleSave,
                className: "btn btn-primary " + this.saveButtonClass() }, "Save"))));
        }
    }]);

    return WehTranslation;
}(React.Component);