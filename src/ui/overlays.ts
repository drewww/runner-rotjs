import { Display } from "rot-js";
import { Drawable } from "..";


export class Overlays implements Drawable {
    x: number;
    y: number;
    height: number;
    width: number;

    // where the string is a color hex string for rotjs
    layers: {[key: string] : string[]};

    constructor(x: number, y: number, width: number, height: number) {

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.layers = {};
    }

    addLayer(name: string) {

        const newLayer = [];

        for (let i = 0; i < this.width * this.height; i++) {
            // last two 00s are the alpha channel
            newLayer.push("#00000000");
        }
        
        this.layers[name] = newLayer;
    }

    setValueOnLayer(name:string, x:number, y:number, color:string) {
        const layer = this.layers[name];

        if(layer) {
            this.setValue(layer, x, y, color);
        }
    }

    setValue(layer: string[], x:number, y:number, color:string) {
        layer[x + y*this.width] = color;
    }

    draw(display: Display, xOffset: number, yOffset: number, bg: string): void {
        for (const layerName in this.layers) {
            const layer = this.layers[layerName];
            for (let i = 0; i < layer.length; i++) {
                const x = i % this.width;
                const y = Math.floor(i / this.width);
                const color = layer[i];
                display.drawOver(x + this.x + xOffset,
                    y + this.y + yOffset, "-", color, color);
            }
        }
    }

    disable(): void {
        throw new Error("Method not implemented.");
    }
}