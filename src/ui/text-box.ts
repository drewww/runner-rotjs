import ROT from "rot-js"; // Add import statement for 'ROT' module
import { UIBox } from "../index";

export class TextBox extends UIBox {
    protected text: string;
    protected fg: string;
    protected bg: string;

    constructor(x:number, y:number, width:number, height: number,
        text: string, fg:string="#fff", bg:string="#000") {
        super(x, y, width, height);
        this.text = text;

        this.fg = fg;
        this.bg = bg;
    }

    draw(display: ROT.Display) {
        super.draw(display);
        display.drawText(this.x, this.y, `%c{${this.fg}}%b{${this.bg}}${this.text}`);
    }
}