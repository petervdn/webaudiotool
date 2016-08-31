"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EventDispatcher_1 = require("../../patchwork/core/EventDispatcher");
var ConnectionsSelectionGrid_1 = require("./ConnectionsSelectionGrid");
var ConnectionsCanvasEvent_1 = require("../event/ConnectionsCanvasEvent");
var ConnectionsCanvas = (function (_super) {
    __extends(ConnectionsCanvas, _super);
    function ConnectionsCanvas(viewOffset) {
        _super.call(this);
        this.drawDebugSelectionGrid = false; // draws the connection selection grid
        this.connectionMouseOverIndex = -1;
        this.viewOffset = viewOffset;
        this.connectionSelectionGrid = new ConnectionsSelectionGrid_1["default"](10, this.drawDebugSelectionGrid);
        // set canvas references
        this.$canvas = $('.draw-area canvas');
        this.canvas = this.$canvas[0];
        // canvas container (to scale the canvas to)
        this.$container = $('.draw-area');
        // get the context
        this.context = this.canvas.getContext('2d');
        // data for creationg a connection
        this.connectionCreationData = null;
        this.setSize();
        this.clear();
        // resize on browser resize
        $(window).resize(function () {
            this.setSize();
            //this.draw(); TODO fix this stuff with having to give a patch
        }.bind(this));
        this.$canvas.on('mousemove', function (event) {
            // get the index of the connection under the mouse
            var connectionMouseOverIndex = this.connectionSelectionGrid.getConnectionIndexAt(event.clientX, event.clientY);
            // redraw if value differs from currently set value
            if (this.connectionMouseOverIndex !== connectionMouseOverIndex) {
                this.connectionMouseOverIndex = connectionMouseOverIndex;
            }
        }.bind(this));
        this.$canvas.on('click', function (event) {
            if (this.connectionMouseOverIndex >= 0)
                this.dispatchEvent(ConnectionsCanvasEvent_1["default"].CONNECTION_CLICKED, { connectionIndex: this.connectionMouseOverIndex });
        }.bind(this));
    }
    ConnectionsCanvas.prototype.setSize = function () {
        this.width = this.$container.outerWidth();
        this.height = this.$container.outerHeight();
        this.$canvas.attr({ width: this.width, height: this.height });
        // create new grid
        this.connectionSelectionGrid.create(this.width, this.height);
    };
    ConnectionsCanvas.prototype.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.connectionSelectionGrid.create(this.canvas.width, this.canvas.height);
        //var margin = 10;
        //this.context.fillStyle = "rgba(0,0,0,0.3)";
        //this.context.fillRect(margin, margin, this.canvas.width - 2 * margin, this.canvas.height - 2 * margin);
    };
    ConnectionsCanvas.prototype.draw = function (patch) {
        if (!patch)
            return;
        this.clear();
        // make a list of x,y points
        var lineObjects = [];
        // add all start/end points of all connections
        var connections = patch.connections; // todo skip creation of connections var
        for (var i = 0; i < connections.length; i++) {
            lineObjects = lineObjects.concat(this.createLineSegments(connections[i], i));
        }
        // then draw all lines
        for (var i = 0; i < lineObjects.length; i++)
            this.drawLine(lineObjects[i]);
        if (this.drawDebugSelectionGrid) {
            this.context.strokeStyle = "rgba(255,255,255,0.5)";
            var gridSize = this.connectionSelectionGrid.gridSize;
            var linesX = Math.floor(this.width / gridSize);
            for (var i = 0; i < linesX; i++) {
                this.context.beginPath();
                this.context.moveTo(i * gridSize, 0);
                this.context.lineTo(i * gridSize, this.height);
                this.context.stroke();
            }
            var linesY = Math.floor(this.height / gridSize);
            for (var i = 0; i < linesX; i++) {
                this.context.beginPath();
                this.context.moveTo(0, i * gridSize);
                this.context.lineTo(this.width, i * gridSize);
                this.context.stroke();
            }
            for (var i = 0; i < this.connectionSelectionGrid.locations.length; i++) {
                this.context.fillStyle = "rgba(0,0,0,1)";
                var x = 1 + this.connectionSelectionGrid.locations[i].x * gridSize;
                var y = 1 + this.connectionSelectionGrid.locations[i].y * gridSize;
                this.context.fillRect(x, y, gridSize - 2, gridSize - 2);
            }
        }
    };
    ConnectionsCanvas.prototype.createLineSegments = function (connection, index) {
        var segments = [];
        var $output = this.findTransputByModuleIdAndIndex(connection.sourceModule.id, connection.sourceOutputIndex, 'output');
        var $input = this.findTransputByModuleIdAndIndex(connection.destinationModule.id, connection.destinationInputIndex, 'input');
        var transputOutDistanceGrowth = 5;
        var transputOutDistance = 8 + connection.sourceOutputIndex * transputOutDistanceGrowth;
        var transputInDistance = 14 + connection.destinationInputIndex * transputOutDistanceGrowth;
        if ($output[0] && $input[0]) {
            var outputOffset = $output.offset();
            var inputOffset = $input.offset();
            var startX = outputOffset.left + $output.outerWidth();
            var startY = outputOffset.top + 0.5 * $output.outerHeight();
            var endX = inputOffset.left;
            var endY = inputOffset.top + 0.5 * $input.outerHeight();
            // decide where the end is with regard to the start
            var positionMode;
            if (endX - transputInDistance > startX + transputOutDistance) {
                // end to the right
                positionMode = 'right';
            }
            else {
                // end to the left
                positionMode = 'left';
            }
            // first go a little right, out of the output
            segments.push({
                fromX: startX,
                fromY: startY,
                toX: startX + transputOutDistance,
                toY: startY,
                connectionIndex: index
            });
            switch (positionMode) {
                case 'right':
                    {
                        // end is to the right, most simple case. just move to the correct y first, and then go to end
                        segments.push({
                            fromX: startX + transputOutDistance,
                            fromY: startY,
                            toX: startX + transputOutDistance,
                            toY: endY,
                            connectionIndex: index
                        });
                        segments.push({
                            fromX: startX + transputOutDistance,
                            fromY: endY,
                            toX: endX - transputInDistance,
                            toY: endY,
                            connectionIndex: index
                        });
                        break;
                    }
                case 'left':
                    {
                        // end is to the left, for now jsut go down halfway, then fully to the left, then final half down
                        segments.push({
                            fromX: startX + transputOutDistance,
                            fromY: startY,
                            toX: startX + transputOutDistance,
                            toY: startY + 0.5 * (endY - startY),
                            connectionIndex: index
                        });
                        segments.push({
                            fromX: startX + transputOutDistance,
                            fromY: startY + 0.5 * (endY - startY),
                            toX: endX - transputInDistance,
                            toY: startY + 0.5 * (endY - startY),
                            connectionIndex: index
                        });
                        segments.push({
                            fromX: endX - transputInDistance,
                            fromY: startY + 0.5 * (endY - startY),
                            toX: endX - transputInDistance,
                            toY: endY,
                            connectionIndex: index
                        });
                        break;
                    }
                default:
                    {
                        // unhandled cases. just draw a straight line
                        segments.push({
                            fromX: startX + transputOutDistance,
                            fromY: startY,
                            toX: endX - transputInDistance,
                            toY: endY,
                            connectionIndex: index
                        });
                    }
            }
            // final part that goes into the input
            segments.push({
                fromX: endX - transputInDistance,
                fromY: endY,
                toX: endX,
                toY: endY,
                connectionIndex: index,
                end: true
            });
        }
        else {
            console.log('No output or input found!');
        }
        return segments;
    };
    ConnectionsCanvas.prototype.drawWithCreation = function (patch, mouseX, mouseY) {
        // first do a normal draw
        this.draw(patch);
        // then add the mouse-line. connectionsdata is set before the mouse move listener is added
        if (this.connectionCreationData) {
            var lineObject = { connectionIndex: -1, toX: -1, toY: -1, fromX: -1, fromY: -1 }; // todo
            lineObject.toX = mouseX;
            lineObject.toY = mouseY;
            if (this.connectionCreationData.source) {
                // drawing from an output
                var $transputElement = this.findTransputByModuleIdAndIndex(this.connectionCreationData.source.moduleId, this.connectionCreationData.source.transputIndex, 'output');
            }
            else {
                // drawing from an input
                var $transputElement = this.findTransputByModuleIdAndIndex(this.connectionCreationData.destination.moduleId, this.connectionCreationData.destination.transputIndex, 'input');
            }
            var transputElementOffset = $transputElement.offset();
            lineObject.fromX = transputElementOffset.left + 0.5 * $transputElement.outerWidth();
            lineObject.fromY = transputElementOffset.top + 0.5 * $transputElement.outerHeight();
            this.drawLine(lineObject);
        }
    };
    ConnectionsCanvas.prototype.drawLine = function (lineObject) {
        //this.context.strokeStyle = (this.connectionMouseOverIndex !== -1 && this.connectionMouseOverIndex === lineObject.connectionIndex) ? 'red' : 'black';
        this.context.strokeStyle = "#999";
        this.context.lineWidth = 2;
        // convert so we have sharp lines
        // lineObject.fromX = this.convertToCanvasSafeNumber(lineObject.fromX);
        // lineObject.fromY = this.convertToCanvasSafeNumber(lineObject.fromY);
        // lineObject.toX = this.convertToCanvasSafeNumber(lineObject.toX);
        // lineObject.toY = this.convertToCanvasSafeNumber(lineObject.toY);
        this.context.beginPath();
        this.context.moveTo(lineObject.fromX, lineObject.fromY);
        this.context.lineTo(lineObject.toX, lineObject.toY);
        this.context.stroke();
        if (lineObject.end === true) {
            // draw arrow
            var arrowWidth = 12;
            var arrowLength = 10;
            var arrowBack = 2;
            this.context.fillStyle = '#999';
            this.context.beginPath();
            this.context.moveTo(lineObject.toX, lineObject.toY);
            this.context.lineTo(lineObject.toX - arrowLength, lineObject.toY - 0.5 * arrowWidth);
            this.context.lineTo(lineObject.toX - arrowLength + arrowBack, lineObject.toY);
            this.context.lineTo(lineObject.toX - arrowLength, lineObject.toY + 0.5 * arrowWidth);
            this.context.lineTo(lineObject.toX, lineObject.toY);
            this.context.fill();
        }
        // give same coordinates to grid
        this.connectionSelectionGrid.drawLine(lineObject.connectionIndex, lineObject.fromX, lineObject.fromY, lineObject.toX, lineObject.toY);
    };
    ConnectionsCanvas.prototype.convertToCanvasSafeNumberfunction = function (value) {
        return Math.round(value) + 0.5;
    };
    ConnectionsCanvas.prototype.findTransputByModuleIdAndIndex = function (moduleId, index, type) {
        var typeClass = type === 'input' ? 'input' : 'output';
        var selector = 'div[data-id="' + moduleId + '"].module .' + typeClass + '[data-index="' + index + '"]';
        return $(selector);
    };
    return ConnectionsCanvas;
}(EventDispatcher_1["default"]));
exports.__esModule = true;
exports["default"] = ConnectionsCanvas;
