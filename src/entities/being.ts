import * as ROT from 'rot-js'; // Import the 'ROT' module

import { COLORS } from '../colors.ts';
import { Drawable, Point, Light } from '../index.ts';
import { LevelController } from '../level/level-controller.ts';

export abstract class Being implements Drawable {
    protected level: LevelController | null = null;
    protected stunned: number = 0;

    constructor(public x:number, public y:number, protected symbol:string,
        protected fg:string, protected bg:string) {
    }

    draw(display: ROT.Display, xOffset:number, yOffset:number, bg:string=COLORS.BLACK): void {
        display.draw(this.x+xOffset, this.y+yOffset, this.symbol, this.fg, bg);
    }

    stun(turns:number): void {
        this.stunned = turns;
    }

    move(dX:number, dY:number): boolean {
        if(!this.level) { return false; }

        if(this.level.pointPassable(this.x + dX, this.y + dY) === false) {
            return false;
        }

        this.x += dX;
        this.y += dY;

        return true;
    }

    getPosition(): Point {
        return {x: this.x, y: this.y};
    }

    setPosition(p: Point): void {
        this.x = p.x;
        this.y = p.y;
    }

    act(): void {
        if(this.stunned > 0) {
           this.stunned -= 1;
        }
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

    setLevel(level: LevelController): void {
        this.level = level;
    }

    public disable(): void {
        // do nothing
    }
}