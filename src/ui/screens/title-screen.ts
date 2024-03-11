import { COLORS } from "../../colors";
import { TextBox } from "../elements/text-box";
import { Screen } from "../screen";
import * as ROT from "rot-js"; // Import the 'ROT' module
import { InstructionBox } from "../elements/instruction-box";

export class TitleScreen extends Screen {
    player: SimpleEntity;
    hunter: SimpleEntity;

    constructor() {
        super();

        this.elements.push(new TextBox(4, 2, 20, 5, "RUNNER", COLORS.WHITE, COLORS.BLACK, true, 0, 50));
        this.elements.push(new TextBox(4, 3, 20, 5, "------", COLORS.WHITE, COLORS.WHITE, true, 0, 50));

        this.elements.push(new TextBox(4, 5, 40, 5, "a cyberpunk escape roguelike", COLORS.WHITE, COLORS.BLACK, true, 50 * 6, 25));
        // this.elements.push(new TextBox(4, 6, 20, 5, "by ", COLORS.WHITE, COLORS.BLACK, true, 50*6, 25));

        this.elements.push(new TextBox(4, this.height - 4, 40, 5, "  press [p] to play", COLORS.WHITE, COLORS.BLACK, true, 50 * 6, 25));
        this.elements.push(new TextBox(4, this.height - 3, 40, 5, "  press [t] to tutorial", COLORS.WHITE, COLORS.BLACK, true, 50 * 6, 25));
        // this.elements.push(new TextBox(4, this.height -2, 40, 5, "  press [i] for instructions", COLORS.WHITE, COLORS.BLACK, true, 50*6, 25));

        // this.scheduler = new ROT.Scheduler.Simple();
        // this.engine = new ROT.Engine(this.scheduler);

        // this.entities = [];
        // this.entities.push(new SimpleEntity(5, 20, "@", COLORS.YELLOW, COLORS.BLACK));
        // this.entities.push(new SimpleEntity(0, 20, "H", COLORS.WHITE, COLORS.LASER_RED));

        this.player = new SimpleEntity(5, 20, "@", COLORS.YELLOW, COLORS.BLACK);
        this.hunter = new SimpleEntity(0, 20, "H", COLORS.WHITE, COLORS.LASER_RED);
        this.disabled = false;
    }

    public draw(display: any, xOffset: number = 0, yOffset: number = 0) {
        display.clear();
        super.draw(display, xOffset, yOffset);


            if(this.disabled) { return; }
            // paint every adjacent tile LASER_RED as well

            var dX = 1;
            const dY = Math.floor(Math.random() * 3)-1;

            this.player.move(dX, dY);
            
            display.draw(this.player.x + xOffset, this.player.y + yOffset, this.player.symbol, this.player.fg, this.player.bg);

            if(this.player.x > this.width) {
                this.player.x = 0;
            }

            this.drawHunter(dX, dY, display, xOffset, yOffset);
           
            setTimeout( () => {
                this.drawHunter(dX, dY, display, xOffset, yOffset);
                this.hunter.move(dX, dY);
                if(this.hunter.x > this.width) {
                    this.hunter.x = 0;
                }
            }, 200);

        if (!this.disabled) {
            setTimeout(() => {
                this.draw(display, xOffset, yOffset);
            }, 250);
        }
    }

    drawHunter(dX: number, dY: number, display: any, xOffset: number = 0, yOffset: number = 0) {
            display.draw(this.hunter.x + xOffset, this.hunter.y + yOffset, this.hunter.symbol, COLORS.WHITE, COLORS.LASER_RED);

            for (let i = -2; i < 3; i++) {
                for (let j = -2; j < 3; j++) {
                    if(i==0 && j==0) { continue; }

                        const distance = Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2));
                        console.log(distance);

                        const startColor = ROT.Color.fromString(COLORS.LASER_RED);
                        var color = startColor;
                        for(var k=0; k<distance; k++) { 
                            color = ROT.Color.multiply(color, ROT.Color.fromString("#DDDDDD"));
                        }

                        display.draw(this.hunter.x + xOffset + i, this.hunter.y + yOffset + j, "-", ROT.Color.toRGB(color), ROT.Color.toRGB(color));
                }
            }
    }

    handleEvent(event: KeyboardEvent): void {
        if (event.keyCode == ROT.KEYS.VK_I) {
            // switch to an instructions screen on "i"
            // this.switchToInstructions();
        }
    }

    // public switchToInstructions() : void {
    //     console.log("instructions screen requested");
    //     this.elements.forEach((element) => {
    //         element.disable();

    //         // my idea is the underline stays in place and animates the extension

    //     });

    //     this.elements = [];

    //     // add in the instructions page
    //     this.elements.push(new TextBox(2+this.x, 2, 20, 5, "INSTRUCTIONS", COLORS.WHITE, COLORS.BLACK, false, 0, 50));
    //     this.elements.push(new TextBox(2+this.x, 3, 20, 5, "------------", COLORS.WHITE, COLORS.WHITE, false, 0, 50));
    //     this.elements.push(new InstructionBox(2+this.x, 5, 8, 10));

    //     this.elements.push(new TextBox(2+this.x, Math.floor(this.height)-2, 20, 5, "  press any key to begin", COLORS.LIGHT_GREY, COLORS.BLACK, false, 0, 0));
    // }

    disable() {
        super.disable();
        this.entities = [];
    }
}

class SimpleEntity {
    x: number;
    y: number;
    symbol: string;
    fg: string;
    bg: string;

    constructor(x: number, y: number, symbol: string, fgColor: string, bgColor: string) {
        this.x = x;
        this.y = y;

        this.symbol = symbol;
        this.fg = fgColor;
        this.bg = bgColor;
    }

    move(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
    }

    act() {
        this.x += 1;
    }

}