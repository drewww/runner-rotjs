import ROT from "rot-js"; // Add import statement for 'ROT' module
import { COLORS } from "../../colors";
import { UIBox } from "./ui-box";
import { Drawable } from "../..";

export class TextBox extends UIBox implements Drawable {
    protected text: string;
    protected fg: string;
    protected bg: string;
    protected animate: boolean;
    protected counter: number;
    protected startDelay: number;
    protected delay: number;

    public disabled: boolean = false;

    constructor(x:number, y:number, width:number, height: number,
        text: string, fg:string=COLORS.WHITE, bg:string=COLORS.BLACK, animate:boolean=false, startDelay:number=0, delay:number=100) {
        super(x, y, width, height);
        this.text = text;

        this.fg = fg;
        this.bg = bg;

        this.animate = animate;
        this.counter = 0;

        this.startDelay = startDelay;
        this.delay = delay;
    }

    disable(): void {
        this.disabled = true;
    }

    draw(display: ROT.Display, xOffset:number, yOffset:number) {
        if(this.disabled) { return; }   

        super.draw(display, xOffset, yOffset);
        // console.log("Position:" + this.x + "," +  this.y + " Offsets: " + xOffset + ", " + yOffset);
        // TODO -- these animations continue even if the screen is changed.
        // need to have some way to de-register the animation.
        if(!this.animate) {
            display.drawText(xOffset+this.x, yOffset + this.y, `%c{${this.fg}}%b{${this.bg}}${this.text}`);
        } else {
            // drop out if we've gotten the signal to disable this element
            if(this.startDelay > 0) {
                setTimeout(this.draw.bind(this), this.startDelay, display, xOffset, yOffset);
                this.startDelay = 0;
            } else {
                display.drawText(xOffset + this.x, yOffset + this.y, `%c{${this.fg}}%b{${this.bg}}${this.text.substring(0, this.counter+1)}`);

                this.counter++;
                if(this.counter<this.text.length) {
                    setTimeout(this.draw.bind(this), this.delay, display, xOffset, yOffset)
                }
            }
        }
    }
}