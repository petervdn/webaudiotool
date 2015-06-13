define([
	'jquery',
	'BufferManagerEvent',
	'VisualBuffer'
], function(
	$,
	BufferManagerEvent,
	VisualBuffer
) {

	function BufferList(bufferManager)
	{
		this.$element = $('#bufferlist');

		this.bufferManager = bufferManager;

		// listen to events
		this.bufferManager.addEventListener(BufferManagerEvent.BUFFER_ADDED, this.handleBufferManagerEvent.bind(this));

		// add new buffer
		$('a.new', this.$element).click(function() {
			this.bufferManager.addBuffer();
		}.bind(this));

		this.$list = $('ul.list', this.$element);
	}

	BufferList.prototype.handleBufferManagerEvent = function(type, data)
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
				this.update();
				break;
			}
			default:
			{
				console.error('Unhandled event: ' + type);
			}
		}
	}

	BufferList.prototype.addVisualBuffer = function(buffer)
	{
		var visualBuffer = new VisualBuffer(buffer);

		var $li = $('<li>');

		$li.append(visualBuffer.$element);
		this.$list.append($li);
	}

	return BufferList;
});