import * as ROT from 'rot-js'; // Import the 'ROT' namespace
import { Being } from './entities/being';

export const SCREEN_WIDTH: number = 70;
export const SCREEN_HEIGHT: number = 40;
export const MAX_HEALTH: number=8;

export type Point = {
    x:number,
    y:number
}

export type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
}

export type Light = {
    p: Point,
    distance: number,
    color: string
    being: Being
}

export enum LevelType {
    CAVE = "CAVE",      // using the built in ROT.js "Digger" implementation and N bots
    DEBUG = "DEBUG",     // use this to figure out new generation techniques; defaults to all visible tiles
    RANDOM = "RANDOM",   // a random map with random bots and tiles
    BSP = "BSP",
    EDGE_ROOM = "EDGE_ROOM",
    TUTORIAL = "TUTORIAL",
    INTRO = "INTRO",
    VAULT = "VAULT",
    // add other level generator types here
    // can also add a sequence of tutorial levels here
}

export enum GameState {
    TITLE = "TITLE",
    GAME = "GAME",
    KILLSCREEN = "KILLSCREEN",
    WINSCREEN = "WINSCREEN",
    MAP_EXPLORE = "MAP_EXPLORE",
    TUTORIAL = "TUTORIAL",
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