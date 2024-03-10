import { PatrolBot } from "../entities/patrol-bot";
import { GameMap } from "./game-map";
import { Tile } from "./tile";
import { Door } from "./door";
import { SentryBot } from "../entities/sentry";
import { COLORS } from "../colors";


export class LoadedGameMap extends GameMap {
    constructor(name: string) {
        super(0, 0);

        this.disableHunter = true;
        
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
                        const triggerTile = new Tile(x, y, "FLOOR");
                        triggerTile.triggerMetadata = { trigger: tileChar, text: staticMap.text[tileChar] };
                        this.setTile(triggerTile);
                        break;
                    case " ":
                    case ".":
                        this.setTile(new Tile(x, y, "FLOOR"));
                        break;
                    case "@":
                        this.setTile(new Tile(x, y, "ENTRANCE"));
                        break;
                    case "s":
                        this.setTile(new Tile(x, y, "FLOOR"));
                        const s = new SentryBot(x, y,0);
                        this.beings.push(s);
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
                "#...3...-2......-4.....-5......#",
                "#...#####2......#4.....#5......#",
                "#-#######.......####s#####sss#-#",
                "#11...0@#....p..#............66#",
                "#11...00#.......#..............#",
                "################################",
                "#..............................#",
                "#..............................#",
                "################################",
            ],

        text: {
            "0": `Welcome, %c{${COLORS.MOVE_BLUE}}runner%c{}. I see you can move, at least.`,
            "1": "Proceed through the door. Press (NUM 5/s) to wait & use adjaecnt objects.",
            "2": "Patrol bot ahead. If you move into its vision, it'll shoot you. Use (NUM 5/s) to wait for an opportune moment to run past.",
            "3": "Close that door behind you! What kind of runner leaves open doors behind them?",
            "4": "This is where your implants come in handy. Walk up to the sentry vision and jump over it with (1), then selecting the direction.",
            "5": "One sentry is nothing. This is more common in the field. Use '(2) wall run' or '(3) wall jump' to get past them.",
            "6": "Time to do it again. Try a different move this time; you won't always have time to wait for your moves to cooldown."
        }
    }
}