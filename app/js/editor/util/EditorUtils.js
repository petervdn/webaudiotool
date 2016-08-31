define(["require", "exports"], function (require, exports) {
    "use strict";
    class EditorUtils {
        static getModuleIdByRemoveButton(element) {
            var moduleElement = element.parentNode.parentNode;
            return moduleElement.dataset.id;
        }
        static elementIsRemoveModuleButton(element) {
            return element.classList.contains('remove');
        }
        static elementIsTransput(element) {
            return (element.classList.contains('input') || element.classList.contains('output'));
        }
        static elementIsInput(element) {
            return element.classList.contains('input');
        }
        static elementIsOutput(element) {
            return element.classList.contains('output');
        }
        static getModuleIdByTransputElement(transputElement) {
            var moduleElement = transputElement.parentNode.parentNode;
            return moduleElement.dataset.id;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = EditorUtils;
});
