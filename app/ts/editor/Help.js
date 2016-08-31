define(["require", "exports", "./AbstractOverlayElement"], function (require, exports, AbstractOverlayElement_1) {
    "use strict";
    class Help extends AbstractOverlayElement_1.default {
        constructor(patch) {
            super(300, 300, 'help');
            this.$container.append($('<h2>', { text: 'Help' }));
            this.$container.append($('<ul>', { class: 'help' }).html('<li>Hold alt to drag screen</li><li>Drag from an output to an intput (or the other way around) to create a connection</li><li>Click a connection to remove it</li>'));
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Help;
});
