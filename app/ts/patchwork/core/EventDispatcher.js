"use strict";
var EventDispatcher = (function () {
    function EventDispatcher() {
        this._eventListeners = {};
    }
    EventDispatcher.prototype.addEventListener = function (type, callback) {
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
    };
    EventDispatcher.prototype.removeEventListener = function (type, callback) {
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
    };
    EventDispatcher.prototype.dispatchEvent = function (type, data) {
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
    };
    EventDispatcher.prototype.showAllEventListeners = function () {
        console.log(this._eventListeners);
    };
    EventDispatcher.prototype.removeAllEventListeners = function () {
        this._eventListeners = {};
    };
    return EventDispatcher;
}());
exports.__esModule = true;
exports["default"] = EventDispatcher;
//# sourceMappingURL=EventDispatcher.js.map