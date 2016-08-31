"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractOverlayElement_1 = require("./AbstractOverlayElement");
var CodeGenerator_1 = require("./code/CodeGenerator");
var ViewCode = (function (_super) {
    __extends(ViewCode, _super);
    function ViewCode(patch) {
        // init extended setup
        //this.containerId = 'code';
        _super.call(this, 600, 600, 'code');
        // create elements
        this.$container.append($('<h2>', { text: 'Generated code' }));
        this.$code = $('<pre>');
        this.$container.append(this.$code);
    }
    ViewCode.prototype.showFullCode = function (patch) {
        this.$code.html(CodeGenerator_1["default"].generateCodeForPatch(patch));
        this.show();
    };
    return ViewCode;
}(AbstractOverlayElement_1["default"]));
exports.__esModule = true;
exports["default"] = ViewCode;
