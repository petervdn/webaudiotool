define(["require", "exports", "../patchwork/core/EventDispatcher", "./net/Tracking", "../patchwork/enum/ModuleCategories", "../patchwork/config/ModuleDefinitions", "./event/HeaderEvent", "./MenuConfig"], function (require, exports, EventDispatcher_1, Tracking_1, ModuleCategories_1, ModuleDefinitions_1, HeaderEvent_1, MenuConfig_1) {
    "use strict";
    class Header extends EventDispatcher_1.default {
        constructor() {
            super();
            this.$header = $('.siteheader');
            this.$menu = this.$header.find('.menu');
            // inject the modules into the config
            this.insertModulesIntoConfig(ModuleCategories_1.default.NATIVE, MenuConfig_1.default.items[1]);
            this.insertModulesIntoConfig('destination', MenuConfig_1.default.items[1]);
            this.insertModulesIntoConfig(ModuleCategories_1.default.PROXY, MenuConfig_1.default.items[2]);
            this.createMenu();
        }
        insertModulesIntoConfig(moduleCategory, menuItem) {
            var modules = ModuleDefinitions_1.default.findByCategory(moduleCategory);
            for (var i = 0; i < modules.length; i++) {
                menuItem.items.push({
                    name: modules[i].label,
                    id: 'module.' + modules[i].type
                });
            }
        }
        handleMenuItemClick(event) {
            // TODO close all submenus
            //$menus.css('display: none');
            var id = $(event.target).attr('data-id');
            var type = id.split('.')[0];
            var data = id.split('.')[1];
            Tracking_1.default.trackEvent('menu_select', id);
            switch (type) {
                case 'patch':
                    {
                        this.dispatchEvent(HeaderEvent_1.default.MENU_ITEM_SELECTED, { type: type, data: data });
                        break;
                    }
                case 'module':
                    {
                        var moduleType = data;
                        var definition = ModuleDefinitions_1.default.findByType(moduleType);
                        var args = [];
                        if (definition.args) {
                            // node needs constructor arguments
                            for (var i = 0; i < definition.args.length; i++) {
                                args.push(prompt(definition.args[i].label));
                            }
                        }
                        this.patch.addModuleByType(moduleType, args);
                        break;
                    }
                default:
                    {
                        console.log('Unhandled menu selection: ' + id);
                        break;
                    }
            }
        }
        createMenu() {
            for (var i = 0; i < MenuConfig_1.default.items.length; i++) {
                var item = MenuConfig_1.default.items[i];
                var $item = $('<li>').html('<h2>' + item.name + '</h2>');
                this.$menu.append($item);
                // sub items
                let $subItems = $('<ul>', { class: 'sub' });
                for (var j = 0; j < item.items.length; j++) {
                    var subItem = item.items[j];
                    var $subItem = $('<li>');
                    var $a = $('<a>', { href: '#', text: subItem.name }).attr('data-id', subItem.id);
                    $subItem.append($a);
                    $subItems.append($subItem);
                    $a.on('click', this.handleMenuItemClick.bind(this));
                }
                $item.append($subItems);
                $item.on('mouseenter', function (event) {
                    $(event.currentTarget).find('ul').css('display', 'block');
                });
                $item.on('mouseleave', function (event) {
                    //console
                    $(event.currentTarget).find('ul').css('display', 'none');
                });
            }
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Header;
});
