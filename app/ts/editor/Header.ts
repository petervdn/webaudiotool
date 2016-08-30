import EventDispatcher from "../patchwork/core/EventDispatcher";
import Tracking from "./net/Tracking";
import ModuleCategories from "../patchwork/enum/ModuleCategories";
import ModuleDefinitions from "../patchwork/config/ModuleDefinitions";
import HeaderEvent from "./event/HeaderEvent";
import MenuConfig from "./MenuConfig";
import Patch from "../patchwork/core/Patch";

declare var $:any;

class Header extends EventDispatcher
{
    public $header:any;
    public $menu:any;
    public patch:Patch;

    constructor()
    {
        super();

        this.$header = $('.siteheader');
        this.$menu = this.$header.find('.menu');

        // inject the modules into the config
        this.insertModulesIntoConfig(ModuleCategories.NATIVE, MenuConfig.get().items[1]);
        this.insertModulesIntoConfig('destination', MenuConfig.get().items[1]);
        this.insertModulesIntoConfig(ModuleCategories.PROXY, MenuConfig.get().items[2]);

        this.createMenu();
    }

    public insertModulesIntoConfig(moduleCategory:string, menuItem:any):void
    {
        var modules = ModuleDefinitions.findByCategory(moduleCategory);
        for(var i = 0; i < modules.length; i++)
        {
            menuItem.items.push({
                name: modules[i].label,
                id: 'module.' + modules[i].type
            });
        }
    }

    public handleMenuItemClick(event):void
    {
        // TODO close all submenus
        //$menus.css('display: none');

        var id = $(event.target).attr('data-id');

        var type = id.split('.')[0];
        var data = id.split('.')[1];

        Tracking.trackEvent('menu_select', id);

        switch(type)
        {
            case 'patch':
            {
                this.dispatchEvent(HeaderEvent.MENU_ITEM_SELECTED, {type: type, data: data});
                break;
            }
            case 'module':
            {
                var moduleType = data;
                var definition = ModuleDefinitions.findByType(moduleType);

                var args = [];
                if(definition.args)
                {
                    // node needs constructor arguments
                    for(var i = 0; i < definition.args.length; i++)
                    {
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

    public createMenu():void
    {
        for(var i = 0; i < MenuConfig.get().items.length; i++)
        {
            var item = MenuConfig.get().items[i];

            var $item = $('<li>').html('<h2>' + item.name + '</h2>');

            this.$menu.append($item);


            // sub items
            let $subItems = $('<ul>', {class: 'sub'});
            for(var j = 0; j < item.items.length; j++)
            {
                var subItem = item.items[j];
                var $subItem = $('<li>');
                var $a = $('<a>', {href: '#', text: subItem.name}).attr('data-id', subItem.id);

                $subItem.append($a);
                $subItems.append($subItem);

                $a.on('click', this.handleMenuItemClick.bind(this));
            }

            $item.append($subItems);

            $item.on('mouseenter', function(event) {
                $(event.currentTarget).find('ul').css('display', 'block');
            });

            $item.on('mouseleave', function(event) {
                //console
                $(event.currentTarget).find('ul').css('display', 'none');
            });

        }
    }
}

export default Header;