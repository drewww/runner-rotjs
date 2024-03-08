import { Point } from "..";
import { PatrolBot } from "../entities/patrol-bot";
import { Door } from "./door";
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

        const hallways = this.getFreePoints();

        for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];
            // add random junk to the map
            const freeTiles = this.getPointsWithinRect(rect);

            // remove these from the hallways  
            for (const tilePoint of freeTiles) {
                for (let j = 0; j < hallways.length; j++) {
                    if (hallways[j].x === tilePoint.x && hallways[j].y === tilePoint.y) {
                        hallways.splice(j, 1);
                        const tile = this.getTile(tilePoint.x, tilePoint.y);
                        tile.procGenType = "ROOM_" + i;
                    }
                }
            }

            for (const tile of freeTiles) {
                if (Math.random() < 0.008) {
                    this.setTile(new Tile(tile.x, tile.y, "TALL_JUNK"));
                    // add short junk all around it
                    for (let j = -1; j < 2; j++) {
                        for (let k = -1; k < 2; k++) {
                            if (Math.random() > 0.25) {
                                const curTile = this.getTile(tile.x + j, tile.y + k);
                                if (curTile && curTile.symbol === ".") {
                                    this.setTile(new Tile(tile.x + j, tile.y + k, "SHORT_JUNK"));
                                }
                            }
                        }
                    }
                }
            }
        }

        // save this hallway visualizer. working at the moment.
        for (const hallway of hallways) {
            const tile = this.getTile(hallway.x, hallway.y)
            tile.procGenType = "HALLWAY";
        }

        // using this alternate type so we can select only internal walls later.
        // may also want to have a "burrow" move that can dig through walls but not
        // boundary tiles.
        this.addTilesOnRectBoundaries([{ x: 0, y: 0, w: this.w, h: this.h }], "BOUNDARY");

        // TODO: add doors
        // simple version -- just randomly knock out walls that ARENT on the edges
        // select all wall tiles
        const wallTiles = this.tiles.filter(tile => tile.symbol === " " && tile.indestructable === false);

        // randomly replace N of them with door tiles
        const numDoors = Math.floor(wallTiles.length / 20); // replace 5% of the wall tiles with doors
        for (let i = 0; i < numDoors; i++) {
            const randomIndex = Math.floor(Math.random() * wallTiles.length);
            const randomWallTile = wallTiles[randomIndex];
            this.setTile(new Door(randomWallTile.x, randomWallTile.y));
            // this.setTile(new Tile(randomWallTile.x, randomWallTile.y, "."));
            wallTiles.splice(randomIndex, 1); // remove the wall tile from the array
        }

        this.addTemplate(GameMap.BUTTON, -1);
        this.addTemplate(GameMap.BUTTON, -1);
        this.addTemplate(GameMap.BUTTON, -1);


        // TODO: add exit template
        this.addTemplate(GameMap.EXIT, -1);
        this.addTemplate(GameMap.ENTRANCE, -1);

        for (let i=0; i<15; i++) {
            this.addTemplate(GameMap.WALL, -1);
        }

        // there is surely a simpler way to do this, but I want 30 enemies WITHIN rooms and 10 hallway
        // enemies.
        for (let i = 0; i < 20; i++) {
            const roomTiles = this.getAllTiles().filter(tile => !(tile.procGenType == "HALLWAY" || tile.solid));

            if (!roomTiles) {
                console.error("No room tiles to place enemy.");
                break;
            }

            const enemyCell = roomTiles[Math.floor(Math.random() * roomTiles.length)];

            this.beings.push(new PatrolBot(enemyCell.x, enemyCell.y));

            roomTiles.splice(roomTiles.indexOf(enemyCell), 1);
        }

        for (let i = 0; i < 8; i++) {
            const hallwayTiles = this.getAllTiles().filter(tile => (tile.procGenType == "HALLWAY"));

            if (!hallwayTiles) {
                console.error("No room tiles to place enemy.");
                break;
            }

            const enemyCell = hallwayTiles[Math.floor(Math.random() * hallwayTiles.length)];
            this.beings.push(new PatrolBot(enemyCell.x, enemyCell.y));

            hallwayTiles.splice(hallwayTiles.indexOf(enemyCell), 1);
        }





        // TODO: add enemies (happens one level up??)
    }

    protected getPointsWithinRect(rect: Rect): Point[] {
        const points: { x: number, y: number }[] = [];
        for (let x = rect.x + 1; x < rect.x + rect.w - 1; x++) {
            for (let y = rect.y + 1; y < rect.y + rect.h - 1; y++) {
                points.push({ x, y });
            }
        }

        return points;
    }

    public addTilesOnRectBoundaries(rects: Rect[], tileType: string = "WALL"): void {
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