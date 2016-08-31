class MenuConfig
{
    public static items =
        [
		    {
		        name: "Patch",
		        items: [
		            {
		                name: 'Clear patch',
		                id: 'patch.clear'
		            },
		            {
		                name: 'Load patch',
		                id: 'patch.load',
		                type: 'action'
		            },
		            {
		                name: 'Save patch',
		                id: 'patch.save',
		            }
		        ]
		    },

		    {
		        name: "Native modules",
		        items: [

		        ]
		    },

		    {
		        name: "Proxy modules",
		        items: [

		        ]
		    },

		    {
		        name: "Subpatches",
		        items: [

		        ]
		    }
        ];
}

export default MenuConfig;