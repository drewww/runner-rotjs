import { SCREEN_HEIGHT, SCREEN_WIDTH } from "..";

export class Overlays {
    x: number;
    y: number;
    height: number;
    width: number;

    // where the string is a color hex string for rotjs
    layers: { [key: string]: string[] };
    callbacks: {
        [key: string]: Function[]
    } = {};

    bufferCanvas: HTMLCanvasElement;
    visibleCanvas: HTMLCanvasElement;
    tileY: number;
    tileX: number;


    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.layers = {};


        const gameCanvas = document.getElementById("game") as HTMLCanvasElement;

        // Create buffer canvas
        this.bufferCanvas = document.createElement("canvas");
        this.bufferCanvas.id = "overlay-buffer";
        this.bufferCanvas.width = gameCanvas.width;
        this.bufferCanvas.height = gameCanvas.height;

        this.tileX = gameCanvas.width / SCREEN_WIDTH;
        this.tileY = gameCanvas.height / SCREEN_HEIGHT;


        // Create visible canvas
        this.visibleCanvas = document.createElement("canvas");
        this.visibleCanvas.id = "overlay-visible";
        this.visibleCanvas.width = gameCanvas.width;
        this.visibleCanvas.height = gameCanvas.height;
        this.visibleCanvas.style.backgroundColor = "rgba(0,0,0,0)";
        this.visibleCanvas.style.position = "absolute";
        this.visibleCanvas.style.top = "0px";
        this.visibleCanvas.style.left = "0px";

        document.body.appendChild(this.visibleCanvas);
    }

    resize():void {
        const gameCanvas = document.getElementById("game") as HTMLCanvasElement;

        this.bufferCanvas.width = gameCanvas.width;
        this.bufferCanvas.height = gameCanvas.height;

        this.tileX = gameCanvas.width / SCREEN_WIDTH;
        this.tileY = gameCanvas.height / SCREEN_HEIGHT;

        this.visibleCanvas.width = gameCanvas.width;
        this.visibleCanvas.height = gameCanvas.height;
    }

    addLayer(name: string, defaultColor: string = "#00000000") {
        if(this.layers[name]) { return; }
        
        const newLayer = [];

        for (let i = 0; i < this.width * this.height; i++) {
            // last two 00s are the alpha channel
            newLayer.push(defaultColor);
        }

        this.layers[name] = newLayer;
    }

    setValueOnLayer(name: string, x: number, y: number, color: string) {
        const layer = this.layers[name];

        if(x > this.width || y > this.height || x < 0 || y < 0) {
            return;
        }   

        if (layer) {
            this.setValue(layer, x, y, color);
        }
    }

    setValue(layer: string[], x: number, y: number, color: string) {
        if(x > this.width || y > this.height || x < 0 || y < 0) {
            return;
        }   
        
        layer[x + y * this.width] = color;
    }

    fillLayerWithValue(layerName: string, color: string) {
        const layer = [];
        for (let i = 0; i < this.width * this.height; i++) {
            layer.push(color);
        }

        this.layers[layerName] = layer;
    }

    hide(): void {
        this.visibleCanvas.style.display = "none";
    }

    show(): void {
        this.visibleCanvas.style.display = "block";
    }

    clear(): void {
        const bufferCtx = this.bufferCanvas.getContext("2d");
        const visibleCtx = this.visibleCanvas.getContext("2d");

        bufferCtx?.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
        visibleCtx?.clearRect(0, 0, this.visibleCanvas.width, this.visibleCanvas.height);


        this.layers = {};
    }


    draw(): void {
        const bufferCtx = this.bufferCanvas.getContext("2d");
        const visibleCtx = this.visibleCanvas.getContext("2d");

        if (!bufferCtx || !visibleCtx) {
            return;
        }

        bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

        for (const layerName in this.layers) {
            const layer = this.layers[layerName];
            for (let i = 0; i < layer.length; i++) {
                const x = i % this.width;
                const y = Math.floor(i / this.width);
                const color = layer[i];
                bufferCtx.fillStyle = color;
                bufferCtx.fillRect(this.tileX * (x+1), this.tileY * (y+1), this.tileX, this.tileY);
            }
        }

        visibleCtx.clearRect(0, 0, this.visibleCanvas.width, this.visibleCanvas.height);
        visibleCtx.drawImage(this.bufferCanvas, 0, 0);
    }

    startLayerFade(layerName: string, duration: number = 1000, steps: number = 10, startingOpacity: number = 1.0) {
        const layer = this.layers[layerName];

        if (!layer) {
            console.log("No layer found with name: " + layerName);
            return;
        }

        let fullyTransparent = true;

        for (let i = 0; i < layer.length; i++) {
            let color = layer[i];

            if (!color) {
                color = "#00000000";
            }

            const transparency = parseInt(color.slice(-2), 16);

            if (transparency > 0) {
                const newTransparency = Math.max(transparency - 10, 0);
                const newColor = color.slice(0, -2) + newTransparency.toString(16).padStart(2, '0');
                layer[i] = newColor;
                fullyTransparent = false;
            }
        }

        this.emit("draw");

        if (!fullyTransparent) {
            setTimeout(() => {
                this.startLayerFade(layerName);
            }, 50);
        } else {
            delete this.layers[layerName];
        }

        this.draw();
    }

    addListener(type: string, callback: Function): void {
        let values = this.callbacks[type];

        if (!values) {
            values = [];
        }

        values.push(callback);
        this.callbacks[type] = values;
    }

    private emit(type: string): void {
        const values = this.callbacks[type];
        if (values) {
            values.forEach(callback => callback(this));
        }
    }

    disable(): void {
        this.visibleCanvas.remove();
        this.bufferCanvas.remove();
    }

    
}
