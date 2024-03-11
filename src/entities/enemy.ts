import { COLORS } from '../colors.ts';
import { Point, Light } from '../index.ts';
import { Being } from './being.ts';
import * as ROT from 'rot-js'; // Import the 'rot-js' package

export abstract class Enemy extends Being {

    // angle in radians
    public facing: number = 0;
    public range: number = 12;

    constructor(x:number, y:number) {
        super(x, y, "p", COLORS.WHITE, COLORS.LASER_RED);
    }

    getLight(): Light[] {
        if(this.stunned > 0) { return []; }

        const visionPoints = this.getVision();
        return visionPoints.map((point) =>{
            const distance = Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));

            const startColor = ROT.Color.fromString(COLORS.LASER_RED);
            var color = startColor;
            for(var i=1; i<distance; i++) { 
                color = ROT.Color.multiply(color, ROT.Color.fromString("#DDDDDD"));
            }

            return {
                p: { x: point.x, y: point.y },
                color: ROT.Color.toHex(color),
                distance: distance,
                being: this
            }
        });
    }

    getVision(): Point[] {
        return [];
    }
}