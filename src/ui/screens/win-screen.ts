import { COLORS } from "../../colors";
import { TextBox } from "../text-box";
import { Screen } from "../screen";


export class WinScreen extends Screen {
    constructor() {
        super();

        this.elements.push(new TextBox(10+this.x, Math.floor(this.height/2), 20, 5, "RUNNER ESCAPED", COLORS.WHITE, COLORS.LIGHT_GREEN, true, 0, 50));
        this.elements.push(new TextBox(12+this.x, Math.floor(this.height/2)+3, 20, 5, "press any key to restart", COLORS.LIGHT_GREY, COLORS.BLACK, true, 50*24, 50));
    }

    draw(display: any, xOffset: number = 0, yOffset: number = 0) {
        super.draw(display, xOffset, yOffset);
    }
}