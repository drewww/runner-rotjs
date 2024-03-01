import * as ROT from 'rot-js'; // Import the 'ROT' namespace

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
    DEBUG = "DEBUG"     // a more open and random map for testing

    // add other level generator types here
    // can also add a sequence of tutorial levels here
}

export enum GameState {
    TITLE = "TITLE",
    GAME = "GAME",
    KILLSCREEN = "KILLSCREEN",
    WINSCREEN = "WINSCREEN"
}

export interface Drawable {
    x: number;
    y: number;

    draw(display: ROT.Display, xOffset:number, yOffset:number, bg:string): void;
    disable(): void;
}

export interface IGame {
    display: ROT.Display;
    engine: ROT.Engine | null;

    refreshDisplay(): void;
    switchState(state: GameState): void;
}