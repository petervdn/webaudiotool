define(["require", "exports"], function (require, exports) {
    "use strict";
    class PatchEvent {
    }
    PatchEvent.MODULE_ADDED = 'PatchEvent.MODULE_ADDED';
    PatchEvent.MODULE_REMOVED = 'PatchEvent.MODULE_REMOVED';
    PatchEvent.CONNECTION_ADDED = 'PatchEvent.CONNECTION_ADDED';
    PatchEvent.CONNECTION_PRE_REMOVE = 'PatchEvent.CONNECTION_PRE_REMOVE';
    PatchEvent.CONNECTION_POST_REMOVE = 'PatchEvent.CONNECTION_POST_REMOVE';
    PatchEvent.PATCH_CLEARED = 'PatchEvent.PATCH_CLEARED';
    PatchEvent.MODULE_ATTRIBUTE_CHANGED = 'PatchEvent.MODULE_ATTRIBUTE_CHANGED';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = PatchEvent;
});
