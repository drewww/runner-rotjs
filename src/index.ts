
export type Point = {
    x:number,
    y:number
}

export type Light = {
    p: Point,
    intensity: number,
    color: string
}

// make a global game object that we can access from anywhere.
export * from './map/game-map'
export * from './game'
export * from './entities/being'
export * from './entities/player'
export * from './entities/enemy'

