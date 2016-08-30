"use strict";
var Patch_1 = require("../patchwork/core/Patch");
var Footer_1 = require("./Footer");
var ViewCode_1 = require("./ViewCode");
var Help_1 = require("./Help");
var share_1 = require("./share");
var LiveCode_1 = require("./code/LiveCode");
var BufferList_1 = require("./buffer/BufferList");
var FooterEvent_1 = require("./event/FooterEvent");
var ConnectionsCanvas_1 = require("./patch/ConnectionsCanvas");
var ConnectionsCanvasEvent_1 = require("./event/ConnectionsCanvasEvent");
var Header_1 = require("./Header");
var HeaderEvent_1 = require("./event/HeaderEvent");
var VisualModuleEvent_1 = require("./event/VisualModuleEvent");
var Editor = (function () {
    function Editor(audioContext) {
        this.handleAddModuleClick = function (event) {
            var moduleType = event.target.dataset.type;
            var definition = ModuleDefinitions.findByType(moduleType);
            var args = [];
            if (definition.args) {
                // node needs constructor arguments
                for (var i = 0; i < definition.args.length; i++) {
                    args.push(prompt(definition.args[i].label));
                }
            }
            this.patch.addModuleByType(moduleType, args);
        };
        this.clearConnectionCreationData = function () {
            this.connectionCreationData = { source: null, destination: null };
            // set also in the connection canvas, so it can draw a connection while it's being created
            this.connectionsCanvas.connectionCreationData = null;
        };
        this.setConnectionCreationDataByTransputElement = function (transput) {
            var moduleId = EditorUtils.getModuleIdByTransputElement(transput);
            var transputIndex = transput.dataset.index || null;
            var audioParamId = transput.dataset.audioparam || null;
            // convert from string to number
            if (transputIndex)
                transputIndex = parseInt(transputIndex);
            var data = { moduleId: moduleId, transputIndex: transputIndex, audioParamId: audioParamId };
            if (EditorUtils.elementIsInput(transput)) {
                this.connectionCreationData.destination = data;
            }
            else if (EditorUtils.elementIsOutput(transput)) {
                this.connectionCreationData.source = data;
            }
            else {
                console.error('Element is no input or output'); // TODO remove?
            }
            // give creation data to canvas (so it can draw during dragging a new connection)
            this.connectionsCanvas.connectionCreationData = this.connectionCreationData;
            // console.log('source: ', this.connectionCreationData.source);
            // console.log('destination: ', this.connectionCreationData.destination);
        };
        this.handleConnectionCreationMouseMove = function (event) {
            this.connectionsCanvas.drawWithCreation(this.patch, event.pageX, event.pageY);
        };
        this.handleConnectionCreationMouseUp = function (event) {
            document.removeEventListener('mouseup', this.connectionCreationMouseUpHandler);
            document.removeEventListener('mousemove', this.connectionCreationMouseMoveHandler);
            if ((EditorUtils.elementIsInput(event.target) && this.connectionCreationData.source) ||
                (EditorUtils.elementIsOutput(event.target) && this.connectionCreationData.destination)) {
                this.setConnectionCreationDataByTransputElement(event.target);
                // both source and destination should be filled now, create the connection
                if (this.connectionCreationData.source && this.connectionCreationData.destination) {
                    var success = this.patch.addConnection(this.connectionCreationData.source.moduleId, this.connectionCreationData.source.transputIndex, this.connectionCreationData.destination.moduleId, this.connectionCreationData.destination.transputIndex);
                    // redraw on fail, so the connectioncreation line should be removed (by redrawing)
                    if (!success)
                        this.connectionsCanvas.draw();
                }
                else {
                    console.error('Source and/or destination not filled', this.connectionCreationData);
                }
            }
            else {
                console.log('invalid connection');
                // do a redraw, so the creation-line disappears
                this.connectionsCanvas.draw(this.patch);
            }
            this.clearConnectionCreationData();
        };
        var startPatch = new Patch_1["default"](audioContext); // TODO rename startPatch to patch
        this.viewOffset = { x: 0, y: 0 };
        // some stuff in footer
        this.viewCode = new ViewCode_1["default"](startPatch);
        this.help = new Help_1["default"]();
        this.share = new share_1["default"]();
        this.liveCode = new LiveCode_1["default"](startPatch);
        // buffer
        this.bufferList = new BufferList_1["default"](startPatch.bufferManager);
        // get some display objs
        this.$drawArea = $('.draw-area');
        this.footer = new Footer_1["default"]();
        this.footer.addEventListener(FooterEvent_1["default"].BREADCRUMB_CLICK, this.handleBreadcrumbClick.bind(this));
        this.footer.addEventListener(FooterEvent_1["default"].GENERATE_CODE, this.handleBreadcrumbClick.bind(this));
        this.footer.addEventListener(FooterEvent_1["default"].HELP, this.handleBreadcrumbClick.bind(this));
        this.footer.addEventListener(FooterEvent_1["default"].SHARE, this.handleBreadcrumbClick.bind(this));
        // init the canvas
        this.connectionsCanvas = new ConnectionsCanvas_1["default"](this.viewOffset);
        this.connectionsCanvas.addEventListener(ConnectionsCanvasEvent_1["default"].CONNECTION_CLICKED, function (type, data) {
            // click on connection, remove it
            this.patch.removeConnection(this.patch.connections[data.connectionIndex]);
        }.bind(this));
        // create header
        this.header = new Header_1["default"]();
        this.header.addEventListener(HeaderEvent_1["default"].MENU_ITEM_SELECTED, this.handleMenuItemSelected.bind(this));
        // now the connectionscanvas & header are here, we can set the patch
        this.setPatch(startPatch);
        this.visualModules = [];
        this.audioContext = audioContext;
        this.clearConnectionCreationData();
        // create some handlers
        this.visualModuleEventHandler = this.handleVisualModuleEvent.bind(this);
        // bind some handlers
        this.connectionCreationMouseUpHandler = this.handleConnectionCreationMouseUp.bind(this);
        this.connectionCreationMouseMoveHandler = this.handleConnectionCreationMouseMove.bind(this);
        this.screenDragMouseDownHandler = this.handleScreenDragMouseEvent.bind(this);
        this.screenDragMouseUpHandler = this.handleScreenDragMouseEvent.bind(this);
        this.screenDragMouseMoveHandler = this.handleScreenDragMouseEvent.bind(this);
        // get hidden file input (used for loading) and listen to changes // TODO MOVE TO HEADER
        this.$fileInput = $('input[type="file"]');
        this.$fileInput.on('change', function (event) {
            var files = this.$fileInput[0].files;
            if (files.length === 1) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    this.patch.loadPatch(reader.result);
                }.bind(this);
                reader.readAsText(files[0]);
            }
            else {
                console.error('Multiple files selected');
            }
        }.bind(this));
        // listen for dragging on the patch
        this.$drawArea.on('mousedown', this.screenDragMouseDownHandler);
    }
    Editor.prototype.handleBreadcrumbClick = function (type, data) {
        switch (type) {
            case FooterEvent_1["default"].BREADCRUMB_CLICK:
                {
                    var rootPatch = this.patch.getRootPatch();
                    if (typeof data.id !== 'undefined') {
                        var idList = data.id.split('$');
                        var patch = rootPatch;
                        for (var i = 0; i < idList.length; i++) {
                            patch = patch.getModuleById(idList[i]).subPatch;
                        }
                        this.setPatch(patch);
                    }
                    else {
                        // goto root
                        this.setPatch(rootPatch);
                    }
                    break;
                }
            case FooterEvent_1["default"].GENERATE_CODE:
                {
                    this.viewCode.showFullCode(this.patch.getRootPatch());
                    break;
                }
            case FooterEvent_1["default"].HELP:
                {
                    this.help.show();
                    break;
                }
            case FooterEvent_1["default"].SHARE:
                {
                    this.share.patch = this.patch.getRootPatch();
                    this.share.show();
                    break;
                }
            default:
                {
                    console.warn('Unhandled FooterEvent: ' + type);
                }
        }
    };
    Editor.prototype.setPatch = function (patch) {
        if (this.patch) {
            this.removeAllVisualModules();
            this.removePatchEventListeners(this.patch);
            this.patch = null;
        }
        this.patch = patch;
        this.addPatchEventListeners(this.patch);
        this.addAllVisualModules();
        this.connectionsCanvas.draw(this.patch);
        this.header.patch = patch;
        this.footer.setBreadcrumb(patch);
    };
    Editor.prototype.addAllVisualModules = function () {
        for (var i = 0; i < this.patch.modules.length; i++) {
            this.addVisualModule(this.patch.modules[i]);
        }
    };
    Editor.prototype.handleMenuItemSelected = function (event, eventData) {
        var type = eventData.type;
        var data = eventData.data;
        if (type === 'patch') {
            switch (data) {
                case 'clear':
                    {
                        this.patch.clear();
                        break;
                    }
                case 'load':
                    {
                        this.$fileInput.click();
                        break;
                    }
                case 'save':
                    {
                        this.download('patch.pw', JSON.stringify(this.patch.toObject()));
                        break;
                    }
                case 'close_subpatch':
                    {
                        if (this.patch.parentModule)
                            this.setPatch(this.patch.parentModule.parentPatch);
                        break;
                    }
                case 'to_object':
                    {
                        console.log(this.patch);
                        var json = JSON.stringify(this.patch.toObject());
                        console.log(JSON.parse(json));
                        console.log(json);
                        break;
                    }
                default:
                    {
                        console.warn('Unhandled patch menu action: ' + data);
                    }
            }
        }
        else {
            console.log('Unhandled menu action', eventData);
        }
    };
    Editor.prototype.handleScreenDragMouseEvent = function (event) {
        switch (event.type) {
            case 'mousedown':
                {
                    if (event.altKey) {
                        // store startpoint
                        this.startScreenDragPoint = new Point(event.clientX, event.clientY);
                        // listen for move and mouseup events
                        this.$drawArea.on('mousemove', this.screenDragMouseMoveHandler);
                        this.$drawArea.on('mouseup', this.screenDragMouseUpHandler);
                    }
                    break;
                }
            case 'mousemove':
                {
                    //console.log(this.startScreenDragPoint);
                    var move = new Point(event.clientX - this.startScreenDragPoint.x, event.clientY - this.startScreenDragPoint.y);
                    var moveX = event.originalEvent.movementX || event.originalEvent.mozMovementX || 0;
                    var moveY = event.originalEvent.movementY || event.originalEvent.mozMovementY || 0;
                    this.viewOffset.x -= moveX;
                    this.viewOffset.y -= moveY;
                    this.moveViewToOffset();
                    break;
                }
            case 'mouseup':
                {
                    // stop listening for move & up events
                    this.$drawArea.off('mousemove', this.screenDragMouseMoveHandler);
                    this.$drawArea.off('mouseup', this.screenDragMouseUpHandler);
                    break;
                }
        }
    };
    Editor.prototype.moveViewToOffset = function () {
        // reposition all modules
        this.visualModules.forEach(function (visualModule) {
            visualModule.moveToPosition();
        });
        // redraw the canvas
        this.connectionsCanvas.draw(this.patch);
    };
    Editor.prototype.handleVisualModuleEvent = function (type, data) {
        switch (type) {
            case VisualModuleEvent_1["default"].MOVE:
                {
                    this.connectionsCanvas.draw(this.patch);
                    break;
                }
            case VisualModuleEvent_1["default"].REMOVE:
                {
                    Tracking.trackEvent('visual_module', 'remove');
                    this.patch.removeModuleById(data.moduleId);
                    break;
                }
            case VisualModuleEvent_1["default"].OPEN_SUBPATCH:
                {
                    this.setPatch(data.module.subPatch);
                    Tracking.trackEvent('visual_module', 'open_subpatch');
                    break;
                }
            case VisualModuleEvent_1["default"].ATTRIBUTE_CHANGED:
                {
                    break;
                }
            default:
                {
                    console.warn('Unhandled visual module event: ' + type);
                    break;
                }
        }
    };
    Editor.prototype.addVisualModuleEventHandlers = function (visualModule) {
        visualModule.addEventListener(VisualModuleEvent_1["default"].MOVE, this.visualModuleEventHandler);
        visualModule.addEventListener(VisualModuleEvent_1["default"].REMOVE, this.visualModuleEventHandler);
        visualModule.addEventListener(VisualModuleEvent_1["default"].OPEN_SUBPATCH, this.visualModuleEventHandler);
        visualModule.addEventListener(VisualModuleEvent_1["default"].ATTRIBUTE_CHANGED, this.visualModuleEventHandler);
    };
    Editor.prototype.removeVisualModuleEventHandlers = function (visualModule) {
        visualModule.removeEventListener(VisualModuleEvent_1["default"].MOVE, this.visualModuleEventHandler);
        visualModule.removeEventListener(VisualModuleEvent_1["default"].REMOVE, this.visualModuleEventHandler);
        visualModule.removeEventListener(VisualModuleEvent_1["default"].OPEN_SUBPATCH, this.visualModuleEventHandler);
        visualModule.removeEventListener(VisualModuleEvent_1["default"].ATTRIBUTE_CHANGED, this.visualModuleEventHandler);
    };
    Editor.prototype.addPatchEventListeners = function (patch) {
        if (!this.patchEventHandler)
            this.patchEventHandler = this.handlePatchEvent.bind(this);
        patch.addEventListener(PatchEvent.MODULE_ADDED, this.patchEventHandler);
        patch.addEventListener(PatchEvent.MODULE_REMOVED, this.patchEventHandler);
        patch.addEventListener(PatchEvent.CONNECTION_ADDED, this.patchEventHandler);
        patch.addEventListener(PatchEvent.CONNECTION_PRE_REMOVE, this.patchEventHandler);
        patch.addEventListener(PatchEvent.CONNECTION_POST_REMOVE, this.patchEventHandler);
        patch.addEventListener(PatchEvent.PATCH_CLEARED, this.patchEventHandler);
        //patch.addEventListener(PatchEvent.MODULE_ATTRIBUTE_CHANGED, this.patchEventHandler);
    };
    Editor.prototype.removePatchEventListeners = function (patch) {
        // remove patch events
        patch.removeEventListener(PatchEvent.MODULE_ADDED, this.patchEventHandler);
        patch.removeEventListener(PatchEvent.MODULE_REMOVED, this.patchEventHandler);
        patch.removeEventListener(PatchEvent.CONNECTION_ADDED, this.patchEventHandler);
        patch.removeEventListener(PatchEvent.CONNECTION_PRE_REMOVE, this.patchEventHandler);
        patch.removeEventListener(PatchEvent.CONNECTION_POST_REMOVE, this.patchEventHandler);
        patch.removeEventListener(PatchEvent.PATCH_CLEARED, this.patchEventHandler);
        //patch.removeEventListener(PatchEvent.MODULE_ATTRIBUTE_CHANGED, this.patchEventHandler);
    };
    Editor.prototype.download = function (filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.click();
    };
    Editor.prototype.handlePatchEvent = function (type, data) {
        switch (type) {
            case PatchEvent.MODULE_ADDED:
                {
                    // only add if the added module is in the currently visible patch
                    if (data.module.parentPatch === this.patch) {
                        this.addVisualModule(data.module);
                    }
                    break;
                }
            case PatchEvent.MODULE_REMOVED:
                {
                    this.removeVisualModuleById(data.module.id);
                    this.connectionsCanvas.draw(this.patch);
                    break;
                }
            case PatchEvent.CONNECTION_ADDED:
                {
                    this.connectionsCanvas.draw(this.patch);
                    Tracking.trackEvent('connection', 'added');
                    break;
                }
            case PatchEvent.CONNECTION_PRE_REMOVE:
                {
                    // does nothing
                    break;
                }
            case PatchEvent.CONNECTION_POST_REMOVE:
                {
                    this.connectionsCanvas.draw(this.patch);
                    Tracking.trackEvent('connection', 'removed');
                    break;
                }
            case PatchEvent.PATCH_CLEARED:
                {
                    // TODO reset viewport
                    break;
                }
            // case PatchEvent.MODULE_ATTRIBUTE_CHANGED:
            // {
            // 	var visualModule = this.getVisualModuleById(data.module.id);
            // 	console.log(visualModule);
            // 	break;
            // }
            default:
                {
                    console.error('Unknown event type: ' + type);
                }
        }
    };
    Editor.prototype.getVisualModuleById = function (moduleId) {
        for (var i = 0; i < this.visualModules.length; i++) {
            var visualModule = this.visualModules[i];
            if (visualModule.module.id === moduleId)
                return visualModule;
        }
    };
    Editor.prototype.removeVisualModuleById = function (moduleId) {
        var visualModule = this.getVisualModuleById(moduleId);
        if (visualModule) {
            // remove from dom
            visualModule.$element.detach();
            // remove from list
            var index = this.visualModules.indexOf(visualModule);
            if (index > -1) {
                this.visualModules.splice(index, 1);
                visualModule.destruct();
            }
            else {
                console.error('VisualModule not in list?!');
            }
        }
        else {
            console.error('VisualModule not found for id: ' + moduleId);
        }
    };
    Editor.prototype.removeAllVisualModules = function () {
        for (var i = this.patch.modules.length - 1; i >= 0; i--) {
            this.removeVisualModuleById(this.patch.modules[i].id);
        }
    };
    Editor.prototype.addVisualModule = function (module) {
        var visualModule = new VisualModule(module, this.viewOffset);
        this.visualModules.push(visualModule);
        // set to a default position, unless the module already has one (in loaded patches the modules have positions)
        var defaultPosition = module.position ? module.position : { x: 300, y: 200 };
        visualModule.setPosition(defaultPosition.x, defaultPosition.y);
        // add element to container
        this.$drawArea.append(visualModule.$element);
        visualModule.$element.on('mousedown', function (event) {
            if (EditorUtils.elementIsTransput(event.target)) {
                // mousedown on input or output, store the connectioncreation data
                this.setConnectionCreationDataByTransputElement(event.target);
                // prevent cursor from changing into textthingie
                event.preventDefault();
                // listen to move and mouse up events on document
                document.addEventListener('mousemove', this.connectionCreationMouseMoveHandler);
                document.addEventListener('mouseup', this.connectionCreationMouseUpHandler);
            }
        }.bind(this));
        // listen for events
        this.addVisualModuleEventHandlers(visualModule);
    };
    return Editor;
}());
