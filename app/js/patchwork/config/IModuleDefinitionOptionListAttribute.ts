import IAbstractModuleDefinitionAttribute from "./IAbstractModuleDefinitionAttribute";

interface IModuleDefinitionOptionListAttribute extends IAbstractModuleDefinitionAttribute
{
	options:Array<any>; // todo as string maybe? or add a string/number type?
}

export default IModuleDefinitionOptionListAttribute;