import { COLORS } from "../colors";
import { Interactable, Player, Tile } from "../index";

export class Door extends Tile implements Interactable {
    public activated:boolean;

    constructor(x:number, y:number) {
        super(x, y, "DOOR");
        this.activated = false;
    }

    interact(player:Player) {
        this.activated = true;
        this.opaque = false;
        this.solid = false;

        this.bg = COLORS.BLACK;
        this.fg = COLORS.WHITE;
        
        this.symbol = "_";
    }
}