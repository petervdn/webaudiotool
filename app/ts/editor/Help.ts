import AbstractOverlayElement from "./AbstractOverlayElement";
import Patch from "../patchwork/core/Patch";

declare var $:any;

class Help extends AbstractOverlayElement
{
    constructor(patch:Patch) // todo why the patch as param?
    {
        super(300, 300, 'help');
        
        this.$container.append($('<h2>', {text: 'Help'}));

        this.$container.append($('<ul>', {class: 'help'}).html('<li>Hold alt to drag screen</li><li>Drag from an output to an intput (or the other way around) to create a connection</li><li>Click a connection to remove it</li>'));
    }
}

export default Help