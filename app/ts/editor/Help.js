"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractOverlayElement_1 = require("./AbstractOverlayElement");
var Help = (function (_super) {
    __extends(Help, _super);
    function Help(patch) {
        _super.call(this, 300, 300, 'help');
        this.$container.append($('<h2>', { text: 'Help' }));
        this.$container.append($('<ul>', { class: 'help' }).html('<li>Hold alt to drag screen</li><li>Drag from an output to an intput (or the other way around) to create a connection</li><li>Click a connection to remove it</li>'));
    }
    return Help;
}(AbstractOverlayElement_1["default"]));
exports.__esModule = true;
exports["default"] = Help;
//# sourceMappingURL=Help.js.map