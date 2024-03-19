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
                        spotTile.fg = COLORS.LIGHT_GOLD;
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
                    case "D":
                        const amuletTile = new Tile(x, y, "FLOOR");
                        amuletTile.symbol = "*";
                        amuletTile.fg = COLORS.GOLD;
                        amuletTile.bg = COLORS.DARK_GREY;
                        amuletTile.triggerMetadata = { trigger: tileChar, text: staticMap.text[tileChar] };
                        this.setTile(amuletTile);
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
                "#################################",
                "#...3...-2......-4.x...-5x.....##",
                "#...#####2......#4.x...###...#-##",
                "#-#######.......####s#####sss#6##",
                "#11...0@#....p..######7777....x##",
                "#11...00#.......######.##.......#",
                "######################-##########",
                "#....H#EEEE.######..##8##......##",
                "#.#####EE##...s##...##x##......##",
                "#........##...s#....#############",
                "#AAAAAAAA##F######..##.##......##",
                "#AAAAAAAA##F##########.##......##",
                "#AAAAAAAA##F....p.xx9-.##......##",
                "#AAAAAAAA################......##",
                "#######x##.....#####b############",
                "#....##.#...#..............######",
                "#....##.#BBB###########....######",
                "#....##.-BBB###########....C..%##",
                "#....####BBB#..............######",
                "#.....###........#b#.....#b#...##",
                "#################################",
            ],

        text: {
            "0": `Welcome, %c{${COLORS.MOVE_LIGHT_BLUE}}runner%c{#ffffff}. I see you can move, at least.`,
            "1": `Proceed through the door. Press %c{${COLORS.MOVE_LIGHT_BLUE}}(NUM 5 or spacebar)%c{#ffffff} to wait next to the door to open it. Or bump into it if you prefer.`,
            "2": `Patrol bot ahead. If you move into its vision, it'll shoot you. Use %c{${COLORS.MOVE_LIGHT_BLUE}}(NUM 5 or spacebar)%c{#ffffff} to wait for an opportune moment to run past. It's okay if your tile is red; you just can't move INTO a red tile on your turn or you'll take damage.`,
            "3": `Close that door behind you! What kind of runner leaves open doors behind them?`,
            "4": `Walk up to the sentry vision and stand on an 'x'. Press "1" then select a direction to jump.`,
            "5": `One sentry is nothing. This is more common in the field. Use %c{${COLORS.MOVE_LIGHT_BLUE}}(2) wall run%c{#ffffff} to get past them.`,
            "6": `Use all your moves for maximum mobility; use %c{${COLORS.MOVE_LIGHT_BLUE}}(3) Jump off wall%c{#ffffff} on this wall to get past these sentries.`,
            "7": `Nominal performance. Let's try your moves for getting out of a jam.`,
            "8": `Chased into a dead end? Use %c{${COLORS.MOVE_LIGHT_BLUE}}(6) burrow%c{#ffffff} to dig through the wall south.`,
            "9": `Stand %c{${COLORS.MOVE_LIGHT_BLUE}}2 or 3 spaces from the enemy%c{#ffffff}. Then use %c{${COLORS.MOVE_LIGHT_BLUE}}(5) enemy jump%c{#ffffff} to jump over them. Wait a few turns with %c{${COLORS.MOVE_LIGHT_BLUE}}(NUM 5 or spacebar)%c{#ffffff} if they're not in the middle of the hallway.`,
        
            "F": `This next move requires some space to get moving; if the %c{${COLORS.MOVE_LIGHT_BLUE}}first three spaces%c{#ffffff} enter enemy vision, they'll hit you and cancel the move. Try it here, with %c{${COLORS.MOVE_LIGHT_BLUE}}(4) Running Jump%c{#ffffff}.`,
            "E": `Getting hit like that isn't fatal, and it causes the attacking bot to power down for a few turns. You can use that to your advantage. Sometimes you have to just walk through enemy vision to keep up your speed.`,
            
            "A": `Now, meet your antagonist. The %c{${COLORS.LASER_RED}}HUNTER%c{#ffffff}. It's relentless, and can sense you from any distance.`,
            "B": `%c{${COLORS.LASER_RED}}You can't fight it%c{#ffffff}. Hit the %c{${COLORS.LIGHT_GREEN}}buttons%c{#ffffff} (wait next to them) and then run to the %c{${COLORS.LIGHT_GREEN}}exit.`,
            "C": `Acceptable job, %c{${COLORS.MOVE_LIGHT_BLUE}}runner%c{#ffffff}. Don't embarrass me on the job.`,
    
        }
    },

    // "intro":
    // {
    //     map: [
    //         "#################",
    //         "#@...0....-1...%#",
    //         "#####0....#######",
    //         "####B.....#######",
    //         "######B##B#######",
    //         "#################"
    //     ],

    //     text: {
    //         "0":"You're almost there,  %c{${COLORS.MOVE_LIGHT_BLUE}}runner%c{}. Punch those buttons to activate the elevator to the vault.",
    //         "1":"",
    //         "2":""
    //     }
    // },

    "vault":
    {
        map: [
            "###################",
            "##................#",
            "##000...###..2222##",
            "#@000....D...2222%#",
            "##000...###..2222##",
            "##................#",
            "###################",
        ],

        text: {
            "0":`There it is! %c{${COLORS.RAINBOW_0}}a%c{${COLORS.RAINBOW_1}}m%c{${COLORS.RAINBOW_2}}u%c{${COLORS.RAINBOW_3}}l%c{${COLORS.RAINBOW_4}}e%c{${COLORS.RAINBOW_5}}t%c{}.dat! Grab it!`,
            "D":`ALERT: %c{${COLORS.LASER_RED}}RUNNER DETECTED. HUNTER ACTIVATED`,
            "2":`Time to %c{${COLORS.MOVE_LIGHT_BLUE}}run%c{#fff}. Three floors of security between you and the exit. Good luck, %c{${COLORS.MOVE_LIGHT_BLUE}}runner%c{}. See  you on the other side.`
        }
    }
}