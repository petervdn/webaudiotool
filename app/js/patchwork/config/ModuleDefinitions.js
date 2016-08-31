define(["require", "exports", "../enum/ModuleTypes", "../enum/ModuleCategories", "../enum/AttributeTypes"], function (require, exports, ModuleTypes_1, ModuleCategories_1, AttributeTypes_1) {
    "use strict";
    class ModuleDefinitions {
        static findByType(type) {
            for (var i = 0; i < ModuleDefinitions._MODULES.length; i++) {
                if (ModuleDefinitions._MODULES[i].type === type)
                    return ModuleDefinitions._MODULES[i];
            }
            return null;
        }
        static findByCategory(category) {
            var results = [];
            for (var i = 0; i < ModuleDefinitions._MODULES.length; i++) {
                if (ModuleDefinitions._MODULES[i].category === category)
                    results.push(ModuleDefinitions._MODULES[i]);
            }
            return results;
        }
    }
    ModuleDefinitions._MODULES = [
        {
            'type': ModuleTypes_1.default.ANALYSER,
            'label': 'Analyser',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createAnalyser',
            'attributes': [
                {
                    'id': 'fftSize',
                    'label_short': 'fft',
                    'type': AttributeTypes_1.default.OPTION_LIST,
                    'options': [32, 64, 128, 256, 512, 1024, 2048]
                },
                {
                    'id': 'frequencyBinCount',
                    'label_short': 'fbc',
                    'type': AttributeTypes_1.default.READ_ONLY
                },
                {
                    'id': 'maxDecibels',
                    'label_short': 'max',
                    'type': AttributeTypes_1.default.FLOAT
                },
                {
                    'id': 'minDecibels',
                    'label_short': 'min',
                    'type': AttributeTypes_1.default.FLOAT
                },
                {
                    'id': 'smoothingTimeConstant',
                    'label_short': 'smth',
                    'type': AttributeTypes_1.default.FLOAT,
                    'min': 0,
                    'max': 1
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.BIQUAD_FILTER,
            'label': 'Biquad Filter',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createBiquadFilter',
            'attributes': [
                {
                    'id': 'frequency',
                    'label_short': 'frq',
                    'type': AttributeTypes_1.default.AUDIO_PARAM,
                    'min': 0,
                    'max': 22000
                },
                {
                    'id': 'Q',
                    'label_short': 'q',
                    'type': AttributeTypes_1.default.AUDIO_PARAM,
                    'min': 0,
                    'max': 10
                },
                {
                    'id': 'gain',
                    'label_short': 'gain',
                    'type': AttributeTypes_1.default.AUDIO_PARAM,
                    'min': 0,
                    'max': 10
                },
                {
                    'id': 'type',
                    'label_short': 'type',
                    'type': AttributeTypes_1.default.OPTION_LIST,
                    'options': ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.BUFFER_SOURCE,
            'label': 'BufferSource',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createBufferSource',
            'att': {
                'id': 'detune',
                'type': AttributeTypes_1.default.AUDIO_PARAM,
                'label_short': 'dtn'
            },
            'attributes': [
                {
                    'id': 'buffer',
                    'type': AttributeTypes_1.default.BUFFER
                },
                {
                    'id': 'loop',
                    'type': AttributeTypes_1.default.BOOLEAN
                },
                {
                    'id': 'loopEnd',
                    'type': AttributeTypes_1.default.FLOAT
                },
                {
                    'id': 'loopStart',
                    'type': AttributeTypes_1.default.FLOAT
                },
                {
                    'id': 'playbackRate',
                    'type': AttributeTypes_1.default.AUDIO_PARAM,
                    'label_short': 'pbr'
                },
            ]
        },
        {
            'type': ModuleTypes_1.default.CHANNEL_MERGER,
            'label': 'Channel Merger',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createChannelMerger',
            'args': [
                {
                    'label': 'Number of inputs (1-32)'
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.CHANNEL_SPLITTER,
            'label': 'Channel Splitter',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createChannelSplitter',
            'args': [
                {
                    'label': 'Number of outputs (1-32)'
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.CONVOLVER,
            'label': 'Convolver',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createConvolver',
            'attributes': [
                {
                    'id': 'buffer',
                    'type': AttributeTypes_1.default.BUFFER
                },
                {
                    'id': 'normalize',
                    'label_short': 'norm',
                    'type': AttributeTypes_1.default.BOOLEAN
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.DELAY,
            'label': 'Delay',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createDelay',
            'attributes': [
                {
                    'id': 'delayTime',
                    'label_short': 'dlay',
                    'type': AttributeTypes_1.default.AUDIO_PARAM,
                    'min': 0,
                    'max': 5
                }
            ],
            'args': [
                {
                    'label': 'Max delaytime in seconds (0-180)'
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.COMPRESSOR,
            'label': 'Compressor',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createDynamicsCompressor',
            'attributes': [
                {
                    'id': 'attack',
                    'label_short': 'attk',
                    'type': AttributeTypes_1.default.AUDIO_PARAM
                },
                {
                    'id': 'knee',
                    'label_short': 'knee',
                    'type': AttributeTypes_1.default.AUDIO_PARAM
                },
                {
                    'id': 'ratio',
                    'label_short': 'rtio',
                    'type': AttributeTypes_1.default.AUDIO_PARAM
                },
                {
                    'id': 'release',
                    'label_short': 'rels',
                    'type': AttributeTypes_1.default.AUDIO_PARAM
                },
                {
                    'id': 'threshold',
                    'label_short': 'trsh',
                    'type': AttributeTypes_1.default.AUDIO_PARAM
                },
                {
                    'id': 'reduction',
                    'label_short': 'redu',
                    'type': AttributeTypes_1.default.READ_ONLY
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.GAIN,
            'label': 'Gain',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createGain',
            'attributes': [
                {
                    'id': 'gain',
                    'label_short': 'gain',
                    'type': AttributeTypes_1.default.AUDIO_PARAM,
                    'min': -10,
                    'max': 10
                },
            ]
        },
        {
            'type': ModuleTypes_1.default.MEDIA_ELEMENT_SOURCE,
            'label': 'Media Element Source',
            'xcategory': ModuleCategories_1.default.NATIVE,
            'js': 'createMediaElementSource',
            'args': [
                {
                    'label': 'Media element selector'
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.MEDIA_STREAM_DESTINATION,
            'label': 'Media Stream Destination',
            'xcategory': ModuleCategories_1.default.NATIVE,
            'js': 'createMediaStreamDestination',
            'attributes': [
                {
                    'id': 'stream',
                    'label_short': 'strm',
                    'type': AttributeTypes_1.default.STREAM
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.OSCILLATOR,
            'category': ModuleCategories_1.default.NATIVE,
            'label': 'Oscillator',
            'js': 'createOscillator',
            'attributes': [
                {
                    'id': 'frequency',
                    'label_short': 'freq',
                    'type': AttributeTypes_1.default.AUDIO_PARAM,
                    'min': 0,
                    'max': 20000
                },
                {
                    'id': 'detune',
                    'label_short': 'dtn',
                    'type': AttributeTypes_1.default.AUDIO_PARAM,
                    'min': -10,
                    'max': 10
                },
                {
                    'id': 'type',
                    'label_short': 'type',
                    'type': AttributeTypes_1.default.OPTION_LIST,
                    'options': ['sine', 'square', 'sawtooth', 'triangle']
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.SPATIALIZER,
            'label': 'Spatializer',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createPanner',
            'attributes': [
                {
                    'id': 'panningModel',
                    'type': AttributeTypes_1.default.OPTION_LIST,
                    'options': ['equalpower', 'HRTF']
                },
                {
                    'id': 'distanceModel',
                    'type': AttributeTypes_1.default.OPTION_LIST,
                    'options': ['linear', 'inverse', 'exponential']
                },
                {
                    'id': 'refDistance',
                    'type': AttributeTypes_1.default.FLOAT
                },
                {
                    'id': 'maxDistance',
                    'type': AttributeTypes_1.default.FLOAT
                },
                {
                    'id': 'rolloffFactor',
                    'type': AttributeTypes_1.default.FLOAT
                },
                {
                    'id': 'coneInnerAngle',
                    'type': AttributeTypes_1.default.FLOAT
                },
                {
                    'id': 'coneOuterAngle',
                    'type': AttributeTypes_1.default.FLOAT
                },
                {
                    'id': 'coneOuterGain',
                    'type': AttributeTypes_1.default.FLOAT
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.STEREO_PANNER,
            'label': 'Panner',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createStereoPanner',
            'attributes': [
                {
                    'id': 'pan',
                    'type': AttributeTypes_1.default.AUDIO_PARAM,
                    'label_short': 'pan'
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.WAVE_SHAPER,
            'label': 'Wave Shaper',
            'category': ModuleCategories_1.default.NATIVE,
            'js': 'createWaveShaper',
            'attributes': [
                {
                    'id': 'oversample',
                    'type': AttributeTypes_1.default.OPTION_LIST,
                    'options': ['none', '2x', '4x']
                },
                {
                    'id': 'curve',
                    'type': AttributeTypes_1.default.FLOAT_ARRAY
                }
            ]
        },
        {
            'type': ModuleTypes_1.default.INPUT,
            'label': 'Input',
            'category': ModuleCategories_1.default.PROXY,
            'in': 0,
            'out': 1
        },
        {
            'type': ModuleTypes_1.default.OUTPUT,
            'label': 'Output',
            'category': ModuleCategories_1.default.PROXY,
            'in': 1,
            'out': 0
        },
        {
            'type': ModuleTypes_1.default.SUBPATCH,
            'label': 'Subpatch',
            'category': ModuleCategories_1.default.PROXY
        }
    ];
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ModuleDefinitions;
});
