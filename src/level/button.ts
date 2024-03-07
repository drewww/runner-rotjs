import { Player } from "../entities/player";
import { Interactable, Tile } from "./tile";

export class Button extends Tile implements Interactable {
    public activated:boolean;

    constructor(x:number, y:number) {
        super(x, y, "BUTTON");
        this.activated = false;
    }

    interact(player:Player) {
        if(!this.activated) {
            this.activated = true;
            this.symbol = "•";
    
            this.emit("button");    
        }
    }
}