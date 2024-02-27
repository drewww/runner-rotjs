
import { Being } from './index.ts';
import {Game} from './index.ts';
import * as ROT from 'rot-js';

export class Player extends Being {

    constructor(x:number, y:number, G:Game) {
        super(x, y, "@", "#ff0", "#000", G);
    }

    act(): void {
        if (this.G.engine) {
            this.G.engine.lock();
            window.addEventListener("keydown", this);
        } else {
            console.error("Game object missing engine.");
        }

        super.act();
    }

    handleEvent(e: KeyboardEvent): void {
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
        
        console.log(code);

        if (!(code in keyMap)) { return; }

        var diff = ROT.DIRS[8][keyMap[code]];

        this.move(diff[0], diff[1]);

        if(this.G.engine) {
            window.removeEventListener("keydown", this);
            this.G.engine.unlock();
        }
    }
}