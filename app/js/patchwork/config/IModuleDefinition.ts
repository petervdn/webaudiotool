import IModuleDefinitionOptionListAttribute from "./IModuleDefinitionOptionListAttribute";
import IModuleDefinitionFloatAttribute from "./IModuleDefinitionFloatAttribute";
import IModuleDefinitionReadOnlyAttribute from "./IModuleDefinitionReadOnlyAttribute";
interface IModuleDefinition
{
	type:string;
	label:string;
	category:string;
	js?:string;
	attributes?:Array<IModuleDefinitionOptionListAttribute | IModuleDefinitionFloatAttribute | IModuleDefinitionReadOnlyAttribute>;
	args?:Array<{label:string}>, // todo label property can be removed? just make an array of strings

	in?:number; // defines number of inputs for non-native modules
	out?:number;

	// todo set this up better, there should be two toplevel types: native and non-native
}

export default IModuleDefinition;