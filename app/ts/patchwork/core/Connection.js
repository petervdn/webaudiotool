define(["require", "exports", "../enum/ModuleTypes"], function (require, exports, ModuleTypes_1) {
    "use strict";
    class Connection {
        constructor(sourceModule, sourceOutputIndex, destinationModule, destinationInputIndex) {
            this.sourceModule = sourceModule;
            this.sourceOutputIndex = sourceOutputIndex;
            this.destinationModule = destinationModule;
            this.destinationInputIndex = destinationInputIndex;
        }
        getConnectedApiModules() {
            var result = { sources: [], destinations: [] };
            this.getConnectedApiModulesForDirection(true, result.sources);
            this.getConnectedApiModulesForDirection(false, result.destinations);
            return result;
        }
        getApiConnections() {
            var connectedApiModules = this.getConnectedApiModules();
            var connections = [];
            for (var s = 0; s < connectedApiModules.sources.length; s++) {
                for (var d = 0; d < connectedApiModules.destinations.length; d++) {
                    connections.push(new Connection(connectedApiModules.sources[s].module, connectedApiModules.sources[s].transputIndex, connectedApiModules.destinations[d].module, connectedApiModules.destinations[d].transputIndex));
                }
            }
            return connections;
        }
        getConnectedApiModulesForDirection(typeIsSource, results) {
            var module = typeIsSource ? this.sourceModule : this.destinationModule;
            if (module.definition.type === ModuleTypes_1.default.INPUT || module.definition.type === ModuleTypes_1.default.OUTPUT) {
                var transputIndex = module.getProxyTransputIndex();
                if (transputIndex === -1) {
                    if (module.definition.type === ModuleTypes_1.default.OUTPUT)
                        results.push({ transputIndex: -1 });
                }
                else {
                    var subPatchModule = module.parentPatch.parentModule;
                    var connections;
                    if (typeIsSource) {
                        connections = subPatchModule.getIncomingConnectionsForInput(transputIndex);
                    }
                    else {
                        connections = subPatchModule.getOutgoingConnectionsForOutput(transputIndex);
                    }
                    for (var i = 0; i < connections.length; i++) {
                        connections[i].getConnectedApiModulesForDirection(typeIsSource, results);
                    }
                }
            }
            else if (module.definition.type === ModuleTypes_1.default.SUBPATCH) {
                var connections;
                if (typeIsSource) {
                    var outputModule = module.subPatch.getOutputs()[this.sourceOutputIndex];
                    connections = outputModule.getIncomingConnectionsForInput(0);
                }
                else {
                    var inputModule = module.subPatch.getInputs()[this.destinationInputIndex];
                    connections = inputModule.getOutgoingConnectionsForOutput(0);
                }
                for (var i = 0; i < connections.length; i++) {
                    connections[i].getConnectedApiModulesForDirection(typeIsSource, results);
                }
            }
            else {
                results.push({ module: module, transputIndex: typeIsSource ? this.sourceOutputIndex : this.destinationInputIndex });
            }
            return results;
        }
        toString() {
            return '[Connection src=' + this.sourceModule.id + ' srcOutput=' + this.sourceOutputIndex + ' dst=' + this.destinationModule.id + ' dstInput=' + this.destinationInputIndex + ']';
        }
        destruct() {
            this.sourceModule = null;
            this.sourceOutputIndex = null;
            this.destinationModule = null;
            this.destinationInputIndex = null;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Connection;
});
