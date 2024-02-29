import { Level, TextBox, Screen, IGame, Player } from "../../index";
import * as ROT from "rot-js"; // Import the 'rot-js' module

export class GameScreen extends Screen {
    public level: Level;
    private title: any;
    private game: IGame;

    constructor(level: Level, game: IGame) {
        super();
        this.level = level;
        this.game = game;

        level.xOffset = 0;
        level.yOffset = 0;
        
        // this sets the render order, be careful.
        this.elements!.push(this.level);
    }

    draw(display: ROT.Display, xOffset: number = 0, yOffset: number = 0) {
        super.draw(display, xOffset, yOffset);
    }

    handleEvent(e: KeyboardEvent): void {
        console.log("Game screen handling event: " + e.keyCode);

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

    setPlayer(player: Player) {

        const freeCells = this.level.getEmptyPoints();
        if (!freeCells) {
            console.error("No free cells to place player.");
            return;
        }
        const playerCell = freeCells[Math.floor(Math.random() * freeCells.length)];
        player.setPosition(playerCell);

        this.level.setPlayer(player);        
    }
}