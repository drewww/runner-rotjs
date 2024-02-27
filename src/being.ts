import {Game, Point} from './index.ts';

export class Being {
    constructor(protected x:number, protected y:number, protected symbol:string,
        protected fg:string, protected bg:string, protected G:Game) {
        this.draw();
    }

    draw(): void {
        this.G.display.draw(this.x, this.y, this.symbol, this.fg, this.bg);
    }

    move(dX:number, dY:number): void {
        // TODO get this out of here eventually, we should be asking the map if we can move in this direction
        // or not.
        const newKey = (this.x + dX) + "," + (this.y + dY);
        if (!(newKey in this.G.map)) { return; } /* cannot move in this direction */

        this.x += dX;
        this.y += dY;
    }

    getPosition(): Point {
        return {x: this.x, y: this.y};
    }

    act(): void {
        this.draw();
    }
}