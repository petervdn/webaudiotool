"use strict";
var BufferManagerEvent_1 = require("../../patchwork/event/BufferManagerEvent");
var VisualBuffer_1 = require("./VisualBuffer");
var BufferList = (function () {
    function BufferList(bufferManager) {
        this.$element = $('#bufferlist');
        this.bufferManager = bufferManager;
        // listen to events
        this.bufferManager.addEventListener(BufferManagerEvent_1["default"].BUFFER_ADDED, this.handleBufferManagerEvent.bind(this)); // todo fix so we can remove
        // add new buffer
        $('a.new', this.$element).click(function () {
            this.bufferManager.addBuffer();
        }.bind(this));
        this.$list = $('ul.list', this.$element);
    }
    BufferList.prototype.handleBufferManagerEvent = function (type, data) {
        switch (type) {
            case BufferManagerEvent_1["default"].BUFFER_ADDED:
                {
                    this.addVisualBuffer(data.buffer);
                    break;
                }
            case BufferManagerEvent_1["default"].BUFFER_REMOVED:
                {
                    // this.update(); todo!?
                    break;
                }
            default:
                {
                    console.error('Unhandled event: ' + type);
                }
        }
    };
    BufferList.prototype.addVisualBuffer = function (buffer) {
        var visualBuffer = new VisualBuffer_1["default"](buffer);
        var $li = $('<li>');
        $li.append(visualBuffer.$element);
        this.$list.append($li);
    };
    return BufferList;
}());
exports.__esModule = true;
exports["default"] = BufferList;
