import {Game} from './index.ts';

export class Being {
    constructor(protected x:number, protected y:number, protected symbol:string,
        protected fg:string, protected bg:string, protected G:Game) {
        this.draw();
    }

    draw(): void {
        this.G.display.draw(this.x, this.y, this.symbol, this.fg, this.bg);
    }

    move(dX:number, dY:number): void {
        // TODO get this out of here eventually
        const newKey = (this.x + dX) + "," + (this.y + dY);
        if (!(newKey in this.G.map)) { return; } /* cannot move in this direction */

        this.G.display.draw(this.x, this.y, this.G.map[this.x + "," + this.y], "#fff", "#000");
        this.x += dX;
        this.y += dY;
        this.draw();
    }

    getPosition(): string {
        return `${this.x},${this.y}`;
    }
}