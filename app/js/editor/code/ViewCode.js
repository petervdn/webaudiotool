define([
	'Patch',
	'ModuleCategories',
	'AttributeTypes',
	'PatchEvent',
	'AudioContextManagerEvent',
	'ModuleTypes',
	'Utils',
	'AbstractOverlayElement',
	'CodeGenerator'

],function(
	Patch,
	ModuleCategories,
	AttributeTypes,
	PatchEvent,
	AudioContextManagerEvent,
	ModuleTypes,
	Utils,
	AbstractOverlayElement,
	CodeGenerator
) {

	ViewCode.prototype = Object.create(AbstractOverlayElement.prototype);
	ViewCode.prototype.constructor = ViewCode;

	function ViewCode(patch)
	{
		// init extended setup
		this.containerId = 'code';
		AbstractOverlayElement.call(this, 600, 600, this.containerId);

		// create elements
		this.$container.append($('<h2>', {text: 'Generated code'}));	
		this.$code = $('<pre>');
		this.$container.append(this.$code);
	}

	ViewCode.prototype.show = function()
	{
		AbstractOverlayElement.prototype.show.call(this, this.containerId);
	}

	ViewCode.prototype.showFullCode = function(patch)
	{
		this.$code.html(CodeGenerator.generateCodeForPatch(patch));
				
		this.show();
	}

	return ViewCode;
});