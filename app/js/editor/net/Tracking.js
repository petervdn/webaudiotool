define(["require", "exports"], function (require, exports) {
    "use strict";
    class Tracking {
        static trackEvent(event, label) {
            if (Tracking.DO_TRACK === false)
                return;
            if (ga.loaded) {
                ga('send', 'event', event, label);
            }
            else {
                console.log('%ctrackEvent: ' + event + ' - ' + label, 'color: green');
            }
        }
    }
    Tracking.DO_TRACK = false;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Tracking;
});
