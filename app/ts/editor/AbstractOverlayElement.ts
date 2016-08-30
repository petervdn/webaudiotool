declare var $:any;

class AbstractOverlayElement
{
    public $overlay:any;
    public $container:any;
    public containerId:string;

    constructor(width:number, height:number, containerId:string)
    {
        this.$overlay = $('#overlay');
        this.containerId = containerId;

        this.$overlay.click(function(event)
        {
            if(event.target === this.$overlay[0]) this.hide();
        }.bind(this));

        this.$container = $('<div>', {class: 'container ' + containerId});
        this.$container.css({width: width, height: height, display: 'none'});

        this.$overlay.append(this.$container);
    }

     public show():void
    {
        this.$overlay.show();

        this.$overlay.find('.' + this.containerId).show();

        $('body').removeClass('noselect');

    }

    public hide():void
    {
        $('body').addClass('noselect');

        this.$overlay.find('.' + this.containerId).hide();

        this.$overlay.hide();
    }
}

export default AbstractOverlayElement;