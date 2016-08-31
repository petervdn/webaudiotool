import IPoint from "../data/interface/IPoint";
class ConnectionsSelectionGrid
{
    public gridSize:number;
    public drawDebugGrid:boolean;
    public grid:Array<any>;
    public locations:Array<any>;

    constructor(gridSize:number, drawDebugGrid:boolean)
    {
        this.gridSize = gridSize;
        this.drawDebugGrid = drawDebugGrid;
        this.grid = [];
    }

    public create(canvasWidth:number, canvasHeight:number):void
    {
        var width = Math.floor(canvasWidth / this.gridSize);
        var height = Math.floor(canvasHeight / this.gridSize); // todo height not used?!

        // create 2d array
        this.grid = [];
        for(var i = 0; i < width; i++)
        {
            this.grid[i] = [];
        }

        this.locations = [];
    }

    public pixelToGrid(value:number):number
    {
        return Math.floor(value / this.gridSize);
    }

    public getConnectionIndexAt(canvasX:number, canvasY:number):number
    {
        if(!this.grid[this.pixelToGrid(canvasX)]) return -1;

        var value = this.grid[this.pixelToGrid(canvasX)][this.pixelToGrid(canvasY)];
        return typeof value !== 'undefined' ? value : -1;
    }

    public drawLine(connectionIndex, x0, y0, x1, y1):void
    {
        x0 = Math.round(x0);
        y0 = Math.round(y0);
        x1 = Math.round(x1);
        y1 = Math.round(y1);

        var dx = Math.abs(x1-x0);
        var dy = Math.abs(y1-y0);
        var sx = (x0 < x1) ? 1 : -1;
        var sy = (y0 < y1) ? 1 : -1;
        var err = dx-dy;

        while(true)
        {
            // if statement prevents errors during dragging
            var gridX = this.pixelToGrid(x0);
            var gridY = this.pixelToGrid(y0);
            if(this.grid[gridX])
            {
                this.grid[gridX][gridY] = connectionIndex;
                //console.log(gridX, gridY)

                var location = {x: gridX, y: gridY};
                if(this.drawDebugGrid && this.locations.indexOf(location) == -1)
                {
                    this.locations.push(location);
                }
            }

            if ((x0==x1) && (y0==y1)) break;
            var e2 = 2*err;
            if (e2 >-dy){ err -= dy; x0  += sx; }
            if (e2 < dx){ err += dx; y0  += sy; }
        }
    }
}

export default ConnectionsSelectionGrid;