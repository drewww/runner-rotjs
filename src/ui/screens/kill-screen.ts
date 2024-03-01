import { COLORS } from "../../colors";
import { Screen } from "../screen";


export class KillScreen extends Screen {
    constructor() {
        super();
    }

    draw(display: any, xOffset: number = 0, yOffset: number = 0) {
        display.drawText(10+xOffset, Math.floor(this.height/2) + yOffset,
            `%c{${COLORS.WHITE}}%b{${COLORS.LASER_RED}}RUNNER TERMINATED`);

        display.drawText(12+xOffset, Math.floor(this.height/2)+3 + yOffset,
            `%c{${COLORS.LIGHT_GREY}%b{${COLORS.BLACK}}press any key to restart`);
    }
}