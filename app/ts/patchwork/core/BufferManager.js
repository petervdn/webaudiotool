"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EventDispatcher_1 = require("./EventDispatcher");
var BufferManagerEvent_1 = require("../event/BufferManagerEvent");
var Buffer_1 = require("./Buffer");
var BufferManager = (function (_super) {
    __extends(BufferManager, _super);
    function BufferManager(audioContext) {
        _super.call(this);
        this.buffers = [];
        this.counter = 0;
        this.audioContext = audioContext;
    }
    BufferManager.prototype.addBuffer = function () {
        var id = 'buffer-' + (++this.counter);
        var buffer = new Buffer_1["default"](id);
        this.buffers.push(buffer);
        this.dispatchEvent(BufferManagerEvent_1["default"].BUFFER_ADDED, { buffer: buffer });
    };
    BufferManager.prototype.removeBuffer = function (buffer) {
    };
    return BufferManager;
}(EventDispatcher_1["default"]));
exports.__esModule = true;
exports["default"] = BufferManager;
