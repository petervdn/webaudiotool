import BufferManager from "../../patchwork/core/BufferManager";
import BufferManagerEvent from "../../patchwork/event/BufferManagerEvent";
import Buffer from "../../patchwork/core/Buffer";
import VisualBuffer from "./VisualBuffer";

declare var $:any;

class BufferList
{
    public $element;
    public bufferManager:BufferManager;
    public $list:any;

    constructor(bufferManager:BufferManager)
    {
        this.$element = $('#bufferlist');

        this.bufferManager = bufferManager;

        // listen to events
        this.bufferManager.addEventListener(BufferManagerEvent.BUFFER_ADDED, this.handleBufferManagerEvent.bind(this)); // todo fix so we can remove

        // add new buffer
        $('a.new', this.$element).click(function() {
            this.bufferManager.addBuffer();
        }.bind(this));

        this.$list = $('ul.list', this.$element);
    }

    public handleBufferManagerEvent(type:string, data:any):void
    {
        switch(type)
        {
            case BufferManagerEvent.BUFFER_ADDED:
            {
                this.addVisualBuffer(data.buffer);
                break;
            }
            case BufferManagerEvent.BUFFER_REMOVED:
            {
                // this.update(); todo!?
                break;
            }
            default:
            {
                console.error('Unhandled event: ' + type);
            }
        }
    }

    public addVisualBuffer(buffer:Buffer):void
    {
        var visualBuffer = new VisualBuffer(buffer);

        var $li = $('<li>');

        $li.append(visualBuffer.$element);
        this.$list.append($li);
    }

}

export default BufferList