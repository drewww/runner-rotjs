import { Path } from 'rot-js';
import { GameMap } from '../level/game-map';
import { Enemy } from './enemy';
import { Point } from '..';
import { Door } from '../level/door';

export class Hunter extends Enemy {
    protected map: GameMap;
    
    protected hasMovedThisCycle: boolean;
    protected nextMove: Point;

    constructor(x:number, y:number, map: GameMap) {
        super(x, y);
        this.map = map;
        this.hasMovedThisCycle = false;
        this.nextMove = {x:0, y:0};
        this.symbol = "H";
    }

    queueNextMove(): void {
        const playerPoint = this.map.getPlayerLocation();
        console.log(`queueing next move with hunter at : ${this.x},${this.y} and player at ${playerPoint.x},${playerPoint.y}`);
        const path = new Path.AStar(playerPoint.x, playerPoint.y, (x, y) => {
            // Implement your own logic to determine if a tile is passable
            const tile = this.map.getTile(x, y);
            // console.log(`${x},${y}`);
            if(tile) {
                // consider doors "passable"
                if(tile.type=="DOOR") {
                    return true;
                } else {
                    return !tile.solid;
                }
            } else {
                return false;
            }

        });

        // trigger a move to the first non-current location it returns
        path.compute(this.x, this.y, (x, y) => {

            const yDistance = y - this.y;
            const xDistance = x - this.x;

            // console.log("compute response: " + x + "," + y + " dX=" + xDistance + " dY=" + yDistance);

            if(!(x == this.x && y == this.y) && Math.abs(yDistance) <=1 && Math.abs(xDistance) <=1) {
                console.log(`setting next hunter move from ${this.x},${this.y} to ${x},${y}`);
                this.nextMove = {x:x-this.x, y:y-this.y};
                this.hasMovedThisCycle = true;
            }

        });
    }

    act(): void {

        

        if(this.nextMove) {
            console.log("hunter moving: " + JSON.stringify(this.nextMove));

            // check if I want to move into a door.
            const tile = this.map.getTile(this.nextMove.x + this.x, this.nextMove.y + this.y);

            if(tile && tile.type=="DOOR") {
                console.log("pausing to open door");
                const doorTile : Door = <Door>tile;
                if(doorTile.solid) {
                    // consider making it wait TWO turns?? not sure.

                    doorTile.interact();
                    return;
                }
            }

            const didMove: boolean = this.move(this.nextMove.x, this.nextMove.y);

            // this is probably wrong idk
            this.queueNextMove();
            if(didMove) {
                console.log("move successful");
            }    
        } else {
            this.queueNextMove();
        }
    }


    getVision(): Point[] {
        if(!this.level) { return []; }

        const points: Point[] = [];

        // could make this a proper FOV checker, but no need for radius 1.
        // just make a const list of adjacent points
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                // if (dx === 0 && dy === 0) continue; // Skip the current location
                const point: Point = { x: this.x + dx, y: this.y + dy };
                points.push(point);
            }
        }

        return points;
    }
}
