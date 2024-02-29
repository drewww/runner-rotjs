import {Screen, TextBox} from "../../index";

export class TitleScreen extends Screen {
    constructor() {
        super();

        this.elements.push(new TextBox(10+this.x, Math.floor(this.height/2), 20, 5, "RUNNER", "#fff", "#000", true, 0, 150));
        this.elements.push(new TextBox(10+this.x, Math.floor(this.height/2)+1, 20, 5, "a cyberpunk escape roguelike", "#fff", "#000", true, 150*6, 25));
        this.elements.push(new TextBox(12+this.x, Math.floor(this.height/2)+3, 20, 5, "press any key to begin", "#ccc", "#000", true, 150*6 + 50*28, 25));
    }

    public draw(display: any, xOffset: number = 0, yOffset: number = 0) {
        super.draw(display, xOffset, yOffset);
    }
}