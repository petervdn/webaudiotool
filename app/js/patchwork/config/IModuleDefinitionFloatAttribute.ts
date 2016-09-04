import IAbstractModuleDefinitionAttribute from "./IAbstractModuleDefinitionAttribute";

interface IModuleDefinitionFloatAttribute extends IAbstractModuleDefinitionAttribute
{
	min?:number;
	max?:number;
}

export default IModuleDefinitionFloatAttribute;