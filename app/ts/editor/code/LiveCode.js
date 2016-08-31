define(["require", "exports", "./CodeGenerator", "../../patchwork/event/PatchEvent", "../../patchwork/event/AudioContextManagerEvent"], function (require, exports, CodeGenerator_1, PatchEvent_1, AudioContextManagerEvent_1) {
    "use strict";
    class LiveCode {
        constructor(patch) {
            this.newLine = '<br>'; // '&#10;' ?
            this.$element = $('#footer .livecode');
            this.$liveCode = this.$element; // todo ????
            this.resetLiveCode();
            // init listeners (listen to both patch and acm) TODO change to all eventlisteners on ACM?
            this.eventHandler = this.handleEvent.bind(this);
            patch.audioContextManager.addEventListener(AudioContextManagerEvent_1.default.MODULE_ADDED, this.eventHandler);
            patch.audioContextManager.addEventListener(AudioContextManagerEvent_1.default.CONNECTION_ADDED, this.eventHandler);
            patch.audioContextManager.addEventListener(AudioContextManagerEvent_1.default.OUTPUT_DISCONNECTED, this.eventHandler);
            patch.addEventListener(PatchEvent_1.default.PATCH_CLEARED, this.eventHandler);
            patch.addEventListener(PatchEvent_1.default.MODULE_ATTRIBUTE_CHANGED, this.eventHandler);
            patch.addEventListener(PatchEvent_1.default.MODULE_REMOVED, this.eventHandler);
        }
        handleEvent(type, data) {
            switch (type) {
                case AudioContextManagerEvent_1.default.MODULE_ADDED:
                    {
                        var strings = CodeGenerator_1.default.getStringsForModuleAdded(data.module);
                        for (var i = 0; i < strings.length; i++)
                            this.addToLiveCode(strings[i]);
                        break;
                    }
                case AudioContextManagerEvent_1.default.CONNECTION_ADDED:
                    {
                        this.addToLiveCode(CodeGenerator_1.default.getStringForConnectionAdded(data.connection));
                        break;
                    }
                case AudioContextManagerEvent_1.default.OUTPUT_DISCONNECTED:
                    {
                        this.addToLiveCode(CodeGenerator_1.default.getStringForOutputDisconnected(data.module, data.outputIndex));
                        break;
                    }
                case PatchEvent_1.default.PATCH_CLEARED:
                    {
                        //this.resetLiveCode();
                        break;
                    }
                case PatchEvent_1.default.MODULE_ATTRIBUTE_CHANGED:
                    {
                        this.addToLiveCode(CodeGenerator_1.default.getStringForSetAttribute(data.attribute, data.module));
                        break;
                    }
                case PatchEvent_1.default.MODULE_REMOVED:
                    {
                        this.addToLiveCode(CodeGenerator_1.default.getStringForModuleRemoved(data.module));
                        break;
                    }
            }
        }
        resetLiveCode() {
            this.$liveCode.html('');
            this.$liveCode.append(CodeGenerator_1.default.getStringForInit() + this.newLine);
        }
        addToLiveCode(code) {
            this.$liveCode.html(this.$liveCode.html() + code + this.newLine);
            // update scrolling
            this.$liveCode[0].scrollTop = this.$liveCode[0].scrollHeight;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = LiveCode;
});
