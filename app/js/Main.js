require([
	'editor/Editor',
	'jquery',
	'Tracking'
], function(
	Editor,
	$,
	Tracking
) {
	
	Array.prototype.pushArray = function(arr) {
	    this.push.apply(this, arr);
	};
	

	
	var AudioContext = window.AudioContext || window.webkitAudioContext;

	if(!AudioContext)
	{
		alert('Your browser does not support Web Audio');
	}
	else
	{
		context = new AudioContext();
		var editor = new Editor(context);

		var loadPatchId = getParameterByName('patch');
		if(loadPatchId)
		{
			$.ajax({
				url: '../api.php',
				data: {action: 'get_patch', patch: loadPatchId}
			}).done(function(result)
			{
				result = JSON.parse(result);
				
				if(result.success)
				{
					var patch = JSON.parse(result.data);
					editor.patch.fromObject(patch);
				}
				else
				{
					console.error(result);
				}
				// prevents tracking of every module/connection being added
				Tracking.doTrack = true;
				Tracking.trackEvent('load_on_start', loadPatchId);
			});
		}
		else
		{
			Tracking.doTrack = true;
		}

		window.patch = editor.patch;
	}

	function getParameterByName(name)
	{
    	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

});