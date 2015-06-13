define([
	'CodeGenerator',
	'AudioContextManagerEvent',
	'PatchEvent'
	], function(
	CodeGenerator,
	AudioContextManagerEvent,
	PatchEvent
) {

	function LiveCode(patch)
	{
		this.$element = $('#footer .livecode');
		this.$liveCode = this.$element;

		// some vars to use in text
		//this.newLine = '&#10;'; 
		this.newLine = '<br>'; 

		this.resetLiveCode();

		// init listeners (listen to both patch and acm) TODO change to all eventlisteners on ACM?
		this.eventHandler = this.handleEvent.bind(this);
		patch.audioContextManager.addEventListener(AudioContextManagerEvent.MODULE_ADDED, this.eventHandler);
		patch.audioContextManager.addEventListener(AudioContextManagerEvent.CONNECTION_ADDED, this.eventHandler);
		patch.audioContextManager.addEventListener(AudioContextManagerEvent.OUTPUT_DISCONNECTED, this.eventHandler);
		
		patch.addEventListener(PatchEvent.PATCH_CLEARED, this.eventHandler);
		patch.addEventListener(PatchEvent.MODULE_ATTRIBUTE_CHANGED, this.eventHandler);
		patch.addEventListener(PatchEvent.MODULE_REMOVED, this.eventHandler);
	}


	LiveCode.prototype.handleEvent = function(type, data)
	{
		switch(type)
		{
			case AudioContextManagerEvent.MODULE_ADDED:
			{
				var strings = CodeGenerator.getStringsForModuleAdded(data.module);
				for(var i = 0; i < strings.length; i++) this.addToLiveCode(strings[i]);				
				break;
			}
			case AudioContextManagerEvent.CONNECTION_ADDED:
			{
				this.addToLiveCode(CodeGenerator.getStringForConnectionAdded(data.connection));
				break;
			}
			case AudioContextManagerEvent.OUTPUT_DISCONNECTED:
			{
				this.addToLiveCode(CodeGenerator.getStringForOutputDisconnected(data.module, data.outputIndex));	
				break;
			}
			case PatchEvent.PATCH_CLEARED:
			{
				//this.resetLiveCode();
				break;
			}
			case PatchEvent.MODULE_ATTRIBUTE_CHANGED:
			{
				this.addToLiveCode(CodeGenerator.getStringForSetAttribute(data.attribute, data.module));
				break;
			}
			case PatchEvent.MODULE_REMOVED:
			{
				this.addToLiveCode(CodeGenerator.getStringForModuleRemoved(data.module));
				break;
			}
		}
	}

	LiveCode.prototype.resetLiveCode = function()
	{
		this.$liveCode.html('');
		this.$liveCode.append(CodeGenerator.getStringForInit() + this.newLine);
	}
	
	LiveCode.prototype.addToLiveCode = function(string)
	{
		this.$liveCode.html(this.$liveCode.html() + string + this.newLine);

		// update scrolling
		this.$liveCode[0].scrollTop = this.$liveCode[0].scrollHeight;
	}

	return LiveCode;

});