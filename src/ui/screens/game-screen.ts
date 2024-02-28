import { Level, TextBox, Screen } from "../../index";
import * as ROT from "rot-js"; // Import the 'rot-js' module

export class GameScreen extends Screen {
    private level: Level;
    private title: any;

    constructor(level: Level) {
        super();
        this.level = level;

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
}