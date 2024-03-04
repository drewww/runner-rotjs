import { Point } from "../..";
import { Level } from "../../level/level";
import * as Array2D from 'array2d'

export type Move = {
    name: string;
    template: MoveTemplate;
    cooldown: number;
}

export class MoveManager {

    
    public static moveResults(level:Level, template:MoveTemplate): Point[] {
        // this method will a list of points that this moveTemplate would
        // 

        return [];
    }

    // public rotateTemplate(): string[][] {
    //     return [][];
    // }
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