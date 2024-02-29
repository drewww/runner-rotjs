import * as ROT from 'rot-js'; // Import the 'ROT' module

import {Drawable, Level, Light, Point} from '../index.ts';

export class Being implements Drawable {
    protected level: Level | null = null;

    constructor(public x:number, public y:number, protected symbol:string,
        protected fg:string, protected bg:string) {
    }

    draw(display: ROT.Display, xOffset:number, yOffset:number, bg:string="#000"): void {
        display.draw(this.x+xOffset, this.y+yOffset, this.symbol, this.fg, bg);
    }

    move(dX:number, dY:number): void {
        if(!this.level) { return; }

        if(this.level.pointPassable(this.x + dX, this.y + dY) === false) { return; }

        this.x += dX;
        this.y += dY;
    }

    getPosition(): Point {
        return {x: this.x, y: this.y};
    }

    setPosition(p: Point): void {
        this.x = p.x;
        this.y = p.y;
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
        // this is out of date relative to updateVision() method
        // on Player. The enemies have a simple procedural method
        // for computing this, but the player is doing an async callback.
        // that difference may not matter but it's worth noting.
        return [];
    }

    setLevel(level: Level): void {
        this.level = level;
    }

    public disable(): void {
        // do nothing
    }
}