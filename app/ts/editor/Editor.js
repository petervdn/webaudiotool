class Editor {
    constructor(audioContext) {
    }
}
var startPatch = new Patch(audioContext);
this.viewOffset = new Point(0, 0);
this.viewCode = new ViewCode(startPatch);
this.help = new Help();
this.share = new Share();
this.liveCode = new LiveCode(startPatch);
this.bufferList = new BufferList(startPatch.bufferManager);
this.$drawArea = $('.draw-area');
this.footer = new Footer();
this.footer.addEventListener(FooterEvent.BREADCRUMB_CLICK, this.handleBreadcrumbClick.bind(this));
this.footer.addEventListener(FooterEvent.GENERATE_CODE, this.handleBreadcrumbClick.bind(this));
this.footer.addEventListener(FooterEvent.HELP, this.handleBreadcrumbClick.bind(this));
this.footer.addEventListener(FooterEvent.SHARE, this.handleBreadcrumbClick.bind(this));
this.connectionsCanvas = new ConnectionsCanvas(this.viewOffset);
this.connectionsCanvas.addEventListener(ConnectionsCanvasEvent.CONNECTION_CLICKED, function (type, data) {
    this.patch.removeConnection(this.patch.connections[data.connectionIndex]);
}.bind(this));
this.header = new Header();
this.header.addEventListener(HeaderEvent.MENU_ITEM_SELECTED, this.handleMenuItemSelected.bind(this));
this.setPatch(startPatch);
this.visualModules = [];
this.audioContext = audioContext;
this.clearConnectionCreationData();
this.visualModuleEventHandler = this.handleVisualModuleEvent.bind(this);
this.connectionCreationMouseUpHandler = this.handleConnectionCreationMouseUp.bind(this);
this.connectionCreationMouseMoveHandler = this.handleConnectionCreationMouseMove.bind(this);
this.screenDragMouseDownHandler = this.handleScreenDragMouseEvent.bind(this);
this.screenDragMouseUpHandler = this.handleScreenDragMouseEvent.bind(this);
this.screenDragMouseMoveHandler = this.handleScreenDragMouseEvent.bind(this);
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
this.$drawArea.on('mousedown', this.screenDragMouseDownHandler);
Editor.prototype.handleBreadcrumbClick = function (type, data) {
    switch (type) {
        case FooterEvent.BREADCRUMB_CLICK:
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
                    this.setPatch(rootPatch);
                }
                break;
            }
        case FooterEvent.GENERATE_CODE:
            {
                this.viewCode.showFullCode(this.patch.getRootPatch());
                break;
            }
        case FooterEvent.HELP:
            {
                this.help.show();
                break;
            }
        case FooterEvent.SHARE:
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
                    this.startScreenDragPoint = new Point(event.clientX, event.clientY);
                    this.$drawArea.on('mousemove', this.screenDragMouseMoveHandler);
                    this.$drawArea.on('mouseup', this.screenDragMouseUpHandler);
                }
                break;
            }
        case 'mousemove':
            {
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
                this.$drawArea.off('mousemove', this.screenDragMouseMoveHandler);
                this.$drawArea.off('mouseup', this.screenDragMouseUpHandler);
                break;
            }
    }
};
Editor.prototype.moveViewToOffset = function () {
    this.visualModules.forEach(function (visualModule) {
        visualModule.moveToPosition();
    });
    this.connectionsCanvas.draw(this.patch);
};
Editor.prototype.handleVisualModuleEvent = function (type, data) {
    switch (type) {
        case VisualModuleEvent.MOVE:
            {
                this.connectionsCanvas.draw(this.patch);
                break;
            }
        case VisualModuleEvent.REMOVE:
            {
                Tracking.trackEvent('visual_module', 'remove');
                this.patch.removeModuleById(data.moduleId);
                break;
            }
        case VisualModuleEvent.OPEN_SUBPATCH:
            {
                this.setPatch(data.module.subPatch);
                Tracking.trackEvent('visual_module', 'open_subpatch');
                break;
            }
        case VisualModuleEvent.ATTRIBUTE_CHANGED:
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
    visualModule.addEventListener(VisualModuleEvent.MOVE, this.visualModuleEventHandler);
    visualModule.addEventListener(VisualModuleEvent.REMOVE, this.visualModuleEventHandler);
    visualModule.addEventListener(VisualModuleEvent.OPEN_SUBPATCH, this.visualModuleEventHandler);
    visualModule.addEventListener(VisualModuleEvent.ATTRIBUTE_CHANGED, this.visualModuleEventHandler);
};
Editor.prototype.removeVisualModuleEventHandlers = function (visualModule) {
    visualModule.removeEventListener(VisualModuleEvent.MOVE, this.visualModuleEventHandler);
    visualModule.removeEventListener(VisualModuleEvent.REMOVE, this.visualModuleEventHandler);
    visualModule.removeEventListener(VisualModuleEvent.OPEN_SUBPATCH, this.visualModuleEventHandler);
    visualModule.removeEventListener(VisualModuleEvent.ATTRIBUTE_CHANGED, this.visualModuleEventHandler);
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
};
Editor.prototype.removePatchEventListeners = function (patch) {
    patch.removeEventListener(PatchEvent.MODULE_ADDED, this.patchEventHandler);
    patch.removeEventListener(PatchEvent.MODULE_REMOVED, this.patchEventHandler);
    patch.removeEventListener(PatchEvent.CONNECTION_ADDED, this.patchEventHandler);
    patch.removeEventListener(PatchEvent.CONNECTION_PRE_REMOVE, this.patchEventHandler);
    patch.removeEventListener(PatchEvent.CONNECTION_POST_REMOVE, this.patchEventHandler);
    patch.removeEventListener(PatchEvent.PATCH_CLEARED, this.patchEventHandler);
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
                break;
            }
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
        visualModule.$element.detach();
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
    var defaultPosition = module.position ? module.position : { x: 300, y: 200 };
    visualModule.setPosition(defaultPosition.x, defaultPosition.y);
    this.$drawArea.append(visualModule.$element);
    visualModule.$element.on('mousedown', function (event) {
        if (EditorUtils.elementIsTransput(event.target)) {
            this.setConnectionCreationDataByTransputElement(event.target);
            event.preventDefault();
            document.addEventListener('mousemove', this.connectionCreationMouseMoveHandler);
            document.addEventListener('mouseup', this.connectionCreationMouseUpHandler);
        }
    }.bind(this));
    this.addVisualModuleEventHandlers(visualModule);
};
Editor.prototype.handleAddModuleClick = function (event) {
    var moduleType = event.target.dataset.type;
    var definition = ModuleDefinitions.findByType(moduleType);
    var args = [];
    if (definition.args) {
        for (var i = 0; i < definition.args.length; i++) {
            args.push(prompt(definition.args[i].label));
        }
    }
    this.patch.addModuleByType(moduleType, args);
};
Editor.prototype.clearConnectionCreationData = function () {
    this.connectionCreationData = { source: null, destination: null };
    this.connectionsCanvas.connectionCreationData = null;
};
Editor.prototype.setConnectionCreationDataByTransputElement = function (transput) {
    var moduleId = EditorUtils.getModuleIdByTransputElement(transput);
    var transputIndex = transput.dataset.index || null;
    var audioParamId = transput.dataset.audioparam || null;
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
        console.error('Element is no input or output');
    }
    this.connectionsCanvas.connectionCreationData = this.connectionCreationData;
};
Editor.prototype.handleConnectionCreationMouseMove = function (event) {
    this.connectionsCanvas.drawWithCreation(this.patch, event.pageX, event.pageY);
};
Editor.prototype.handleConnectionCreationMouseUp = function (event) {
    document.removeEventListener('mouseup', this.connectionCreationMouseUpHandler);
    document.removeEventListener('mousemove', this.connectionCreationMouseMoveHandler);
    if ((EditorUtils.elementIsInput(event.target) && this.connectionCreationData.source) ||
        (EditorUtils.elementIsOutput(event.target) && this.connectionCreationData.destination)) {
        this.setConnectionCreationDataByTransputElement(event.target);
        if (this.connectionCreationData.source && this.connectionCreationData.destination) {
            var success = this.patch.addConnection(this.connectionCreationData.source.moduleId, this.connectionCreationData.source.transputIndex, this.connectionCreationData.destination.moduleId, this.connectionCreationData.destination.transputIndex);
            if (!success)
                this.connectionsCanvas.draw();
        }
        else {
            console.error('Source and/or destination not filled', this.connectionCreationData);
        }
    }
    else {
        console.log('invalid connection');
        this.connectionsCanvas.draw(this.patch);
    }
    this.clearConnectionCreationData();
};
