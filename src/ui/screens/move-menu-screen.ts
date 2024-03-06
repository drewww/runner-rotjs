import { COLORS } from "../../colors";
import { Player } from "../../entities/player";
import { TextBox } from "../elements/text-box";
import { Screen } from "../screen";

export class MoveMenuScreen extends Screen {
    player: Player;

    constructor (x:number, y:number, player:Player) {
        super(x,y); // passing 0,0 knowing that setPlayer will figure out the right values
        this.player = player;
        this.setPlayer(player);

        this.elements!.push(new TextBox(0, 0, this.width, 1, "MOVES", COLORS.WHITE, COLORS.BLACK, false, 0, 50));    
    }


    draw(display: any, xOffset: number = 0, yOffset: number = 0) {

        // for (let y = 0; y < height; y++) {
        //     for (let x = 0; x < width; x++) {
        //         display.draw(x + xOffset + this.x, y + yOffset + this.y, ' ', COLORS.LIGHT_GREY, COLORS.LIGHT_GREY);
        //     }
        // }

        let i = 0;
        for (let move of this.player.moves) {
            const moveName = move.name;
            const moveX = 1;
            const moveY = i + 1;

            let bg = COLORS.BLACK;
            let fg = COLORS.LIGHT_GREY;
            if(move==this.player.getSelectedMove()) {
                bg = COLORS.MOVE_BLUE;
                fg = COLORS.WHITE;
            }

            display.drawText(moveX + xOffset + this.x, moveY + yOffset + this.y, `%c{${fg}}%b{${bg}}${moveName}`);
            i++;
        }
        
        super.draw(display, xOffset, yOffset);
    }

    setPlayer(player: Player) {
        this.player = player;

        const moves = player.moves;
        const names = moves.map(move => move.name);
        // const maxLength = Math.max(...names.map(name => name.length));

        // this.width = maxLength+2;
        // this.height = moves.length+2;
    }
}