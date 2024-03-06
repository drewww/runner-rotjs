import * as ROT from 'rot-js';
import { Tile } from './tile';
import { Point } from '..';
import { Being } from '../entities/being';

type MapTemplate = {
    name: string;
    template: string[];

    // there may be other constraints we add here
}

export class GameMap {
    


    // going to try to do this as 1d array with a fixed width, since 2d arrays
    // in js seem kinda janky.
    protected tiles:Tile[] = [];
    protected beings:Being[] = [];

    constructor(protected w:number, protected h:number) {
        this.w = w;
        this.h = h;

        this.tiles = [];
        this.beings = [];
    }

    fillMapWithWalls(): void {
        this.fillMapWithTile("WALL");
    }

    fillMapWithTile(tileType: string): void {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                this.tiles.push(new Tile(x, y, tileType));
            }
        }
    }

    generateTrivialMap(): void {
        this.fillMapWithWalls();
        for (let x = 1; x < this.w-1; x++) {
            for (let y = 1; y < this.h-1; y++) {
                this.setTile(new Tile(x, y, "FLOOR"));
            }
        }

        // now put some random walls in it
        for (let i = 0; i < 100; i++) {
            const x = Math.floor(Math.random() * this.w);
            const y = Math.floor(Math.random() * this.h);
            this.setTile(new Tile(x, y, "WALL"));
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
    
    getBeings(): Being[] {
        return this.beings;
    }

    getFreePoints(): Point[] {
        return this.getFreeTiles().map(tile => ({x: tile.x, y: tile.y}));
    } 

    resetPlayerVisibility() {
        for (const tile of this.getAllTiles()) {
            tile.visible = false;
        }
    }

    public pointTransparent(x: number, y: number) {
        const tile = this.getTile(x, y);
        return tile && !tile.opaque;
    }


    static EXIT: MapTemplate = {
        name: "EXIT",
        template: [
            "   ",
            " % ",
            " # ",
            " # ",
            " # "
        ]
    }
    
    static ENTRANCE: MapTemplate = {
        name: "ENTRANCE",
        template: [
            "   ",
            " @ ",
            " # ",
            " % ",
            "   "
        ]
    }

    public addTemplate(template: MapTemplate, minDistance: number = 0, hallway: boolean=false): void {
        // look for places to put the template

        // distance will let you know how far in A* distance it can be from the player starting. 
        // for now ignore it.

        // pick random spots, see if there is space. 
        const freeCells = this.getFreePoints().filter(point => { 
            const tile = this.getTile(point.x, point.y)
            return tile.procGenType != "HALLWAY"
        });
    
        let placed = false;
        while (!placed) {
            const randomIndex = Math.floor(Math.random() * freeCells.length);

            if(this.templateFitsAtPoint(template, freeCells[randomIndex])) {
                this.placeTemplateAtPoint(template, freeCells[randomIndex]);
                placed = true;
            }
        }
    }

    protected placeTemplateAtPoint(template: MapTemplate, point: {x: number, y: number}): void {
        const dimensions = this.getTemplateDimensions(template);

        for (let y = 0; y < dimensions.h; y++) {
            for (let x = 0; x < dimensions.w; x++) {
                const templateTile = template.template[y][x];

                var newTile;

                switch (templateTile) {
                    case " ":
                        newTile = new Tile(point.x + x, point.y + y, "FLOOR");
                        break;
                    case "#":
                        newTile = new Tile(point.x + x, point.y + y, "FORCEFIELD");
                        break;
                    case "%":
                        newTile = new Tile(point.x + x, point.y + y, "EXIT");
                        break;
                    case "@":
                        // skip this?? 
                        break;
                    default:
                        console.error("unrecognized template tile: " + templateTile);
                        break;
                }

                if (newTile) {
                    this.setTile(newTile);
                }
            }
        }
    }

    protected templateFitsAtPoint(template: MapTemplate, point: {x: number, y: number}, rotation: number = 0): boolean {
        const dimensions = this.getTemplateDimensions(template);
        
        // check if the template fits at the point
        for (let y = 0; y < dimensions.h; y++) {
            for (let x = 0; x < dimensions.w; x++) {
                const levelTile = this.getTile(point.x + x, point.y + y);

                // make sure none of the space the template might take up is solid. 
                // non solid stuff we can overwrite(?)
                if (levelTile.solid) {
                    break;
                }
            }
        }

        return false;
    }

    protected getTemplateDimensions(template: MapTemplate): {w: number, h:number} {
        return {w: template.template[0].length, h: template.template.length};
    }
}