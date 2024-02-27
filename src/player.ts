
import {G} from './index'

export class Player {
    private x: number;
    private y: number;

    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
    }

    draw(): void {
        G.display.draw(this.x, this.y, "@", "#ff0", "#000");
    }
}