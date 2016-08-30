"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FooterEvent_1 = require("./event/FooterEvent");
var Tracking_1 = require("./net/Tracking");
var EventDispatcher_1 = require("../patchwork/core/EventDispatcher");
var Footer = (function (_super) {
    __extends(Footer, _super);
    function Footer() {
        _super.call(this);
        this.$element = $('#footer');
        // init footer
        this.$breadcrumb = this.$element.find('.breadcrumb');
        this.$breadcrumb.on('click', function (event) {
            if ($(event.target).is('a')) {
                // user clicked a link in breadcrumb
                var id = $(event.target).attr('data-id');
                this.dispatchEvent(FooterEvent_1["default"].BREADCRUMB_CLICK, { id: id });
            }
        }.bind(this));
        // init some buttons
        this.$element.find('a.to_code').click(function () {
            this.dispatchEvent(FooterEvent_1["default"].GENERATE_CODE);
        }.bind(this));
        this.$element.find('a.help').click(function () {
            this.dispatchEvent(FooterEvent_1["default"].HELP);
        }.bind(this));
        this.$element.find('a.share').click(function () {
            this.dispatchEvent(FooterEvent_1["default"].SHARE);
        }.bind(this));
        this.$element.find('a.twitter').click(function () {
            Tracking_1["default"].trackEvent('click_out', 'twitter');
        }.bind(this));
    }
    Footer.prototype.setBreadcrumb = function (patch) {
        var list = patch.createParentList();
        var links = ['<a href="#">root</a>'];
        var usedIds = [];
        for (var i = 0; i < list.length; i++) {
            var subPatchId = list[i];
            usedIds.push(subPatchId);
            links.push('<a href="#" data-id="' + usedIds.join('$') + '">' + subPatchId + '</a>');
        }
        this.$breadcrumb.html('Now viewing: ' + links.join(' &#8594 '));
    };
    return Footer;
}(EventDispatcher_1["default"]));
exports.__esModule = true;
exports["default"] = Footer;
