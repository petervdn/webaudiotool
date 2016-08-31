import Module from "../../patchwork/core/Module";
import Connection from "../../patchwork/core/Connection";
import Patch from "../../patchwork/core/Patch";
import AttributeTypes from "../../patchwork/enum/AttributeTypes";
import ModuleCategories from "../../patchwork/enum/ModuleCategories";
import ModuleTypes from "../../patchwork/enum/ModuleTypes";

class CodeGenerator
{
    private static AUDIOCONTEXT_NAME:string = 'audioContext';

    public static getStringForModuleRemoved(module:Module):string
    {
        return CodeGenerator.createBreadcrumbModuleId(module) + ' = null;';
    }

    public static getStringForOutputDisconnected(module:Module, outputIndex:string):string
    {
        return CodeGenerator.createBreadcrumbModuleId(module) + '.disconnect(' + outputIndex + ');';
    }

    public static getStringForInit():string
    {
        return 'var ' + CodeGenerator.AUDIOCONTEXT_NAME + ' = new(window.AudioContext || window.webkitAudioContext);';
    }

    public static getStringForConnectionAdded(connection:Connection):string
    {
        var sourceName = CodeGenerator.createBreadcrumbModuleId(connection.sourceModule);

        // when transput is -1 there is an output in the root. this will be considered the context destination (input is always 0 in that case)
        if(connection.destinationInputIndex === -1)
        {
            var destinationName = CodeGenerator.AUDIOCONTEXT_NAME + '.destination';
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
    }

    public static getStringForSetAttribute(attribute:any, module:Module):string
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
    }

    public static getStringsForModuleSetAttributes(module:Module):Array<string>
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
    }

    public static getStringsForModuleAdded(module:Module):Array<string>
    {
        var strings = [];
        switch(module.definition.category)
        {
            case ModuleCategories.NATIVE:
            {
                var args = module.args ? module.args.join(',') : '';

                var moduleId = this.createBreadcrumbModuleId(module);
                strings.push('var ' + moduleId + ' = '+ CodeGenerator.AUDIOCONTEXT_NAME + '.' + module.definition.js + '(' + args + ');');

                if(module.definition.type === ModuleTypes.OSCILLATOR)
                {
                    strings.push(moduleId + '.start();');
                }
                break;
            }
            case ModuleCategories.PROXY:
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
    }

    public static createBreadcrumbModuleId(module:Module):string
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
    }

    public static getPatchModulesCreationCode(patch:Patch):Array<string>
    {
        var code = [];
        for(var i = 0; i < patch.modules.length; i++)
        {
            if(patch.modules[i].definition.category === ModuleCategories.NATIVE)
            {
                code = code.concat(this.getStringsForModuleAdded(patch.modules[i]));
            }
            else if(patch.modules[i].definition.type === ModuleTypes.SUBPATCH)
            {
                code = code.concat(this.getPatchModulesCreationCode(patch.modules[i].subPatch));
            }
        }

        return code;
    }

    public static getPatchConnectionsCode(patch:Patch):Array<string>
    {
        var code = [];

        // get all connections in the patch
        var connections = patch.getConnectionsWithNested();

        // get the api connections for those
        var apiConnections:Array<Connection> = [];
        for(var i = 0; i < connections.length; i++)
        {
            apiConnections = apiConnections.concat(connections[i].getApiConnections());
        }

        // get the code for each api connection and avoid duplicates (TODO are there duplicates? and why?)
        if(apiConnections.length > 0)
        {
            var done:Array<Connection> = [];
            for(var i = 0; i < apiConnections.length; i++)
            {
                let connection:Connection = apiConnections[i];
                if(!connection.isInList(done))
                {
                    code.push(this.getStringForConnectionAdded(connection));

                    done.push(connection);
                }
            }
        }

        return code;
    }

    public static getPatchSetAttributesCode(patch:Patch):Array<string>
    {
        // loops through all (nested) modules and creates code for every attribute
        var code:Array<string> = [];
        for(var i = 0; i < patch.modules.length; i++)
        {
            if(patch.modules[i].definition.category === ModuleCategories.NATIVE)
            {
                code = code.concat(this.getStringsForModuleSetAttributes(patch.modules[i]));
            }
            else if(patch.modules[i].definition.type === ModuleTypes.SUBPATCH)
            {
                code = code.concat(this.getPatchSetAttributesCode(patch.modules[i].subPatch));
            }
        }

        return code;
    }

    public static generateCodeForPatch(patch:Patch):string
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

export default CodeGenerator;