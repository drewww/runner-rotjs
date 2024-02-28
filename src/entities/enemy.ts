import { Being, Level, Light, Point } from '../index.ts';
import * as ROT from 'rot-js';

export class Enemy extends Being {

    // angle in radians
    public facing: number = 0;
    public range: number = 5;

    constructor(x:number, y:number, level:Level) {
        super(x, y, "p", "#fff", "#a80d02", level);
    }

    act(): void {
        // TODO move around randomly as a first pass
        const dX = Math.floor(ROT.RNG.getUniform() * 3) - 1;
        const dY = Math.floor(ROT.RNG.getUniform() * 3) - 1;

        this.move(dX, dY);

        super.act();
    }

    getVision(): Point[] {
        const points: Point[] = [];

        // could make this a proper FOV checker, but no need for radius 1.
        // just make a const list of adjacent points
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue; // Skip the current location
                const point: Point = { x: this.x + dx, y: this.y + dy };
                points.push(point);
            }
        }

        // now check that none of them are opaque or solid
        // it may be you only want to check for opaque and not solid for things like windows. TBD.
        // you may not need to do this check at all if you simply reject light on tiles that are solid
        return points.filter(p => this.level.map.pointPassable(p.x, p.y) && this.level.map.pointVisible(p.x, p.y));
    }

    getLight(): Light[] {
        const visionPoints = this.getVision();
        return visionPoints.map(point => ({
            p: { x: point.x, y: point.y },
            color: "#a80d02",
            intensity: 10
        }));
    }
}