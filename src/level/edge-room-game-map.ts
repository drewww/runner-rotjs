import { GameMap } from "./game-map";

export class EdgeRoomGameMap extends GameMap {


    constructor(protected w: number, protected h: number) {
        super(w, h);

        this.fillMapWithTile("FLOOR");
    }
}