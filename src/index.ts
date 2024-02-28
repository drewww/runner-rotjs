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

export interface IGame {
    display: ROT.Display;
    engine: ROT.Engine | null;

    refreshDisplay(): void;
}

// make a global game object that we can access from anywhere.
export * from './game'

export * from './level/level'
export * from './level/game-map'
export * from './entities/being'
export * from './entities/player'
export * from './entities/enemy'
export * from './ui/ui-box'
export * from './ui/text-box'
