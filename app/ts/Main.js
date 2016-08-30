define(["require", "exports", "./editor/Editor"], function (require, exports, Editor_1) {
    "use strict";
    let audioContext = new AudioContext();
    new Editor_1.default(audioContext);
});
