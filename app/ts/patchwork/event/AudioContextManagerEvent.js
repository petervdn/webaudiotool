"use strict";
var AudioContextManagerEvent = (function () {
    function AudioContextManagerEvent() {
    }
    AudioContextManagerEvent.MODULE_ADDED = 'AudioContextManagerEvent.MODULE_ADDED';
    AudioContextManagerEvent.CONNECTION_ADDED = 'AudioContextManagerEvent.CONNECTION_ADDED';
    AudioContextManagerEvent.OUTPUT_DISCONNECTED = 'AudioContextManagerEvent.OUTPUT_DISCONNECTED';
    AudioContextManagerEvent.PATCH_CLEARED = 'AudioContextManagerEvent.PATCH_CLEARED';
    return AudioContextManagerEvent;
}());
exports.__esModule = true;
exports["default"] = AudioContextManagerEvent;
