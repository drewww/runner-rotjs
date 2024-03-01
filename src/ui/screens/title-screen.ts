import { COLORS } from "../../colors";
import { TextBox } from "../elements/text-box";
import { Screen } from "../screen";
import * as ROT from "rot-js"; // Import the 'ROT' module
import { InstructionBox } from "../elements/instruction-box";

export class TitleScreen extends Screen {
    constructor() {
        super();

        this.elements.push(new TextBox(4, 2, 20, 5, "RUNNER", COLORS.WHITE, COLORS.BLACK, true, 0, 50));
        this.elements.push(new TextBox(4, 3, 20, 5, "------", COLORS.WHITE, COLORS.WHITE, true, 0, 50));

        this.elements.push(new TextBox(4, 5, 20, 5, "a cyberpunk escape roguelike", COLORS.WHITE, COLORS.BLACK, true, 50*6, 25));
        this.elements.push(new TextBox(4, 6, 20, 5, "by ", COLORS.WHITE, COLORS.BLACK, true, 50*6, 25));

        this.elements.push(new TextBox(4, this.height -3, 20, 5, "  press any key to begin", COLORS.LIGHT_GREY, COLORS.BLACK, true, 50*6, 25));
        this.elements.push(new TextBox(4, this.height -2, 20, 5, "  press [i] for instructions", COLORS.LIGHT_GREY, COLORS.BLACK, true, 50*6, 25));
    }

    public draw(display: any, xOffset: number = 0, yOffset: number = 0) {
        super.draw(display, xOffset, yOffset);

        console.log("title screen location: ", this.x, this.y, this.width, this.height);
    }

    handleEvent(event: KeyboardEvent): void {
        if(event.keyCode == ROT.KEYS.VK_I) {
        // switch to an instructions screen on "i"
            this.switchToInstructions();
        }
    }

    public switchToInstructions() : void {
        console.log("instructions screen requested");
        this.elements.forEach((element) => {
            element.disable();

            // my idea is the underline stays in place and animates the extension

        });

        this.elements = [];

        // add in the instructions page
        this.elements.push(new TextBox(2+this.x, 2, 20, 5, "INSTRUCTIONS", COLORS.WHITE, COLORS.BLACK, false, 0, 50));
        this.elements.push(new TextBox(2+this.x, 3, 20, 5, "------------", COLORS.WHITE, COLORS.WHITE, false, 0, 50));
        this.elements.push(new InstructionBox(2+this.x, 5, 8, 10));

        this.elements.push(new TextBox(2+this.x, Math.floor(this.height)-2, 20, 5, "  press any key to begin", COLORS.LIGHT_GREY, COLORS.BLACK, false, 0, 0));

    }
}