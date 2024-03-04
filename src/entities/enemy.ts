import { COLORS } from '../colors.ts';
import { Point, Light } from '../index.ts';
import { Being } from './being.ts';

export abstract class Enemy extends Being {

    // angle in radians
    public facing: number = 0;
    public range: number = 12;

    constructor(x:number, y:number) {
        super(x, y, "p", COLORS.WHITE, COLORS.LASER_RED);
    }

    getLight(): Light[] {
        const visionPoints = this.getVision();
        return visionPoints.map(point => ({
            p: { x: point.x, y: point.y },
            color: COLORS.LASER_RED,
            intensity: 10
        }));
    }

    getVision(): Point[] {
        return [];
    }
}