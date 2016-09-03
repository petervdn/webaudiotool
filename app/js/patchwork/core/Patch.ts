import EventDispatcher from "./EventDispatcher";
import Connection from "./Connection";
import AudioContextManager from "./AudioContextManager";
import BufferManager from "./BufferManager";
import PatchEvent from "../event/PatchEvent";
import ModuleDefinitions from "../config/ModuleDefinitions";
import Module from "./Module";
import ModuleTypes from "../enum/ModuleTypes";
import ModuleEvent from "../event/ModuleEvent";
import IModuleDefinition from "../config/IModuleDefinition";
import IPatchObject from "./IPatchObject";
import IModuleObject from "./IModuleObject";

class Patch extends EventDispatcher
{
	public static ID_COUNT_SEPARATOR = '_'; // todo private?
	public static ID_SUBPATCH_SEPARATOR = '$';

	public modules:Array<Module> = [];
	public parentModule:Module;
	public audioContext:AudioContext;
	public connections:Array<Connection> = [];
	public countsByType:{[type:string]: number} = {};
	public audioContextManager:AudioContextManager;
	public subPatchEventHandler:any;
	public moduleEventHandler:any;
	public bufferManager:BufferManager;
	
	constructor(audioContext:AudioContext, parentModule?:Module)
	{
		super();

		this.parentModule = parentModule;
		this.audioContext = audioContext;

		if(!parentModule)
		{
			// only the root gets a listener, all subpatches bubble their events to here
			this.audioContextManager = new AudioContextManager(this, audioContext);

			// same for buffermanager
			this.bufferManager = new BufferManager(this.audioContext);
		}

		// handlers for events
		this.subPatchEventHandler = this.handleSubPatchEvent.bind(this);
		this.moduleEventHandler = this.handleModuleEvent.bind(this);
	}

	/**
	 * Removes a given connection from the patch.
	 * @param connectionToRemove
     */
	public removeConnection(connectionToRemove:Connection):void
	{
		let index:number = this.connections.indexOf(connectionToRemove);

		if(index >= 0)
		{
			// dispatch event *before* removing, so the ACM can still figure out what connections are involved
			this.dispatchEvent(PatchEvent.CONNECTION_PRE_REMOVE, {connection: connectionToRemove});

			this.connections.splice(index, 1);

			// editor redraws from post event
			this.dispatchEvent(PatchEvent.CONNECTION_POST_REMOVE, {connection: connectionToRemove});

			connectionToRemove.destruct();
		}
		else
		{
			console.error('Connection not found', connectionToRemove);
		}
	}

	/**
	 * Adds a module to the patch.
	 * @param moduleType
	 * @param moduleArguments
	 * @param moduleObject
	 * @returns {Module}
     */
	public addModuleByType(moduleType:string, moduleArguments?:Array<any>, moduleObject?:any):Module // moduleObject is passed when parsing a full patch json todo type
	{
		if(!moduleType)
		{
			console.error('No type given');
			return;
		}

		let definition:IModuleDefinition = ModuleDefinitions.findByType(moduleType);

		//console.log('addModuleByType', moduleType);

		if(definition)
		{
			// init the counter for this moduletype
			if(typeof this.countsByType[moduleType] === 'undefined') this.countsByType[moduleType] = 0;

			// increase count
			this.countsByType[moduleType]++;

			// get the id of the module (module data, containing a saved id is given when loading a patch)
			let moduleId:string = moduleObject ? moduleObject.id : moduleType + Patch.ID_COUNT_SEPARATOR + this.countsByType[moduleType];

			// create the module TODO try/catch this all and make sure the id doesnt get incremented if all fails
			let module:Module = new Module(this, definition, moduleId, moduleArguments);
			this.modules.push(module);

			// if the module was loaded, set the position as well (so the visualmodule doesnt set to default startposition)
			if(moduleObject)
			{
				module.position = moduleObject.pos;
			}

			// if it was a subpatch, we need to give it a new patch
			if(definition.type === ModuleTypes.SUBPATCH)
			{
				let subPatch = new Patch(this.audioContext, module);

				// listen to subpatch events. should be done BEFORE setting the subpatch, so that when loaded, the events from adding nested modules
				// are caught and the ACM can set the audionode
				this.addEventListenersToSubPatch(subPatch);

				if(!moduleObject)
				{
					// module was NOT created from parsing an object, create default subpatch
					subPatch.addModuleByType(ModuleTypes.INPUT);
					subPatch.addModuleByType(ModuleTypes.OUTPUT);
				}
				else
				{
					// module created from parsing an object, parse the subpatch
					subPatch.fromObject(moduleObject.subPatch);
				}

				// set it
				module.subPatch = subPatch;

			}

			// listen to module events
			this.addEventListenersToModule(module);

			// notify ACM (audionode gets set in this module) and the editor (visual module is created)
			this.dispatchEvent(PatchEvent.MODULE_ADDED, {module: module, args: moduleArguments});

			// after event has been dispatched, set the values (so there is a node to set the values on and the visual module can update its values)
			if(moduleObject) module.setAttributesByLoadedObject(moduleObject);

			return module; // for now only needed for parsing a json and handling a subpatch TODO what is this?!
		}
		else
		{
			console.error('No module definition found for type: ' + moduleType);
		}
	}

	public handleModuleEvent(type:string, data:any):void
	{
		// dispatch as new (patch) event, so it bubbles up to the root (has exacty the same data as the ModuleEvent, but we dispatch a PatchEvent for consistency)
		// TODO switch on type, even though there is only type one now
		this.dispatchEvent(PatchEvent.MODULE_ATTRIBUTE_CHANGED, {module: data.module, attribute: data.attribute});
	}

	/**
	 * Add necessary listeners to module.
	 * @param module
     */
	private addEventListenersToModule(module:Module):void
	{
		module.addEventListener(ModuleEvent.ATTRIBUTE_CHANGED, this.moduleEventHandler);
	}

	/**
	 * Removes necessary listeners from module.
	 * @param module
	 */
	private removeEventListenersFromModule(module:Module):void
	{
		module.removeEventListener(ModuleEvent.ATTRIBUTE_CHANGED, this.moduleEventHandler);
	}

	/**
	 * Add necessary listeners to subpatch.
	 * @param module
	 */
	private addEventListenersToSubPatch(subPatch:Patch):void
	{
		subPatch.addEventListener(PatchEvent.MODULE_ADDED, this.subPatchEventHandler);
		subPatch.addEventListener(PatchEvent.MODULE_REMOVED, this.subPatchEventHandler);
		subPatch.addEventListener(PatchEvent.CONNECTION_ADDED, this.subPatchEventHandler);
		subPatch.addEventListener(PatchEvent.CONNECTION_PRE_REMOVE, this.subPatchEventHandler);
		subPatch.addEventListener(PatchEvent.CONNECTION_POST_REMOVE, this.subPatchEventHandler);
		subPatch.addEventListener(PatchEvent.PATCH_CLEARED, this.subPatchEventHandler);
		subPatch.addEventListener(PatchEvent.MODULE_ATTRIBUTE_CHANGED, this.subPatchEventHandler);
	}

	/**
	 * Remove necessary listeners from module.
	 * @param module
	 */
	private removeEventListenersFromSubPatch(subPatch:Patch):void
	{
		subPatch.removeEventListener(PatchEvent.MODULE_ADDED, this.subPatchEventHandler);
		subPatch.removeEventListener(PatchEvent.MODULE_REMOVED, this.subPatchEventHandler);
		subPatch.removeEventListener(PatchEvent.CONNECTION_ADDED, this.subPatchEventHandler);
		subPatch.removeEventListener(PatchEvent.CONNECTION_PRE_REMOVE, this.subPatchEventHandler);
		subPatch.removeEventListener(PatchEvent.CONNECTION_POST_REMOVE, this.subPatchEventHandler);
		subPatch.removeEventListener(PatchEvent.PATCH_CLEARED, this.subPatchEventHandler);
		subPatch.removeEventListener(PatchEvent.MODULE_ATTRIBUTE_CHANGED, this.subPatchEventHandler);

	}

	private handleSubPatchEvent(type, data):void
	{
		// redispatch all events, so they bubble up to the root
		this.dispatchEvent(type, data);
	}

	public getModuleById(moduleId:string):Module
	{
		return this.modules.find(module => module.id === moduleId);
	}

	/**
	 * Removes a module from the patch.
	 * @param moduleId
     */
	public removeModuleById(moduleId:string):void
	{
		let module:Module = this.getModuleById(moduleId);

		if(module)
		{
			let moduleIndex:number = this.modules.indexOf(module);

			// first get all connections from or to this module
			var connections:Array<Connection> = this.getConnectionsForModule(module);

			// remove all these connections
			connections.forEach(connection => this.removeConnection(connection));

			// remove module from list
			this.modules.splice(moduleIndex, 1);

			if(module.definition.type === ModuleTypes.SUBPATCH)
			{
				// and clear subpatch 
				module.subPatch.clear();

				// if subpatch, remove listeners
				this.removeEventListenersFromSubPatch(module.subPatch);

				module.subPatch.destruct();
			}

			// do this BEFORE destruct, so that listeners can still check the module's id todo maybe do it afterwards and pass the id? or do we need the full module
			this.dispatchEvent(PatchEvent.MODULE_REMOVED, {module: module});

			this.removeEventListenersFromModule(module);

			// destruct
			module.destruct();
		}
		else
		{
			console.error('Module not found for id: ' + moduleId + ' (or not in list)');
		}
	}

	/**
	 * Returns all connections for a given module.
 	 * @param module
	 * @returns {Array}
     */
	public getConnectionsForModule(module:Module):Array<Connection>
	{
		return this.connections.filter(connection => connection.sourceModule === module || connection.destinationModule === module);
	}

	/**
	 * Get all modules of type INPUT for a patch. todo do we need this? we canjust call this.getModulesByType
	 * @returns {Array<Module>}
     */
	public getInputs():Array<Module>
	{
		return this.getModulesByType(ModuleTypes.INPUT);
	}

	/**
	 * Get all modules of type OUTPUT for a patch.
	 * @returns {Array<Module>}
     */
	public getOutputs():Array<Module>
	{
		return this.getModulesByType(ModuleTypes.OUTPUT);
	}

	/**
	 * Returns all modules for a given type.
	 * @param moduleType
	 * @returns {Array}
     */
	public getModulesByType(moduleType:string):Array<Module>
	{
		return this.modules.filter(module => module.definition.type === moduleType);
	}

	/**
	 * Returns all subpatch modules in the path.
	 * @returns {Array}
     */
	public getSubPatchModules():Array<Module>
	{
		return this.modules.filter(module => module.definition.type === ModuleTypes.SUBPATCH);
	}

	/**
	 * Returns all connections for this patch, including all connections in nested subpatches
	 * @returns {Array}
     */
	public getConnectionsWithNested():Array<Connection>
	{
		// first add connections in this patch
		var connections = [];
		for(var i = 0; i < this.connections.length; i++)
		{
			connections.push(this.connections[i]);
		}

		// then do the same for all submodules
		var subPatchModules = this.getSubPatchModules();
		for(var i = 0; i < subPatchModules.length; i++)
		{
			var subConnections = subPatchModules[i].subPatch.getConnectionsWithNested();

			connections = connections.concat(subConnections);
		}

		return connections;
	}

	/**
	 * Converts the whole patch to a data-object.
	 * @returns {{modules: Array, connections: Array}}
     */
	public toObject():IPatchObject
	{
		var object:IPatchObject = {modules: [], connections: []};

		this.modules.forEach(module =>
		{
			let moduleObject:IModuleObject = {
				id: module.id,
				pos: null,
				args: null,
				attributes: null,
				subPatch: null
			};

			if(module.position) moduleObject.pos = {x: module.position.x, y: module.position.y};

			// add constructor arguments
			if(module.args && module.args.length > 0) moduleObject.args = module.args;

			// add audioparams
			if(module.definition.attributes)
			{
				var attributesObject = [];
				module.definition.attributes.forEach(attribute =>
				{
					attributesObject.push({
						id: attribute.id,
						value: module.getAttributeValue(attribute.id)
					});
				});

				moduleObject.attributes = attributesObject;
			}

			// nested subpatch
			if(module.definition.type === ModuleTypes.SUBPATCH) moduleObject.subPatch = module.subPatch.toObject();

			object.modules.push(moduleObject);
		});

		this.connections.forEach(connection =>
		{
			object.connections.push({
				source: connection.sourceModule.id,
				sourceOutput: connection.sourceOutputIndex,
				destination: connection.destinationModule.id,
				destinationInput: connection.destinationInputIndex,
			});
		});

		return object;
	}

	/**
	 * Creates a new connection in the patch
	 * @param sourceModuleId
	 * @param sourceOutputIndex
	 * @param destinationModuleId
	 * @param destinationInputIndex
	 * @param reconnect
     * @returns {boolean}
     */
	public addConnection(sourceModuleId:string, sourceOutputIndex:number, destinationModuleId:string, destinationInputIndex:number, reconnect:boolean = false):boolean
	{
		let sourceModule:Module = this.getModuleById(sourceModuleId);
		let destinationModule:Module = this.getModuleById(destinationModuleId);

		if(sourceModule && destinationModule)
		{
			if(sourceModule.outputIndexIsValid(sourceOutputIndex) && destinationModule.inputIndexIsValid(destinationInputIndex))
			{
				var connection = new Connection(sourceModule, sourceOutputIndex, destinationModule, destinationInputIndex);

				// TODO check if connection doesnt exist already

				this.connections.push(connection);

				// reconnect defines this connection as a reconnection after an output was disconnected // todo what is this
				this.dispatchEvent(PatchEvent.CONNECTION_ADDED, {connection: connection, reconnect: reconnect || false});

				return true;
			}
			else
			{
				console.error('Output and/or input index is invalid');
			}

		}
		else
		{
			console.error('Source and/or destination for found for ids: ' + sourceModuleId + ', ' + destinationModuleId);
		}

		return false;
	}

	/**
	 * Create a patch from an object
	 * @param patchObject
     */
	public fromObject(patchObject):void
	{
		for(var i = 0; i < patchObject.modules.length; i++)
		{
			var moduleObject = patchObject.modules[i];
			var type = moduleObject.id.split(Patch.ID_COUNT_SEPARATOR)[0];

			//console.log(type, moduleObject);

			// todo fix this
			var module = this.addModuleByType(type, moduleObject.args, moduleObject); // TODO this is a strange way to pass arguments 

			//module.setAttributesByLoadedObject(moduleObject);

		}

		for(var i = 0; i < patchObject.connections.length; i++)
		{
			var loadedConnectionData = patchObject.connections[i];

			this.addConnection(
				loadedConnectionData.source,
				loadedConnectionData.sourceOutput,
				loadedConnectionData.destination,
				loadedConnectionData.destinationInput
			);
		}
	}

	/**
	 * Returns the root patch of this patch (if it exists)
	 * @returns {Patch}
     */
	public getRootPatch():Patch
	{
		let parentPatch:Patch = this.getParentPatch();

		if(!parentPatch)
		{
			return this;
		}
		else
		{
			while(parentPatch.hasParentPatch())
			{
				parentPatch = parentPatch.getParentPatch();
			}

			return parentPatch;
		}
	}

	/**
	 * Returns a list of ids for all parents of this patch.
	 * @returns {T[]}
     */
	public createParentList():Array<string>
	{
		let results:Array<string> = [];
		let parentModule:Module = this.parentModule;

		while(parentModule)
		{
			results.push(parentModule.id);

			parentModule = parentModule.parentPatch.parentModule;
		}

		return results.reverse();
	}

	public hasParentPatch():boolean
	{
		return this.parentModule ? true : false;
	}

	public getParentPatch():Patch
	{
		return this.parentModule ? this.parentModule.parentPatch : null;
	}

	/**
	 * Removes every module and connection from the patch.
	 */
	public clear():void
	{
		// todo foreach?
		for(var i = this.modules.length - 1; i >= 0; i--)
		{
			this.removeModuleById(this.modules[i].id);
		}

		// reset counts
		this.countsByType = {};

		this.dispatchEvent(PatchEvent.PATCH_CLEARED);
	}

	public destruct():void
	{
		this.removeAllEventListeners();

		this.audioContext = null;
		this.parentModule = null;
		this.modules = null;
		this.connections = null;
		this.countsByType = null;

		this.moduleEventHandler = null;
		this.subPatchEventHandler = null;
	}
}

export default Patch;