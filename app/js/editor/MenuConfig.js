define(["require", "exports"], function (require, exports) {
    "use strict";
    class MenuConfig {
    }
    MenuConfig.items = [
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
            items: []
        },
        {
            name: "Proxy modules",
            items: []
        },
        {
            name: "Subpatches",
            items: []
        }
    ];
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MenuConfig;
});
