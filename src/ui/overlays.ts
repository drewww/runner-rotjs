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
    tileX: number;

    canvas: HTMLCanvasElement;
    tileY: number;

    constructor(x: number, y: number, width: number, height: number) {

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.layers = {};

        const overlayCanvas = document.createElement("canvas");
        const gameCanvas = document.getElementById("game") as HTMLCanvasElement;
        overlayCanvas.width = gameCanvas.width;
        overlayCanvas.height = gameCanvas.height;

        // tile dimensions
        this.tileX = gameCanvas.width / SCREEN_WIDTH;
        this.tileY = gameCanvas.height / SCREEN_HEIGHT;

        overlayCanvas.style.backgroundColor = "rgba(0,0,0,0)";
        overlayCanvas.style.position = "absolute";
        overlayCanvas.style.top = "0px";
        overlayCanvas.style.left = "0px";

        this.canvas = overlayCanvas;

        document.body.appendChild(overlayCanvas);
    }

    addLayer(name: string, defaultColor: string = "#00000000") {

        const newLayer = [];

        for (let i = 0; i < this.width * this.height; i++) {
            // last two 00s are the alpha channel
            newLayer.push(defaultColor);
        }

        this.layers[name] = newLayer;
    }

    setValueOnLayer(name: string, x: number, y: number, color: string) {
        const layer = this.layers[name];

        if (layer) {
            this.setValue(layer, x, y, color);
        }
    }

    setValue(layer: string[], x: number, y: number, color: string) {
        layer[x + y * this.width] = color;
    }

    // this is very similar to addLayer?? not sure
    fillLayerWithValue(layerName: string, color: string) {
        const layer = [];
        for (let i = 0; i < this.width * this.height; i++) {
            // last two 00s are the alpha channel
            layer.push(color);
        }

        this.layers[layerName] = layer;
    }

    draw(): void {
        var ctx = this.canvas.getContext("2d");

        if (!ctx) { return; }

        ctx.reset();

        for (const layerName in this.layers) {
            const layer = this.layers[layerName];
            for (let i = 0; i < layer.length; i++) {
                const x = i % this.width;
                const y = Math.floor(i / this.width);
                const color = layer[i];
                ctx.fillStyle = color;
                ctx.fillRect(this.tileX * x, this.tileY * y, this.tileX, this.tileY);
            }
        }
    }

    startLayerFade(layerName: string, duration: number = 1000, steps: number = 10, startingOpacity: number = 1.0) {
        // keep calling this function repeatedly until it's close to black. 
        // console.log("fading: "+layerName);
        const layer = this.layers[layerName];

        // const fadeStep = duration / steps;
        // const opacityStep = startingOpacity / steps;

        // const fadeStep = duration / steps;
        // const opacityStep = Math.floor(startingOpacity*255/steps);

        // console.log("opacityStep: "+opacityStep);

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
                console.log("transparency: " + transparency);
                const newTransparency = Math.max(transparency - 10, 0);
                console.log("new transparency: " + newTransparency);
                const newColor = color.slice(0, -2) + newTransparency.toString(16).padStart(2, '0');
                // console.log(newColor);
                layer[i] = newColor;
                fullyTransparent = false;
            }
        }

        // later, batcht hese. 
        this.emit("draw");

        if (!fullyTransparent) {
            setTimeout(() => {
                this.startLayerFade(layerName);

            })
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
        throw new Error("Method not implemented.");
    }
}