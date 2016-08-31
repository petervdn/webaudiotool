define(["require", "exports", "./AbstractOverlayElement", "./code/CodeGenerator"], function (require, exports, AbstractOverlayElement_1, CodeGenerator_1) {
    "use strict";
    class ViewCode extends AbstractOverlayElement_1.default {
        constructor(patch) {
            // init extended setup
            //this.containerId = 'code';
            super(600, 600, 'code');
            // create elements
            this.$container.append($('<h2>', { text: 'Generated code' }));
            this.$code = $('<pre>');
            this.$container.append(this.$code);
        }
        showFullCode(patch) {
            this.$code.html(CodeGenerator_1.default.generateCodeForPatch(patch));
            this.show();
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ViewCode;
});
