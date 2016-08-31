import ModuleEvent from "../event/ModuleEvent";
import ModuleCategories from "../enum/ModuleCategories";
import EventDispatcher from "./EventDispatcher";
import Patch from "./Patch";
import ModuleTypes from "../enum/ModuleTypes";
import Connection from "./Connection";
import AttributeTypes from "../enum/AttributeTypes";

class Module extends EventDispatcher
{
	public parentPatch:Patch;
	public definition:any; // todo type
	public id:any;
	public audioNode:AudioNode;
	public args:Array<any>;
	
	public position:any;
	public subPatch:Patch;
	
	constructor(parentPatch, definition, id, args)
	{
		super();

		this.parentPatch = parentPatch;
		this.definition = definition;
		this.id = id;
		this.audioNode = null; // set later by the audiocontext manager (listens to added modules)
		this.args = args; // store constructor arguments, so we can save them in the json

		this.position = null; // will be set if a visualmodule is created for it
		this.subPatch = null; // will be filled if it's a subpatch
	}

	public getAttributeValue(attributeId:string):any
	{
		// first get the attribute
		var attribute = this.getAttributeById(attributeId);

		var value;
		if(attribute)
		{
			switch(attribute.type)
			{
				case AttributeTypes.AUDIO_PARAM:
				{
					value = this.audioNode[attribute.id].value;
					break;
				}
				case AttributeTypes.OPTION_LIST:
				case AttributeTypes.FLOAT:
				{
					value = this.audioNode[attribute.id];
					break;
				}
				default:
				{
					console.warn('Unhandled attribute type: ' + attribute.type);
				}
			}

			return value;
		}
		else
		{
			console.error('No attribute found with id ' + attributeId + ' in module ' + this.definition.type);
		}
	}

	public setAudioNode(audioNode:AudioNode):void
	{
		this.audioNode = audioNode;
	}

	public getAttributeById (attributeId):any // todo type
	{
		if(this.definition.attributes)
		{
			for(var i = 0; i < this.definition.attributes.length; i++)
			{
				var attribute = this.definition.attributes[i];

				if(attribute.id === attributeId) return attribute;
			}
		}

		return null;
	}

	public setAttributeValue (attributeId:string, value:any):any
	{
		var attribute = this.getAttributeById(attributeId);
		if(attribute)
		{
			switch(attribute.type)
			{
				case AttributeTypes.AUDIO_PARAM:
				{

					this.audioNode[attributeId].value = value;

					this.dispatchEvent(ModuleEvent.ATTRIBUTE_CHANGED, {module: this, attribute: attribute});

					break;
				}
				case AttributeTypes.OPTION_LIST:
				case AttributeTypes.FLOAT:
				{
					this.audioNode[attributeId] = value;

					this.dispatchEvent(ModuleEvent.ATTRIBUTE_CHANGED, {module: this, attribute: attribute});

					break;
				}
				default:
				{
					console.error('Unhandled attribute type: ' + attribute.type);

					return;
				}
			}
		}
		else
		{
			console.error('Attribute not found: ' + attributeId);
		}
	}

	public inputIndexIsValid(index:any):boolean
	{
		return !isNaN(index) && index < this.getNumberOfInputs() ? true : false;
	}

	public outputIndexIsValid(index):boolean
	{
		return !isNaN(index) && index < this.getNumberOfOutputs() ? true : false;
	}

	public getNumberOfInputs():number
	{
		return this.getNumberOfTransputs().in;
	}

	public getNumberOfOutputs():number
	{
		return this.getNumberOfTransputs().out;
	}

	public setAttributesByLoadedObject(moduleObject:any):void
	{
		if(!moduleObject.attributes) return;

		for(var i = 0; i < moduleObject.attributes.length; i++)
		{
			var attribute = moduleObject.attributes[i];
			this.setAttributeValue(attribute.id, attribute.value);
		}
	}

	public getNumberOfTransputs():any
	{
		// TODO when loading a patch, this function gets called A LOT of times...why?

		var numberOfInputs, numberOfOutputs;

		switch(this.definition.category)
		{
			case ModuleCategories.NATIVE:
			{
				//console.log(this);
				numberOfInputs = this.audioNode.numberOfInputs + this.getAudioParams().length;
				numberOfOutputs = this.audioNode.numberOfOutputs
				break;
			}
			case ModuleCategories.PROXY:
			{
				if(this.definition.type === ModuleTypes.SUBPATCH)
				{
					numberOfInputs = this.subPatch.getInputs().length;
					numberOfOutputs = this.subPatch.getOutputs().length;
				}
				else
				{
					numberOfInputs = this.definition.in;
					numberOfOutputs = this.definition.out;
				}

				break;
			}
			default:
			{
				console.error('Unhandled category: ' + this.definition.category);
				return;
			}
		}

		return {in: numberOfInputs, out: numberOfOutputs};
	}

	public getProxyTransputIndex():number
	{
		if(this.definition.type === ModuleTypes.INPUT)
		{
			return this.getProxyInputIndex();
		}
		else if(this.definition.type === ModuleTypes.OUTPUT)
		{
			return this.getProxyOutputIndex();
		}
		else
		{
			console.error('Module doesn\'t have a proxy (not an input or output)');
			return -1;
		}
	}

	/**
	 When called on an input module which is part of a subpatch, this returns the input that goes with it on its subpatch-module.
	 */
	public getProxyInputIndex():number
	{
		if(this.definition.type === ModuleTypes.INPUT)
		{
			// check if module is in rootpatch or a nested subpatch 
			var isRoot = this.parentPatch.parentModule ? false : true;

			if(isRoot)
			{
				// root patch, has no proxy input
				return -1;
			}
			else
			{
				// return the input-index is of this input
				return this.parentPatch.getInputs().indexOf(this);
			}
		}
		else
		{
			console.error('Only modules of type ' + ModuleTypes.INPUT + ' have a proxy input');
			return -1;
		}
	}

	/**
	 When called on an output module which is part of a subpatch, this returns the output that goes with it on its subpatch-module.
	 */
	public getProxyOutputIndex():number
	{
		if(this.definition.type === ModuleTypes.OUTPUT)
		{
			// check if module is in rootpatch or a nested subpatch 
			var isInRoot = this.parentPatch.parentModule ? false : true;

			if(isInRoot)
			{
				// root patch, has no proxy input
				return -1;
			}
			else
			{
				// return the input-index is of this input
				return this.parentPatch.getOutputs().indexOf(this);
			}
		}
		else
		{
			console.error('Only modules of type ' + ModuleTypes.OUTPUT + ' have a proxy output');
			return -1;
		}
	}

	public getNumberOfNodeInputs():number
	{
		return this.getNumberOfInputs() - this.getAudioParams().length;
	}

	public getAudioParamForInputIndex(inputIndex):any
	{
		var numberOfNodeInputs = this.getNumberOfNodeInputs();
		if(inputIndex > numberOfNodeInputs - 1)
		{
			var audioParams = this.getAudioParams();
			var paramIndex = inputIndex - numberOfNodeInputs;
			return audioParams[paramIndex];
		}
		else
		{
			return null;
		}
	}

	public getAudioParams():Array<any>
	{
		var results = [];

		if(this.definition.attributes)
		{
			for(var i = 0; i < this.definition.attributes.length; i++)
			{
				if(this.definition.attributes[i].type === AttributeTypes.AUDIO_PARAM)
				{
					results.push(this.definition.attributes[i]);
				}
			}
		}

		return results;
	}

	public getConnectedModulesByProxy():Array<Module>
	{
		var results = [];
		if(this.definition.type === ModuleTypes.INPUT)
		{
			// module is input, and either in the rootpatch, or in a subpatch, get the index of the proxy input on that subpatch
			var inputIndex = this.getProxyInputIndex();

			if(inputIndex === -1)
			{
				// input is in rootpatch, return empty array (no connected modules)
				return results;
			}
			else
			{
				// input is in subpacth, get the subpatchmodule
				var subPatchModule = this.parentPatch.parentModule;

				// get the connections to that input
				var connections = subPatchModule.getIncomingConnectionsForInput(inputIndex);

				// loop through all connections
				for(var i = 0; i < connections.length; i++)
				{
					var connection = connections[i];

					if(connection.sourceModule.definition.type === ModuleTypes.INPUT)
					{
						// connection is connected to yet another input, call this function again and add the results
						var modules = connection.sourceModule.getConnectedModulesByProxy();
						for(var j = 0; j < modules.length; j++) results.push(modules[j])

					}
					else
					{
						// connection is connected to a regular module, add it to the results
						results.push({module: connection.sourceModule, outputIndex: connection.sourceOutputIndex});
					}
				}
			}

		}
		else if(this.definition.type === ModuleTypes.OUTPUT)
		{
			//if(isInRoot) return results; // todo WHATTTTTT?!
			return results;
		}
		else
		{
			console.error('Only modules of type ' + ModuleTypes.INPUT + ' or ' + ModuleTypes.OUTPUT);
		}

		return results;
	}

	public getIncomingConnectionsForInput(inputIndex):Array<Connection>
	{
		var results = [];
		for(var i = 0; i < this.parentPatch.connections.length; i++)
		{
			var connection = this.parentPatch.connections[i];

			if(connection.destinationModule === this && connection.destinationInputIndex === inputIndex) results.push(connection)
		}

		return results;
	}

	public getOutgoingConnectionsForOutput(outputIndex):Array<Connection>
	{
		let results = [];
		for(var i = 0; i < this.parentPatch.connections.length; i++)
		{
			var connection = this.parentPatch.connections[i];

			if(connection.sourceModule === this && connection.sourceOutputIndex === outputIndex) results.push(connection)
		}

		return results;
	}

	public createBreadcrumb():Array<any>
	{
		let results = [];

		var parentModule = this.parentPatch.parentModule;

		while(parentModule)
		{
			results.push(parentModule.id);
			parentModule = parentModule.parentPatch.parentModule;
		}

		return results.reverse();
	}

	public destruct():void
	{
		this.removeAllEventListeners();

		this.parentPatch = null;
		this.definition = null;
		this.id = null;
		this.audioNode = null;
		this.args = null;
	}
}

export default Module;