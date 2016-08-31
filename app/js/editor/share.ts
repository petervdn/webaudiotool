import AbstractOverlayElement from "./AbstractOverlayElement";
import Patch from "../patchwork/core/Patch";
declare var $:any;

class Share extends AbstractOverlayElement // todo rename file
{
    public $content:any;
    public $button:any;
    public $error;
    public $textfield;
    public patch:Patch;

    constructor(patch:Patch)
    {
        super(400, 200, 'share');

        // create elements
        this.$container.append($('<h2>', {text: 'Share your patch'}));
        this.$content = $('<div>', {class: 'content'});
        this.$button = $('<button>', {text: 'Generate link'});
        this.$error = $('<div>', {class: 'error', text: 'Error!'});

        this.$button.click(function()
        {
            this.$button.hide();
            var jsonPatch = JSON.stringify(this.patch.toObject());

            $.post('../api.php', {patch: jsonPatch, action: 'share'}, function(result)
            {
                result = JSON.parse(result);

                if(result.success)
                {
                    if(result.data.bitly)
                    {
                        // show bitly url
                        this.$textfield.val(result.data.bitly);

                    }
                    else
                    {
                        // bitly failed, show own url
                        this.$textfield.val(result.data.url);
                        this.$textfield.css('font-size', '10px');
                    }

                    this.$textfield.show();
                }
                else
                {
                    this.$error.text('There was an error, please try again later');
                    this.$error.show();
                }

            }.bind(this));
        }.bind(this));

        this.$textfield = $('<input type="text">');

        this.$content.append(this.$button);
        this.$content.append(this.$textfield);
        this.$content.append(this.$error);

        this.$container.append(this.$content);
    }


    public show():void
    {
        this.$textfield.hide();
        this.$error.hide();
        this.$button.show();

        super.show();
    }
}

export default Share;