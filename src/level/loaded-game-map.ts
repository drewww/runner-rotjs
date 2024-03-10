import { PatrolBot } from "../entities/patrol-bot";
import { GameMap } from "./game-map";
import { Tile } from "./tile";
import { Door } from "./door";
import { SentryBot } from "../entities/sentry";
import { COLORS } from "../colors";
import { Hunter } from "../entities/hunter";
import { Button } from "./button";


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
                    case "A":
                    case "B":
                    case "A":
                    case "B":
                    case "C":
                    case "D":
                    case "E":
                    case "F":
                    case "G":
                    case "I":
                        // case "H": RESERVED FOR HUNTER
                    case "J":
                    case "K":

                        // todo something special with these later
                        const triggerTile = new Tile(x, y, "FLOOR");
                        triggerTile.triggerMetadata = { trigger: tileChar, text: staticMap.text[tileChar] };
                        this.setTile(triggerTile);
                        break;
                    case "x":
                        const spotTile = new Tile(x, y, "FLOOR");
                        spotTile.symbol = "x";
                        this.setTile(spotTile);
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
                        const s = new SentryBot(x, y, 0);
                        this.beings.push(s);
                        break;
                    case "p":
                        this.setTile(new Tile(x, y, "FLOOR"));
                        const p = new PatrolBot(x, y, "flip");
                        p.facing = Math.PI / 2;
                        this.beings.push(p);
                        break;
                    case "-":
                        this.setTile(new Door(x, y));
                        break;
                    case "b":
                        const button = new Button(x, y);
                        this.setTile(button);
                        break;
                    case "H":
                        this.setTile(new Tile(x, y, "FLOOR"));
                        const hunter = new Hunter(x, y, this);
                        hunter.disable();
                        this.beings.push(hunter);
                        break;
                    case "%":
                        this.setTile(new Tile(x, y, "EXIT"));
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
                "#...3...-2......-4.x...-5x.....#",
                "#...#####2......#4.x...##x.....#",
                "#-#######.......####s#####sss#-#",
                "#11...0@#....p..######7777...6x#",
                "#11...00#.......######.#77...6x#",
                "######################-#########",
                "#..H................##8##......#",
                "#...................##8##......#",
                "#........#######################",
                "#........##....#######.##......#",
                "#.......A#######p#####.##......#",
                "#.......A-.........x9-.##......#",
                "#.......A#######.########......#",
                "#######-##.....#####b###########",
                "#.....BBB...#..................#",
                "#...........###########.......##",
                "#...........###########.......%#",
                "#...........#.................##",
                "#................#b#.....#b#...#",
                "################################",
            ],

        text: {
            "0": `Welcome, %c{${COLORS.MOVE_LIGHT_BLUE}}runner%c{}. I see you can move, at least.`,
            "1": `Proceed through the door. Press %c{${COLORS.MOVE_LIGHT_BLUE}}(NUM 5/s)%c{} to wait & use adjacent objects.`,
            "2": `Patrol bot ahead. If you move into its vision, it'll shoot you. Use %c{${COLORS.MOVE_LIGHT_BLUE}}(NUM 5/s)%c{} to wait for an opportune moment to run past.`,
            "3": `Close that door behind you! What kind of runner leaves open doors behind them?`,
            "4": `This is where your implants come in handy. Walk up to the sentry vision and jump over it with %c{${COLORS.MOVE_LIGHT_BLUE}}(1)%c{}, then selecting the direction.`,
            "5": `One sentry is nothing. This is more common in the field. Use %c{${COLORS.MOVE_LIGHT_BLUE}}(2) wall run%c{} or %c{${COLORS.MOVE_LIGHT_BLUE}}(3) wall jump %c{}to get past them.`,
            "6": `Time to do it again. Try a different move this time; you won't always have time to wait for your moves to cooldown.`,
            "7": `Nominal performance. Let's try your last two moves.`,
            "8": `Dead end? Not for you. Use %c{${COLORS.MOVE_LIGHT_BLUE}}(6) burrow%c{} to dig through the wall south.`,
            "9": `Wait for the right moment, standing %c{${COLORS.MOVE_LIGHT_BLUE}}3 spaces from the enemy%c{}. Then use %c{${COLORS.MOVE_LIGHT_BLUE}}(5) enemy jump%c{} to jump over them.`,
            "A": `Now, meet your antagonist. The %c{${COLORS.LASER_RED}}hunter%c{}. It's relentless, and can sense you from any distance.`,
            "B": `%c{${COLORS.LASER_RED}}You can't fight it%c{}. Hit the %c{${COLORS.LIGHT_GREEN}}buttons%c{} (wait next to them) and then run to the %c{${COLORS.LIGHT_GREEN}}exit.`,
        }
    }
}