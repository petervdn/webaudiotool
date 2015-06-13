define(function() {
	return {

		getModuleIdByRemoveButton: function(element)
		{
			var moduleElement = element.parentNode.parentNode;
			return moduleElement.dataset.id;
		},

		elementIsRemoveModuleButton: function(element)
		{
			return element.classList.contains('remove');
		},

		elementIsTransput: function(element)
		{
			return (element.classList.contains('input') || element.classList.contains('output'));
		},

		elementIsInput: function(element)
		{
			return element.classList.contains('input');
		},

		elementIsOutput: function(element)
		{
			return element.classList.contains('output');
		},

		getModuleIdByTransputElement: function(transputElement)
		{
			var moduleElement = transputElement.parentNode.parentNode;
			return moduleElement.dataset.id;
		}
	}
})