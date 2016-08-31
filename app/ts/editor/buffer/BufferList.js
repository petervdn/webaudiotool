define(["require", "exports", "../../patchwork/event/BufferManagerEvent", "./VisualBuffer"], function (require, exports, BufferManagerEvent_1, VisualBuffer_1) {
    "use strict";
    class BufferList {
        constructor(bufferManager) {
            this.$element = $('#bufferlist');
            this.bufferManager = bufferManager;
            // listen to events
            this.bufferManager.addEventListener(BufferManagerEvent_1.default.BUFFER_ADDED, this.handleBufferManagerEvent.bind(this)); // todo fix so we can remove
            // add new buffer
            $('a.new', this.$element).click(function () {
                this.bufferManager.addBuffer();
            }.bind(this));
            this.$list = $('ul.list', this.$element);
        }
        handleBufferManagerEvent(type, data) {
            switch (type) {
                case BufferManagerEvent_1.default.BUFFER_ADDED:
                    {
                        this.addVisualBuffer(data.buffer);
                        break;
                    }
                case BufferManagerEvent_1.default.BUFFER_REMOVED:
                    {
                        // this.update(); todo!?
                        break;
                    }
                default:
                    {
                        console.error('Unhandled event: ' + type);
                    }
            }
        }
        addVisualBuffer(buffer) {
            var visualBuffer = new VisualBuffer_1.default(buffer);
            var $li = $('<li>');
            $li.append(visualBuffer.$element);
            this.$list.append($li);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BufferList;
});
