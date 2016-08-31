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
            // get all modules involved
            var connectedApiModules = this.getConnectedApiModules();
            // and create a list of connections between those
            var connections = [];
            for (var s = 0; s < connectedApiModules.sources.length; s++) {
                for (var d = 0; d < connectedApiModules.destinations.length; d++) {
                    connections.push(new Connection(connectedApiModules.sources[s].module, connectedApiModules.sources[s].transputIndex, connectedApiModules.destinations[d].module, connectedApiModules.destinations[d].transputIndex));
                }
            }
            return connections;
        }
        /*
         Looks recursively 'up' or 'down' a connection, skipping subpatches and inputs/outputs,
         and retrieves all modules that should have a connection on the API.
         */
        getConnectedApiModulesForDirection(typeIsSource, results) {
            var module = typeIsSource ? this.sourceModule : this.destinationModule;
            //if((typeIsSource && module.definition.type === ModuleTypes.INPUT) || (!typeIsSource && module.definition.type === ModuleTypes.OUTPUT))
            if (module.definition.type === ModuleTypes_1.default.INPUT || module.definition.type === ModuleTypes_1.default.OUTPUT) {
                // module is input or output, and either in the rootpatch, or in a subpatch, get the index of the proxy input on that subpatch
                var transputIndex = module.getProxyTransputIndex();
                if (transputIndex === -1) {
                    // input is in rootpatch, do nothing unless it's on an output: add the destination (by adding transputindex -1)
                    if (module.definition.type === ModuleTypes_1.default.OUTPUT)
                        results.push({ transputIndex: -1 });
                }
                else {
                    // input is in subpatch, get the subpatchmodule
                    var subPatchModule = module.parentPatch.parentModule;
                    // get the connections to that input/output
                    var connections;
                    if (typeIsSource) {
                        connections = subPatchModule.getIncomingConnectionsForInput(transputIndex);
                    }
                    else {
                        connections = subPatchModule.getOutgoingConnectionsForOutput(transputIndex);
                    }
                    // loop through all connections
                    for (var i = 0; i < connections.length; i++) {
                        connections[i].getConnectedApiModulesForDirection(typeIsSource, results);
                    }
                }
            }
            else if (module.definition.type === ModuleTypes_1.default.SUBPATCH) {
                // module is a subpatch, get the subpatch's input or output module (call it proxy here) and its connections
                var connections;
                if (typeIsSource) {
                    // we're looking for the sources (going 'up' the connection), so we need the subpatch's output
                    var outputModule = module.subPatch.getOutputs()[this.sourceOutputIndex];
                    connections = outputModule.getIncomingConnectionsForInput(0); // in/output modulex always have 1 transput
                }
                else {
                    // other way around
                    var inputModule = module.subPatch.getInputs()[this.destinationInputIndex];
                    connections = inputModule.getOutgoingConnectionsForOutput(0);
                }
                for (var i = 0; i < connections.length; i++) {
                    connections[i].getConnectedApiModulesForDirection(typeIsSource, results);
                }
            }
            else {
                // we've reached an api module (module that can actually be connected on the api)
                results.push({ module: module, transputIndex: typeIsSource ? this.sourceOutputIndex : this.destinationInputIndex });
            }
            return results;
        }
        toString() {
            return '[Connection src=' + this.sourceModule.id + ' srcOutput=' + this.sourceOutputIndex + ' dst=' + this.destinationModule.id + ' dstInput=' + this.destinationInputIndex + ']';
        }
        isInList(connections, ignoreDestination = false) {
            for (var i = 0; i < connections.length; i++) {
                if (!ignoreDestination) {
                    if (this.sourceModule === connections[i].sourceModule &&
                        this.sourceOutputIndex === connections[i].sourceOutputIndex &&
                        this.destinationModule === connections[i].destinationModule &&
                        this.destinationInputIndex === connections[i].destinationInputIndex) {
                        return true;
                    }
                }
                else {
                    if (this.sourceModule === connections[i].sourceModule &&
                        this.sourceOutputIndex === connections[i].sourceOutputIndex) {
                        return true;
                    }
                }
            }
            return false;
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
