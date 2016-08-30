import Patch from "../patchwork/core/Patch";
import AbstractOverlayElement from "./AbstractOverlayElement";
import CodeGenerator from "./code/CodeGenerator";

declare var $:any

class ViewCode extends AbstractOverlayElement
{
    public $code:any;

    constructor(patch:Patch)
    {
        // init extended setup
        //this.containerId = 'code';
        super(600, 600, 'code');

        // create elements
        this.$container.append($('<h2>', {text: 'Generated code'}));
        this.$code = $('<pre>');
        this.$container.append(this.$code);
    }


    public showFullCode(patch:Patch):void
    {
        this.$code.html(CodeGenerator.generateCodeForPatch(patch));

        this.show();
    }
}

export default ViewCode;