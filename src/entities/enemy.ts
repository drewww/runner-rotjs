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

    getVision(): Point[] {
        if(!this.level) { return []; }

        const points: Point[] = [];

        // could make this a proper FOV checker, but no need for radius 1.
        // just make a const list of adjacent points
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                // if (dx === 0 && dy === 0) continue; // Skip the current location
                const point: Point = { x: this.x + dx, y: this.y + dy };
                points.push(point);
            }
        }

        // iterate "forward" in the direction we're facing until you hit a solid tile
        // or you hit the max range.

        for(let i = 2; i <= this.range; i++) {
            const dX = Math.round(Math.cos(this.facing) * i);
            const dY = Math.round(Math.sin(this.facing) * i);
            const point: Point = { x: this.x + dX, y: this.y + dY };

            if(this.level!.pointTransparent(point.x, point.y) === false) {
                break;
            }

            points.push(point);
        }

        // now check that none of them are opaque or solid
        // it may be you only want to check for opaque and not solid for things like windows. TBD.
        // you may not need to do this check at all if you simply reject light on tiles that are solid
        // let passablePoints = points.filter(p => this.level!.pointPassable(p.x, p.y) && this.level!.pointTransparent(p.x, p.y));
        // passablePoints.push({x: this.x, y: this.y}); // add the current location to the list
        return points.filter(p=>this.level!.pointTransparent(p.x, p.y));
    }

    getLight(): Light[] {
        const visionPoints = this.getVision();
        return visionPoints.map(point => ({
            p: { x: point.x, y: point.y },
            color: COLORS.LASER_RED,
            intensity: 10
        }));
    }
}