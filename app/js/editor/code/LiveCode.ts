import CodeGenerator from "./CodeGenerator";
import PatchEvent from "../../patchwork/event/PatchEvent";
import AudioContextManagerEvent from "../../patchwork/event/AudioContextManagerEvent";
import Patch from "../../patchwork/core/Patch";
declare var $:any;

class LiveCode
{
    public $element:any;
    public $liveCode:any;
    public eventHandler:any;

    private newLine = '<br>'; // '&#10;' ?

    constructor(patch:Patch)
    {
        this.$element = $('#footer .livecode');
        this.$liveCode = this.$element; // todo ????

        this.resetLiveCode();

        // init listeners (listen to both patch and acm) TODO change to all eventlisteners on ACM?
        this.eventHandler = this.handleEvent.bind(this);
        patch.audioContextManager.addEventListener(AudioContextManagerEvent.MODULE_ADDED, this.eventHandler);
        patch.audioContextManager.addEventListener(AudioContextManagerEvent.CONNECTION_ADDED, this.eventHandler);
        patch.audioContextManager.addEventListener(AudioContextManagerEvent.OUTPUT_DISCONNECTED, this.eventHandler);

        patch.addEventListener(PatchEvent.PATCH_CLEARED, this.eventHandler);
        patch.addEventListener(PatchEvent.MODULE_ATTRIBUTE_CHANGED, this.eventHandler);
        patch.addEventListener(PatchEvent.MODULE_REMOVED, this.eventHandler);
    }


    public handleEvent(type:string, data:any):void
    {
        switch(type)
        {
            case AudioContextManagerEvent.MODULE_ADDED:
            {
                var strings = CodeGenerator.getStringsForModuleAdded(data.module);
                for(var i = 0; i < strings.length; i++) this.addToLiveCode(strings[i]);
                break;
            }
            case AudioContextManagerEvent.CONNECTION_ADDED:
            {
                this.addToLiveCode(CodeGenerator.getStringForConnectionAdded(data.connection));
                break;
            }
            case AudioContextManagerEvent.OUTPUT_DISCONNECTED:
            {
                this.addToLiveCode(CodeGenerator.getStringForOutputDisconnected(data.module, data.outputIndex));
                break;
            }
            case PatchEvent.PATCH_CLEARED:
            {
                //this.resetLiveCode();
                break;
            }
            case PatchEvent.MODULE_ATTRIBUTE_CHANGED:
            {
                this.addToLiveCode(CodeGenerator.getStringForSetAttribute(data.attribute, data.module));
                break;
            }
            case PatchEvent.MODULE_REMOVED:
            {
                this.addToLiveCode(CodeGenerator.getStringForModuleRemoved(data.module));
                break;
            }
        }
    }

    public resetLiveCode():void
    {
        this.$liveCode.html('');
        this.$liveCode.append(CodeGenerator.getStringForInit() + this.newLine);
    }

    public addToLiveCode(code:string):void
    {
        this.$liveCode.html(this.$liveCode.html() + code + this.newLine);

        // update scrolling
        this.$liveCode[0].scrollTop = this.$liveCode[0].scrollHeight;
    }
}

export default LiveCode