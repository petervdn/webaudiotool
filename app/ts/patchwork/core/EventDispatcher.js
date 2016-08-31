define(["require", "exports"], function (require, exports) {
    "use strict";
    class EventDispatcher {
        constructor() {
            this._eventListeners = {};
        }
        addEventListener(type, callback) {
            if (typeof type === 'undefined') {
                console.error('Type is undefined, cannot add listener');
            }
            else if (typeof callback === 'undefined') {
                console.error('Callback is undefined, cannot add listener');
            }
            else {
                if (!this._eventListeners[type])
                    this._eventListeners[type] = [];
                this._eventListeners[type].push(callback);
            }
        }
        removeEventListener(type, callback) {
            if (typeof type === 'undefined') {
                console.error('Type is undefined, cannot remove listener');
            }
            else {
                if (this._eventListeners[type]) {
                    var index = this._eventListeners[type].indexOf(callback);
                    if (index >= 0) {
                        this._eventListeners[type].splice(index, 1);
                    }
                }
            }
        }
        dispatchEvent(type, data) {
            if (typeof type === 'undefined') {
                console.error('Type is undefined, cannot dispatch event', this.constructor);
            }
            else {
                if (this._eventListeners[type]) {
                    var len = this._eventListeners[type].length; // TODO WTFFFFF
                    for (var i = 0; i < len; i++) {
                        this._eventListeners[type][i](type, data);
                    }
                }
            }
        }
        showAllEventListeners() {
            console.log(this._eventListeners);
        }
        removeAllEventListeners() {
            this._eventListeners = {};
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = EventDispatcher;
});
