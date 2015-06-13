define([
	'jquery'
], function(
	$
){

	function AbstractOverlayElement(width, height, containerId)
	{
		this.$overlay = $('#overlay');	
		this.containerId = containerId;

		this.$overlay.click(function(event)
		{
			if(event.target === this.$overlay[0]) this.hide();
		}.bind(this));

		this.$container = $('<div>', {class: 'container ' + containerId});
		this.$container.css({width: width, height: height, display: 'none'});

		this.$overlay.append(this.$container);
	}

	AbstractOverlayElement.prototype.show = function()
	{
		this.$overlay.show();	

		this.$overlay.find('.' + this.containerId).show();

		$('body').removeClass('noselect');
		
	}

	AbstractOverlayElement.prototype.hide = function()
	{
		$('body').addClass('noselect');

		this.$overlay.find('.' + this.containerId).hide();

		this.$overlay.hide();	
	}
	

	return AbstractOverlayElement;
});