import { COLORS } from '../../colors';
import { UIBox } from './ui-box';
import * as ROT from 'rot-js';

export class InstructionBox extends UIBox {
    draw(display: ROT.Display, xOffset:number, yOffset:number) {

        console.log("Drawing instruction box at: ", xOffset, yOffset, this.x, this.y, this.w, this.h);
        const keypad = [
            ['7', '8', '9'],
            ['4', '5', '6'],
            ['1', '2', '3']
        ];

        const keyboard = [
            ['q', 'w', 'e'],
            ['a', 's', 'd'],
            ['z', 'x', 'c']
        ];

        // Draw keypad
        let directionalXOffset = 1;   
        let directionalYOffset = 0;     

        display.drawText(this.x + xOffset + directionalXOffset, this.y + yOffset + directionalYOffset, "8-Directional Movement");
        display.drawText(this.x + xOffset + directionalXOffset+1, this.y + yOffset + directionalYOffset+1,
            ` %b{${COLORS.YELLOW}}%c{${COLORS.BLACK}}center%b{${COLORS.BLACK}}%c{${COLORS.LIGHT_GREY}} waits and acts on adjacent objects`);

        let directional = 0;
        for (const grid of [keypad, keyboard]) {
            for (let row = 0; row < grid.length; row++) {
                for (let col = 0; col < grid[row].length; col++) {
                    const symbol = grid[row][col];
                    let bg = COLORS.BLACK;
                    let fg = COLORS.LIGHT_GREY;
                    if (symbol === '5' || symbol === 's') {
                        bg = COLORS.YELLOW;
                        fg = COLORS.BLACK;
                    }
                    display.drawText(this.x + xOffset + directionalXOffset + 1 + col + directional*4, this.y + yOffset + row + 3, `%b{${bg}}%c{${fg}}${symbol}`);
                }
            }
            directional++;
        }


        directionalXOffset = 45;   

        // add instructions about doors, buttons, enemeies, health, etc.
        display.drawText(this.x + xOffset + directionalXOffset, this.y + yOffset + directionalYOffset, "Enemies");
        display.drawText(this.x + xOffset + directionalXOffset+1, this.y + yOffset + directionalYOffset+1,
            ` %b{${COLORS.LASER_RED}}%c{${COLORS.WHITE}}p%b{${COLORS.BLACK}}%c{${COLORS.LIGHT_GREY}}atrol bot - [behavior]`);


        directionalYOffset = 4;
        display.drawText(this.x + xOffset + directionalXOffset, this.y + yOffset + directionalYOffset, "Environment");
        display.drawText(this.x + xOffset + directionalXOffset+1, this.y + yOffset + directionalYOffset+1,
            ` %b{${COLORS.BLACK}}%c{${COLORS.LIGHT_GREEN}}%%b{${COLORS.BLACK}}%c{${COLORS.LIGHT_GREY}} exit here`);
        display.drawText(this.x + xOffset + directionalXOffset+1, this.y + yOffset + directionalYOffset+3,
                ` %b{${COLORS.WHITE}}%c{${COLORS.BLACK}}b%b{${COLORS.BLACK}}%c{${COLORS.LIGHT_GREY}} un-pressed button`);
        display.drawText(this.x + xOffset + directionalXOffset+1, this.y + yOffset + directionalYOffset+4,
                ` %b{${COLORS.WHITE}}%c{${COLORS.BLACK}}B%b{${COLORS.BLACK}}%c{${COLORS.LIGHT_GREY}} pressed button`);
        display.drawText(this.x + xOffset + directionalXOffset+1, this.y + yOffset + directionalYOffset+5,
                    ` %b{${COLORS.WHITE}}%c{${COLORS.BLACK}}-%b{${COLORS.BLACK}}%c{${COLORS.LIGHT_GREY}} closed door`);
        display.drawText(this.x + xOffset + directionalXOffset+1, this.y + yOffset + directionalYOffset+6,
                    ` %b{${COLORS.WHITE}}%c{${COLORS.BLACK}}_%b{${COLORS.BLACK}}%c{${COLORS.LIGHT_GREY}} open door`);
            
    }
}