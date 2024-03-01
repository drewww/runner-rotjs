import * as ROT from 'rot-js';
import { COLORS } from '../colors';
import { Tile } from './tile';
import { Point } from '..';

export class GameMap {
    

    // going to try to do this as 1d array with a fixed width, since 2d arrays
    // in js seem kinda janky.
    private tiles:Tile[] = [];

    constructor(private w:number, private h:number) {
    }

    fillMapWithWalls(): void {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                this.tiles.push({
                    x: x,
                    y: y,
                    opaque: true,
                    solid: true,
                    symbol: " ",
                    fg: COLORS.WHITE,
                    bg: COLORS.BLACK,
                    visible: false,
                    discovered: true
                });
            }
        }
    }

    generateTrivialMap(): void {
        this.fillMapWithWalls();
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 2; y++) {
                this.setTile(new Tile(x, y, "WALL"));
            }
        }
    }

    generateDiggerMap(): void {
        this.fillMapWithWalls();

        const digger = new ROT.Map.Digger(this.w, this.h);

        const digCallback = (x: number, y: number, value: number): void => {
            if (value) { return; } // for walls, don't do anything. map is pre-seeded with walls.
            this.setTile(new Tile(x, y, "FLOOR"));
        }

        // bind causes it to run in the context of the Game object.
        digger.create(digCallback.bind(this));

        // create an exit
        const freeTiles = this.getFreeTiles();
        const exit = freeTiles[Math.floor(Math.random() * freeTiles.length)];
        this.setTile(new Tile(exit.x, exit.y, "EXIT"));
    }

    getIndex(x:number, y:number):number {
        return x + y * this.w;
    }

    setTile(tile:Tile) {
        this.tiles[this.getIndex(tile.x, tile.y)] = tile;
    }

    getTile(x:number, y:number):Tile {
        return this.tiles[this.getIndex(x, y)];
    }

    getFreeTiles(): Tile[] {
        return this.tiles.filter(tile => !tile.solid);
    }

    getAllTiles(): Tile[] {
        return this.tiles;
    }


    getFreePoints(): Point[] {
        return this.getFreeTiles().map(tile => ({x: tile.x, y: tile.y}));
    } 
}