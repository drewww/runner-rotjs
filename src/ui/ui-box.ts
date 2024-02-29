import * as ROT from 'rot-js'; // Import the 'rot-js' module

export abstract class UIBox {
    public w: number;
    public h: number;

    public x: number;
    public y: number;

    public disabled:boolean = false;

    constructor(x:number, y:number, width: number, height: number) {
        this.w = width;
        this.h = height;

        this.x = x;
        this.y = y;
    }

    draw(display: ROT.Display, xOffset:number, yOffset:number): void {}

    public disable(): void {
        this.disabled = true;
    }

}