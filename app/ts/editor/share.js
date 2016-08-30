"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AbstractOverlayElement_1 = require("./AbstractOverlayElement");
var Share = (function (_super) {
    __extends(Share, _super);
    function Share(patch) {
        _super.call(this, 400, 200, 'share');
        // create elements
        this.$container.append($('<h2>', { text: 'Share your patch' }));
        this.$content = $('<div>', { class: 'content' });
        this.$button = $('<button>', { text: 'Generate link' });
        this.$error = $('<div>', { class: 'error', text: 'Error!' });
        this.$button.click(function () {
            this.$button.hide();
            var jsonPatch = JSON.stringify(this.patch.toObject());
            $.post('../api.php', { patch: jsonPatch, action: 'share' }, function (result) {
                result = JSON.parse(result);
                if (result.success) {
                    if (result.data.bitly) {
                        // show bitly url
                        this.$textfield.val(result.data.bitly);
                    }
                    else {
                        // bitly failed, show own url
                        this.$textfield.val(result.data.url);
                        this.$textfield.css('font-size', '10px');
                    }
                    this.$textfield.show();
                }
                else {
                    this.$error.text('There was an error, please try again later');
                    this.$error.show();
                }
            }.bind(this));
        }.bind(this));
        this.$textfield = $('<input type="text">');
        this.$content.append(this.$button);
        this.$content.append(this.$textfield);
        this.$content.append(this.$error);
        this.$container.append(this.$content);
    }
    Share.prototype.show = function () {
        this.$textfield.hide();
        this.$error.hide();
        this.$button.show();
        _super.prototype.show.call(this);
    };
    return Share;
}(AbstractOverlayElement_1["default"]));
exports.__esModule = true;
exports["default"] = Share;
