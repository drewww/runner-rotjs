import { GameMap } from "./game-map";

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
    }
}