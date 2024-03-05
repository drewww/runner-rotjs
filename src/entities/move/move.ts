import { Point } from "../..";
import { Level } from "../../level/level";

export type Move = {
    name: string;
    template: MoveTemplate;
    cooldown: number;
    selected: boolean;
}

export class MoveManager {

    
    public static moveResults(level:Level, template:MoveTemplate): Point[][] {
        // this method will a list of points that this moveTemplate would
        // move the player to. expressed in player-relative vector locations.

        // return a list of lists
        // each list is a rotation of the first one
        // and the list of moves in order that the player will pass through

        // first, just return the max number
        
        const stepsInMove : Point[] = MoveManager.getAllPointsInMove(template);

        const output: Point[][] = [];

        for (let i = 0; i < 4; i++) {
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
            vector = {x: vector.y, y: -vector.x};
        }
        return vector;
    }

    static getLocationInTemplate(template:MoveTemplate, symbol:string): Point {
        for(let y = 0; y < template.length; y++) {
            for(let x = 0; x < template[y].length; x++) {
                if(template[y][x] === symbol) {
                    return {x, y};
                }
            }
        }

        throw new Error(`No ${symbol} location found in template`);
    }

    static getAllPointsInMove(template: MoveTemplate): Point[] {
        const steps = MoveManager.getMaxDigitInTemplate(template);
        const playerLocation = MoveManager.getLocationInTemplate(template, '@');

        let points: Point[] = [];

        for (let step = 1; step <= steps; step++) {
            for (let y = 0; y < template.length; y++) {
                for (let x = 0; x < template[y].length; x++) {
                    if (template[y][x] === step.toString()) {
                        points.push({ x: x-playerLocation.x, y: y - playerLocation.y});
                    }
                }
            }
        }

        return points;
    }

    static getMaxDigitInTemplate(template:MoveTemplate) : number {
        let max = 0;
        for(let y = 0; y < template.length; y++) {
            for(let x = 0; x < template[y].length; x++) {
                if(!isNaN(parseInt(template[y][x]))) {
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
// W   - the space must be a wall

export const JUMP: MoveTemplate = [
    '1',
    '*',
    '@',
]

// TODO figure out how to accept the chiral version? this it the R variant
export const WALL_RUN_R: MoveTemplate = [
    '1W',
    '*W',
    '*W',
    '*W',
    '@W'
]

export const LONG_WALL_JUMP: MoveTemplate = [
    '1',
    '*',
    '*',
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
