"use strict";
var CodeGenerator_1 = require("./CodeGenerator");
var PatchEvent_1 = require("../../patchwork/event/PatchEvent");
var AudioContextManagerEvent_1 = require("../../patchwork/event/AudioContextManagerEvent");
var LiveCode = (function () {
    function LiveCode(patch) {
        this.newLine = '<br>'; // '&#10;' ?
        this.$element = $('#footer .livecode');
        this.$liveCode = this.$element; // todo ????
        this.resetLiveCode();
        // init listeners (listen to both patch and acm) TODO change to all eventlisteners on ACM?
        this.eventHandler = this.handleEvent.bind(this);
        patch.audioContextManager.addEventListener(AudioContextManagerEvent_1["default"].MODULE_ADDED, this.eventHandler);
        patch.audioContextManager.addEventListener(AudioContextManagerEvent_1["default"].CONNECTION_ADDED, this.eventHandler);
        patch.audioContextManager.addEventListener(AudioContextManagerEvent_1["default"].OUTPUT_DISCONNECTED, this.eventHandler);
        patch.addEventListener(PatchEvent_1["default"].PATCH_CLEARED, this.eventHandler);
        patch.addEventListener(PatchEvent_1["default"].MODULE_ATTRIBUTE_CHANGED, this.eventHandler);
        patch.addEventListener(PatchEvent_1["default"].MODULE_REMOVED, this.eventHandler);
    }
    LiveCode.prototype.handleEvent = function (type, data) {
        switch (type) {
            case AudioContextManagerEvent_1["default"].MODULE_ADDED:
                {
                    var strings = CodeGenerator_1["default"].getStringsForModuleAdded(data.module);
                    for (var i = 0; i < strings.length; i++)
                        this.addToLiveCode(strings[i]);
                    break;
                }
            case AudioContextManagerEvent_1["default"].CONNECTION_ADDED:
                {
                    this.addToLiveCode(CodeGenerator_1["default"].getStringForConnectionAdded(data.connection));
                    break;
                }
            case AudioContextManagerEvent_1["default"].OUTPUT_DISCONNECTED:
                {
                    this.addToLiveCode(CodeGenerator_1["default"].getStringForOutputDisconnected(data.module, data.outputIndex));
                    break;
                }
            case PatchEvent_1["default"].PATCH_CLEARED:
                {
                    //this.resetLiveCode();
                    break;
                }
            case PatchEvent_1["default"].MODULE_ATTRIBUTE_CHANGED:
                {
                    this.addToLiveCode(CodeGenerator_1["default"].getStringForSetAttribute(data.attribute, data.module));
                    break;
                }
            case PatchEvent_1["default"].MODULE_REMOVED:
                {
                    this.addToLiveCode(CodeGenerator_1["default"].getStringForModuleRemoved(data.module));
                    break;
                }
        }
    };
    LiveCode.prototype.resetLiveCode = function () {
        this.$liveCode.html('');
        this.$liveCode.append(CodeGenerator_1["default"].getStringForInit() + this.newLine);
    };
    LiveCode.prototype.addToLiveCode = function (code) {
        this.$liveCode.html(this.$liveCode.html() + code + this.newLine);
        // update scrolling
        this.$liveCode[0].scrollTop = this.$liveCode[0].scrollHeight;
    };
    return LiveCode;
}());
exports.__esModule = true;
exports["default"] = LiveCode;
//# sourceMappingURL=LiveCode.js.map