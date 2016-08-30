class PatchEvent
{
	public static MODULE_ADDED:string               = 'PatchEvent.MODULE_ADDED';
	public static MODULE_REMOVED:string             = 'PatchEvent.MODULE_REMOVED';
	public static CONNECTION_ADDED:string           = 'PatchEvent.CONNECTION_ADDED';
	public static CONNECTION_PRE_REMOVE:string      = 'PatchEvent.CONNECTION_PRE_REMOVE';
	public static CONNECTION_POST_REMOVE:string     = 'PatchEvent.CONNECTION_POST_REMOVE';
	public static PATCH_CLEARED:string              = 'PatchEvent.PATCH_CLEARED';
	public static MODULE_ATTRIBUTE_CHANGED:string   = 'PatchEvent.MODULE_ATTRIBUTE_CHANGED';
}

export default PatchEvent;