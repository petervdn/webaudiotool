import EventDispatcher from "./EventDispatcher";
import BufferManagerEvent from "../event/BufferManagerEvent";
import Buffer from "./Buffer";

class BufferManager extends EventDispatcher
{
	public audioContext:AudioContext;
	public buffers:Array<any> = [];
	public counter:number = 0;
	
	constructor(audioContext:AudioContext)
	{
		super();
		
		this.audioContext = audioContext;
	}

	public addBuffer():void
	{
		var id = 'buffer-' + (++this.counter);
		var buffer = new Buffer(id);
		this.buffers.push(buffer);
		this.dispatchEvent(BufferManagerEvent.BUFFER_ADDED, {buffer: buffer});
	}

	public removeBuffer(buffer):void
	{

	}
}

export default BufferManager;