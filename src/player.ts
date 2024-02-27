
import {Game} from './index.ts';
import * as ROT from 'rot-js';

export class Player {
    private x: number;
    private y: number;

    private G: Game;

    constructor(x:number, y:number, g:Game) {
        this.x = x;
        this.y = y;

        this.G = g;
        this.draw();
    }

    draw(): void {
        this.G.display.draw(this.x, this.y, "@", "#ff0", "#000");
    }

    act(): void {
        if (this.G.engine) {
            this.G.engine.lock();
            window.addEventListener("keydown", this);
        } else {
            console.error("Game object missing engine.");
        }
    }

    handleEvent(e: KeyboardEvent): void {
        console.log(e.keyCode);

        const keyMap: { [key: number]: number } = {};
        keyMap[104] = 0;
        keyMap[105] = 1;
        keyMap[102] = 2;
        keyMap[99] = 3;
        keyMap[98] = 4;
        keyMap[97] = 5;
        keyMap[100] = 6;
        keyMap[103] = 7;

        var code = e.keyCode;

        if (!(code in keyMap)) { return; }

        var diff = ROT.DIRS[8][keyMap[code]];
        var newX = this.x + diff[0];
        var newY = this.y + diff[1];

        var newKey = newX + "," + newY;
        if (!(newKey in this.G.map)) { return; } /* cannot move in this direction */

        this.G.display.draw(this.x, this.y, this.G.map[this.x + "," + this.y], "#fff", "#000");
        this.x = newX;
        this.y = newY;
        this.draw();
        if(this.G.engine) {
            window.removeEventListener("keydown", this);
            this.G.engine.unlock();
        }
    }
}