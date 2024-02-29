import { UIBox, Player } from '../index';
import ROT from 'rot-js'; // Import the 'rot-js' package


export class StatusBar extends UIBox {
    public player: Player;

    constructor(x:number, y:number, w:number,  h:number, player: Player) {
        super(x, y, w, h);
        this.player = player;
    }

    draw(display: ROT.Display, xOffset:number, yOffset:number): void {
        const health = this.player.health;

        //fill entire background first
        for(let x = 0; x < this.w; x++) {
            display.draw(xOffset+x, yOffset, ' ', '#333', '#333');
        }

        // display.drawText(0+xOffset, 0+yOffset, `%c{#f00}%b{$333}HEALTH: ${health}`);
        display.drawText(0+xOffset, 0+yOffset, "%c{#fff}%b{#f00}H");

        // -1 beacuse the H indicator takes up one space
        for(let i = 0; i < health-1; i++) {
            display.draw(1+xOffset+i, 0+yOffset, " ", "#f00", "#f00");
        }
    }
}