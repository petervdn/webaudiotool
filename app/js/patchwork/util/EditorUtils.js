"use strict";
var EditorUtils = (function () {
    function EditorUtils() {
    }
    EditorUtils.getModuleIdByRemoveButton = function (element) {
        var moduleElement = element.parentNode.parentNode;
        return moduleElement.dataset.id;
    };
    EditorUtils.elementIsRemoveModuleButton = function (element) {
        return element.classList.contains('remove');
    };
    EditorUtils.elementIsTransput = function (element) {
        return (element.classList.contains('input') || element.classList.contains('output'));
    };
    EditorUtils.elementIsInput = function (element) {
        return element.classList.contains('input');
    };
    EditorUtils.elementIsOutput = function (element) {
        return element.classList.contains('output');
    };
    EditorUtils.getModuleIdByTransputElement = function (transputElement) {
        var moduleElement = transputElement.parentNode.parentNode;
        return moduleElement.dataset.id;
    };
    return EditorUtils;
}());
exports.__esModule = true;
exports["default"] = EditorUtils;
