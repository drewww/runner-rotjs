import { Rect } from "..";
import { GameMap } from "./game-map";
import { Tile } from "./tile";

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
        while(partitionValues.length < numPartitions) {
            let partition = Math.floor(Math.random() * (this.w - 10)) + 5;

            // check if it's valid
            let valid = true;
            for (const value of partitionValues) {
                if (Math.abs(partition - value) < 5) {
                    valid = false;
                }
            }

            if(valid) { partitionValues.push(partition); }
            attempts++;
            if(attempts >= 30) {
                console.log("too many attempts to find valid partition stopping");
                break;
            }
        }

        partitionValues.sort((a, b) => a - b);
        partitionValues.push(this.w);
        console.log("partitionValues", partitionValues );

        var roomId = 0;
        for (let nextX of partitionValues) {

            // now we have a choice -- we can leave this column empty or fill it.
            // if (Math.random() > 0.90) {
            //     continue;
            // } else {
            // use the column for something. 
            // we can split the column in 0-3 ways.

            var splitsBalance = [0, 0, 1, 1, 1, 1,1, 1, 2, 2, 2, 2];
            var numSplits = splitsBalance[Math.floor(Math.random() * splitsBalance.length)];

            let dY: number[] = [];
            let yCursor = 0;
            let skipped = false;
            // numSplits = 2;

            const SKIP_CHANCE= 0.5;

            console.log("numSplits", numSplits);
            let rect = { x: xCursor, y: 0, w: nextX-xCursor, h: this.h };
            switch (numSplits) {
                case 0:
                    rect = { x: xCursor, y: 0, w: nextX-xCursor, h: this.h };
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
                        rect = { x: xCursor, y: yCursor, w: nextX-xCursor, h: y }
                        if (skipped || Math.random() > SKIP_CHANCE) {
                            this.addTilesOnRectBoundaries([rect], "WALL");
                        } else {
                            skipped = true;
                        }
                        yCursor += y - 1;
                        this.setTileMetadata(this.shrinkRect(rect), "ROOM_" + roomId);
                        roomId++;
                    }

                    rect = { x: xCursor, y: yCursor, w: nextX-xCursor, h: this.h - yCursor }
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
                            rect = { x: xCursor, y: yCursor, w: nextX-xCursor, h: y };
                            this.addTilesOnRectBoundaries([rect], "WALL");
                            yCursor += y - 1;
                            
                        } else {
                            skipped = true;
                        }

                        this.setTileMetadata(this.shrinkRect(rect), "ROOM_" + roomId);
                        roomId++;

                    }

                    rect = { x: xCursor, y: yCursor, w: nextX-xCursor, h: this.h - yCursor };
                    if (skipped || Math.random() > 0.33) {
                        this.addTilesOnRectBoundaries([rect], "WALL");
                    }
                    this.setTileMetadata(this.shrinkRect(rect), "ROOM_" + roomId);
                    roomId++;

                    break;
                default:
                    break;

                }

                xCursor = nextX-1;


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
            let filler = new RowsRoomFiller(rect);
            filler.fillRoom();
            // now take the transposed tiles out and REPLACE them on the map
            const tiles = filler.transposeTiles();

            for (let tile of tiles) {
                this.setTile(tile);
            }
        }

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

    getTile(x: number, y: number): Tile {
        return this.tiles[y * this.rect.w + x];
    }

    setTile(x: number, y: number, tile: Tile) {
        this.tiles[y * this.rect.w + x] = tile;
    }
 
    transposeTiles(): Tile[] {
        for(let tile of this.tiles) {
            tile.x = tile.x + this.rect.x;
            tile.y = tile.y + this.rect.y;
        }

        return this.tiles;
    }

    fillRoom(): void {
        return;
    }

}

class RowsRoomFiller extends BaseRoomFiller {

    fillRoom(): void {
        var w = this.rect.w;
        var h = this.rect.h;

        // fill all spaces with floor tiles

        // oooookay. first, pick horizontal or vertical.
        // hard code vetical for now.

        // const axis = Math.random() > 0.5 ? "H" : "V";
        // figure out how many columns we can do. we want to have a free edge on each side.
        const numCols = Math.floor((w-1) / 2);

        // start at 2 for a left margin of 1
        var cursor = 1;
        for(let i = 0; i < numCols; i++) {
            // fill in a line of tiles
            for(let j = 1; j < h-1; j++) {
                this.setTile(cursor, j, new Tile(cursor, j, "WALL"));
            }

            cursor+=2;
        }
    }
}