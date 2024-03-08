import { GameMap } from "./game-map";

export class EdgeRoomGameMap extends GameMap {


    constructor(protected w: number, protected h: number) {
        super(w, h);

        this.fillMapWithTile("FLOOR");



        // first, do it entirely with horizontal movement.
        let xCursor = 0;

        for (let i = 2; i < 3; i++) {
            // move some distance to the right. minimum 5, max 30
            let dX = Math.floor(Math.random() * 25) + 5;

            // now we have a choice -- we can leave this column empty or fill it.
            // if (Math.random() > 0.90) {
            //     continue;
            // } else {
            // use the column for something. 
            // we can split the column in 0-3 ways.

            // consider balancing these differently
            var numSplits = Math.floor(Math.random() * 3);

            let dY:number[] = [];
            let yCursor = 0;
            numSplits = 2;

            console.log("numSplits", numSplits);
            switch (numSplits) {
                case 0:
                    this.addTilesOnRectBoundaries([{ x: xCursor, y: 0, w: dX, h: this.h }], "WALL");
                    break;
                case 1:
                    // add a value between 5 and this.h - 5
                    dY.push(Math.floor(Math.random() * (this.h - 15)) + 5);
                    yCursor = 0;
                    for(const y of dY) {
                        this.addTilesOnRectBoundaries([{ x: xCursor, y: yCursor, w: dX, h: y }], "WALL");
                        yCursor += y-1;
                    }
                    this.addTilesOnRectBoundaries([{ x: xCursor, y: yCursor, w: dX, h: this.h-yCursor }], "WALL");

                    break;
                case 2:
                    // add two values, first is between 5 and height-10, second is bewteen the FIRST number and height-5
                    const first = Math.floor(Math.random() * (this.h - 10 - 5)) + 5;
                    dY.push(first);
                    dY.push(Math.floor(Math.random() * (this.h- 10 - first)+5));

                    console.log(dY);
                    yCursor = 0;
                    for(const y of dY) {
                        this.addTilesOnRectBoundaries([{ x: xCursor, y: yCursor, w: dX, h: y }], "WALL");
                        yCursor += y-1;
                    }
                    this.addTilesOnRectBoundaries([{ x: xCursor, y: yCursor, w: dX, h: this.h-yCursor }], "WALL");

                    break;
                default:
                    break;
            }




            // do this last so it ovewrites any "wall" types on the edges
            this.addTilesOnRectBoundaries([{ x: 0, y: 0, w: this.w, h: this.h }], "BOUNDARY");
        }
    }
}