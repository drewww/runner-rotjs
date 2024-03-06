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
        const rects = this.divideSpace();
        this.addWallsOnRectBoundaries(rects);
    }

    public addWallsOnRectBoundaries(rects: Rect[]): void {
        for (const rect of rects) {
            for (let x = rect.x; x < rect.x + rect.w; x++) {
                this.setTile(new Tile(x, rect.y, "WALL"));
                this.setTile(new Tile(x, rect.y + rect.h - 1, "WALL"));
            }
            for (let y = rect.y; y < rect.y + rect.h; y++) {
                this.setTile(new Tile(rect.x, y, "WALL"));
                this.setTile(new Tile(rect.x + rect.w - 1, y, "WALL"));
            }
            
        }
    }

    protected divideSpace(): Rect[] {
        const rects: Rect[] = [];
        const root = { x: 0, y: 0, w: this.w, h: this.h };
        rects.push(root);
        for (let i = 0; i < 1; i++) {
            const rect = rects.pop()!;
            if (Math.random() > 0.5) {
                const splitRects: Rect[] = this.splitRect(rect, false);
                rects.push(...splitRects);
            } else {
                const splitRects: Rect[] = this.splitRect(rect, true);
                rects.push(...splitRects);
            }
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