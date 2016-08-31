define(["require", "exports"], function (require, exports) {
    "use strict";
    class ModuleTypes {
    }
    // native
    ModuleTypes.ANALYSER = 'analyser';
    ModuleTypes.BIQUAD_FILTER = 'biquad';
    ModuleTypes.BUFFER_SOURCE = 'buffersource';
    ModuleTypes.CHANNEL_MERGER = 'channelmerger';
    ModuleTypes.CHANNEL_SPLITTER = 'channelsplitter';
    ModuleTypes.CONVOLVER = 'convolver';
    ModuleTypes.DELAY = 'delay';
    ModuleTypes.COMPRESSOR = 'compressor';
    ModuleTypes.GAIN = 'gain';
    ModuleTypes.MEDIA_ELEMENT_SOURCE = 'elementsource';
    ModuleTypes.MEDIA_STREAM_DESTINATION = 'streamdestination';
    ModuleTypes.OSCILLATOR = 'oscillator';
    ModuleTypes.SPATIALIZER = 'spatializer';
    ModuleTypes.STEREO_PANNER = 'panner';
    ModuleTypes.WAVE_SHAPER = 'waveshaper';
    // proxy
    ModuleTypes.INPUT = 'input';
    ModuleTypes.OUTPUT = 'output';
    ModuleTypes.SUBPATCH = 'sub';
    ModuleTypes.DESTINATION = 'destination';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ModuleTypes;
});
