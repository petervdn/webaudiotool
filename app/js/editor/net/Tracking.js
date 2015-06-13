define({
	
	doTrack: false,

	trackEvent: function(event, label)
	{
		if(this.doTrack === false) return;

		if(ga.loaded)
		{
			ga('send', 'event', event, label);	
		}
		else
		{
			console.log('%ctrackEvent: ' + event + ' - ' + label, 'color: green');	
		}
		
	}
});