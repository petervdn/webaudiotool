define(["require", "exports"], function (require, exports) {
    "use strict";
    function logConnections(label, connections, indent) {
        if (!indent)
            indent = '';
        console.log(indent + label);
        for (var i = 0; i < connections.length; i++)
            console.log(indent + i + ' - ' + connections[i].toString());
    }
    exports.logConnections = logConnections;
});
