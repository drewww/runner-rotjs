import { COLORS } from '../../colors';
import ROT from 'rot-js'; // Import the 'rot-js' package
import { UIBox } from './ui-box';
import { Player } from '../../entities/player';
import { MAX_HEALTH } from '../..';


export class StatusBar extends UIBox {
    public player: Player;

    constructor(x:number, y:number, w:number,  h:number, player: Player) {
        super(x, y, w, h);
        this.player = player;
    }

    draw(display: ROT.Display, xOffset:number, yOffset:number): void {
        // console.log("DRAWING STATUS BAR");
        const health = this.player.health;

        //fill entire background first
        for(let x = 0; x < this.w; x++) {
            display.draw(xOffset+x + this.x, yOffset + this.y, ' ', COLORS.DARK_GREY, COLORS.DARK_GREY);
        }

        // display.drawText(0+xOffset, 0+yOffset, `%c{#f00}%b{$333}HEALTH: ${health}`);
        display.drawText(0+xOffset + this.x, 0+yOffset + this.y, `%c{${COLORS.WHITE}}%b{${COLORS.HEALTH_RED}}H`);

        // -1 beacuse the H indicator takes up one space
        for(let i = 0; i < health-1; i++) {
            display.draw(1+xOffset+i + this.x, 0+yOffset + this.y, " ", COLORS.HEALTH_RED, COLORS.HEALTH_RED);
        }

        display.drawText(this.w-3 + xOffset + this.x, 0 + yOffset + this.y, `%c{${COLORS.WHITE}}%b{${COLORS.DARK_GREY}}L${this.player.depth}`)

        display.draw(xOffset + this.x + MAX_HEALTH, yOffset + this.y, "|", COLORS.WHITE, COLORS.WHITE);
    }
}