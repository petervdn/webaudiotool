define([
	'ModuleCategories',
	'AttributeTypes',
	'Utils',
	'ModuleTypes'
], function(
	ModuleCategories,
	AttributeTypes,
	Utils,
	ModuleTypes
){
	var contextName = 'audioContext';

	return {

		getStringForModuleRemoved: function(module)
		{
			return this.createBreadcrumbModuleId(module) + ' = null;';
		},

		getStringForOutputDisconnected: function(module, outputIndex)
		{	
			return this.createBreadcrumbModuleId(module) + '.disconnect(' + outputIndex + ');';
		},

		getStringForInit: function()
		{
			return 'var ' + contextName + ' = new(window.AudioContext || window.webkitAudioContext);';
		},

		getStringForConnectionAdded: function(connection)
		{	
			var sourceName = this.createBreadcrumbModuleId(connection.sourceModule);

			// when transput is -1 there is an output in the root. this will be considered the context destination (input is always 0 in that case)
			if(connection.destinationInputIndex === -1)
			{
				var destinationName = contextName + '.destination';
				var inputIndex = 0;
			}
			else
			{
				// input might be an audioparam
				var audioParam = connection.destinationModule.getAudioParamForInputIndex(connection.destinationInputIndex);
				if(audioParam)
				{
					var destinationName = this.createBreadcrumbModuleId(connection.destinationModule) + '.' + audioParam.id;
				}
				else
				{
					// regular node input
					var destinationName = this.createBreadcrumbModuleId(connection.destinationModule);
					var inputIndex = connection.destinationInputIndex;	
				}
			} 

			var outputIndex = connection.sourceOutputIndex;

			var string = sourceName + 
						   '.connect(' +
				  		 	destinationName + 
				   			', ' +
						   	outputIndex +
						   	(typeof inputIndex !== 'undefined' ? ', ' + inputIndex : '') + // strips out the inputindex part when it's an audioParam
						   	');';
			
			return string;
		},	

		getStringForSetAttribute: function(attribute, module)
		{
			var code;
			switch(attribute.type)
			{
				case AttributeTypes.AUDIO_PARAM:
				{
					code = this.createBreadcrumbModuleId(module) + '.' + attribute.id + '.value = ' + module.getAttributeValue(attribute.id) + ';';
					break;
				}
				case AttributeTypes.OPTION_LIST:
				case AttributeTypes.OPTION_LIST:
				case AttributeTypes.BOOLEAN:
				{
					code = this.createBreadcrumbModuleId(module) + '.' + attribute.id + ' = \'' + module.getAttributeValue(attribute.id) + '\';';
					break;
				}
				default:
				{
					console.warn('Unhandled attribute type: ' + attribute.type);
				}
			}

			return code;
		},

		getStringsForModuleSetAttributes: function(module)
		{
			var code = [];

			if(module.definition.attributes)
			{
				for(var i = 0; i < module.definition.attributes.length; i++)
				{
					code.push(this.getStringForSetAttribute(module.definition.attributes[i], module));
				}
			}
			
			return code;
		},

		getStringsForModuleAdded: function(module)
		{
			var strings = [];
			switch(module.definition.category)
			{
				case ModuleCategories.NATIVE:
				{
					var args = module.args ? module.args.join(',') : '';

					var moduleId = this.createBreadcrumbModuleId(module);
					strings.push('var ' + moduleId + ' = '+ contextName + '.' + module.definition.js + '(' + args + ');');

					if(module.definition.type === ModuleTypes.OSCILLATOR)
					{
						strings.push(moduleId + '.start();');
					}
					break;
				}
				case ModuleCategories.SUBPATCH:
				{
					break;
				}
				default:
				{
					console.warn('Unhandled module category: ' + module.definition.category);
				}
			}

			return strings;
		},

		createBreadcrumbModuleId: function(module)
		{
			// when in a subpatch, creates an id like this: topsubpatch$nestedsubpatch$moduleId

			var breadcrumb = module.createBreadcrumb();
			if(breadcrumb.length > 0)
			{
				return breadcrumb.join('$') + '$' + module.id;
			}
			else
			{
				return module.id;
			}
		},

		getPatchModulesCreationCode: function(patch)
		{
			var code = [];
			for(var i = 0; i < patch.modules.length; i++)
			{
				if(patch.modules[i].definition.category === ModuleCategories.NATIVE)
				{
					code.pushArray(this.getStringsForModuleAdded(patch.modules[i]));				
				}
				else if(patch.modules[i].definition.type === ModuleTypes.SUBPATCH)
				{
					code.pushArray(this.getPatchModulesCreationCode(patch.modules[i].subPatch));
				}
				
			}

			return code;
		},

		getPatchConnectionsCode: function(patch)
		{
			var code = [];
			
			// get all connections in the patch
			var connections = patch.getConnectionsWithNested();

			// get the api connections for those
			var apiConnections = [];
			for(var i = 0; i < connections.length; i++)
			{
				apiConnections.pushArray(connections[i].getApiConnections());
			}

			// get the code for each api connection and avoid duplicates (TODO are there duplicates? and why?)
			if(apiConnections.length > 0)
			{
				var done = [];
				for(var i = 0; i < apiConnections.length; i++)
				{
					var connection = apiConnections[i]; 
					if(!Utils.connectionIsInList(connection, done))
					{
						code.push(this.getStringForConnectionAdded(connection));

						done.push(connection);
					}
				}
			}

			return code;
		},

		getPatchSetAttributesCode: function(patch)
		{
			// loops through all (nested) modules and creates code for every attribute 
			var code = [];
			for(var i = 0; i < patch.modules.length; i++)
			{
				if(patch.modules[i].definition.category === ModuleCategories.NATIVE)
				{
					code.pushArray(this.getStringsForModuleSetAttributes(patch.modules[i]));
				}
				else if(patch.modules[i].definition.type === ModuleTypes.SUBPATCH)
				{
					code.pushArray(this.getPatchSetAttributesCode(patch.modules[i].subPatch));
				}
				
			}

			return code;
		},

		generateCodeForPatch: function(patch)
		{
			var code = '';

			var modulesCode = this.getPatchModulesCreationCode(patch);

			if(modulesCode.length === 0)
			{
				code += '// patch is empty, no code to generate';
				return code;
			}

			code += this.getStringForInit() + '\n\n';

			code += '// create the audio nodes\n';
			code += modulesCode.join('\n') + '\n';
			
			code += '\n';

			// module attribute values (indeed: loops through modules again)
			var attributesCode = this.getPatchSetAttributesCode(patch);
			
			if(attributesCode.length > 0) 
			{
				code += '// set attributes on the nodes\n';
				code += attributesCode.join('\n') + '\n';
			}

			code += '\n';

			// connection creation
			var connectionsCode = this.getPatchConnectionsCode(patch);

			if(connectionsCode.length > 0)
			{
				code += '// connect the nodes\n';
				code += connectionsCode.join('\n') + '\n';
			}

			return code;
		}
	}
});