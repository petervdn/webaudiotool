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
                this.audioContextManager = new AudioContextManager_1.default(this, audioContext);
                this.bufferManager = new BufferManager_1.default(this.audioContext);
            }
            this.subPatchEventHandler = this.handleSubPatchEvent.bind(this);
            this.moduleEventHandler = this.handleModuleEvent.bind(this);
        }
        removeConnection(connectionToRemove) {
            var index = this.connections.indexOf(connectionToRemove);
            if (index >= 0) {
                this.dispatchEvent(PatchEvent_1.default.CONNECTION_PRE_REMOVE, { connection: connectionToRemove });
                this.connections.splice(index, 1);
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
            if (definition) {
                if (typeof this.countsByType[moduleType] === 'undefined')
                    this.countsByType[moduleType] = 0;
                this.countsByType[moduleType]++;
                var moduleId = moduleObject ? moduleObject.id : moduleType + Patch.ID_COUNT_SEPARATOR + this.countsByType[moduleType];
                var module = new Module_1.default(this, definition, moduleId, args);
                this.modules.push(module);
                if (moduleObject) {
                    module.position = moduleObject.pos;
                }
                if (definition.type === ModuleTypes_1.default.SUBPATCH) {
                    var subPatch = new Patch(this.audioContext, module);
                    this.addEventListenersToSubPatch(subPatch);
                    if (!moduleObject) {
                        subPatch.addModuleByType(ModuleTypes_1.default.INPUT);
                        subPatch.addModuleByType(ModuleTypes_1.default.OUTPUT);
                    }
                    else {
                        subPatch.fromObject(moduleObject.subPatch);
                    }
                    module.subPatch = subPatch;
                }
                this.addEventListenersToModule(module);
                this.dispatchEvent(PatchEvent_1.default.MODULE_ADDED, { module: module, args: args });
                if (moduleObject)
                    module.setAttributesByLoadedObject(moduleObject);
                return module;
            }
            else {
                console.error('No module definition found for id: ' + moduleId);
            }
        }
        handleModuleEvent(type, data) {
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
                var connections = this.getConnectionsForModule(module);
                for (var i = 0; i < connections.length; i++) {
                    this.removeConnection(connections[i]);
                }
                this.modules.splice(moduleIndex, 1);
                if (module.definition.type === ModuleTypes_1.default.SUBPATCH) {
                    module.subPatch.clear();
                    this.removeEventListenersFromSubPatch(module.subPatch);
                    module.subPatch.destruct();
                }
                this.dispatchEvent(PatchEvent_1.default.MODULE_REMOVED, { module: module });
                this.removeEventListenersFromModule(module);
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
            var connections = [];
            for (var i = 0; i < this.connections.length; i++) {
                connections.push(this.connections[i]);
            }
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
                if (module.args && module.args.length > 0)
                    moduleObject.args = module.args;
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
                    this.connections.push(connection);
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
        }
        fromObject(patchObject) {
            for (var i = 0; i < patchObject.modules.length; i++) {
                var moduleObject = patchObject.modules[i];
                var type = moduleObject.id.split(Patch.ID_COUNT_SEPARATOR)[0];
                var module = this.addModuleByType(type, moduleObject.args, moduleObject);
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
    Patch.ID_COUNT_SEPARATOR = '_';
    Patch.ID_SUBPATCH_SEPARATOR = '$';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Patch;
});