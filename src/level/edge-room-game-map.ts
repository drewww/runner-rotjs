import { Point, Rect } from "..";
import { Button } from "./button";
import { GameMap } from "./game-map";
import { Tile } from "./tile";
import * as ROT from 'rot-js'; // Import the 'rot-js' package

export class EdgeRoomGameMap extends GameMap {
    totalRooms: number;


    constructor(protected w: number, protected h: number) {
        super(w, h);

        this.fillMapWithTile("FLOOR");

        // first, do it entirely with horizontal movement.
        let xCursor = 0;

        this.totalRooms = 0;

        // partition the space 0 to this.w into between 3 and 6 sections. each partition should be at least five wide.
        // implement this as a binary space partition in one dimension.

        const partitionWeights = [1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4];
        const numPartitions = partitionWeights[Math.floor(Math.random() * partitionWeights.length)];

        // we're going to just randomly choose these values, test their validity, and stop if it takes too long.
        // there are better ways to do this but I am lazy and it's day 5.
        let partitionValues: number[] = [];

        var attempts = 0;
        while (partitionValues.length < numPartitions) {
            let partition = Math.floor(Math.random() * (this.w - 10)) + 5;

            // check if it's valid
            let valid = true;
            for (const value of partitionValues) {
                if (Math.abs(partition - value) < 5) {
                    valid = false;
                }
            }

            if (valid) { partitionValues.push(partition); }
            attempts++;
            if (attempts >= 30) {
                console.log("too many attempts to find valid partition stopping");
                break;
            }
        }

        partitionValues.sort((a, b) => a - b);
        partitionValues.push(this.w);
        console.log("partitionValues", partitionValues);

        var roomId = 0;
        for (let nextX of partitionValues) {

            // now we have a choice -- we can leave this column empty or fill it.
            // if (Math.random() > 0.90) {
            //     continue;
            // } else {
            // use the column for something. 
            // we can split the column in 0-3 ways.

            var splitsBalance = [0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2];
            var numSplits = splitsBalance[Math.floor(Math.random() * splitsBalance.length)];

            let dY: number[] = [];
            let yCursor = 0;
            let skipped = false;
            // numSplits = 2;

            const SKIP_CHANCE = 0.5;

            console.log("numSplits", numSplits);
            let rect = { x: xCursor, y: 0, w: nextX - xCursor, h: this.h };
            switch (numSplits) {
                case 0:
                    rect = { x: xCursor, y: 0, w: nextX - xCursor, h: this.h };
                    this.addTilesOnRectBoundaries([rect], "WALL");
                    this.setTileMetadata(this.shrinkRect(rect), "ROOM_" + roomId);
                    roomId++;
                    break;
                case 1:
                    // add a value between 5 and this.h - 5
                    dY.push(Math.floor(Math.random() * (this.h - 15)) + 5);
                    yCursor = 0;

                    skipped = false;
                    for (const y of dY) {
                        rect = { x: xCursor, y: yCursor, w: nextX - xCursor, h: y }
                        if (skipped || Math.random() > SKIP_CHANCE) {
                            this.addTilesOnRectBoundaries([rect], "WALL");
                        } else {
                            skipped = true;
                        }
                        yCursor += y - 1;
                        this.setTileMetadata(this.shrinkRect(rect), "ROOM_" + roomId);
                        roomId++;
                    }

                    rect = { x: xCursor, y: yCursor, w: nextX - xCursor, h: this.h - yCursor }
                    if (skipped || Math.random() > SKIP_CHANCE) {

                        this.addTilesOnRectBoundaries([rect], "WALL");
                    }
                    this.setTileMetadata(this.shrinkRect(rect), "ROOM_" + roomId);
                    roomId++;
                    break;
                case 2:
                    // add two values, first is between 5 and height-10, second is bewteen the FIRST number and height-5
                    const first = Math.floor(Math.random() * (this.h - 10 - 5)) + 5;
                    dY.push(first);
                    dY.push(Math.floor(Math.random() * (this.h - 10 - first) + 5));

                    console.log(dY);
                    yCursor = 0;
                    skipped = false;

                    for (const y of dY) {
                        if (skipped || Math.random() > SKIP_CHANCE) {
                            rect = { x: xCursor, y: yCursor, w: nextX - xCursor, h: y };
                            this.addTilesOnRectBoundaries([rect], "WALL");
                            yCursor += y - 1;

                        } else {
                            skipped = true;
                        }

                        this.setTileMetadata(this.shrinkRect(rect), "ROOM_" + roomId);
                        roomId++;

                    }

                    rect = { x: xCursor, y: yCursor, w: nextX - xCursor, h: this.h - yCursor };
                    if (skipped || Math.random() > 0.33) {
                        this.addTilesOnRectBoundaries([rect], "WALL");
                    }
                    this.setTileMetadata(this.shrinkRect(rect), "ROOM_" + roomId);
                    roomId++;

                    break;
                default:
                    break;

            }

            xCursor = nextX - 1;


        }

        // 

        // do this last so it ovewrites any "wall" types on the edges
        this.addTilesOnRectBoundaries([{ x: 0, y: 0, w: this.w, h: this.h }], "BOUNDARY");
        this.totalRooms = roomId;

        //---------------------------------------//
        //   FILL IN THE ROOMS                   //
        //---------------------------------------//
        for (let roomId = 0; roomId < this.totalRooms; roomId++) {
            let rect = this.getRectForRoomId(roomId);
            console.log("filling room", roomId, rect);
            let filler: RoomFiller;


            if(rect.w >= 9 && rect.h >= 9) { 
                console.log("  choosing bracket");
                filler = new BracketRoomFiller(rect);
            } else if(Math.random() > 0.5) {
                console.log("Choosing random");
                filler = new RandomRoomFiller(rect);
            } else {
                console.log("   choosing rows");
                filler = new RowsRoomFiller(rect);
            }

            filler.fillRoom();
            // now take the transposed tiles out and REPLACE them on the map
            const tiles = filler.getTiles();

            for (let tile of tiles) {
                this.setTile(tile);
            }
        }

        // now look for an entrance and exit
        // first pass, place the entrance on the left edge, and the exit on the right
        const leftEdgeTiles = this.tiles.filter(tile => tile.x === 0 && tile.type === "BOUNDARY");

        while(leftEdgeTiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * leftEdgeTiles.length);
            const tile = leftEdgeTiles[randomIndex];
            if(tile) {

                // check if the three tiles to the right of this tile are all floor tiles
                let allFloor = true;
                for(let j=0; j<2; j++) {
                    for(let i = -1; i < 1; i++) {
                        const nextTile = this.getTile(tile.x+1+j, tile.y+i);
                        if(nextTile && nextTile.type !== "FLOOR") {
                            allFloor = false;
                        }
                    }
                }   

                if(allFloor) {
                    this.setTile(new Tile(tile.x+1, tile.y-1, "WALL"));
                    this.setTile(new Tile(tile.x+1, tile.y, "ENTRANCE"));
                    this.setTile(new Tile(tile.x+1, tile.y+1, "WALL"));
                    break;
                }
            }
            leftEdgeTiles.splice(randomIndex, 1)
        }
        
        const rightEdgeTiles = this.tiles.filter(tile => tile.x === this.w-1 && tile.type === "BOUNDARY");
        while(rightEdgeTiles.length > 0) {
            const randomIndex = Math.floor(Math.random() * rightEdgeTiles.length);
            const tile = rightEdgeTiles[randomIndex];
            if(tile) {

                // check if the three tiles to the right of this tile are all floor tiles
                let allFloor = true;
                for(let j=0; j<2; j++) {
                    for(let i = -1; i < 1; i++) {
                        const nextTile = this.getTile(tile.x-1-j, tile.y+i);
                        if(nextTile && (nextTile.type === "BOUNDARY" || nextTile.type === "BUTTON")) {
                            allFloor = false;
                        }
                    }
                }   

                if(allFloor) {
                    this.setTile(new Tile(tile.x-1, tile.y-1, "WALL", "EXIT_TEMPLATE"));
                    this.setTile(new Tile(tile.x-1, tile.y, "EXIT", "EXIT_TEMPLATE"));
                    this.setTile(new Tile(tile.x-1, tile.y+1, "WALL", "EXIT_TEMPLATE"));
                    this.setTile(new Tile(tile.x-2, tile.y-1, "FLOOR", "EXIT_TEMPLATE"));
                    this.setTile(new Tile(tile.x-2, tile.y, "FLOOR", "EXIT_TEMPLATE"));
                    this.setTile(new Tile(tile.x-2, tile.y+1, "FLOOR", "EXIT_TEMPLATE"));

                    break;
                }
            }

            rightEdgeTiles.splice(randomIndex, 1);
        }

        const wallTiles = this.tiles.filter(tile => tile.type === "WALL");
        // randomly replace 3 of them with buttons
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * wallTiles.length);
            const tile = wallTiles[randomIndex];
            this.setTile(new Button(tile.x, tile.y));
            wallTiles.splice(randomIndex, 1); // remove the wall tile from the array
        }


        // ------------- DOORS ------------------ //



    }

    getRectForRoomId(roomId: number): Rect {
        let rect: Rect = { x: Infinity, y: Infinity, w: 0, h: 0 };
        for (let tile of this.tiles) {
            if (tile.procGenType === "ROOM_" + roomId) {
                rect.x = Math.min(rect.x, tile.x);
                rect.y = Math.min(rect.y, tile.y);
                rect.w = Math.max(rect.w, tile.x - rect.x + 1);
                rect.h = Math.max(rect.h, tile.y - rect.y + 1);
            }
        }
        return rect;
    }
}

interface RoomFiller {
    // takes a rect, returns a list of tiles ordered by x, then y with w and h
    // matching the rect provided.
    fillRoom(): void;
    getTiles(): Tile[];
}

abstract class BaseRoomFiller implements RoomFiller {
    tiles: Tile[];
    rect: Rect;

    constructor(rect: Rect) {
        this.rect = rect;
        this.tiles = [];

        for (let y = 0; y < rect.h; y++) {
            for (let x = 0; x < rect.w; x++) {
                this.tiles.push(new Tile(x, y, "FLOOR"));
            }
        }
    }

    getPointsOnRectBoundaries(rect: Rect): Point[] {
        let points: Point[] = [];
        for (let x = rect.x; x < rect.x + rect.w; x++) {
            points.push({ x: x, y: rect.y });
            points.push({ x: x, y: rect.y + rect.h - 1 });
        }
        for (let y = rect.y; y < rect.y + rect.h; y++) {
            points.push({ x: rect.x, y: y });
            points.push({ x: rect.x + rect.w - 1, y: y });
        }
        return points;
    }

    getTile(x: number, y: number): Tile {
        return this.tiles[y * this.rect.w + x];
    }

    setTile(x: number, y: number, tile: Tile) {
        if(!tile) { return; }

        const index = y * this.rect.w + x;
        if(index >= this.tiles.length) { 
            // console.error("Got bad index: " + index + " for x: " + x + " y: " + y + " rect: " + JSON.stringify(this.rect));
            return;
        }

        if(x > this.rect.w || y > this.rect.h) {
            // console.error("exceeded bounds" + x + " " + y + " " + this.rect.w + " " + this.rect.h);
            return;
        }

        this.tiles[y * this.rect.w + x] = tile;
    }

    translateTiles(): void{
        // console.log(this.tiles);
        // this.cleanTiles();
        for (let tile of this.tiles) {
            if(!tile) { }
            // console.log("tile: " + JSON.stringify(tile));
            // console.log("rect: " + JSON.stringify(this.rect));



            tile.x = tile.x + this.rect.x;
            tile.y = tile.y + this.rect.y;
        }
    }

    getTiles(): Tile[] {
        return this.tiles;
    }


    fillRoom(): void {
        return;
    }

}

// class TinyRoomFiller extends BaseRoomFiller {

// }

class RandomRoomFiller extends BaseRoomFiller {
    fillRoom(): void {

        var noise = new ROT.Noise.Simplex();

        for (let tile of this.tiles) {
            let value = noise.get(tile.x / 5, tile.y / 5) * 255;

            if(value > 100) {
                this.setTile(tile.x, tile.y, new Tile(tile.x, tile.y, "WALL"));
                console.log(tile);
            }
        }

        this.translateTiles();
    }
}

class BracketRoomFiller extends BaseRoomFiller {
    fillRoom(): void {
        // fill the corners with inset walls
        var insetRect = this.shrinkRect(this.shrinkRect(this.rect));
        for(let i = 0; i < 10; i++) {
            if(insetRect.w < 6 && insetRect.h < 6) { break; }
            // iterate through the points of insetRect
            // for points that are greater than 2 steps away from any of the corners, skip them.
            // otherwise, fill in with a wall tile.
            for (const point of this.getPointsOnRectBoundaries(insetRect)) {
                const rectPoint = { x: point.x - this.rect.x, y: point.y - this.rect.y };

                if (rectPoint.x > (insetRect.w/5+4) && rectPoint.x < insetRect.w-(insetRect.w/5 + 2)) { continue; }
                if (rectPoint.y > (insetRect.h/5+4) && rectPoint.y < insetRect.h-(insetRect.w/5 + 2)) { continue; }
                
                this.setTile(rectPoint.x, rectPoint.y, new Tile(rectPoint.x, rectPoint.y, "WALL"));
            }

            insetRect = this.shrinkRect(this.shrinkRect(this.shrinkRect(insetRect)));
        } 
        this.translateTiles();
    }

    shrinkRect(rect: Rect): Rect {
        return {
            x: rect.x + 1,
            y: rect.y + 1,
            w: rect.w - 2,
            h: rect.h - 2
        };
    }
}
class RowsRoomFiller extends BaseRoomFiller {

    fillRoom(): void {
        var w = this.rect.w;
        var h = this.rect.h;

        // fill all spaces with floor tiles

        // oooookay. first, pick horizontal or vertical.
        // hard code vetical for now.

        const axis = Math.random() > 0.5 ? "H" : "V";
        // figure out how many columns we can do. we want to have a free edge on each side.

        const a = axis === "V" ? w : h;
        const b = axis === "V" ? h : w;

        const numLanes = Math.floor((a - 1) / 2);

        const isOdd = (a - 1) % 2 === 1;

        // start at 2 for a left margin of 1
        var cursor = 1;
        for (let i = 0; i < numLanes; i++) {
            // fill in a line of tiles
            const guaranteeCut = b > 4;
            var cutAt = Math.floor(Math.random() * (b - 4)) + 2;

            for (let j = 1; j < b - 1; j++) {
                if (guaranteeCut && j === cutAt) { continue; }

                if (axis === "V") {
                    this.setTile(cursor, j, new Tile(cursor, j, "WALL"));
                } else {
                    this.setTile(j, cursor, new Tile(j, cursor, "WALL"));
                }
            }
            cursor += 2;

            // chance to skip a lane
            if (Math.random() > 0.95) {
                cursor += 2;
                i++;
            }
        }

        // if we have an odd number of spaces, rather than making lanes, in the last column sometimes 
        // add periodic walls.
        if (isOdd) {
            const period = Math.floor(Math.random() * 2 + 2);
            for (let j = 1; j < b - 1; j += period) {
                if (axis === "V") {
                    this.setTile(a - 1, j, new Tile(a - 1, j, "WALL"));
                } else {
                    this.setTile(j, a - 1, new Tile(j, a - 1, "WALL"));
                }
            }
        }

        this.translateTiles();
    }
}