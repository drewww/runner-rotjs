import { Point } from "../..";
import { Level } from "../../level/level";

export type Move = {
    name: string;
    template: MoveTemplate;
    cooldown: number;
    selected: boolean;
}

export class MoveManager {

    
    public static moveResults(level:Level, template:MoveTemplate): Point[] {
        // this method will a list of points that this moveTemplate would
        // 

        // first, just return the max number
        const maxMoveNumber = MoveManager.getMaxDigitInTemplate(template); 
        // console.log("max move number: " + maxMoveNumber);

        const playerLocation = MoveManager.getLocationInTemplate(template, '@');
        const destinationLocation = MoveManager.getLocationInTemplate(template, maxMoveNumber.toString());

        // console.log("player location: " + playerLocation.x + ", " + playerLocation.y);
        // console.log("destination location: " + destinationLocation.x + ", " + destinationLocation.y);

        return [{x: (destinationLocation.x - playerLocation.x),
                 y: (destinationLocation.y - playerLocation.y)}];
    }

    // public rotateTemplate(): string[][] {
    //     return [][];
    // }

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

    static getMaxDigitInTemplate(template:MoveTemplate) {
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
