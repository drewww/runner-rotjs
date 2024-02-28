import { Being } from '../index.ts';
import {Game} from '../index.ts';
import * as ROT from 'rot-js';

export class Enemy extends Being {

    constructor(x:number, y:number, G:Game) {
        super(x, y, "p", "#f00", "#000", G);
    }

    act(): void {
        // TODO move around randomly as a first pass
        const dX = Math.floor(ROT.RNG.getUniform() * 3) - 1;
        const dY = Math.floor(ROT.RNG.getUniform() * 3) - 1;

        this.move(dX, dY);

        super.act();
    }
}