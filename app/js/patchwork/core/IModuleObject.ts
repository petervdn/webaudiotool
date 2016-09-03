import IPoint from "../../editor/data/interface/IPoint";
import IPatchObject from "./IPatchObject";

interface IModuleObject
{
    id: string;
    pos: IPoint;
    args: any; // todo type
    attributes: any; // todo type,
    subPatch: IPatchObject;
}

export default IModuleObject