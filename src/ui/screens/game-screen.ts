import { Level, TextBox, Screen } from "../../index";
import * as ROT from "rot-js"; // Import the 'rot-js' module

export class GameScreen extends Screen {
    private level: Level;
    private title: any;

    constructor(level: Level) {
        super();
        this.level = level;

        this.title = new TextBox(0, 0, 80, 1, "runner -- a cyberpunk escape roguelike", "#fff", "#000");
        this.elements!.push(this.title);
        this.elements!.push(this.level);
    }

    draw(display: ROT.Display) {
        super.draw(display);
    }
}