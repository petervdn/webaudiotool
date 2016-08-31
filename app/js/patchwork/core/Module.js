define(["require", "exports", "../event/ModuleEvent", "../enum/ModuleCategories", "./EventDispatcher", "../enum/ModuleTypes", "../enum/AttributeTypes"], function (require, exports, ModuleEvent_1, ModuleCategories_1, EventDispatcher_1, ModuleTypes_1, AttributeTypes_1) {
    "use strict";
    class Module extends EventDispatcher_1.default {
        constructor(parentPatch, definition, id, args) {
            super();
            this.parentPatch = parentPatch;
            this.definition = definition;
            this.id = id;
            this.audioNode = null; // set later by the audiocontext manager (listens to added modules)
            this.args = args; // store constructor arguments, so we can save them in the json
            this.position = null; // will be set if a visualmodule is created for it
            this.subPatch = null; // will be filled if it's a subpatch
        }
        getAttributeValue(attributeId) {
            // first get the attribute
            var attribute = this.getAttributeById(attributeId);
            var value;
            if (attribute) {
                switch (attribute.type) {
                    case AttributeTypes_1.default.AUDIO_PARAM:
                        {
                            value = this.audioNode[attribute.id].value;
                            break;
                        }
                    case AttributeTypes_1.default.OPTION_LIST:
                    case AttributeTypes_1.default.FLOAT:
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
            else {
                console.error('No attribute found with id ' + attributeId + ' in module ' + this.definition.type);
            }
        }
        setAudioNode(audioNode) {
            this.audioNode = audioNode;
        }
        getAttributeById(attributeId) {
            if (this.definition.attributes) {
                for (var i = 0; i < this.definition.attributes.length; i++) {
                    var attribute = this.definition.attributes[i];
                    if (attribute.id === attributeId)
                        return attribute;
                }
            }
            return null;
        }
        setAttributeValue(attributeId, value) {
            var attribute = this.getAttributeById(attributeId);
            if (attribute) {
                switch (attribute.type) {
                    case AttributeTypes_1.default.AUDIO_PARAM:
                        {
                            this.audioNode[attributeId].value = value;
                            this.dispatchEvent(ModuleEvent_1.default.ATTRIBUTE_CHANGED, { module: this, attribute: attribute });
                            break;
                        }
                    case AttributeTypes_1.default.OPTION_LIST:
                    case AttributeTypes_1.default.FLOAT:
                        {
                            this.audioNode[attributeId] = value;
                            this.dispatchEvent(ModuleEvent_1.default.ATTRIBUTE_CHANGED, { module: this, attribute: attribute });
                            break;
                        }
                    default:
                        {
                            console.error('Unhandled attribute type: ' + attribute.type);
                            return;
                        }
                }
            }
            else {
                console.error('Attribute not found: ' + attributeId);
            }
        }
        inputIndexIsValid(index) {
            return !isNaN(index) && index < this.getNumberOfInputs() ? true : false;
        }
        outputIndexIsValid(index) {
            return !isNaN(index) && index < this.getNumberOfOutputs() ? true : false;
        }
        getNumberOfInputs() {
            return this.getNumberOfTransputs().in;
        }
        getNumberOfOutputs() {
            return this.getNumberOfTransputs().out;
        }
        setAttributesByLoadedObject(moduleObject) {
            if (!moduleObject.attributes)
                return;
            for (var i = 0; i < moduleObject.attributes.length; i++) {
                var attribute = moduleObject.attributes[i];
                this.setAttributeValue(attribute.id, attribute.value);
            }
        }
        getNumberOfTransputs() {
            // TODO when loading a patch, this function gets called A LOT of times...why?
            var numberOfInputs, numberOfOutputs;
            switch (this.definition.category) {
                case ModuleCategories_1.default.NATIVE:
                    {
                        //console.log(this);
                        numberOfInputs = this.audioNode.numberOfInputs + this.getAudioParams().length;
                        numberOfOutputs = this.audioNode.numberOfOutputs;
                        break;
                    }
                case ModuleCategories_1.default.PROXY:
                    {
                        if (this.definition.type === ModuleTypes_1.default.SUBPATCH) {
                            numberOfInputs = this.subPatch.getInputs().length;
                            numberOfOutputs = this.subPatch.getOutputs().length;
                        }
                        else {
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
            return { in: numberOfInputs, out: numberOfOutputs };
        }
        getProxyTransputIndex() {
            if (this.definition.type === ModuleTypes_1.default.INPUT) {
                return this.getProxyInputIndex();
            }
            else if (this.definition.type === ModuleTypes_1.default.OUTPUT) {
                return this.getProxyOutputIndex();
            }
            else {
                console.error('Module doesn\'t have a proxy (not an input or output)');
                return -1;
            }
        }
        /**
         When called on an input module which is part of a subpatch, this returns the input that goes with it on its subpatch-module.
         */
        getProxyInputIndex() {
            if (this.definition.type === ModuleTypes_1.default.INPUT) {
                // check if module is in rootpatch or a nested subpatch 
                var isRoot = this.parentPatch.parentModule ? false : true;
                if (isRoot) {
                    // root patch, has no proxy input
                    return -1;
                }
                else {
                    // return the input-index is of this input
                    return this.parentPatch.getInputs().indexOf(this);
                }
            }
            else {
                console.error('Only modules of type ' + ModuleTypes_1.default.INPUT + ' have a proxy input');
                return -1;
            }
        }
        /**
         When called on an output module which is part of a subpatch, this returns the output that goes with it on its subpatch-module.
         */
        getProxyOutputIndex() {
            if (this.definition.type === ModuleTypes_1.default.OUTPUT) {
                // check if module is in rootpatch or a nested subpatch 
                var isInRoot = this.parentPatch.parentModule ? false : true;
                if (isInRoot) {
                    // root patch, has no proxy input
                    return -1;
                }
                else {
                    // return the input-index is of this input
                    return this.parentPatch.getOutputs().indexOf(this);
                }
            }
            else {
                console.error('Only modules of type ' + ModuleTypes_1.default.OUTPUT + ' have a proxy output');
                return -1;
            }
        }
        getNumberOfNodeInputs() {
            return this.getNumberOfInputs() - this.getAudioParams().length;
        }
        getAudioParamForInputIndex(inputIndex) {
            var numberOfNodeInputs = this.getNumberOfNodeInputs();
            if (inputIndex > numberOfNodeInputs - 1) {
                var audioParams = this.getAudioParams();
                var paramIndex = inputIndex - numberOfNodeInputs;
                return audioParams[paramIndex];
            }
            else {
                return null;
            }
        }
        getAudioParams() {
            var results = [];
            if (this.definition.attributes) {
                for (var i = 0; i < this.definition.attributes.length; i++) {
                    if (this.definition.attributes[i].type === AttributeTypes_1.default.AUDIO_PARAM) {
                        results.push(this.definition.attributes[i]);
                    }
                }
            }
            return results;
        }
        getConnectedModulesByProxy() {
            var results = [];
            if (this.definition.type === ModuleTypes_1.default.INPUT) {
                // module is input, and either in the rootpatch, or in a subpatch, get the index of the proxy input on that subpatch
                var inputIndex = this.getProxyInputIndex();
                if (inputIndex === -1) {
                    // input is in rootpatch, return empty array (no connected modules)
                    return results;
                }
                else {
                    // input is in subpacth, get the subpatchmodule
                    var subPatchModule = this.parentPatch.parentModule;
                    // get the connections to that input
                    var connections = subPatchModule.getIncomingConnectionsForInput(inputIndex);
                    // loop through all connections
                    for (var i = 0; i < connections.length; i++) {
                        var connection = connections[i];
                        if (connection.sourceModule.definition.type === ModuleTypes_1.default.INPUT) {
                            // connection is connected to yet another input, call this function again and add the results
                            var modules = connection.sourceModule.getConnectedModulesByProxy();
                            for (var j = 0; j < modules.length; j++)
                                results.push(modules[j]);
                        }
                        else {
                            // connection is connected to a regular module, add it to the results
                            results.push({ module: connection.sourceModule, outputIndex: connection.sourceOutputIndex });
                        }
                    }
                }
            }
            else if (this.definition.type === ModuleTypes_1.default.OUTPUT) {
                //if(isInRoot) return results; // todo WHATTTTTT?!
                return results;
            }
            else {
                console.error('Only modules of type ' + ModuleTypes_1.default.INPUT + ' or ' + ModuleTypes_1.default.OUTPUT);
            }
            return results;
        }
        getIncomingConnectionsForInput(inputIndex) {
            var results = [];
            for (var i = 0; i < this.parentPatch.connections.length; i++) {
                var connection = this.parentPatch.connections[i];
                if (connection.destinationModule === this && connection.destinationInputIndex === inputIndex)
                    results.push(connection);
            }
            return results;
        }
        getOutgoingConnectionsForOutput(outputIndex) {
            let results = [];
            for (var i = 0; i < this.parentPatch.connections.length; i++) {
                var connection = this.parentPatch.connections[i];
                if (connection.sourceModule === this && connection.sourceOutputIndex === outputIndex)
                    results.push(connection);
            }
            return results;
        }
        createBreadcrumb() {
            let results = [];
            var parentModule = this.parentPatch.parentModule;
            while (parentModule) {
                results.push(parentModule.id);
                parentModule = parentModule.parentPatch.parentModule;
            }
            return results.reverse();
        }
        destruct() {
            this.removeAllEventListeners();
            this.parentPatch = null;
            this.definition = null;
            this.id = null;
            this.audioNode = null;
            this.args = null;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Module;
});
