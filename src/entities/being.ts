import {Game, Point} from '../index.ts';

export class Being {
    constructor(protected x:number, protected y:number, protected symbol:string,
        protected fg:string, protected bg:string, protected G:Game) {
        this.draw();
    }

    draw(): void {
        this.G.display.draw(this.x, this.y, this.symbol, this.fg, this.bg);
    }

    move(dX:number, dY:number): void {
        if(this.G.map.pointPassable(this.x + dX, this.y + dY) === false) { return; }

        this.x += dX;
        this.y += dY;
    }

    getPosition(): Point {
        return {x: this.x, y: this.y};
    }

    act(): void {
        // this.draw();
    }
}