"use strict";
var ModuleTypes = (function () {
    function ModuleTypes() {
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
    return ModuleTypes;
}());
exports.__esModule = true;
exports["default"] = ModuleTypes;
