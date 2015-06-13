define([
	'EventDispatcher',
	'Buffer',
	'BufferManagerEvent'
], function(
	EventDispatcher,
	Buffer,
	BufferManagerEvent
) {

	BufferManager.prototype = Object.create(EventDispatcher.prototype);
	BufferManager.prototype.constructor = BufferManager;

	function BufferManager(audioContext)
	{
		EventDispatcher.call(this);

		this.audioContext = audioContext;

		this.buffers = [];
		this.counter = 0;
	}

	BufferManager.prototype.addBuffer = function()
	{
		var id = 'buffer-' + (++this.counter);
		var buffer = new Buffer(id);
		this.buffers.push(buffer);
		this.dispatchEvent(BufferManagerEvent.BUFFER_ADDED, {buffer: buffer});
	}

	BufferManager.prototype.removeBuffer = function(buffer)
	{

	}

	return BufferManager;
});