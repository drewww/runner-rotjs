import { COLORS } from "../../colors";
import {Screen, TextBox} from "../../index";

export class TitleScreen extends Screen {
    constructor() {
        super();

        this.elements.push(new TextBox(10+this.x, 5, 20, 5, "RUNNER", COLORS.WHITE, COLORS.BLACK, true, 0, 50));
        this.elements.push(new TextBox(10+this.x, 6, 20, 5, "------", COLORS.WHITE, COLORS.WHITE, true, 0, 50));

        this.elements.push(new TextBox(10+this.x, Math.floor(this.height/2)+3, 20, 5, "a cyberpunk escape roguelike", COLORS.WHITE, COLORS.BLACK, true, 50*6, 25));
        this.elements.push(new TextBox(12+this.x, Math.floor(this.height/2)+5, 20, 5, "  press any key to begin", COLORS.LIGHT_GREY, COLORS.BLACK, true, 50*6, 25));
    }

    public draw(display: any, xOffset: number = 0, yOffset: number = 0) {
        super.draw(display, xOffset, yOffset);
    }
}