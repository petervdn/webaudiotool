	define([
	'ModuleCategories',
	'AttributeTypes',
	'ModuleTypes'
], function(
	ModuleCategories,
	AttributeTypes,
	ModuleTypes
) {

	var modules = [
		{
			'type': ModuleTypes.ANALYSER,
			'label': 'Analyser',
			'category': ModuleCategories.NATIVE,
			'js': 'createAnalyser',
			'attributes': [
				{
					'id': 'fftSize',
					'label_short': 'fft',
					'type': AttributeTypes.OPTION_LIST,
					'options': [32,64,128,256,512,1024,2048]
				},
				{
					'id': 'frequencyBinCount',
					'label_short': 'fbc',
					'type': AttributeTypes.READ_ONLY
				},
				{
					'id': 'maxDecibels',
					'label_short': 'max',
					'type': AttributeTypes.FLOAT
				},
				{
					'id': 'minDecibels',
					'label_short': 'min',
					'type': AttributeTypes.FLOAT
				},
				{
					'id': 'smoothingTimeConstant',
					'label_short': 'smth',
					'type': AttributeTypes.FLOAT,
					'min': 0,
					'max': 1
				}
			]
		},
		{
			'type': ModuleTypes.BIQUAD_FILTER,
			'label': 'Biquad Filter',
			'category': ModuleCategories.NATIVE,
			'js': 'createBiquadFilter',
			'attributes': [
				{
					'id': 'frequency',
					'label_short': 'frq',
					'type':  AttributeTypes.AUDIO_PARAM,
					'min': 0,
					'max': 22000
				},
				{
					'id': 'Q',
					'label_short': 'q',
					'type': AttributeTypes.AUDIO_PARAM,
					'min': 0,
					'max': 10
				},
				{
					'id': 'gain',
					'label_short': 'gain',
					'type': AttributeTypes.AUDIO_PARAM,
					'min': 0,
					'max': 10
				},
				{
					'id': 'type',
					'label_short': 'type',
					'type': AttributeTypes.OPTION_LIST,
					'options': ['lowpass','highpass','bandpass', 'lowshelf','highshelf','peaking','notch','allpass']
				}
			]	
		},
		{
			'type': ModuleTypes.BUFFER_SOURCE,
			'label': 'BufferSource',
			'category': ModuleCategories.NATIVE,
			'js': 'createBufferSource',
			'att': {
					'id': 'detune',
					'type': AttributeTypes.AUDIO_PARAM,
					'label_short': 'dtn'
				},
			'attributes': [
				{
					'id': 'buffer',
					'type': AttributeTypes.BUFFER
				},
				
				{
					'id': 'loop',	
					'type': AttributeTypes.BOOLEAN
				},
				{
					'id': 'loopEnd',
					'type': AttributeTypes.FLOAT
				},
				{
					'id': 'loopStart',
					'type': AttributeTypes.FLOAT
				},
				{
					'id': 'playbackRate',
					'type': AttributeTypes.AUDIO_PARAM,
					'label_short': 'pbr'
				},
			]	
		},
		{
			'type': ModuleTypes.CHANNEL_MERGER,
			'label': 'Channel Merger',
			'category': ModuleCategories.NATIVE,
			'js': 'createChannelMerger',
			'args': [
				{
					'label': 'Number of inputs (1-32)'
				}
			]
		},
		{
			'type': ModuleTypes.CHANNEL_SPLITTER,
			'label': 'Channel Splitter',
			'category': ModuleCategories.NATIVE,
			'js': 'createChannelSplitter',
			'args': [
				{
					'label': 'Number of outputs (1-32)'
				}
			]
			
		},
		{
			'type': ModuleTypes.CONVOLVER,
			'label': 'Convolver',
			'category': ModuleCategories.NATIVE,
			'js': 'createConvolver',
			'attributes': [
				{
					'id': 'buffer',
					'type': AttributeTypes.BUFFER
				},
				{
					'id': 'normalize',
					'label_short': 'norm',
					'type': AttributeTypes.BOOLEAN
				}
			]	
		},
		{
			'type': ModuleTypes.DELAY,
			'label': 'Delay',
			'category': ModuleCategories.NATIVE,
			'js': 'createDelay',
			'attributes': [
				{
					'id': 'delayTime',
					'label_short': 'dlay',
					'type':  AttributeTypes.AUDIO_PARAM,
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
			'type': ModuleTypes.COMPRESSOR,
			'label': 'Compressor',
			'category': ModuleCategories.NATIVE,
			'js': 'createDynamicsCompressor',
			'attributes': [
				{
					'id': 'attack',
					'label_short': 'attk',
					'type': AttributeTypes.AUDIO_PARAM
				},
				{
					'id': 'knee',
					'label_short': 'knee',
					'type': AttributeTypes.AUDIO_PARAM
				},
				{
					'id': 'ratio',
					'label_short': 'rtio',
					'type': AttributeTypes.AUDIO_PARAM
				},
				{
					'id': 'release',
					'label_short': 'rels',
					'type': AttributeTypes.AUDIO_PARAM
				},
				{
					'id': 'threshold',	
					'label_short': 'trsh',
					'type': AttributeTypes.AUDIO_PARAM
				},
				{
					'id': 'reduction',
					'label_short': 'redu',
					'type': AttributeTypes.READ_ONLY
				}
			]
		},
		{
			'type': ModuleTypes.GAIN,
			'label': 'Gain',
			'category': ModuleCategories.NATIVE,
			'js': 'createGain',
			'attributes': [
				{
					'id': 'gain',
					'label_short': 'gain',
					'type': AttributeTypes.AUDIO_PARAM,
					'min': -10,
					'max': 10
				},
			]
		},
		{
			'type': ModuleTypes.MEDIA_ELEMENT_SOURCE,
			'label': 'Media Element Source',
			'xcategory': ModuleCategories.NATIVE,
			'js': 'createMediaElementSource',
			'args': [
				{
					'label': 'Media element selector'
				}
			]
		},
		{
			'type': ModuleTypes.MEDIA_STREAM_DESTINATION,
			'label': 'Media Stream Destination',
			'xcategory': ModuleCategories.NATIVE,
			'js': 'createMediaStreamDestination',
			'attributes': [
				{
					'id': 'stream',
					'label_short': 'strm',
					'type': AttributeTypes.STREAM
				}
			]
		},
		{
			'type': ModuleTypes.OSCILLATOR,
			'category': ModuleCategories.NATIVE,
			'label': 'Oscillator',
			'js': 'createOscillator',
			'attributes': [
				{
					'id': 'frequency',
					'label_short': 'freq',
					'type': AttributeTypes.AUDIO_PARAM,
					'min': 0,
					'max': 20000
				},
				{
					'id': 'detune',
					'label_short': 'dtn',
					'type':  AttributeTypes.AUDIO_PARAM,
					'min': -10,
					'max': 10
				},
				{
					'id': 'type',
					'label_short': 'type',
					'type':  AttributeTypes.OPTION_LIST,
					'options': ['sine','square','sawtooth','triangle']
				}
			]	
		},
		{
			'type': ModuleTypes.SPATIALIZER,
			'label': 'Spatializer',
			'category': ModuleCategories.NATIVE,
			'js': 'createPanner',
			'attributes': [
				{
					'id': 'panningModel',
					'type': AttributeTypes.OPTION_LIST,
					'options': ['equalpower', 'HRTF']
				},
				{
					'id': 'distanceModel',
					'type': AttributeTypes.OPTION_LIST,
					'options': ['linear', 'inverse', 'exponential']
				},
				{
					'id': 'refDistance',
					'type': AttributeTypes.FLOAT
				},
				{
					'id': 'maxDistance',
					'type': AttributeTypes.FLOAT
				},
				{
					'id': 'rolloffFactor',
					'type': AttributeTypes.FLOAT
				},
				{
					'id': 'coneInnerAngle',
					'type': AttributeTypes.FLOAT
				},
				{
					'id': 'coneOuterAngle',
					'type': AttributeTypes.FLOAT
				},
				{
					'id': 'coneOuterGain',
					'type': AttributeTypes.FLOAT
				}
			]
		},
		{
			'type': ModuleTypes.STEREO_PANNER,
			'label': 'Panner',
			'category': ModuleCategories.NATIVE,
			'js': 'createStereoPanner',
			'attributes': [
				{
					'id': 'pan',
					'type': AttributeTypes.AUDIO_PARAM,
					'label_short': 'pan'
				}
			]
		},
		{
			'type': ModuleTypes.WAVE_SHAPER,
			'label': 'Wave Shaper',
			'category': ModuleCategories.NATIVE,
			'js': 'createWaveShaper',
			'attributes': [
				{
					'id': 'oversample',
					'type': AttributeTypes.OPTION_LIST,
					'options': ['none', '2x', '4x']
				},
				{
					'id': 'curve',
					'type': AttributeTypes.FLOAT_ARRAY	
				}
			]
		},
		

		{
			'type': ModuleTypes.INPUT,
			'label': 'Input',
			'category': ModuleCategories.PROXY,
			'in': 0,
			'out': 1
		},

		{
			'type': ModuleTypes.OUTPUT,
			'label': 'Output',
			'category': ModuleCategories.PROXY,
			'in': 1,
			'out': 0
		},
		{
			'type': ModuleTypes.SUBPATCH,
			'label': 'Subpatch',
			'category': ModuleCategories.PROXY
		}
	]

	return {
		modules: modules,

		// findAttribute: function(moduleType, attributeId)
		// {
		// 	var moduleDefinition = this.findByType(moduleType);

		// 	if(moduleDefinition && moduleDefinition.attributes)
		// 	{
		// 		for(var i = 0; i < moduleDefinition.attributes.length; i++)
		// 		{
		// 			if(moduleDefinition.attributes[i].id === attributeId) return moduleDefinition.attributes[i];
		// 		}
		// 	}

		// 	return null;
		// },

		findByType: function(type)
		{
			for(var i = 0; i < modules.length; i++)
			{
				if(modules[i].type === type) return modules[i];
			}

			return null;
		},

		findByCategory: function(category)
		{
			var results = [];

			for(var i = 0; i < modules.length; i++)
			{
				if(modules[i].category === category) results.push(modules[i]);
			}

			return results;
		}
	}
});