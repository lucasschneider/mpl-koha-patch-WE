"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Link = function (_React$Component) {
    _inherits(Link, _React$Component);

    function Link(props) {
        _classCallCheck(this, Link);

        var _this = _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).call(this, props));

        _this.handleClick = _this.handleClick.bind(_this);
        return _this;
    }

    _createClass(Link, [{
        key: "handleClick",
        value: function handleClick() {
            weh.post({
                type: this.props.messageType
            });
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement("a", { onClick: this.handleClick }, weh._(this.props.label));
        }
    }]);

    return Link;
}(React.Component);

ReactDOM.render(React.createElement("div", null, React.createElement("div", { className: "panel" }, React.createElement("h1", null, "Quick Links"), React.createElement("ul", null, React.createElement("li", null, React.createElement("a", { href: "http://scls-staff.kohalibrary.com/cgi-bin/koha/circ/returns.pl", target: "_blank" }, "Koha\u2014Checkin")), React.createElement("li", null, React.createElement("a", { href: "http://scls-staff.kohalibrary.com/cgi-bin/koha/circ/circulation.pl", target: "_blank" }, "Koha\u2014Checkout")), React.createElement("li", null, React.createElement("a", { href: "http://factfinder.census.gov/faces/nav/jsf/pages/searchresults.xhtml?refresh=t", target: "_blank" }, "American Fact Finder")), React.createElement("li", null, React.createElement("a", { href: "http://madisonpubliclibrary.org", target: "_blank" }, "MPL Home Page")), React.createElement("li", null, React.createElement("a", { href: "http://www.mplnet.org", target: "_blank" }, "MPLnet")), React.createElement("li", null, React.createElement("a", { href: "http://www.madisonpubliclibrary.org/research/referenc2", target: "_blank" }, "MPL Reference Tools"))), React.createElement("h1", null, "Tools"), React.createElement("ul", null, React.createElement("li", null, React.createElement(Link, { messageType: "addNote", label: "addNote" })), React.createElement("li", null, React.createElement(Link, { messageType: "addLostCardNote", label: "addLostCardNote" })), React.createElement("li", null, React.createElement(Link, { messageType: "addr2PSTAT", label: "addr2PSTAT" })), React.createElement("li", null, React.createElement(Link, { messageType: "calendarAnnouncements", label: "calendarAnnouncements" })), React.createElement("li", null, React.createElement("a", { href: "https://github.com/lucasschneider/mpl-koha-patch-WE", target: "_blank" }, "View Source on GitHub")))), React.createElement("div", { className: "toolbar" }, React.createElement(Link, { messageType: "open-settings", label: "settings" }))), document.getElementById('root'));