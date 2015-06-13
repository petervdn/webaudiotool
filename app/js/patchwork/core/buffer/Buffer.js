define([
	'EventDispatcher'
], function(
	EventDispatcher
) {

	Buffer.prototype = Object.create(EventDispatcher.prototype);
	Buffer.prototype.constructor = Buffer;

	function Buffer(id)
	{
		this.id = id;
	}

	return Buffer;
});