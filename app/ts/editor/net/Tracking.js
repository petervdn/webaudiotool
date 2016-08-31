"use strict";
var Tracking = (function () {
    function Tracking() {
    }
    Tracking.trackEvent = function (event, label) {
        if (Tracking.DO_TRACK === false)
            return;
        if (ga.loaded) {
            ga('send', 'event', event, label);
        }
        else {
            console.log('%ctrackEvent: ' + event + ' - ' + label, 'color: green');
        }
    };
    Tracking.DO_TRACK = false;
    return Tracking;
}());
exports.__esModule = true;
exports["default"] = Tracking;
//# sourceMappingURL=Tracking.js.map