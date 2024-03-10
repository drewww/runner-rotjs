import { Point } from "..";
import { Enemy } from "./enemy";
import { PatrolBot } from "./patrol-bot";


export class SentryBot extends Enemy {

    constructor(x:number, y:number, angle:number = 0) {
        super(x, y);
        this.symbol = "s";
        this.facing = angle;
        this.range = 20;
    }

    act() :void {
        super.act();

        if(this.stunned > 0) { return; }

    }

    getVision(): Point[] {
        if(!this.level) { return []; }

        const points: Point[] = [];

        // iterate "forward" in the direction we're facing until you hit a solid tile
        // or you hit the max range.


        for(let angle=0; angle < Math.PI * 2; angle += Math.PI/2) {
            for(let i = 1; i <= this.range; i++) {
                const dX = Math.round(Math.cos(angle) * i);
                const dY = Math.round(Math.sin(angle) * i);
                const point: Point = { x: this.x + dX, y: this.y + dY };

                if(this.level!.map.pointTransparent(point.x, point.y) === false) {
                    break;
                }

                // test if the point in front of the bot is solid. if it is, stop in the "break"
                // above. otherwise, continue. but don't add it to the list in dpulication.
                // if(i==1) {
                //     continue;
                // }
                points.push(point);
            }
        }

        // now check that none of them are opaque or solid
        // it may be you only want to check for opaque and not solid for things like windows. TBD.
        // you may not need to do this check at all if you simply reject light on tiles that are solid
        // let passablePoints = points.filter(p => this.level!.pointPassable(p.x, p.y) && this.level!.pointTransparent(p.x, p.y));
        // passablePoints.push({x: this.x, y: this.y}); // add the current location to the list
        return points.filter(p=>this.level!.map.pointTransparent(p.x, p.y));
    }

}