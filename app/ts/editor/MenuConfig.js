"use strict";
var MenuConfig = (function () {
    function MenuConfig() {
    }
    MenuConfig.get = function () {
        return {
            items: [
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
                            id: 'patch.save'
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
            ]
        };
    };
    return MenuConfig;
}());
exports.__esModule = true;
exports["default"] = MenuConfig;
//# sourceMappingURL=MenuConfig.js.map