import * as ROT from 'rot-js';
import { Tile } from './tile';
import { Point, Rect, rotateVector } from '..';
import { Being } from '../entities/being';
import { Button } from './button';
import { Door } from './door';

type MapTemplate = {
    name: string;
    templates: string[][];

    // there may be other constraints we add here
}

export class GameMap {
    // going to try to do this as 1d array with a fixed width, since 2d arrays
    // in js seem kinda janky.
    protected tiles: Tile[] = [];
    protected beings: Being[] = [];

    public latestPlayerPosition: Point;

    disableHunter: boolean = false;

    constructor(protected w: number, protected h: number) {
        this.w = w;
        this.h = h;

        this.tiles = [];
        this.beings = [];

        this.latestPlayerPosition = {x:0, y:0};
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
        for (let x = 1; x < this.w - 1; x++) {
            for (let y = 1; y < this.h - 1; y++) {
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

    getPlayerLocation() : Point {
        // var player;
        // player = this.beings.find(being => {
        //     return "takeDamage" in being;
        // });

        // if(player) {
        //     console.log("found a player: " + player);
        //     return {x:player.x, y:player.y};    
        // } else {
        //     console.log("COULD NOT FIND PLAYER");
        //     return {x:0, y:0};
        // }
        return this.latestPlayerPosition;
    }

    getIndex(x: number, y: number): number {
        return x + y * this.w;
    }

    setTile(tile: Tile) {
        this.tiles[this.getIndex(tile.x, tile.y)] = tile;
    }

    getTile(x: number, y: number): Tile {
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
        return this.getFreeTiles().map(tile => ({ x: tile.x, y: tile.y }));
    }

    resetPlayerVisibility() {
        for (const tile of this.getAllTiles()) {
            tile.visible = false;
        }
    }

    shrinkRect(rect: Rect): Rect {
        return {
            x: rect.x + 1,
            y: rect.y + 1,
            w: rect.w - 2,
            h: rect.h - 2
        };
    }

    shrinkRects(rects: Rect[]): Rect[] {
        const newRects: Rect[] = [];
        for (const rect of rects) {
            const newRect: Rect = {
                x: rect.x + 1,
                y: rect.y + 1,
                w: rect.w - 2,
                h: rect.h - 2
            };
            newRects.push(newRect);
        }
        return newRects;
    }

    public getTilesInRect(rect: Rect): Tile[] {
        return this.tiles.filter(tile => {
            return tile.x >= rect.x && tile.x < rect.x + rect.w && tile.y >= rect.y && tile.y < rect.y + rect.h;
        });
    }

    public setTileMetadata(rect: Rect, type: string) {
        const tiles = this.getTilesInRect(rect);
        for (const tile of tiles) {
            tile.procGenType = type;
        }
    }

    public addTilesOnRectBoundaries(rects: Rect[], tileType: string = "WALL"): void {
        for (const rect of rects) {
            for (let x = rect.x; x < rect.x + rect.w; x++) {
                this.setTile(new Tile(x, rect.y, tileType, "PARTITION"));
                this.setTile(new Tile(x, rect.y + rect.h - 1, tileType, "PARTITION"));
            }
            for (let y = rect.y; y < rect.y + rect.h; y++) {
                this.setTile(new Tile(rect.x, y, tileType, "PARTITION"));
                this.setTile(new Tile(rect.x + rect.w - 1, y, tileType, "PARTITION"));
            }
        }
    }

    public pointTransparent(x: number, y: number) {
        const tile = this.getTile(x, y);
        return tile && !tile.opaque;
    }

    public clear() {
        this.tiles = [];
        this.beings = [];
    }


    static EXIT: MapTemplate = {
        name: "EXIT",
        templates: [
        [
            "WWW",
            "W%W",
            "W#W",
            "W#W",
            "W#W",
            "   "
        ]
        ]
    }

    static ENTRANCE: MapTemplate = {
        name: "ENTRANCE",
        templates: [
            [
                "WWW",
                "W@W",
                "   "
            ],
            [
                "W W",
                " @ ",
                "W W"
            ],
            [
                "WWW",
                "W@W",
                "- -",
                "W-W"
            ],
        ]
    }

    static BUTTON: MapTemplate = {
        name: "BUTTON",
        templates: [
            [
                "W ",
                "WB",
                "W "
            ],
            [
                " W",
                " B",
                " W"
            ],
            [
                " WWW ",
                "  B  ",
                " WWW "
            ],
            [
                "W W",
                " B ",
                "W W"
            ],
        ]
    }

    static WALL: MapTemplate = {
        name: "WALL",
        templates: [
            [
                "W",
                "W",
                "W",
                "W",
                "W",
                "W",
                "W"
            ],
            [
                "W****",
                "W****",
                "W****",
                "WWWWW",
                "W****",
                "W****",
                "W****"
            ],
            [
                "W  W",
                "W  W",
                "W  W",
                "W  W",
                "*  *"
            ]
        ]
    }

    public addTemplate(template: MapTemplate, minDistance: number = 0, hallway: boolean = false): void {
        // look for places to put the template

        // distance will let you know how far in A* distance it can be from the player starting. 
        // for now ignore it.

        // pick random spots, see if there is space. 
        const freeCells = this.getFreePoints().filter(point => {
            const tile = this.getTile(point.x, point.y)
            return tile.procGenType != "HALLWAY"
        });

        let placed = false;
        let count = 0;
        while (!placed && count < 20) {
            const randomIndex = Math.floor(Math.random() * freeCells.length);
            const rotation = Math.floor(Math.random() * 4);
            const templateIndex = Math.floor(Math.random() * template.templates.length);

            if (this.templateFitsAtPoint(template, freeCells[randomIndex], rotation, templateIndex)) {
                this.placeTemplateAtPoint(template, freeCells[randomIndex], rotation, templateIndex);
                placed = true;
            }

            count++;
        }

        // console.log("finishing place: " + placed + " " + count);
    }

    protected placeTemplateAtPoint(template: MapTemplate, point: { x: number, y: number }, rotation: number, templateIndex: number): void {
        const dimensions = this.getTemplateDimensions(template, templateIndex);

        for (let y = 0; y < dimensions.h; y++) {
            for (let x = 0; x < dimensions.w; x++) {
                const rotatedPoint = rotateVector({ x, y }, rotation);

                const templateTile = template.templates[templateIndex][y][x];

                var newTile;

                switch (templateTile) {
                    case " ":
                        newTile = new Tile(point.x + rotatedPoint.x, point.y + rotatedPoint.y, "FLOOR");
                        break;
                    case "W":
                        newTile = new Tile(point.x + rotatedPoint.x, point.y + rotatedPoint.y, "WALL");
                        break;
                    case "#":
                        newTile = new Tile(point.x + rotatedPoint.x, point.y + rotatedPoint.y, "EXIT_FORCEFIELD");
                        break;
                    case "%":
                        newTile = new Tile(point.x + rotatedPoint.x, point.y + rotatedPoint.y, "EXIT");
                        break;
                    case "@":
                        newTile = new Tile(point.x + rotatedPoint.x, point.y + rotatedPoint.y, "ENTRANCE");
                        newTile.procGenType = "ENTRANCE";
                        break;
                    case "B":
                        newTile = new Button(point.x + rotatedPoint.x, point.y + rotatedPoint.y);
                        newTile.procGenType = "BUTTON";
                        break;
                    case "-":
                        newTile = new Door(point.x + rotatedPoint.x, point.y + rotatedPoint.y);
                        newTile.procGenType = "DOOR";
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

    protected templateFitsAtPoint(template: MapTemplate, point: { x: number, y: number }, rotation: number = -1, templateIndex: number): boolean {
        const dimensions = this.getTemplateDimensions(template, templateIndex);

        // // console.log("--------------------");

        // for (let y = -2; y < dimensions.h + 4; y++) {
        //     var mapRow = [];
        //     for (let x = -2; x < dimensions.w + 4; x++) {
        //         const rotatedPoint = rotateVector({ x, y }, 0);

        //         if (x == 0 && y == 0) {
        //             mapRow.push("X");
        //             continue;
        //         }
        //         const t = this.getTile(point.x + rotatedPoint.x, point.y + rotatedPoint.y);

        //         if (t) {
        //             mapRow.push(t.symbol);
        //         }
        //     }
        //     // console.log(mapRow.join(""));
        // }



        // check if the template fits at the point
        for (let y = 0; y < dimensions.h; y++) {
            for (let x = 0; x < dimensions.w; x++) {
                const rotatedPoint = rotateVector({ x, y }, rotation);

                const levelTile = this.getTile(point.x + rotatedPoint.x, point.y + rotatedPoint.y);

                const templateSymbol = template.templates[templateIndex][y][x];
                // TODO write a more complex template checker, like we use in the MoveManager.

                if(!levelTile) { return false; }

                switch(templateSymbol) {
                    case "*":
                        // means any tile is acceptable here (except maybe boundary tile? indestructable?)
                        continue;
                    case " ":
                        // break if there's not an empty tile there. that's the constraint -- it needs to be
                        // passable.
                        if(levelTile.solid) { return false; }
                        break;
                    case "W":
                        // basically, we want this to be a wall. we're happy with an existing wall.
                        // what would cause us to fail? a pre-existing "special" tile? 
                        // an indestructable tile
                        // a hallway tile?
                        
                        // if it's open, we can replace it. 
                        // ("special" tiles are basically all indestructable, so we can use that.)
                        if(levelTile.indestructable || levelTile.procGenType == "HALLWAY") { return false; }
                        break;
                }
                // make sure none of the space the template might take up is solid. 
                // non solid stuff we can overwrite(?)
                if (!levelTile || levelTile.solid) {
                    return false;
                }
            }
        }

        return true;
    }

    protected getTemplateDimensions(template: MapTemplate, templateIndex: number): { w: number, h: number } {
        return { w: template.templates[templateIndex][0].length, h: template.templates[templateIndex].length };
    }

    public getAdjacentTiles(x: number, y: number, cardinalOnly: boolean = false): Tile[] {
        const tiles: Tile[] = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                if (cardinalOnly && Math.abs(i)==1 && Math.abs(j)==1) continue;

                const tile = this.getTile(x + i, y + j);

                if (tile) {
                    tiles.push(tile);
                }
            }
        }

        return tiles;
    }
}