define(["require", "exports", "./EventDispatcher", "../event/BufferManagerEvent", "./Buffer"], function (require, exports, EventDispatcher_1, BufferManagerEvent_1, Buffer_1) {
    "use strict";
    class BufferManager extends EventDispatcher_1.default {
        constructor(audioContext) {
            super();
            this.buffers = [];
            this.counter = 0;
            this.audioContext = audioContext;
        }
        addBuffer() {
            var id = 'buffer-' + (++this.counter);
            var buffer = new Buffer_1.default(id);
            this.buffers.push(buffer);
            this.dispatchEvent(BufferManagerEvent_1.default.BUFFER_ADDED, { buffer: buffer });
        }
        removeBuffer(buffer) {
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BufferManager;
});
