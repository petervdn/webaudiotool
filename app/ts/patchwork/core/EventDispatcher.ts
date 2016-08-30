class EventDispatcher
{
	private _eventListeners = {};

	constructor()
	{

	}

	public addEventListener(type, callback):void
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
			if(!this._eventListeners[type]) this._eventListeners[type] = [];

			this._eventListeners[type].push(callback);

			//console.log('Callback added for: ' + type);
		}
	}

	public removeEventListener(type, callback):void
	{
		if(typeof type === 'undefined')
		{
			console.error('Type is undefined, cannot remove listener');
		}
		else
		{
			if(this._eventListeners[type])
			{
				var index = this._eventListeners[type].indexOf(callback);

				if(index >= 0)
				{
					this._eventListeners[type].splice(index, 1);
				}
			}
		}
	}

	public dispatchEvent(type:string, data?:any):void
	{
		if(typeof type === 'undefined')
		{
			console.error('Type is undefined, cannot dispatch event', this.constructor);
		}
		else
		{
			if(this._eventListeners[type])
			{
				var len = this._eventListeners[type].length; // TODO WTFFFFF
				for(var i = 0; i < len; i++)
				{
					this._eventListeners[type][i](type, data);
				}
			}
		}
	}

	public showAllEventListeners():void
	{
		console.log(this._eventListeners);
	}

	public removeAllEventListeners()
	{
		this._eventListeners = {};
	}
}

export default EventDispatcher;