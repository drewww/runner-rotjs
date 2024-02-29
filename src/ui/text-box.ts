import ROT from "rot-js"; // Add import statement for 'ROT' module
import { UIBox } from "../index";

export class TextBox extends UIBox {
    protected text: string;
    protected fg: string;
    protected bg: string;
    protected animate: boolean;
    protected counter: number;
    protected startDelay: number;
    protected delay: number;

    constructor(x:number, y:number, width:number, height: number,
        text: string, fg:string="#fff", bg:string="#000", animate:boolean=false, startDelay:number=0, delay:number=100) {
        super(x, y, width, height);
        this.text = text;

        this.fg = fg;
        this.bg = bg;

        this.animate = animate;
        this.counter = 0;

        this.startDelay = startDelay;
        this.delay = delay;
    }

    draw(display: ROT.Display, xOffset:number, yOffset:number) {
        super.draw(display, xOffset, yOffset);

        // TODO -- these animations continue even if the screen is changed.
        // need to have some way to de-register the animation.
        if(!this.animate) {
            display.drawText(xOffset, yOffset, `%c{${this.fg}}%b{${this.bg}}${this.text}`);
        } else {
            if(this.startDelay > 0) {
                setTimeout(this.draw.bind(this), this.startDelay, display, xOffset, yOffset);
                this.startDelay = 0;
            } else {
                console.log("animating @${this.counter}: ", this.text.substring(0, this.counter));
                display.drawText(xOffset, yOffset, `%c{${this.fg}}%b{${this.bg}}${this.text.substring(0, this.counter+1)}`);

                this.counter++;
                if(this.counter<this.text.length) {
                    setTimeout(this.draw.bind(this), this.delay, display, xOffset, yOffset)
                }
            }
        }
    }
}