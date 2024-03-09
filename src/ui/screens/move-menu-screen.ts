import { COLORS } from "../../colors";
import { Player } from "../../entities/player";
import { Screen } from "../screen";

export class MoveMenuScreen extends Screen {
    player: Player;

    constructor (x:number, y:number, player:Player) {
        super(x,y); // passing 0,0 knowing that setPlayer will figure out the right values
        this.player = player;
        this.setPlayer(player);
    }


    draw(display: any, xOffset: number = 0, yOffset: number = 0) {

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                display.draw(x + xOffset + this.x, y + yOffset + this.y, '-', COLORS.DARK_GREY, COLORS.DARK_GREY);
            }
        }

        display.drawText(xOffset + this.x, yOffset + this.y, `%c{${COLORS.BLACK}}%b{${COLORS.LIGHT_GREY}}MOVES%c{${COLORS.LIGHT_GREY}}%b{${COLORS.LIGHT_GREY}}${"-".repeat(this.width-5)}`)

        let i = 0;
        for (let move of this.player.moves) {
            const moveName = move.name;
            const moveX = 1;
            const moveY = i + 1;

          
            let bg = COLORS.DARK_GREY;
            let fg = COLORS.WHITE;

            //iteratre through the characters in move name
            for (let j = 0; j < moveName.length; j++) {
                const char = moveName[j];

                if(j<move.cooldown) {
                    fg = COLORS.WHITE;
                    bg = COLORS.RED;
                } else {
                    bg = COLORS.DARK_GREY;
                    fg = COLORS.WHITE;
                    if(move==this.player.getSelectedMove()) {
                        bg = COLORS.MOVE_BLUE;
                        fg = COLORS.WHITE;
                    }
                }

                display.draw(moveX + xOffset + this.x + j, moveY + yOffset + this.y, char, fg, bg);
            }

            // display.drawText(moveX + xOffset + this.x, moveY + yOffset + this.y, `%c{${fg}}%b{${bg}}${moveName}`);
            i++;
        }
        
        super.draw(display, xOffset, yOffset);
    }

    setPlayer(player: Player) {
        this.player = player;
    }
}