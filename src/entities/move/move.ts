import { Point, rotateVector } from "../..";
import { LevelController } from "../../level/level-controller";

export type Move = {
    name: string;
    template: MoveTemplate;
    variants?: MoveTemplate[];
    cooldownOnUse: number;
    cooldown: number;
    selected: boolean;
}

export type MoveOption = {
    symbol: string,
    moves: Point[]
}

export type MoveSignature = {
    rotation: number;
    shorten: number;
}

export class MoveManager {


    public static moveResults(level: LevelController, move: Move, keyStyle: string): MoveOption[] {
        // this method will a list of points that this moveTemplate would
        // move the player to. expressed in player-relative vector locations.

        // return a list of lists
        // each list is a rotation of the first one
        // and the list of moves in order that the player will pass through

        const validRotations: MoveSignature[] = MoveManager.getValidRotationsForTemplate(level, move);

        const output: MoveOption[] = [];

        // TODO swap between keypad and keyboard symbols dynamically based
        // on what player used last. For now, just use keyboard.
        const symbol_map: { [key: string]: string[] } = {};
        symbol_map["letters"] = ["W", "D", "S", "A"];
        symbol_map["keypad"] = ["8", "6", "2", "4"];

        // ahhh the assumption here is that the steps in the move are always the same for each rotation.
        // we need to break that now.

        for (let validRotation of validRotations) {
            const i = validRotation.rotation;
            const stepsInMove: Point[] = MoveManager.getAllPointsInMoves(move, validRotation);
            let thisRotation = [];
            for (let step of stepsInMove) {
                // refactored this into index
                step = rotateVector(step, i);
                thisRotation.push(step);
            }

            output.push({ symbol: symbol_map[keyStyle][i], moves: thisRotation });
        }

        return output;
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
    static getAllPointsInMoves(move: Move, moveSignature: MoveSignature): Point[] {

        let points: Point[] = [];

        var template = move.template;

        if (move.variants && moveSignature.shorten > 0) {
            template = move.variants![moveSignature.shorten - 1];
        }

        const steps = MoveManager.getMaxDigitInTemplate(template);
        const playerLocation = MoveManager.getLocationInTemplate(template, '@');

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

    // returns an array that contains only valid rotations, with the associated variant id
    // that makes that rotation work. 
    static getValidRotationsForTemplate(level: LevelController, move: Move): MoveSignature[] {
        // for the given template and level return which rotations are valid.
        // (consider a version of this that shows where the templates are failing... people
        // may find it weird not knowing what are the options. or it may be that we end up
        // showing all valid moves all at once, rather than having to pick the move style first.

        let output: MoveSignature[] = [];

        // so, for each rotation check every template square against the world and its constraint. 
        for (let i = 0; i < 4; i++) {
            console.log("----starting rotation: " + i + "----");

            if (move.variants) {
                for (let shorten = 0; shorten < move.variants.length + 1; shorten++) {
                    const validRotation = MoveManager.checkValidRotation(level, move, i, shorten);
                    console.log("rotation: " + i + " shorten: " + shorten + " valid? " + validRotation);
                    if (validRotation) {
                        output.push({ rotation: i, shorten: shorten });
                        break;
                    }
                }
            } else {
                const validRotation = MoveManager.checkValidRotation(level, move, i);
                if (validRotation) {
                    output.push({ rotation: i, shorten: 0 });
                }
            }
        }
        return output;
    }

    static checkValidRotation(level: LevelController, move: Move, rotation: number, shorten: number = 0): boolean {

        var template = move.template;

        var validRotation = false;

        // for a given rotation, if it is asymmetric, then test the flip.
        // asymmetric means -- there is greater than one column AND
        //    (column count is even OR column count is odd and player is not in the "center" column)

        var basePlayerLocation = MoveManager.getLocationInTemplate(template, '@');

        const asymmetric = template[0].length > 1 &&
            (template[0].length % 2 == 0 ||
                (template[0].length % 2 == 1 && basePlayerLocation.x != Math.floor(template[0].length / 2)));

        if (shorten > 0 && move.variants && move.variants.length + 1 > shorten) {
            template = move.variants[shorten - 1];
        } else {
            template = move.template;
        }

        console.log("checking template: " + template);

        var curTemplate: MoveTemplate = template;

        for (let flip = 0; flip < (asymmetric ? 2 : 1); flip++) {
            var validFlip = true;

            // console.log(`Evaluating rotation: ${i} and flip: ${flip} (validRotation: false, validFlip: true)`);

            if (flip === 1) {
                curTemplate = MoveManager.flipTemplate(template);
            }

            // console.log("template: " + curTemplate);
            const playerLocation = MoveManager.getLocationInTemplate(curTemplate, '@');

            for (let y = 0; y < curTemplate.length; y++) {
                for (let x = 0; x < curTemplate[y].length; x++) {
                    const symbol = curTemplate[y][x];

                    // so, get the symbol from the "normal" template. but rotate the vector
                    // when you go to get it out of the level.map object. so calculate the player-relative
                    // vector first (that's the x-playerLocation.x part) and then rotate normally around 0,0.
                    // the vector that comes out will be player relative still.
                    const vectorToTile = rotateVector({ x: x - playerLocation.x, y: y - playerLocation.y }, rotation);

                    // the template x/y coordinates need to be transformed to be player-relative
                    // in other words, find the @ symbol in the template and make sure we are getting
                    // a vector back that is the player to the current tile, not the absolute location
                    // in the template vectors.
                    const tile = level.map.getTile(vectorToTile.x + level.player!.x,
                        (vectorToTile.y) + level.player!.y);

                    const enemy = level.getBeings().find(being => being.x === (vectorToTile.x + level.player!.x) && being.y === (vectorToTile.y + level.player!.y));


                    // we may not get a valid tile back from the map, in which case the move is touching
                    // an out of bound space and is invalid.
                    if (!tile) {
                        validFlip = false;
                        break;
                    }

                    switch (symbol) {
                        case '@':
                        case '*':
                            // any tile is valid here
                            break;
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

                            // make sure there is not a being on the other side
                            if (enemy) { validFlip = false; break; }

                            // check that it's passable
                            if (!tile.solid) { break; }
                            else { validFlip = false; break; }

                        case 'W':
                            // must be a wall or other impassable tile
                            // notably we are not asking the level to check against
                            // the "passable" checker, which also looks at beings. 
                            // you can't jump off a bot currently. but you could!
                            if (tile.solid) { break; }
                            else { validFlip = false; break; }
                        case 'E':
                            // must be an enemy
                            // search through the list of beings on the level to see
                            // if any are in this spot.
                            // must be an enemy
                            // search through the list of beings on the level to see
                            // if any are in this spot.
                            if (enemy) { break; }
                            else { validFlip = false; break; }
                            break;
                    }

                }

            }
            // console.log(`CHECK ${symbol} against ${tile}: ${valid}`);
            // if both loops through are not valid, this will (false || false) || false = false
            // if one of them is valid, this will be (false || true) || false = true

            // console.log(`validRotation: ${validRotation} validFlip: ${validFlip} NEW validRotation: ${validFlip || validRotation}`);
            validRotation = validFlip || validRotation;
        }

        // if this rotation is not valid, retry with a shorter variant.

        return validRotation;
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

    static flipTemplate(template: MoveTemplate): MoveTemplate {
        const flippedTemplate: MoveTemplate = [];

        for (let y = 0; y < template.length; y++) {
            const row = template[y];
            const flippedRow = row.split('').reverse().join('');
            flippedTemplate.push(flippedRow);
        }

        return flippedTemplate;
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
// #   - the space must be a destructible wall

export const JUMP: MoveTemplate = [
    '1',
    '0',
    '@',
]

export const WALL_RUN_R: MoveTemplate = [
    '1W',
    '0W',
    '0W',
    '0W',
    '@W'
]

export const WALL_RUN_SHORTEN: MoveTemplate[] = [
    [
        '1W',
        '0W',
        '0W',
        '@W'
    ],
    [
        '1W',
        '0W',
        '@W'
    ]
]


export const LONG_WALL_JUMP: MoveTemplate = [
    '1',
    '0',
    '0',
    '0',
    '0',
    '@',
    'W'
]

export const LONG_WALL_JUMP_SHORTEN: MoveTemplate[] = [
    [
        '1',
        '0',
        '0',
        '0',
        '@',
        'W'
    ],
    [
        '1',
        '0',
        '0',
        '@',
        'W'
    ]
    ,[
        '1',
        '0',
        '@',
        'W'
    ]
]

export const RUNNING_JUMP: MoveTemplate = [
    '4',
    '0',
    '0',
    '0',
    '3',
    '2',
    '1',
    '@'
]

export const RUNNING_JUMP_SHORTEN: MoveTemplate[] = [
    [
        '4',
        '0',
        '0',
        '3',
        '2',
        '1',
        '@'
    ],

    [
        '4',
        '0',
        '3',
        '2',
        '1',
        '@'
    ],

    [
        '4',
        '3',
        '2',
        '1',
        '@'
    ]

]

export const BURROW: MoveTemplate = [
    '1',
    'W',
    '@'
]

export const ENEMY_JUMP: MoveTemplate = [
    '1',
    '0',
    '0',
    'E',
    '0',
    '0',
    '@'
]

export const ENEMY_JUMP_SHORTEN: MoveTemplate[] = [[
    '1',
    '0',
    'E',
    '0',
    '@'
]]
