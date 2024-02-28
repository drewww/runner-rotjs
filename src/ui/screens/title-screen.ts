import {Screen} from "../../index";

export class TitleScreen extends Screen {
    constructor() {
        super();
    }

    draw(display: any, xOffset: number = 0, yOffset: number = 0) {
        display.drawText(10+xOffset, Math.floor(this.height/2) + yOffset,
            "%c{#fff}%b{#000}runner -- a cyberpunk escape roguelike");
    }
}