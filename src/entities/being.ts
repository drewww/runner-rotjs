import * as ROT from 'rot-js'; // Import the 'ROT' module

import {Drawable, Level, Light, Point} from '../index.ts';

export class Being implements Drawable {
    constructor(protected x:number, protected y:number, protected symbol:string,
        protected fg:string, protected bg:string, protected level:Level) {
    }

    draw(display: ROT.Display): void {
        display.draw(this.x, this.y, this.symbol, this.fg, this.bg);
    }

    move(dX:number, dY:number): void {
        if(this.level.map.pointPassable(this.x + dX, this.y + dY) === false) { return; }

        this.x += dX;
        this.y += dY;
    }

    getPosition(): Point {
        return {x: this.x, y: this.y};
    }

    act(): void {
        // this.draw();
    }

    // returns how this being wants to add light around them
    getLight(): Light[] {
        return [];
    }

    // returns what this being can see
    getVision(): Point[] {
        return [];
    }
}