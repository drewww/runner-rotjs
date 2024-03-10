import { PatrolBot } from "../entities/patrol-bot";
import { GameMap } from "./game-map";
import { Tile } from "./tile";
import { Door } from "./door";


export class LoadedGameMap extends GameMap {
    constructor(name: string) {
        super(0, 0);
        this.loadMap(name);
    }

    protected loadMap(name: string) {
        const staticMap = levels[name];

        if (!staticMap) {
            console.error("No map found for name: " + name);
        }

        this.w = staticMap.map[0].length;
        this.h = staticMap.map.length;

        console.log("setting w and h: " + this.w + " " + this.h);

        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                const tileChar = staticMap.map[y][x];

                switch (tileChar) {
                    case "#":
                        this.setTile(new Tile(x, y, "BOUNDARY"));
                        break;
                    case "0":
                    case "1":
                    case "2":
                    case "3":
                    case "4":
                    case "5":
                    case "6":
                    case "7":
                    case "8":
                    case "9":
                        // todo something special with these later
                    case " ":
                    case ".":
                        this.setTile(new Tile(x, y, "FLOOR"));
                        break;
                    case "@":
                        this.setTile(new Tile(x, y, "ENTRANCE"));
                        break;
                    case "p":
                        this.setTile(new Tile(x, y, "FLOOR"));
                        const p = new PatrolBot(x, y, "flip");
                        p.facing = Math.PI/2;
                        this.beings.push(p);
                        break;
                    case "-":
                        this.setTile(new Door(x, y));
                        break;
                    default:
                        console.error("unrecognized tile character: " + tileChar);
                        break;
                }
            }
        }

        // const map = require(`./maps/${name}.json`);
        // this.w = map.width;
        // this.h = map.height;
        // this.tiles = [];
        // for (let y = 0; y < this.h; y++) {
        //     for (let x = 0; x < this.w; x++) {
        //         const tile = map.tiles[y][x];
        //         this.setTile(new Tile(x, y, tile.type, tile.procGenType));
        //     }
        // }

    }
}

type StaticLevel = {
    map: string[];
    text: { [key: string]: string };
};





const levels: { [key: string]: StaticLevel } = {
    "tutorial1":
    {
        map:

            [
                "################################",
                "#@.1-......-...................#",
                "#..1#......#...................#",
                "#####...p..#...................#",
                "#...#......#...................#",
                "#...#......#...................#",
                "#...########...................#",
                "#..............................#",
                "#..............................#",
                "################################",
            ],

        text: {
            "1": "This is a door. Open it by waiting ('s' or 5) next to it. ",
        }
    }
}