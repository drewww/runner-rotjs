import { GameMap } from "./game-map";
import { Tile } from "./tile";

type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
}

export class BSPGameMap extends GameMap {

    constructor(protected w: number, protected h: number) {
        super(w, h);

        this.fillMapWithTile("FLOOR");
        let rects = this.divideSpace({ x: 2, y: 2, w: this.w - 4, h: this.h - 4 });
        rects = this.shrinkRects(rects);
        this.addTilesOnRectBoundaries(rects);

        // using this alternate type so we can select only internal walls later.
        // may also want to have a "burrow" move that can dig through walls but not
        // boundary tiles.
        this.addTilesOnRectBoundaries([{ x: 0, y: 0, w: this.w, h: this.h }], "BOUNDARY");

        // TODO: add doors
        // simple version -- just randomly knock out walls that ARENT on the edges
        // select all wall tiles
        const wallTiles = this.tiles.filter(tile => tile.symbol === " ");

        // randomly replace N of them with door tiles
        const numDoors = Math.floor(wallTiles.length / 20); // replace 5% of the wall tiles with doors
        for (let i = 0; i < numDoors; i++) {
            const randomIndex = Math.floor(Math.random() * wallTiles.length);
            const randomWallTile = wallTiles[randomIndex];
            this.setTile(new Tile(randomWallTile.x, randomWallTile.y, "DOOR"));
            wallTiles.splice(randomIndex, 1); // remove the wall tile from the array
            console.log("splicing in door: " + randomWallTile.x + ", " + randomWallTile.y);
        }
        
        // get all tiles of type wall


        // TODO: add exit template
        // TODO: add enemies (happens one level up??)
    }

    public addTilesOnRectBoundaries(rects: Rect[], tileType: string="WALL"): void {
        for (const rect of rects) {
            for (let x = rect.x; x < rect.x + rect.w; x++) {
                this.setTile(new Tile(x, rect.y, tileType));
                this.setTile(new Tile(x, rect.y + rect.h - 1, tileType));
            }
            for (let y = rect.y; y < rect.y + rect.h; y++) {
                this.setTile(new Tile(rect.x, y, tileType));
                this.setTile(new Tile(rect.x + rect.w - 1, y, tileType));
            }
        }
    }

    protected shrinkRects(rects: Rect[]): Rect[] {
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

    protected divideSpace(root: Rect): Rect[] {
        const rects: Rect[] = [];
        rects.push(root);

        for (let i = 0; i < 3; i++) {
            const rect = rects.pop()!;
            const vertical = Math.random() > 0.5;
            const splitRects: Rect[] = this.splitRect(rect, vertical);
            rects.push(...splitRects)
        }
        return rects;
    }

    protected splitRect(rect: Rect, isVertical: boolean): Rect[] {
        const rects: Rect[] = [];
        if (isVertical) {
            const splitPoint = Math.floor(rect.y + rect.h / 2);
            const rect1: Rect = {
                x: rect.x,
                y: rect.y,
                w: rect.w,
                h: splitPoint - rect.y
            };
            const rect2: Rect = {
                x: rect.x,
                y: splitPoint,
                w: rect.w,
                h: rect.y + rect.h - splitPoint
            };
            rects.push(rect1, rect2);
        } else {
            const splitPoint = Math.floor(rect.x + rect.w / 2);
            const rect1: Rect = {
                x: rect.x,
                y: rect.y,
                w: splitPoint - rect.x,
                h: rect.h
            };
            const rect2: Rect = {
                x: splitPoint,
                y: rect.y,
                w: rect.x + rect.w - splitPoint,
                h: rect.h
            };
            rects.push(rect1, rect2);
        }
        return rects;
    }
}