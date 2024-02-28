import { Level, TextBox, Screen, Game } from "../../index";
import * as ROT from "rot-js"; // Import the 'rot-js' module

export class GameScreen extends Screen {
    private level: Level;
    private title: any;
    private game: Game;

    constructor(level: Level, game: Game) {
        super();
        this.level = level;
        this.game = game;

        level.xOffset = 0;
        level.yOffset = 1;

        this.title = new TextBox(0, 0, 80, 1, "runner -- a cyberpunk escape roguelike", "#fff", "#000");
        
        // this sets the render order, be careful.
        this.elements!.push(this.level);
        this.elements!.push(this.title);
    }

    draw(display: ROT.Display, xOffset: number = 0, yOffset: number = 0) {
        super.draw(display, xOffset, yOffset);
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
        
        if (!(code in keyMap)) { return; }

        var diff = ROT.DIRS[8][keyMap[code]];

        this.level.player!.move(diff[0], diff[1]);

        if(this.game.engine) {
            // window.removeEventListener("keydown", this);
            this.game.engine.unlock();
        }
    }
}