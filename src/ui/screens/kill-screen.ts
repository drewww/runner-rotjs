import {Screen} from "../../index";

export class KillScreen extends Screen {
    constructor() {
        super();
    }

    draw(display: any, xOffset: number = 0, yOffset: number = 0) {
        display.drawText(10+xOffset, Math.floor(this.height/2) + yOffset,
            "%c{#fff}%b{#a00}RUNNER TERMINATED");

        display.drawText(12+xOffset, Math.floor(this.height/2)+3 + yOffset,
            "%c{#ccc}%b{#000}press any key to restart");
    }
}