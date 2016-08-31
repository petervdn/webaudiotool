"use strict";
function connectionIsInList(connection, connectionList, ignoreDestination) {
    if (ignoreDestination === void 0) { ignoreDestination = false; }
    for (var i = 0; i < connectionList.length; i++) {
        if (!ignoreDestination) {
            if (connection.sourceModule === connectionList[i].sourceModule &&
                connection.sourceOutputIndex === connectionList[i].sourceOutputIndex &&
                connection.destinationModule === connectionList[i].destinationModule &&
                connection.destinationInputIndex === connectionList[i].destinationInputIndex) {
                return true;
            }
        }
        else {
            if (connection.sourceModule === connectionList[i].sourceModule &&
                connection.sourceOutputIndex === connectionList[i].sourceOutputIndex) {
                return true;
            }
        }
    }
    return false;
}
exports.connectionIsInList = connectionIsInList;
function logConnections(label, connections, indent) {
    if (!indent)
        indent = '';
    console.log(indent + label);
    for (var i = 0; i < connections.length; i++)
        console.log(indent + i + ' - ' + connections[i].toString());
}
exports.logConnections = logConnections;
