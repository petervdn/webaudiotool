define(["require", "exports", "./event/FooterEvent", "./net/Tracking", "../patchwork/core/EventDispatcher"], function (require, exports, FooterEvent_1, Tracking_1, EventDispatcher_1) {
    "use strict";
    class Footer extends EventDispatcher_1.default {
        constructor() {
            super();
            this.$element = $('#footer');
            // init footer
            this.$breadcrumb = this.$element.find('.breadcrumb');
            this.$breadcrumb.on('click', function (event) {
                if ($(event.target).is('a')) {
                    // user clicked a link in breadcrumb
                    var id = $(event.target).attr('data-id');
                    this.dispatchEvent(FooterEvent_1.default.BREADCRUMB_CLICK, { id: id });
                }
            }.bind(this));
            // init some buttons
            this.$element.find('a.to_code').click(function () {
                this.dispatchEvent(FooterEvent_1.default.GENERATE_CODE);
            }.bind(this));
            this.$element.find('a.help').click(function () {
                this.dispatchEvent(FooterEvent_1.default.HELP);
            }.bind(this));
            this.$element.find('a.share').click(function () {
                this.dispatchEvent(FooterEvent_1.default.SHARE);
            }.bind(this));
            this.$element.find('a.twitter').click(function () {
                Tracking_1.default.trackEvent('click_out', 'twitter');
            }.bind(this));
        }
        setBreadcrumb(patch) {
            var list = patch.createParentList();
            var links = ['<a href="#">root</a>'];
            var usedIds = [];
            for (var i = 0; i < list.length; i++) {
                var subPatchId = list[i];
                usedIds.push(subPatchId);
                links.push('<a href="#" data-id="' + usedIds.join('$') + '">' + subPatchId + '</a>');
            }
            this.$breadcrumb.html('Now viewing: ' + links.join(' &#8594 '));
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Footer;
});
