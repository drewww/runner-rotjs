import { Path } from 'rot-js';
import { GameMap } from '../level/game-map';
import { Enemy } from './enemy';
import { Point } from '..';
import { Door } from '../level/door';
import * as ROT from 'rot-js'; // Import the 'rot-js' package
import { Tile } from '../level/tile';

export class Hunter extends Enemy {
    protected map: GameMap;
    
    protected hasMovedThisCycle: boolean;
    protected nextMove: Point;

    protected doorCountdown: number;
    protected pointsInVision: Point[];
    juggernaut: boolean = false;
    listeners: Function[] = [];

    constructor(x:number, y:number, map: GameMap) {
        super(x, y);
        this.map = map;
        this.hasMovedThisCycle = false;
        this.nextMove = {x:0, y:0};
        this.symbol = "H";
        this.doorCountdown = -1;

        this.pointsInVision = [];
    }

    resetMoveListeners() {
        this.listeners = [];
    }

    addMoveListener(callback: Function) {
        this.listeners.push(callback);
    }

    enableJuggernaut(): void {
        this.juggernaut = true;
    }

    disableJuggernaut(): void {
        this.juggernaut = false;
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
                if(this.juggernaut) {

                    // test against beings too
                    if(this.level?.getBeings().find(being => !(being instanceof Hunter) && being.x == x && being.y == y)) {
                        return false;
                    }

                    if(tile.type==="BOUNDARY") {
                        return false;
                    } else {
                        return true;
                    }
                }

                if(tile.type=="DOOR" || tile.type=="ENTRANCE") {
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
                // console.log(`setting next hunter move from ${this.x},${this.y} to ${x},${y}`);
                this.nextMove = {x:x-this.x, y:y-this.y};
                this.hasMovedThisCycle = true;
            }

        });
    }

    act(): void {
        super.act();

        if(this.stunned > 0) { return; }

        console.log("hunter got act()");
        if(this.nextMove) {
            // check if I want to move into a door.
            const tile = this.map.getTile(this.nextMove.x + this.x, this.nextMove.y + this.y);

            if(tile && tile.type=="DOOR") {
                if(this.doorCountdown==-1) {
                    this.doorCountdown = 4;
                    return;
                }
                const doorTile : Door = <Door>tile;
                if(doorTile.solid && this.doorCountdown==0) {
                    // consider making it wait TWO turns?? not sure.
                    doorTile.interact();
                    this.doorCountdown = -1
                    return;
                } else {
                    this.doorCountdown--;
                }
            }

            if(this.juggernaut) {
                // knock down any walls.
                const nextTile = this.map.getTile(this.x + this.nextMove.x, this.y + this.nextMove.y);

                if(nextTile.type === "WALL" || nextTile.type === "DOOR") {
                    const newTile = new Tile(nextTile.x, nextTile.y, "FLOOR");
                    newTile.symbol = "$";
                    this.map.setTile(newTile);
                }
            }

            this.move(this.nextMove.x, this.nextMove.y);

            this.listeners.forEach(listener => {
                listener(this);
            });


            this.updateVision();
            // this is probably wrong idk
            this.queueNextMove();
        } else {
            this.queueNextMove();
        }
    }


    updateVision(): void {
        if(!this.map) { return; }

        let fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
            return this.level!.map.pointTransparent(x, y);
        });

        // set all tiles to not visible
        // this.level!.map.resetPlayerVisibility();
        this.pointsInVision = [];
        fov.compute(this.x, this.y, 2, (x, y, r, visibility) => {
            if (visibility > 0) {
                // case to be made to put this into a method on tile and call
                // discovered from there ...
                this.pointsInVision.push({x:x, y:y});
            }
        });
    }


    getVision(): Point[] {
        if(!this.level) { return []; }

        return this.pointsInVision;
    }

    public disable(): void {
        this.stunned = 100000;
    }

    enable() : void {
        this.stunned = 0;
    }

    active(): boolean {
        return this.stunned == 0;
    }
}
