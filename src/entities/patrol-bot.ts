import { Enemy } from "./enemy";


export class PatrolBot extends Enemy {
    constructor(x:number, y:number) {
        super(x, y);;
    }

    act() :void {
        // move in the "facing" direction. If you hit a wall, turn 90 degrees and try again.
        const dX = Math.round(Math.cos(this.facing));
        const dY = Math.round(Math.sin(this.facing));

        const didMove:boolean = this.move(dX, dY);

        if(!didMove) {
            console.log("hit a wall, turning from ", this.facing/Math.PI + " to " +
                ((this.facing + (Math.PI / 2) % (Math.PI * 2))/Math.PI));
            this.facing += Math.PI / 2;
            this.facing = this.facing % (Math.PI * 2);
        }
    }
}