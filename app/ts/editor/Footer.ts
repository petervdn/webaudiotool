import FooterEvent from "./event/FooterEvent";
import Tracking from "./net/Tracking";
import EventDispatcher from "../patchwork/core/EventDispatcher";

declare var $:any; // todo

class Footer extends EventDispatcher
{
	public $element:any;
	public $breadcrumb:any;

	constructor()
	{
		super();

		this.$element = $('#footer');

		// init footer
		this.$breadcrumb = this.$element.find('.breadcrumb');

		this.$breadcrumb.on('click', function(event){ // todo arrow functions

			if($(event.target).is('a'))
			{
				// user clicked a link in breadcrumb
				var id = $(event.target).attr('data-id');

				this.dispatchEvent(FooterEvent.BREADCRUMB_CLICK, {id: id});
			}
		}.bind(this));

		// init some buttons
		this.$element.find('a.to_code').click(function()
		{
			this.dispatchEvent(FooterEvent.GENERATE_CODE);
		}.bind(this));

		this.$element.find('a.help').click(function()
		{
			this.dispatchEvent(FooterEvent.HELP);
		}.bind(this));

		this.$element.find('a.share').click(function()
		{
			this.dispatchEvent(FooterEvent.SHARE);
		}.bind(this));

		this.$element.find('a.twitter').click(function()
		{
			Tracking.trackEvent('click_out', 'twitter');
		}.bind(this));
	}

	public setBreadcrumb(patch):void
	{
		var list = patch.createParentList();

		var links = ['<a href="#">root</a>'];
		var usedIds = [];
		for(var i = 0; i < list.length; i++)
		{
			var subPatchId = list[i];
			usedIds.push(subPatchId);
			links.push('<a href="#" data-id="' + usedIds.join('$') + '">' + subPatchId + '</a>')
		}

		this.$breadcrumb.html('Now viewing: ' + links.join(' &#8594 '));
	}
}

export default Footer;