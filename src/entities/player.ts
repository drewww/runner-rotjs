
import { Being, IGame, Level } from '../index.ts';
import * as ROT from 'rot-js';

export class Player extends Being {
    game: IGame;

    constructor(x:number, y:number, level:Level, game:IGame) {
        super(x, y, "@", "#ff0", "#000", level);
        this.game = game;
    }

    act(): void {
        this.game.refreshDisplay();

        if (this.game.engine) {
            this.game.engine.lock();
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

        if(this.game.engine) {
            window.removeEventListener("keydown", this);
            this.game.engine.unlock();
        }
    }
}