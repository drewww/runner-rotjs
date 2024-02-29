import {Screen} from "../../index";

export class TitleScreen extends Screen {
    constructor() {
        super();
    }

    draw(display: any, xOffset: number = 0, yOffset: number = 0) {
        display.drawText(10+xOffset, Math.floor(this.height/2) + yOffset,
            "%c{#fff}%b{#000}RUNNER");
        display.drawText(10+xOffset, Math.floor(this.height/2)+1 + yOffset,
            "%c{#fff}%b{#000}a cyberpunk escape roguelike");

        display.drawText(12+xOffset, Math.floor(this.height/2)+3 + yOffset,
            "%c{#ccc}%b{#000}press any key to begin");
    }
}