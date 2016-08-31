class EditorUtils
{
	public static getModuleIdByRemoveButton(element):string
	{
		var moduleElement = element.parentNode.parentNode;
		return moduleElement.dataset.id;
	}

	public static elementIsRemoveModuleButton(element):boolean
	{
		return element.classList.contains('remove');
	}

	public static elementIsTransput(element):boolean
	{
		return (element.classList.contains('input') || element.classList.contains('output'));
	}

	public static elementIsInput(element):boolean
	{
		return element.classList.contains('input');
	}

	public static elementIsOutput(element):boolean
	{
		return element.classList.contains('output');
	}

	public static getModuleIdByTransputElement(transputElement):string
	{
		var moduleElement = transputElement.parentNode.parentNode;
		return moduleElement.dataset.id;
	}
}

export default EditorUtils;