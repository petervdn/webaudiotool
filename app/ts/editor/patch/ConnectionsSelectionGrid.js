"use strict";
var ConnectionsSelectionGrid = (function () {
    function ConnectionsSelectionGrid(gridSize, drawDebugGrid) {
        this.gridSize = gridSize;
        this.drawDebugGrid = drawDebugGrid;
        this.grid = [];
    }
    ConnectionsSelectionGrid.prototype.create = function (canvasWidth, canvasHeight) {
        var width = Math.floor(canvasWidth / this.gridSize);
        var height = Math.floor(canvasHeight / this.gridSize); // todo height not used?!
        // create 2d array
        this.grid = [];
        for (var i = 0; i < width; i++) {
            this.grid[i] = [];
        }
        this.locations = [];
    };
    ConnectionsSelectionGrid.prototype.pixelToGrid = function (value) {
        return Math.floor(value / this.gridSize);
    };
    ConnectionsSelectionGrid.prototype.getConnectionIndexAt = function (canvasX, canvasY) {
        if (!this.grid[this.pixelToGrid(canvasX)])
            return -1;
        var value = this.grid[this.pixelToGrid(canvasX)][this.pixelToGrid(canvasY)];
        return typeof value !== 'undefined' ? value : -1;
    };
    ConnectionsSelectionGrid.prototype.drawLine = function (connectionIndex, x0, y0, x1, y1) {
        x0 = Math.round(x0);
        y0 = Math.round(y0);
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        var dx = Math.abs(x1 - x0);
        var dy = Math.abs(y1 - y0);
        var sx = (x0 < x1) ? 1 : -1;
        var sy = (y0 < y1) ? 1 : -1;
        var err = dx - dy;
        while (true) {
            // if statement prevents errors during dragging
            var gridX = this.pixelToGrid(x0);
            var gridY = this.pixelToGrid(y0);
            if (this.grid[gridX]) {
                this.grid[gridX][gridY] = connectionIndex;
                //console.log(gridX, gridY)
                var location = { x: gridX, y: gridY };
                if (this.drawDebugGrid && this.locations.indexOf(location) == -1) {
                    this.locations.push(location);
                }
            }
            if ((x0 == x1) && (y0 == y1))
                break;
            var e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    };
    return ConnectionsSelectionGrid;
}());
exports.__esModule = true;
exports["default"] = ConnectionsSelectionGrid;
