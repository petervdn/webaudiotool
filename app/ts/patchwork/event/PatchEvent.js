"use strict";
var PatchEvent = (function () {
    function PatchEvent() {
    }
    PatchEvent.MODULE_ADDED = 'PatchEvent.MODULE_ADDED';
    PatchEvent.MODULE_REMOVED = 'PatchEvent.MODULE_REMOVED';
    PatchEvent.CONNECTION_ADDED = 'PatchEvent.CONNECTION_ADDED';
    PatchEvent.CONNECTION_PRE_REMOVE = 'PatchEvent.CONNECTION_PRE_REMOVE';
    PatchEvent.CONNECTION_POST_REMOVE = 'PatchEvent.CONNECTION_POST_REMOVE';
    PatchEvent.PATCH_CLEARED = 'PatchEvent.PATCH_CLEARED';
    PatchEvent.MODULE_ATTRIBUTE_CHANGED = 'PatchEvent.MODULE_ATTRIBUTE_CHANGED';
    return PatchEvent;
}());
exports.__esModule = true;
exports["default"] = PatchEvent;
