declare var ga:any;

class Tracking
{
    public static DO_TRACK:boolean = false;

    public static trackEvent(event:string, label:string):void
    {
        if(Tracking.DO_TRACK === false) return;

        if(ga.loaded)
        {
            ga('send', 'event', event, label);
        }
        else
        {
            console.log('%ctrackEvent: ' + event + ' - ' + label, 'color: green');
        }

    }
}

export default Tracking