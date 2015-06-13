define([], function() {



	function EventDispatcher()
	{
		this.eventListeners = {};
	}

	EventDispatcher.prototype.addEventListener = function(type, callback)
	{
		if(typeof type === 'undefined')
		{
			console.error('Type is undefined, cannot add listener');
		}
		else if(typeof callback === 'undefined')
		{
			console.error('Callback is undefined, cannot add listener');
		}
		else
		{
			if(!this.eventListeners[type]) this.eventListeners[type] = [];

			this.eventListeners[type].push(callback);

			//console.log('Callback added for: ' + type);
		}
	}

	EventDispatcher.prototype.removeEventListener = function(type, callback)
	{
		if(typeof type === 'undefined')
		{
			console.error('Type is undefined, cannot remove listener');
		}
		else
		{
			if(this.eventListeners[type])
			{
				var index = this.eventListeners[type].indexOf(callback);

				if(index >= 0)
				{
					this.eventListeners[type].splice(index, 1);
				}
			}
		}	
	}

	EventDispatcher.prototype.dispatchEvent = function(type, data)
	{
		if(typeof type === 'undefined')
		{
			console.error('Type is undefined, cannot dispatch event', this.constructor);
		}
		else
		{
			if(this.eventListeners[type])
			{
				var len = this.eventListeners[type].length; // TODO WTFFFFF
				for(var i = 0; i < len; i++)
				{
					this.eventListeners[type][i](type, data);
				}
			}
		}
	}

	EventDispatcher.prototype.showAllEventListeners = function()	
	{
		console.log(this.eventListeners);
	}

	EventDispatcher.prototype.removeAllEventListeners = function()
	{
		this.eventListeners = {};
	}

	return EventDispatcher;
})