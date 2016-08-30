define(["require", "exports", "../event/PatchEvent", "../enum/ModuleCategories", "../event/AudioContextManagerEvent", "../util/Utils", "./EventDispatcher"], function (require, exports, PatchEvent_1, ModuleCategories_1, AudioContextManagerEvent_1, Utils_1, EventDispatcher_1) {
    "use strict";
    class AudioContextManager extends EventDispatcher_1.default {
        constructor(patch, audioContext) {
            super();
            this.logColor = '#FF00FF';
            this.patch = patch;
            this.logColor = '#FF00FF';
            this.audioContext = audioContext;
            this.patchEventHandler = this.handlePatchEvent.bind(this);
            this.patch.addEventListener(PatchEvent_1.default.MODULE_ADDED, this.patchEventHandler);
            this.patch.addEventListener(PatchEvent_1.default.MODULE_REMOVED, this.patchEventHandler);
            this.patch.addEventListener(PatchEvent_1.default.CONNECTION_ADDED, this.patchEventHandler);
            this.patch.addEventListener(PatchEvent_1.default.CONNECTION_PRE_REMOVE, this.patchEventHandler);
            this.patch.addEventListener(PatchEvent_1.default.CONNECTION_POST_REMOVE, this.patchEventHandler);
            this.patch.addEventListener(PatchEvent_1.default.PATCH_CLEARED, this.patchEventHandler);
            this.patch.addEventListener(PatchEvent_1.default.MODULE_ATTRIBUTE_CHANGED, this.patchEventHandler);
        }
        handlePatchEvent(type, data) {
            switch (type) {
                case PatchEvent_1.default.MODULE_ADDED:
                    {
                        var module = data.module;
                        switch (module.definition.category) {
                            case ModuleCategories_1.default.NATIVE:
                                {
                                    var jsMethodName = module.definition.js;
                                    var audioNode = this.audioContext[jsMethodName].call(this.audioContext, data.args);
                                    module.setAudioNode(audioNode);
                                    if (module.definition.type === 'oscillator')
                                        module.audioNode.start();
                                    this.dispatchEvent(AudioContextManagerEvent_1.default.MODULE_ADDED, { module: module });
                                    break;
                                }
                            case ModuleCategories_1.default.PROXY:
                                {
                                    break;
                                }
                            default:
                                {
                                    console.error('Unhandled module category: ' + module.definition.category);
                                }
                        }
                        break;
                    }
                case PatchEvent_1.default.MODULE_REMOVED:
                    {
                        break;
                    }
                case PatchEvent_1.default.PATCH_CLEARED:
                    {
                        this.dispatchEvent(AudioContextManagerEvent_1.default.PATCH_CLEARED);
                        break;
                    }
                case PatchEvent_1.default.CONNECTION_ADDED:
                    {
                        this.addApiConnectionFor(data.connection);
                        break;
                    }
                case PatchEvent_1.default.CONNECTION_PRE_REMOVE:
                    {
                        var apiConnectionsToRemove = data.connection.getApiConnections();
                        var outgoingApiConnections = [];
                        for (var i = 0; i < apiConnectionsToRemove.length; i++) {
                            var apiConnectionToRemove = apiConnectionsToRemove[i];
                            var sourceModuleToClear = apiConnectionToRemove.sourceModule;
                            var outgoingConnections = sourceModuleToClear.getOutgoingConnectionsForOutput(apiConnectionToRemove.sourceOutputIndex);
                            for (var j = 0; j < outgoingConnections.length; j++) {
                                var outgoingApiConnectionsToAdd = outgoingConnections[j].getApiConnections();
                                for (var k = 0; k < outgoingApiConnectionsToAdd.length; k++) {
                                    if (!Utils_1.connectionIsInList(outgoingApiConnectionsToAdd[k], outgoingApiConnections)) {
                                        outgoingApiConnections.push(outgoingApiConnectionsToAdd[k]);
                                    }
                                }
                            }
                        }
                        var apiConnectionsToRestore = [];
                        for (var i = 0; i < outgoingApiConnections.length; i++) {
                            if (!Utils_1.connectionIsInList(outgoingApiConnections[i], apiConnectionsToRemove)) {
                                apiConnectionsToRestore.push(outgoingApiConnections[i]);
                            }
                        }
                        var removed = [];
                        for (var i = 0; i < apiConnectionsToRemove.length; i++) {
                            var removeConnection = apiConnectionsToRemove[i];
                            if (!Utils_1.connectionIsInList(removeConnection, removed, true)) {
                                removeConnection.sourceModule.audioNode.disconnect(removeConnection.sourceOutputIndex);
                                this.dispatchEvent(AudioContextManagerEvent_1.default.OUTPUT_DISCONNECTED, {
                                    module: removeConnection.sourceModule,
                                    outputIndex: removeConnection.sourceOutputIndex
                                });
                                removed.push(removeConnection);
                            }
                        }
                        for (var i = 0; i < apiConnectionsToRestore.length; i++) {
                            this.addApiConnectionFor(apiConnectionsToRestore[i]);
                        }
                        break;
                    }
                case PatchEvent_1.default.MODULE_ATTRIBUTE_CHANGED:
                case PatchEvent_1.default.CONNECTION_POST_REMOVE:
                    {
                        break;
                    }
                default:
                    {
                        console.warn('Unhandled patch event: ' + type);
                    }
            }
        }
        addApiConnectionFor(connection) {
            var apiConnections = connection.getApiConnections();
            for (var i = 0; i < apiConnections.length; i++) {
                var connection = apiConnections[i];
                if (connection.destinationInputIndex === -1) {
                    connection.sourceModule.audioNode.connect(this.audioContext.destination, connection.sourceOutputIndex);
                }
                else {
                    var audioParam = connection.destinationModule.getAudioParamForInputIndex(connection.destinationInputIndex);
                    if (audioParam) {
                        connection.sourceModule.audioNode.connect(connection.destinationModule.audioNode[audioParam.id], connection.sourceOutputIndex);
                    }
                    else {
                        connection.sourceModule.audioNode.connect(connection.destinationModule.audioNode, connection.sourceOutputIndex, connection.destinationInputIndex);
                    }
                }
                this.dispatchEvent(AudioContextManagerEvent_1.default.CONNECTION_ADDED, { connection: connection });
            }
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AudioContextManager;
});
