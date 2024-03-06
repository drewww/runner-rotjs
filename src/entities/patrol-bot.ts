import { Point } from "..";
import { Enemy } from "./enemy";

export class PatrolBot extends Enemy {

    public behavior: string = "rotate";

    constructor(x:number, y:number, behavior: string = "random") {
        super(x, y);
        
        if(behavior== "random") {
            behavior = Math.random() > 0.5 ? "rotate" : "flip";
        }

        this.behavior = behavior;

        const directions = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
        this.facing = directions[Math.floor(Math.random() * directions.length)];
    }

    act() :void {
        // move in the "facing" direction. If you hit a wall, turn 90 degrees and try again.
        const dX = Math.round(Math.cos(this.facing));
        const dY = Math.round(Math.sin(this.facing));

        const didMove:boolean = this.move(dX, dY);

            if(!didMove) {
                console.log("hit a wall, turning from ", this.facing/Math.PI + " to " +
                    ((this.facing + (Math.PI / 2) % (Math.PI * 2))/Math.PI));

                if(this.behavior == "rotate") {
                    this.facing += Math.PI / 2;
                } else if(this.behavior == "flip"){
                    // return 180
                    this.facing += Math.PI;
                }

                this.facing = this.facing % (Math.PI * 2);
            }
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

            if(this.level!.map.pointTransparent(point.x, point.y) === false) {
                break;
            }

            points.push(point);
        }

        // now check that none of them are opaque or solid
        // it may be you only want to check for opaque and not solid for things like windows. TBD.
        // you may not need to do this check at all if you simply reject light on tiles that are solid
        // let passablePoints = points.filter(p => this.level!.pointPassable(p.x, p.y) && this.level!.pointTransparent(p.x, p.y));
        // passablePoints.push({x: this.x, y: this.y}); // add the current location to the list
        return points.filter(p=>this.level!.map.pointTransparent(p.x, p.y));
    }
}