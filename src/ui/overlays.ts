import { Display } from "rot-js";
import { Drawable } from "..";


export class Overlays implements Drawable {
    x: number;
    y: number;
    height: number;
    width: number;

    // where the string is a color hex string for rotjs
    layers: { [key: string]: string[] };
    callbacks: {
        [key:string]: Function[]
    } = {};

    constructor(x: number, y: number, width: number, height: number) {

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.layers = {};
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

    draw(display: Display, xOffset: number, yOffset: number, bg: string): void {
        for (const layerName in this.layers) {
            const layer = this.layers[layerName];
            for (let i = 0; i < layer.length; i++) {
                const x = i % this.width;
                const y = Math.floor(i / this.width);
                const color = layer[i];
                display.drawOver(x + this.x + xOffset,
                    y + this.y + yOffset, null, null, color);
            }
        }
    }

    startLayerFade(layerName: string) {
        // keep calling this function repeatedly until it's close to black. 
        console.log("fading: "+layerName);
        const layer = this.layers[layerName];

        if(!layer) { 
            console.log("No layer found with name: " + layerName);
            return;
        }

        let fullyTransparent = true;

        for (let i = 0; i < layer.length; i++) {
            const color = layer[i];
            const transparency = parseInt(color.slice(-2), 16);

            if (transparency > 0) {
                const newTransparency = Math.max(transparency - 16, 0);
                const newColor = color.slice(0, -2) + newTransparency.toString(16).padStart(2, '0');
                layer[i] = newColor;
                fullyTransparent = false;
            }
        }

        // later, batcht hese. 
        this.emit("draw");

        if (!fullyTransparent) {
            setTimeout(() => {
                this.startLayerFade(layerName);
            }, 100);
        }

    }

    addListener(type: string, callback: Function): void {
        let values = this.callbacks[type];
        
        if(!values) {
            values = [];
        }

        values.push(callback);
        this.callbacks[type] = values;
    }

    private emit(type: string): void {
        const values = this.callbacks[type];
        if(values) {
            values.forEach(callback => callback(this));
        }
    }

    disable(): void {
        throw new Error("Method not implemented.");
    }
}