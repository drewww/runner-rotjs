import { COLORS } from "../colors";
import { Interactable, Tile } from "./tile";

export class Door extends Tile implements Interactable {
    public activated:boolean;

    constructor(x:number, y:number) {
        super(x, y, "DOOR");
        this.activated = false;
    }

    interact() {

        this.activated = !this.activated;
        this.opaque = !this.opaque;
        this.solid = !this.solid;

        if(this.activated) {
            this.bg = COLORS.FAINT_GREEN;
            this.fg = COLORS.BLACK;
            
            this.symbol = "_";
        } else {
            this.bg = COLORS.FAINT_GREEN;
            this.fg = COLORS.BLACK;
            this.symbol = "-";
        }
    }
}