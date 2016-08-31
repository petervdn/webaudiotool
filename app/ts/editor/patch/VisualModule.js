define(["require", "exports", "../../patchwork/core/EventDispatcher", "../../patchwork/enum/ModuleCategories", "../../patchwork/enum/ModuleTypes", "../event/VisualModuleEvent", "../../patchwork/event/ModuleEvent", "../../patchwork/enum/AttributeTypes"], function (require, exports, EventDispatcher_1, ModuleCategories_1, ModuleTypes_1, VisualModuleEvent_1, ModuleEvent_1, AttributeTypes_1) {
    "use strict";
    class VisualModule extends EventDispatcher_1.default {
        constructor(module, viewOffset) {
            super();
            this.inputsByAttributeId = {};
            this.module = module;
            this.viewOffset = viewOffset;
            // create module element
            this.$element = $('<div>', { class: 'module noselect' });
            // header
            this.$header = $('<div>', { class: 'header' });
            this.$title = $('<span>');
            // different color for proxy modules
            if (this.module.definition.category === ModuleCategories_1.default.PROXY) {
                this.$header.addClass('proxy');
            }
            var $remove = $('<a>', { class: 'remove', href: '#', text: 'X' });
            this.$header.append(this.$title);
            this.$header.append($remove);
            // main area
            this.$main = $('<div>', { class: 'main' });
            switch (this.module.definition.category) {
                case ModuleCategories_1.default.NATIVE:
                    {
                        this.$info = $('<div>', { class: 'info' });
                        this.$info.text('id: ' + this.module.id +
                            ', mode: ' + this.module.audioNode.channelCountMode +
                            ', interpr: ' + this.module.audioNode.channelInterpretation +
                            ', chcount: ' + this.module.audioNode.channelCount);
                        this.$main.append(this.$info);
                        this.createAttributes();
                        break;
                    }
                case ModuleCategories_1.default.PROXY:
                    {
                        switch (this.module.definition.type) {
                            case ModuleTypes_1.default.SUBPATCH:
                                {
                                    this.$info = $('<div>', { class: 'info' });
                                    this.$info.text('id: ' + this.module.id);
                                    this.$main.append(this.$info);
                                    var $openSubpatchButton = $('<button>', { text: 'Open subpatch' }).on('click', function () {
                                        this.dispatchEvent(VisualModuleEvent_1.default.OPEN_SUBPATCH, { module: this.module });
                                    }.bind(this));
                                    this.$main.append($openSubpatchButton);
                                    break;
                                }
                            case ModuleTypes_1.default.OUTPUT:
                                {
                                    if (!this.module.parentPatch.parentModule) {
                                        var text = 'This output is in the root of the patch and will act as the context\'s destination.';
                                        this.$main.append($('<div>', { text: text, class: 'info' }));
                                    }
                                    break;
                                }
                            case ModuleTypes_1.default.INPUT:
                                {
                                    if (!this.module.parentPatch.parentModule) {
                                        var text = 'An input in the root of the patch has no function, but will be useful if this patch is later used as subpatch.';
                                        this.$main.append($('<div>', { text: text, class: 'info' }));
                                    }
                                    break;
                                }
                        }
                        break;
                    }
                default:
                    {
                        console.warn('Unhandled module category: ' + this.module.definition.category);
                    }
            }
            // add all
            this.$element.append(this.$inputs);
            this.$element.append(this.$header);
            this.$element.append(this.$main);
            this.$element.append(this.$outputs);
            // define listeners
            this.headerMouseDownListener = this.handleHeaderMouseDown.bind(this);
            this.documentMouseMoveListener = this.handleDocumentMouseMove.bind(this);
            this.documentMouseUpListener = this.handleDocumentMouseUp.bind(this);
            this.removeButtonClickHandler = this.handleRemoveButtonClick.bind(this);
            // add mouse listeners
            this.$header.on('mousedown', this.headerMouseDownListener);
            $remove.on('click', this.removeButtonClickHandler);
            // set the id in the element & title 
            this.$element.attr('data-id', this.module.id);
            this.$title.text(this.module.definition.label); // + ' [' + this.module.id + ']'); 
            // create transputs
            var lastInY = this.createTransputs('in');
            var lastOutY = this.createTransputs('out');
            // set minheight of main to highest (either inputs or outputs)
            this.$main.css({ minHeight: Math.max(lastInY, lastOutY) + 15 });
            // isten to update values
            this.attributeChangedHandler = this.handleAttributeChanged.bind(this);
            module.addEventListener(ModuleEvent_1.default.ATTRIBUTE_CHANGED, this.attributeChangedHandler);
        }
        handleAttributeChanged(type, data) {
            this.updateAttribute(data.attribute);
        }
        handleRemoveButtonClick(event) {
            this.dispatchEvent(VisualModuleEvent_1.default.REMOVE, { moduleId: this.module.id });
        }
        createAttributes() {
            if (!this.module.definition.attributes)
                return;
            for (var i = 0; i < this.module.definition.attributes.length; i++) {
                var attribute = this.module.definition.attributes[i];
                switch (attribute.type) {
                    case AttributeTypes_1.default.BUFFER:
                    case AttributeTypes_1.default.STREAM:
                    case AttributeTypes_1.default.FLOAT_ARRAY:
                    case AttributeTypes_1.default.READ_ONLY:
                        {
                            // TODO
                            console.warn('No input selector for: ' + attribute.type);
                            return;
                        }
                    case AttributeTypes_1.default.AUDIO_PARAM:
                        {
                            this.$main.append(this.$createInputForAttribute(attribute, true));
                            break;
                        }
                    case AttributeTypes_1.default.BOOLEAN:
                    case AttributeTypes_1.default.FLOAT:
                        {
                            this.$main.append(this.$createInputForAttribute(attribute, true));
                            break;
                        }
                    case AttributeTypes_1.default.OPTION_LIST:
                        {
                            this.$main.append(this.$createOptionListForAttribute(attribute));
                            break;
                        }
                    default:
                        {
                            console.error('Unknown attribute type: ' + attribute.type);
                        }
                }
            }
            this.$main.append($('<div>', { class: 'clear' }));
        }
        updateAttribute(attribute) {
            switch (attribute.type) {
                case AttributeTypes_1.default.AUDIO_PARAM:
                case AttributeTypes_1.default.OPTION_LIST:
                    {
                        var $input = this.inputsByAttributeId[attribute.id];
                        $input.val(this.module.getAttributeValue(attribute.id));
                        break;
                    }
                case AttributeTypes_1.default.BUFFER:
                case AttributeTypes_1.default.STREAM:
                case AttributeTypes_1.default.FLOAT_ARRAY:
                case AttributeTypes_1.default.BOOLEAN:
                case AttributeTypes_1.default.FLOAT:
                case AttributeTypes_1.default.READ_ONLY:
                default:
                    {
                        console.error('Unknown attribute type: ' + attribute.type);
                    }
            }
        }
        $createOptionListForAttribute(attribute) {
            var $container = this.createAttributeRow(attribute, true);
            var $select = $('<select>');
            var currentValue = this.module.getAttributeValue(attribute.id);
            for (var i = 0; i < attribute.options.length; i++) {
                var optionValue = attribute.options[i];
                var $option = $('<option>', { text: optionValue });
                $select.append($option);
                if (optionValue === currentValue)
                    $option.prop('selected', true);
            }
            $container.append($select);
            $select.on('change', function (event) {
                var value = event.target.value;
                // get the id of the attribute
                var $parent = $(event.target.parentNode);
                var attributeId = $parent.attr('data-id');
                // set the value on the audionode
                this.module.setAttributeValue(attributeId, value);
            }.bind(this));
            // story the input element by attribute id
            this.inputsByAttributeId[attribute.id] = $select;
            return $container;
        }
        createAttributeRow(attribute, addLabel) {
            var $container = $('<div>', { class: 'attribute', 'data-id': attribute.id });
            if (addLabel) {
                var $label = $('<div>', { class: 'label', text: attribute.label_short });
                $container.append($label);
            }
            return $container;
        }
        $createInputForAttribute(attribute, isEditable) {
            if (typeof this.module.audioNode[attribute.id] === 'undefined') {
                console.warn('AudioNode ' + this.module.definition.type + ' doesn\'t have attribute ' + attribute.id);
                return;
            }
            var $container = this.createAttributeRow(attribute, true);
            var currentValue = this.module.getAttributeValue(attribute.id);
            //	var $value = $('<div>', {class: 'value', text: currentValue});
            if (attribute.type === AttributeTypes_1.default.BOOLEAN) {
                // selectbox
                var $input = $('<input>', { class: 'float' }).attr('type', 'checkbox');
            }
            else {
                // textfield input
                var $input = $('<input>', { class: 'float' });
            }
            if (!isEditable) {
                $input.prop('disabled', true);
                $container.find('.label').css('color', '#bbb');
            }
            $container.append($input);
            $input.on('change', function (event) {
                var value = event.target.value;
                // set in value-field
                var $parent = $(event.target.parentNode);
                $parent.find('.value').text(value);
                // get the id of the attribute
                var attributeId = $parent.attr('data-id');
                // set the value on the correct audioparam of the audionode
                this.module.setAttributeValue(attributeId, value);
            }.bind(this));
            // set the current value
            $input.val(currentValue);
            // story the input element by attribute id
            this.inputsByAttributeId[attribute.id] = $input;
            return $container;
        }
        createTransputs(type) {
            var numberOfInputs = this.module.getNumberOfInputs();
            var numberOfOutputs = this.module.getNumberOfOutputs();
            let cssClass;
            let numberOfTransputs;
            let audioParams;
            // set correct variables
            if (type === 'in') {
                // inputs
                cssClass = 'input';
                //$containerElement = this.$inputs;
                numberOfTransputs = numberOfInputs;
                audioParams = this.module.getAudioParams();
            }
            else {
                // outputs
                cssClass = 'output';
                //$containerElement = this.$outputs;
                numberOfTransputs = numberOfOutputs;
                // audioparams are never outputs
                audioParams = [];
            }
            var transputY = 0;
            var transputYMultiply = 30;
            var transputYOffset = 6;
            var numberOfNodeInputs = this.module.getNumberOfNodeInputs();
            for (var i = 0; i < numberOfTransputs; i++) {
                var $transput = $('<div>', { class: cssClass });
                transputY = transputYOffset + i * transputYMultiply;
                $transput.css({ 'top': transputY });
                $transput.attr('data-index', i);
                if (i < numberOfTransputs - audioParams.length) {
                    // in our output
                    $transput.text(type + '-' + (i + 1));
                }
                else {
                    // audio params (always inputs)
                    var audioParam = audioParams[i - numberOfNodeInputs];
                    $transput.addClass('audioparam');
                    $transput.attr('data-audioparam', audioParam.id);
                    $transput.text(audioParam.label_short);
                }
                // set horizontal position
                if (type === 'in') {
                    $transput.css('left', 0);
                }
                else {
                    $transput.css('right', 0);
                }
                this.$main.append($transput);
            }
            // return the latest y-value of the created transput, so the module knows what height to set
            return transputY;
        }
        handleHeaderMouseDown(event) {
            $(document).on('mousemove', this.documentMouseMoveListener);
            $(document).on('mouseup', this.documentMouseUpListener);
        }
        handleDocumentMouseUp(event) {
            $(document).off('mousemove', this.documentMouseMoveListener);
            $(document).off('mouseup', this.documentMouseUpListener);
        }
        handleDocumentMouseMove(event) {
            var moveX = event.originalEvent.movementX || event.originalEvent.mozMovementX || 0;
            var moveY = event.originalEvent.movementY || event.originalEvent.mozMovementY || 0;
            this.setPosition(this.position.x + moveX, this.position.y + moveY);
            this.dispatchEvent(VisualModuleEvent_1.default.MOVE);
        }
        setPosition(x, y) {
            this.position = { x: x, y: y };
            // we also need to set this on the module itself, since the module has
            // no reference to the visual module (and we need to store the position when saving)
            this.module.position = { x: x, y: y };
            this.moveToPosition();
        }
        moveToPosition() {
            this.$element.css({
                left: this.position.x - this.viewOffset.x,
                top: this.position.y - this.viewOffset.y
            });
        }
        destruct() {
            this.removeAllEventListeners();
            this.$title = null;
            this.$element = null;
            this.position = null;
            this.viewOffset = null;
            if (this.$header) {
                this.$header.off('mousedown', this.headerMouseDownListener);
                //this.titleMouseDownListener = null;
                this.$header = null;
            }
            $(document).off('mousemove', this.documentMouseMoveListener);
            $(document).off('mouseup', this.documentMouseUpListener);
            this.documentMouseMoveListener = null;
            this.documentMouseUpListener = null;
            this.module = null;
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = VisualModule;
});
