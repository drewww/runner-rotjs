import * as ROT from 'rot-js'; // Import the 'ROT' namespace

export const SCREEN_WIDTH: number = 70;
export const SCREEN_HEIGHT: number = 40;

export type Point = {
    x:number,
    y:number
}

export type Light = {
    p: Point,
    intensity: number,
    color: string
}

export enum LevelType {
    CAVE = "CAVE",      // using the built in ROT.js "Digger" implementation and N bots
    DEBUG = "DEBUG",     // use this to figure out new generation techniques; defaults to all visible tiles
    RANDOM = "RANDOM"   // a random map with random bots and tiles
    // add other level generator types here
    // can also add a sequence of tutorial levels here
}

export enum GameState {
    TITLE = "TITLE",
    GAME = "GAME",
    KILLSCREEN = "KILLSCREEN",
    WINSCREEN = "WINSCREEN",
    MAP_EXPLORE = "MAP_EXPLORE",
}

export interface Drawable {
    x: number;
    y: number;

    draw(display: ROT.Display, xOffset:number, yOffset:number, bg:string): void;
    disable(): void;
}

export interface IGame {
    display: ROT.Display;
    

    refreshDisplay(): void;
    switchState(state: GameState): void;
}

export function rotateVector(vector: Point, times: number): Point {
    for (let i = 0; i < times; i++) {
        vector = { x: -vector.y, y: vector.x };
    }
    return vector;
}