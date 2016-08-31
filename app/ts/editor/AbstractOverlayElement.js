define(["require", "exports"], function (require, exports) {
    "use strict";
    class AbstractOverlayElement {
        constructor(width, height, containerId) {
            this.$overlay = $('#overlay');
            this.containerId = containerId;
            this.$overlay.click(function (event) {
                if (event.target === this.$overlay[0])
                    this.hide();
            }.bind(this));
            this.$container = $('<div>', { class: 'container ' + containerId });
            this.$container.css({ width: width, height: height, display: 'none' });
            this.$overlay.append(this.$container);
        }
        show() {
            this.$overlay.show();
            this.$overlay.find('.' + this.containerId).show();
            $('body').removeClass('noselect');
        }
        hide() {
            $('body').addClass('noselect');
            this.$overlay.find('.' + this.containerId).hide();
            this.$overlay.hide();
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AbstractOverlayElement;
});
