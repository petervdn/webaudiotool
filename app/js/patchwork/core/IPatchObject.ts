import Module from "./Module";
import IModuleObject from "./IModuleObject";
import IConnectionObject from "./IConnectionObject";

interface IPatchObject
{
    modules:Array<IModuleObject>;
    connections:Array<IConnectionObject>;
}

export default IPatchObject;