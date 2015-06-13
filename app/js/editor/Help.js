define([	
	'AbstractOverlayElement'

],function(
	
	AbstractOverlayElement
) {

	Help.prototype = Object.create(AbstractOverlayElement.prototype);
	Help.prototype.constructor = Help;

	function Help(patch)
	{
		// init extended setup
		this.containerId = 'help';
		AbstractOverlayElement.call(this, 300, 300, this.containerId);

		this.$container.append($('<h2>', {text: 'Help'}));	

		this.$container.append($('<ul>', {class: 'help'}).html('<li>Hold alt to drag screen</li><li>Drag from an output to an intput (or the other way around) to create a connection</li><li>Click a connection to remove it</li>'));			
	}

	return Help;

});