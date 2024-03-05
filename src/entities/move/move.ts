import { Point } from "../..";
import { Level } from "../../level/level";

export type Move = {
    name: string;
    template: MoveTemplate;
    cooldown: number;
    selected: boolean;
}

export class MoveManager {


    public static moveResults(level: Level, template: MoveTemplate): Point[][] {
        // this method will a list of points that this moveTemplate would
        // move the player to. expressed in player-relative vector locations.

        // return a list of lists
        // each list is a rotation of the first one
        // and the list of moves in order that the player will pass through

        const stepsInMove: Point[] = MoveManager.getAllPointsInMoves(template);
        const validRotations: number[] = MoveManager.getValidRotationsForTemplate(level, template);

        const output: Point[][] = [];

        for (let i of validRotations) {
            let thisRotation = [];
            for (let step of stepsInMove) {
                step = MoveManager.rotateVector(step, i);
                thisRotation.push(step);
            }

            output.push(thisRotation);
        }

        return output;
    }

    // could do this ... better but it works.
    static rotateVector(vector: Point, times: number): Point {
        for (let i = 0; i < times; i++) {
            vector = { x: -vector.y, y: vector.x };
        }
        return vector;
    }

    static getLocationInTemplate(template: MoveTemplate, symbol: string): Point {
        for (let y = 0; y < template.length; y++) {
            for (let x = 0; x < template[y].length; x++) {
                if (template[y][x] === symbol) {
                    return { x, y };
                }
            }
        }

        throw new Error(`No ${symbol} location found in template`);
    }

    // currently, this returns only the "move" points in the current template
    // this is useful for the player to know where they can move to, but not all
    // these moves are valid.
    static getAllPointsInMoves(template: MoveTemplate): Point[] {
        const steps = MoveManager.getMaxDigitInTemplate(template);
        const playerLocation = MoveManager.getLocationInTemplate(template, '@');

        let points: Point[] = [];

        for (let step = 1; step <= steps; step++) {
            for (let y = 0; y < template.length; y++) {
                for (let x = 0; x < template[y].length; x++) {
                    if (template[y][x] === step.toString()) {
                        points.push({ x: x - playerLocation.x, y: y - playerLocation.y });
                    }
                }
            }
        }

        return points;
    }

    static getValidRotationsForTemplate(level: Level, template: MoveTemplate): number[] {
        // for the given template and level return which rotations are valid.
        // (consider a version of this that shows where the templates are failing... people
        // may find it weird not knowing what are the options. or it may be that we end up
        // showing all valid moves all at once, rather than having to pick the move style first.

        let output = [];
        const playerLocation = MoveManager.getLocationInTemplate(template, '@');


        // so, for each rotation check every template square against the world and its constraint. 
        for(let i = 0; i < 4; i++) {
            let valid = true;            

            for (let y = 0; y < template.length; y++) {
                for (let x = 0; x < template[y].length; x++) {
                    const symbol = template[y][x];

                    // so, get the symbol from the "normal" template. but rotate the vector
                    // when you go to get it out of the level.map object. so calculate the player-relative
                    // vector first (that's the x-playerLocation.x part) and then rotate normally around 0,0.
                    // the vector that comes out will be player relative still.
                    const vectorToTile = MoveManager.rotateVector({x:x-playerLocation.x, y:y-playerLocation.y}, i);

                    // the template x/y coordinates need to be transformed to be player-relative
                    // in other words, find the @ symbol in the template and make sure we are getting
                    // a vector back that is the player to the current tile, not the absolute location
                    // in the template vectors.
                    const tile = level.map.getTile(vectorToTile.x + level.player!.x,
                                                   (vectorToTile.y) + level.player!.y);

                    // we may not get a valid tile back from the map, in which case the move is touching
                    // an out of bound space and is invalid.
                    if(!tile) {
                        valid = false;
                        break;
                    }

                    switch(symbol) {
                        case '@':
                        case '*':
                            // any tile is valid here
                            continue;
                        case '1':   // these are all the numbered move tiles that the player
                        case '2':   // will "touch" as they move to the highest number, which
                        case '3':   // is the destination.
                        case '4':
                        case '5':
                        case '6':
                        case '7':
                        case '8':
                        case '9':
                        case '0':   // this is the symbol for moving "through" but not counting
                                    // as a move step. the i-frames essentially. but you can't phase
                                    // through a wall.
                            
                            // check that it's passable
                            if(!tile.solid) { continue; }
                            else { valid = false; break;}

                        case 'W':
                            // must be a wall or other impassable tile
                            // notably we are not asking the level to check against
                            // the "passable" checker, which also looks at beings. 
                            // you can't jump off a bot currently. but you could!
                            if(tile.solid) { continue; }
                            else { valid = false; break; }
                    }

                    console.log(`CHECK ${symbol} against ${tile}: ${valid}`);
                }
           }

           if(valid) {
            console.log("VALID ROTATION: " + i + " for template " + template + " on level " + level);
            output.push(i);
           }
        }

        return output;
    }

    static getMaxDigitInTemplate(template: MoveTemplate): number {
        let max = 0;
        for (let y = 0; y < template.length; y++) {
            for (let x = 0; x < template[y].length; x++) {
                if (!isNaN(parseInt(template[y][x]))) {
                    max = Math.max(max, parseInt(template[y][x]));
                }
            }
        }

        return max;
    }
}


type MoveTemplate = string[];

// MAPPING for these templates
// @   - player location, must exist.
// *   - any tile type acecptable
// 1-N - the sequence of spaces the player will move through. 
// W   - the space must be a wall or other solid tile
// 0   - the space must be not solid
// E   - the space must have an enemy in it (TODO)

export const JUMP: MoveTemplate = [
    '1',
    '0',
    '@',
]

// TODO figure out how to accept the chiral version? this it the R variant
export const WALL_RUN_R: MoveTemplate = [
    '1W',
    '0W',
    '0W',
    '0W',
    '@W'
]

export const LONG_WALL_JUMP: MoveTemplate = [
    '1',
    '0',
    '0',
    '@',
    'W'
]

export const RUNNING_JUMP: MoveTemplate = [
    '3',
    '*',
    '*',
    '2',
    '1',
    '@'
]
