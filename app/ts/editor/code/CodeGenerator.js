"use strict";
var AttributeTypes_1 = require("../../patchwork/enum/AttributeTypes");
var ModuleCategories_1 = require("../../patchwork/enum/ModuleCategories");
var ModuleTypes_1 = require("../../patchwork/enum/ModuleTypes");
var Utils_1 = require("../../patchwork/util/Utils");
var CodeGenerator = (function () {
    function CodeGenerator() {
    }
    CodeGenerator.getStringForModuleRemoved = function (module) {
        return CodeGenerator.createBreadcrumbModuleId(module) + ' = null;';
    };
    CodeGenerator.getStringForOutputDisconnected = function (module, outputIndex) {
        return CodeGenerator.createBreadcrumbModuleId(module) + '.disconnect(' + outputIndex + ');';
    };
    CodeGenerator.getStringForInit = function () {
        return 'var ' + CodeGenerator.AUDIOCONTEXT_NAME + ' = new(window.AudioContext || window.webkitAudioContext);';
    };
    CodeGenerator.getStringForConnectionAdded = function (connection) {
        var sourceName = CodeGenerator.createBreadcrumbModuleId(connection.sourceModule);
        // when transput is -1 there is an output in the root. this will be considered the context destination (input is always 0 in that case)
        if (connection.destinationInputIndex === -1) {
            var destinationName = CodeGenerator.AUDIOCONTEXT_NAME + '.destination';
            var inputIndex = 0;
        }
        else {
            // input might be an audioparam
            var audioParam = connection.destinationModule.getAudioParamForInputIndex(connection.destinationInputIndex);
            if (audioParam) {
                var destinationName = this.createBreadcrumbModuleId(connection.destinationModule) + '.' + audioParam.id;
            }
            else {
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
            (typeof inputIndex !== 'undefined' ? ', ' + inputIndex : '') +
            ');';
        return string;
    };
    CodeGenerator.getStringForSetAttribute = function (attribute, module) {
        var code;
        switch (attribute.type) {
            case AttributeTypes_1["default"].AUDIO_PARAM:
                {
                    code = this.createBreadcrumbModuleId(module) + '.' + attribute.id + '.value = ' + module.getAttributeValue(attribute.id) + ';';
                    break;
                }
            case AttributeTypes_1["default"].OPTION_LIST:
            case AttributeTypes_1["default"].OPTION_LIST:
            case AttributeTypes_1["default"].BOOLEAN:
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
    };
    CodeGenerator.getStringsForModuleSetAttributes = function (module) {
        var code = [];
        if (module.definition.attributes) {
            for (var i = 0; i < module.definition.attributes.length; i++) {
                code.push(this.getStringForSetAttribute(module.definition.attributes[i], module));
            }
        }
        return code;
    };
    CodeGenerator.getStringsForModuleAdded = function (module) {
        var strings = [];
        switch (module.definition.category) {
            case ModuleCategories_1["default"].NATIVE:
                {
                    var args = module.args ? module.args.join(',') : '';
                    var moduleId = this.createBreadcrumbModuleId(module);
                    strings.push('var ' + moduleId + ' = ' + CodeGenerator.AUDIOCONTEXT_NAME + '.' + module.definition.js + '(' + args + ');');
                    if (module.definition.type === ModuleTypes_1["default"].OSCILLATOR) {
                        strings.push(moduleId + '.start();');
                    }
                    break;
                }
            case ModuleCategories_1["default"].PROXY:
                {
                    // todo?
                    break;
                }
            default:
                {
                    console.warn('Unhandled module category: ' + module.definition.category);
                }
        }
        return strings;
    };
    CodeGenerator.createBreadcrumbModuleId = function (module) {
        // when in a subpatch, creates an id like this: topsubpatch$nestedsubpatch$moduleId
        var breadcrumb = module.createBreadcrumb();
        if (breadcrumb.length > 0) {
            return breadcrumb.join('$') + '$' + module.id;
        }
        else {
            return module.id;
        }
    };
    CodeGenerator.getPatchModulesCreationCode = function (patch) {
        var code = [];
        for (var i = 0; i < patch.modules.length; i++) {
            if (patch.modules[i].definition.category === ModuleCategories_1["default"].NATIVE) {
                code = code.concat(this.getStringsForModuleAdded(patch.modules[i]));
            }
            else if (patch.modules[i].definition.type === ModuleTypes_1["default"].SUBPATCH) {
                code = code.concat(this.getPatchModulesCreationCode(patch.modules[i].subPatch));
            }
        }
        return code;
    };
    CodeGenerator.getPatchConnectionsCode = function (patch) {
        var code = [];
        // get all connections in the patch
        var connections = patch.getConnectionsWithNested();
        // get the api connections for those
        var apiConnections = [];
        for (var i = 0; i < connections.length; i++) {
            apiConnections = apiConnections.concat(connections[i].getApiConnections());
        }
        // get the code for each api connection and avoid duplicates (TODO are there duplicates? and why?)
        if (apiConnections.length > 0) {
            var done = [];
            for (var i = 0; i < apiConnections.length; i++) {
                var connection = apiConnections[i];
                if (!Utils_1.connectionIsInList(connection, done)) {
                    code.push(this.getStringForConnectionAdded(connection));
                    done.push(connection);
                }
            }
        }
        return code;
    };
    CodeGenerator.getPatchSetAttributesCode = function (patch) {
        // loops through all (nested) modules and creates code for every attribute
        var code = [];
        for (var i = 0; i < patch.modules.length; i++) {
            if (patch.modules[i].definition.category === ModuleCategories_1["default"].NATIVE) {
                code = code.concat(this.getStringsForModuleSetAttributes(patch.modules[i]));
            }
            else if (patch.modules[i].definition.type === ModuleTypes_1["default"].SUBPATCH) {
                code = code.concat(this.getPatchSetAttributesCode(patch.modules[i].subPatch));
            }
        }
        return code;
    };
    CodeGenerator.generateCodeForPatch = function (patch) {
        var code = '';
        var modulesCode = this.getPatchModulesCreationCode(patch);
        if (modulesCode.length === 0) {
            code += '// patch is empty, no code to generate';
            return code;
        }
        code += this.getStringForInit() + '\n\n';
        code += '// create the audio nodes\n';
        code += modulesCode.join('\n') + '\n';
        code += '\n';
        // module attribute values (indeed: loops through modules again)
        var attributesCode = this.getPatchSetAttributesCode(patch);
        if (attributesCode.length > 0) {
            code += '// set attributes on the nodes\n';
            code += attributesCode.join('\n') + '\n';
        }
        code += '\n';
        // connection creation
        var connectionsCode = this.getPatchConnectionsCode(patch);
        if (connectionsCode.length > 0) {
            code += '// connect the nodes\n';
            code += connectionsCode.join('\n') + '\n';
        }
        return code;
    };
    CodeGenerator.AUDIOCONTEXT_NAME = 'audioContext';
    return CodeGenerator;
}());
exports.__esModule = true;
exports["default"] = CodeGenerator;
