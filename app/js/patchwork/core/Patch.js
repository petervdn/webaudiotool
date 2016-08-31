define(["require", "exports", "./EventDispatcher", "./Connection", "./AudioContextManager", "./BufferManager", "../event/PatchEvent", "../config/ModuleDefinitions", "./Module", "../enum/ModuleTypes", "../event/ModuleEvent"], function (require, exports, EventDispatcher_1, Connection_1, AudioContextManager_1, BufferManager_1, PatchEvent_1, ModuleDefinitions_1, Module_1, ModuleTypes_1, ModuleEvent_1) {
    "use strict";
    class Patch extends EventDispatcher_1.default {
        constructor(audioContext, parentModule) {
            super();
            this.connections = [];
            this.countsByType = {};
            if (!audioContext)
                console.error('Cannot create patch without an AudioContext');
            this.parentModule = parentModule;
            this.audioContext = audioContext;
            this.modules = [];
            if (!parentModule) {
                // only the root gets a listener, all subpatches bubble their events to here
                this.audioContextManager = new AudioContextManager_1.default(this, audioContext);
                // same for buffermanager
                this.bufferManager = new BufferManager_1.default(this.audioContext);
            }
            // handlers for events
            this.subPatchEventHandler = this.handleSubPatchEvent.bind(this);
            this.moduleEventHandler = this.handleModuleEvent.bind(this);
        }
        removeConnection(connectionToRemove) {
            var index = this.connections.indexOf(connectionToRemove);
            if (index >= 0) {
                // event before removing, so the ACM can still figure out what connections are involved
                this.dispatchEvent(PatchEvent_1.default.CONNECTION_PRE_REMOVE, { connection: connectionToRemove });
                this.connections.splice(index, 1);
                // editor redraws from post event
                this.dispatchEvent(PatchEvent_1.default.CONNECTION_POST_REMOVE, { connection: connectionToRemove });
                connectionToRemove.destruct();
            }
            else {
                console.error('Connection not found', connectionToRemove);
            }
        }
        addModuleByType(moduleType, args, moduleObject) {
            if (!moduleType) {
                console.error('No type given');
                return;
            }
            var definition = ModuleDefinitions_1.default.findByType(moduleType);
            //console.log('addModuleByType', moduleType);
            if (definition) {
                // init the counter for this moduletype
                if (typeof this.countsByType[moduleType] === 'undefined')
                    this.countsByType[moduleType] = 0;
                // increase count
                this.countsByType[moduleType]++;
                // get the id of the module (module data, containing a saved id is given when loading a patch)
                var moduleId = moduleObject ? moduleObject.id : moduleType + Patch.ID_COUNT_SEPARATOR + this.countsByType[moduleType];
                // create the module TODO try/catch this all and make sure the id doesnt get incremented if all fails
                var module = new Module_1.default(this, definition, moduleId, args);
                this.modules.push(module);
                // if the module was loaded, set the position as well (so the visualmodule doesnt set to default startposition)
                if (moduleObject) {
                    module.position = moduleObject.pos;
                }
                // if it was a subpatch, we need to give it a new patch
                if (definition.type === ModuleTypes_1.default.SUBPATCH) {
                    var subPatch = new Patch(this.audioContext, module);
                    // listen to subpatch events. should be done BEFORE setting the subpatch, so that when loaded, the events from adding nested modules
                    // are caught and the ACM can set the audionode
                    this.addEventListenersToSubPatch(subPatch);
                    if (!moduleObject) {
                        // module was NOT created from parsing an object, create default subpatch
                        subPatch.addModuleByType(ModuleTypes_1.default.INPUT);
                        subPatch.addModuleByType(ModuleTypes_1.default.OUTPUT);
                    }
                    else {
                        // module created from parsing an object, parse the subpatch
                        subPatch.fromObject(moduleObject.subPatch);
                    }
                    // set it
                    module.subPatch = subPatch;
                }
                // listen to module events
                this.addEventListenersToModule(module);
                // notify ACM (audionode gets set in this module) and the editor (visual module is created)
                this.dispatchEvent(PatchEvent_1.default.MODULE_ADDED, { module: module, args: args });
                // after event has been dispatched, set the values (so there is a node to set the values on and the visual module can update its values)
                if (moduleObject)
                    module.setAttributesByLoadedObject(moduleObject);
                return module; // for now only needed for parsing a json and handling a subpatch TODO what is this?!
            }
            else {
                console.error('No module definition found for id: ' + moduleId);
            }
        }
        handleModuleEvent(type, data) {
            // dispatch as new (patch) event, so it bubbles up to the root (has exacty the same data as the ModuleEvent, but we dispatch a PatchEvent for consistency)
            // TODO switch on type, even though there is only type one now
            this.dispatchEvent(PatchEvent_1.default.MODULE_ATTRIBUTE_CHANGED, { module: data.module, attribute: data.attribute });
        }
        addEventListenersToModule(module) {
            module.addEventListener(ModuleEvent_1.default.ATTRIBUTE_CHANGED, this.moduleEventHandler);
        }
        removeEventListenersFromModule(module) {
            module.removeEventListener(ModuleEvent_1.default.ATTRIBUTE_CHANGED, this.moduleEventHandler);
        }
        addEventListenersToSubPatch(subPatch) {
            subPatch.addEventListener(PatchEvent_1.default.MODULE_ADDED, this.subPatchEventHandler);
            subPatch.addEventListener(PatchEvent_1.default.MODULE_REMOVED, this.subPatchEventHandler);
            subPatch.addEventListener(PatchEvent_1.default.CONNECTION_ADDED, this.subPatchEventHandler);
            subPatch.addEventListener(PatchEvent_1.default.CONNECTION_PRE_REMOVE, this.subPatchEventHandler);
            subPatch.addEventListener(PatchEvent_1.default.CONNECTION_POST_REMOVE, this.subPatchEventHandler);
            subPatch.addEventListener(PatchEvent_1.default.PATCH_CLEARED, this.subPatchEventHandler);
            subPatch.addEventListener(PatchEvent_1.default.MODULE_ATTRIBUTE_CHANGED, this.subPatchEventHandler);
        }
        removeEventListenersFromSubPatch(subPatch) {
            subPatch.removeEventListener(PatchEvent_1.default.MODULE_ADDED, this.subPatchEventHandler);
            subPatch.removeEventListener(PatchEvent_1.default.MODULE_REMOVED, this.subPatchEventHandler);
            subPatch.removeEventListener(PatchEvent_1.default.CONNECTION_ADDED, this.subPatchEventHandler);
            subPatch.removeEventListener(PatchEvent_1.default.CONNECTION_PRE_REMOVE, this.subPatchEventHandler);
            subPatch.removeEventListener(PatchEvent_1.default.CONNECTION_POST_REMOVE, this.subPatchEventHandler);
            subPatch.removeEventListener(PatchEvent_1.default.PATCH_CLEARED, this.subPatchEventHandler);
            subPatch.removeEventListener(PatchEvent_1.default.MODULE_ATTRIBUTE_CHANGED, this.subPatchEventHandler);
        }
        handleSubPatchEvent(type, data) {
            // redispatch all events, so they bubble up to the root
            this.dispatchEvent(type, data);
        }
        getModuleById(moduleId) {
            for (var i = 0; i < this.modules.length; i++) {
                if (this.modules[i].id === moduleId)
                    return this.modules[i];
            }
            return null;
        }
        removeModuleById(moduleId) {
            var module = this.getModuleById(moduleId);
            var moduleIndex = this.modules.indexOf(module);
            if (module && moduleIndex > -1) {
                // first get all connections from or to this module
                var connections = this.getConnectionsForModule(module);
                // remove all these connections
                for (var i = 0; i < connections.length; i++) {
                    this.removeConnection(connections[i]);
                }
                // remove module from list
                this.modules.splice(moduleIndex, 1);
                if (module.definition.type === ModuleTypes_1.default.SUBPATCH) {
                    // and clear subpatch 
                    module.subPatch.clear();
                    // if subpatch, remove listeners
                    this.removeEventListenersFromSubPatch(module.subPatch);
                    module.subPatch.destruct();
                }
                // do this BEFORE destruct, so that listeners can still check the module's id
                this.dispatchEvent(PatchEvent_1.default.MODULE_REMOVED, { module: module });
                this.removeEventListenersFromModule(module);
                // destruct
                module.destruct();
            }
            else {
                console.error('Module not found for id: ' + moduleId + ' (or not in list)');
            }
        }
        getConnectionsForModule(module) {
            var results = [];
            for (var i = 0; i < this.connections.length; i++) {
                var connection = this.connections[i];
                if (connection.sourceModule === module || connection.destinationModule === module)
                    results.push(connection);
            }
            return results;
        }
        getInputs() {
            return this.getModulesByType(ModuleTypes_1.default.INPUT);
        }
        getOutputs() {
            return this.getModulesByType(ModuleTypes_1.default.OUTPUT);
        }
        getModulesByType(moduleType) {
            var results = [];
            for (var i = 0; i < this.modules.length; i++) {
                if (this.modules[i].definition.type === moduleType)
                    results.push(this.modules[i]);
            }
            return results;
        }
        getSubPatchModules() {
            var modules = [];
            for (var i = 0; i < this.modules.length; i++) {
                if (this.modules[i].definition.type === ModuleTypes_1.default.SUBPATCH)
                    modules.push(this.modules[i]);
            }
            return modules;
        }
        getConnectionsWithNested() {
            // returns all connections for this patch, and all connections in nested subpatches
            // first add connections in this patch
            var connections = [];
            for (var i = 0; i < this.connections.length; i++) {
                connections.push(this.connections[i]);
            }
            // then do the same for all submodules
            var subPatchModules = this.getSubPatchModules();
            for (var i = 0; i < subPatchModules.length; i++) {
                var subConnections = subPatchModules[i].subPatch.getConnectionsWithNested();
                connections = connections.concat(subConnections);
            }
            return connections;
        }
        toObject() {
            var object = { modules: [], connections: [] };
            for (var i = 0; i < this.modules.length; i++) {
                var module = this.modules[i];
                var moduleObject = {
                    id: module.id,
                    pos: null,
                    args: null,
                    attributes: null,
                    subPatch: null
                };
                if (module.position) {
                    moduleObject.pos = { x: module.position.x, y: module.position.y };
                }
                // add constructor arguments
                if (module.args && module.args.length > 0)
                    moduleObject.args = module.args;
                // add audioparams
                if (module.definition.attributes && module.definition.attributes.length > 0) {
                    var attributesObject = [];
                    for (var j = 0; j < module.definition.attributes.length; j++) {
                        var attribute = module.definition.attributes[j];
                        var attributeValue = module.getAttributeValue(attribute.id);
                        attributesObject.push({
                            id: attribute.id,
                            value: attributeValue
                        });
                    }
                    moduleObject.attributes = attributesObject;
                }
                // nested subpatch
                if (module.definition.type === ModuleTypes_1.default.SUBPATCH) {
                    moduleObject.subPatch = module.subPatch.toObject();
                }
                object.modules.push(moduleObject);
            }
            for (var i = 0; i < this.connections.length; i++) {
                var connection = this.connections[i];
                object.connections.push({
                    source: connection.sourceModule.id,
                    sourceOutput: connection.sourceOutputIndex,
                    destination: connection.destinationModule.id,
                    destinationInput: connection.destinationInputIndex,
                });
            }
            return object;
        }
        addConnection(sourceModuleId, sourceOutputIndex, destinationModuleId, destinationInputIndex, reconnect) {
            var sourceModule = this.getModuleById(sourceModuleId);
            var destinationModule = this.getModuleById(destinationModuleId);
            if (sourceModule && destinationModule) {
                if (sourceModule.outputIndexIsValid(sourceOutputIndex) && destinationModule.inputIndexIsValid(destinationInputIndex)) {
                    var connection = new Connection_1.default(sourceModule, sourceOutputIndex, destinationModule, destinationInputIndex);
                    // TODO check if connection doesnt exist already
                    this.connections.push(connection);
                    // reconnect defines this connection as a reconnection after an output was disconnected // todo what is this
                    this.dispatchEvent(PatchEvent_1.default.CONNECTION_ADDED, { connection: connection, reconnect: reconnect || false });
                    return true;
                }
                else {
                    console.error('Output and/or input index is invalid');
                }
            }
            else {
                console.error('Source and/or destination for found for ids: ' + sourceModuleId + ', ' + destinationModuleId);
            }
            return false;
        }
        setPatchByJSON(jsonString) {
            this.clear();
            //this.setPatchByObject(JSON.parse(jsonString)); todo probably fromObject fnc?
        }
        fromObject(patchObject) {
            for (var i = 0; i < patchObject.modules.length; i++) {
                var moduleObject = patchObject.modules[i];
                var type = moduleObject.id.split(Patch.ID_COUNT_SEPARATOR)[0];
                //console.log(type, moduleObject);
                var module = this.addModuleByType(type, moduleObject.args, moduleObject); // TODO this is a strange way to pass arguments 
            }
            for (var i = 0; i < patchObject.connections.length; i++) {
                var loadedConnectionData = patchObject.connections[i];
                this.addConnection(loadedConnectionData.source, loadedConnectionData.sourceOutput, loadedConnectionData.destination, loadedConnectionData.destinationInput);
            }
        }
        getRootPatch() {
            var parentPatch = this.getParentPatch();
            if (!parentPatch) {
                return this;
            }
            else {
                while (parentPatch.hasParentPatch()) {
                    parentPatch = parentPatch.getParentPatch();
                }
                return parentPatch;
            }
        }
        createParentList() {
            let results = [];
            var parentModule = this.parentModule;
            while (parentModule) {
                results.push(parentModule.id);
                parentModule = parentModule.parentPatch.parentModule;
            }
            return results.reverse();
        }
        hasParentPatch() {
            return this.parentModule ? true : false;
        }
        getParentPatch() {
            return this.parentModule ? this.parentModule.parentPatch : null;
        }
        clear() {
            console.log('clear');
            for (var i = this.modules.length - 1; i >= 0; i--) {
                console.log('remove', this.modules[i]);
                this.removeModuleById(this.modules[i].id);
            }
            // reset counts
            this.countsByType = {};
            this.dispatchEvent(PatchEvent_1.default.PATCH_CLEARED);
        }
        destruct() {
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
    Patch.ID_COUNT_SEPARATOR = '_'; // todo private?
    Patch.ID_SUBPATCH_SEPARATOR = '$';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Patch;
});
